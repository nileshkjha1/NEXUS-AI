import json
from typing import List, Dict, Any, Optional
import numpy as np
import faiss
from sqlalchemy.orm import Session

from app.config import settings
from app.models.ticket import Ticket, TicketStatus
from app.models.ai_resolution import ResolutionRecommendation, RecommendationStatus, KnowledgeDocument
from app.ai.embeddings import get_embedding_encoder, EMBEDDING_DIM
from app.ai.knowledge_base import get_all_knowledge_docs
from app.ai.llm_provider import get_llm_provider


class RAGEngine:
    _instance = None

    def __init__(self):
        self.encoder = get_embedding_encoder()
        self.docs = []
        self.index = None
        self._build_index()

    @classmethod
    def get_instance(cls) -> "RAGEngine":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def _build_index(self):
        """
        Build and populate the FAISS vector index with knowledge documents.
        """
        self.docs = get_all_knowledge_docs()
        corpus_texts = [
            f"{d['title']} Category: {d['category']} Tags: {d.get('tags', '')} Content: {d['content']}"
            for d in self.docs
        ]

        # Generate L2-normalized dense embeddings
        embeddings = self.encoder.encode(corpus_texts)

        # IndexFlatIP with normalized vectors computes exact cosine similarity
        self.index = faiss.IndexFlatIP(EMBEDDING_DIM)
        self.index.add(embeddings)

    def search_knowledge(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """
        Vector search the knowledge base using FAISS.
        """
        if not query or self.index is None or self.index.ntotal == 0:
            return []

        query_vec = self.encoder.encode(query)
        k = min(top_k, len(self.docs))
        scores, indices = self.index.search(query_vec, k)

        results = []
        for score, idx in zip(scores[0], indices[0]):
            if idx != -1 and idx < len(self.docs):
                doc_copy = dict(self.docs[idx])
                doc_copy["similarity_score"] = float(score)
                results.append(doc_copy)

        return results

    def find_similar_incidents(self, query_text: str, db: Session, top_k: int = 3) -> List[Dict[str, Any]]:
        """
        Find historical resolved incidents using semantic vector similarity.
        """
        resolved_tickets = (
            db.query(Ticket)
            .filter(Ticket.status.in_([TicketStatus.RESOLVED, TicketStatus.CLOSED]))
            .all()
        )
        if not resolved_tickets:
            return []

        ticket_texts = [
            f"{t.title} {t.category} {t.description} {t.resolution_notes or ''}"
            for t in resolved_tickets
        ]
        ticket_vectors = self.encoder.encode(ticket_texts)

        # Temporary FAISS index for resolved incident cases
        incident_index = faiss.IndexFlatIP(EMBEDDING_DIM)
        incident_index.add(ticket_vectors)

        query_vec = self.encoder.encode(query_text)
        k = min(top_k, len(resolved_tickets))
        scores, indices = incident_index.search(query_vec, k)

        similar_cases = []
        for score, idx in zip(scores[0], indices[0]):
            if idx != -1 and idx < len(resolved_tickets):
                ticket = resolved_tickets[idx]
                similar_cases.append({
                    "id": ticket.id,
                    "ticket_number": ticket.ticket_number,
                    "title": ticket.title,
                    "category": ticket.category.value,
                    "priority": ticket.priority.value,
                    "status": ticket.status.value,
                    "resolution_notes": ticket.resolution_notes,
                    "similarity_score": round(float(score), 3),
                })

        return similar_cases

    def generate_resolution(self, ticket_id: int, db: Session) -> Dict[str, Any]:
        """
        End-to-end RAG pipeline:
        1. Retrieve ticket
        2. Vector search FAISS knowledge base
        3. Query LLM provider with grounded context
        4. Persist recommendation in database
        """
        ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
        if not ticket:
            raise ValueError(f"Ticket #{ticket_id} not found.")

        query_text = f"{ticket.title} {ticket.category} {ticket.description}"

        # 1. Retrieve knowledge documents
        top_k = settings.RAG_TOP_K
        retrieved_docs = self.search_knowledge(query_text, top_k=top_k)

        # 2. Invoke LLM provider
        provider = get_llm_provider()
        resolution = provider.generate_resolution(
            incident_title=ticket.title,
            incident_description=ticket.description,
            retrieved_docs=retrieved_docs,
        )

        # 3. Save resolution recommendation to database
        steps_str = "\n".join(resolution.get("recommended_steps", []))
        sources_str = json.dumps(resolution.get("supporting_sources", []))

        recommendation = ResolutionRecommendation(
            ticket_id=ticket.id,
            summary=resolution.get("summary", ""),
            probable_cause=resolution.get("probable_cause", ""),
            recommended_steps=steps_str,
            confidence_score=resolution.get("confidence_score"),
            supporting_sources=sources_str,
            status=RecommendationStatus.PENDING,
        )
        db.add(recommendation)
        db.commit()
        db.refresh(recommendation)

        resolution["recommendation_id"] = recommendation.id
        resolution["status"] = recommendation.status.value
        return resolution


def get_rag_engine() -> RAGEngine:
    return RAGEngine.get_instance()
