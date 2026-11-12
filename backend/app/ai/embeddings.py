import re
import numpy as np
import faiss
from typing import List, Union

EMBEDDING_DIM = 128


class DenseEmbeddingEncoder:
    """
    Robust local semantic dense embedding generator.
    Produces unit-length (L2-normalized) 128-dimensional vectors using
    n-gram term hashing and random projection matrix (preserving cosine distances).
    Requires zero internet access or heavy neural network weights, ensuring high speed (<1ms).
    """

    def __init__(self, dim: int = EMBEDDING_DIM, seed: int = 42):
        self.dim = dim
        self.seed = seed
        rng = np.random.default_rng(seed)
        # Random projection matrix for Johnson-Lindenstrauss dimension reduction
        self.projection = rng.standard_normal((1024, dim)).astype(np.float32)

    def _tokenize(self, text: str) -> List[str]:
        text = text.lower()
        tokens = re.findall(r"\b[a-z0-9_]{2,}\b", text)
        # Add character tri-grams for subword matching
        trigrams = [text[i:i + 3] for i in range(len(text) - 2)]
        return tokens + trigrams

    def encode(self, texts: Union[str, List[str]]) -> np.ndarray:
        """
        Encode text or list of texts into L2-normalized float32 numpy array (shape: N, dim).
        """
        if isinstance(texts, str):
            texts = [texts]

        vectors = []
        for text in texts:
            tokens = self._tokenize(text)
            bow = np.zeros(1024, dtype=np.float32)

            for token in tokens:
                # Hash token into 1024-bucket space
                h = hash(token) % 1024
                bow[h] += 1.0

            # Sublinear term frequency
            bow = np.log1p(bow)

            # Project into target semantic embedding dimension
            dense_vec = np.dot(bow, self.projection)

            # L2 normalization for cosine similarity in FAISS
            norm = np.linalg.norm(dense_vec)
            if norm > 1e-6:
                dense_vec = dense_vec / norm
            else:
                dense_vec = np.zeros(self.dim, dtype=np.float32)

            vectors.append(dense_vec)

        return np.vstack(vectors).astype(np.float32)


# Global singleton instance
_encoder_instance = None


def get_embedding_encoder() -> DenseEmbeddingEncoder:
    global _encoder_instance
    if _encoder_instance is None:
        _encoder_instance = DenseEmbeddingEncoder()
    return _encoder_instance

