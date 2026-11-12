import pytest
import numpy as np
from app.ai.embeddings import get_embedding_encoder, EMBEDDING_DIM
from app.ai.rag import get_rag_engine


@pytest.fixture
def auth_headers(client):
    resp = client.post(
        "/api/v1/auth/login",
        json={"email": "agent@nexusai.com", "password": "Agent@123456"},
    )
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_dense_embeddings_norm():
    encoder = get_embedding_encoder()
    text = "PostgreSQL connection pool exhausted with timeout 10060"
    vec = encoder.encode(text)
    assert vec.shape == (1, EMBEDDING_DIM)
    # Check L2 unit length
    norm = np.linalg.norm(vec[0])
    assert pytest.approx(norm, abs=1e-4) == 1.0


def test_faiss_vector_search():
    rag = get_rag_engine()
    results = rag.search_knowledge("AnyConnect VPN connection drops repeatedly every 15 minutes", top_k=2)
    assert len(results) > 0
    top_doc = results[0]
    assert "doc_id" in top_doc
    assert top_doc["doc_id"] == "KB-NET-01"
    assert top_doc["similarity_score"] > 0.0


def test_api_generate_recommendation(client, auth_headers):
    # INC-1001 is about database connection timeout over VPN
    resp = client.post("/api/v1/ai/recommend/1", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "summary" in data
    assert "probable_cause" in data
    assert "recommended_steps" in data
    assert len(data["recommended_steps"]) > 0
    assert "supporting_sources" in data
    assert "confidence_score" in data
    assert "recommendation_id" in data


def test_api_get_recommendations(client, auth_headers):
    resp = client.get("/api/v1/ai/recommendations/1", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert "probable_cause" in data[0]


def test_api_review_recommendation(client, auth_headers):
    # First generate recommendation
    gen_resp = client.post("/api/v1/ai/recommend/1", headers=auth_headers)
    rec_id = gen_resp.json()["recommendation_id"]

    # Review it: Approve
    review_resp = client.post(
        f"/api/v1/ai/review/{rec_id}",
        json={
            "status": "Approved",
            "review_notes": "Verified steps against production architecture.",
            "apply_to_ticket": True,
        },
        headers=auth_headers,
    )
    assert review_resp.status_code == 200
    assert review_resp.json()["status"] == "Approved"


def test_api_knowledge_search(client, auth_headers):
    resp = client.get("/api/v1/ai/knowledge?q=swollen%20battery", headers=auth_headers)
    assert resp.status_code == 200
    docs = resp.json()
    assert len(docs) > 0
    assert any("KB-HW-03" == d["doc_id"] for d in docs)

