"""Simple inference API for the released Sindhi SentencePiece models."""

from __future__ import annotations

from pathlib import Path
from typing import Literal, Sequence

import sentencepiece as spm
from huggingface_hub import hf_hub_download


DEFAULT_MODEL_ID = "alinawazmahar/sindhi-tokenizer"
MODEL_FILES = {
    32_000: "sindhi_custom_32000.model",
    64_000: "sindhi_custom_64000.model",
    100_000: "sindhi_custom_100000.model",
    150_000: "sindhi_custom_150000.model",
}
TokenOutput = Literal["ids", "pieces"]


class SindhiTokenizer:
    """Load and use one of the released Sindhi SentencePiece models.

    Use :meth:`from_pretrained` for a Hugging Face model or :meth:`from_file`
    for a local ``.model`` file. The default is the recommended 64k vocabulary.
    """

    def __init__(self, model_path: str | Path) -> None:
        self.model_path = Path(model_path)
        if not self.model_path.is_file():
            raise FileNotFoundError(f"SentencePiece model not found: {self.model_path}")
        self._processor = spm.SentencePieceProcessor(model_file=str(self.model_path))

    @classmethod
    def from_file(cls, model_path: str | Path) -> "SindhiTokenizer":
        """Load a model from a local SentencePiece ``.model`` file."""
        return cls(model_path)

    @classmethod
    def from_pretrained(
        cls,
        model_id: str = DEFAULT_MODEL_ID,
        *,
        vocab_size: int = 64_000,
        revision: str | None = None,
        cache_dir: str | Path | None = None,
        local_files_only: bool = False,
    ) -> "SindhiTokenizer":
        """Download or reuse a cached released vocabulary from Hugging Face.

        ``vocab_size`` must be one of 32000, 64000, 100000, or 150000.
        """
        try:
            filename = MODEL_FILES[vocab_size]
        except KeyError as exc:
            supported = ", ".join(str(size) for size in MODEL_FILES)
            raise ValueError(f"Unsupported vocab_size {vocab_size}; choose one of: {supported}.") from exc

        model_path = hf_hub_download(
            repo_id=model_id,
            filename=filename,
            revision=revision,
            cache_dir=str(cache_dir) if cache_dir is not None else None,
            local_files_only=local_files_only,
        )
        return cls(model_path)

    @property
    def vocab_size(self) -> int:
        """Number of SentencePiece entries in this model."""
        return self._processor.get_piece_size()

    def tokenize(self, text: str) -> list[str]:
        """Split text into SentencePiece pieces, retaining whitespace markers."""
        self._check_text(text)
        return self._processor.encode(text, out_type=str)

    def encode(self, text: str, *, out_type: TokenOutput = "ids") -> list[int] | list[str]:
        """Encode a string as integer IDs (default) or readable pieces."""
        self._check_text(text)
        if out_type == "ids":
            return self._processor.encode(text, out_type=int)
        if out_type == "pieces":
            return self._processor.encode(text, out_type=str)
        raise ValueError("out_type must be 'ids' or 'pieces'.")

    def encode_batch(
        self, texts: Sequence[str], *, out_type: TokenOutput = "ids"
    ) -> list[list[int]] | list[list[str]]:
        """Encode strings in order, returning one token sequence per input."""
        if isinstance(texts, (str, bytes)):
            raise TypeError("texts must be a sequence of strings, not one string.")
        for text in texts:
            self._check_text(text)
        if out_type not in ("ids", "pieces"):
            raise ValueError("out_type must be 'ids' or 'pieces'.")
        kind = int if out_type == "ids" else str
        return [self._processor.encode(text, out_type=kind) for text in texts]

    def decode(self, tokens: Sequence[int] | Sequence[str]) -> str:
        """Reconstruct text from token IDs or SentencePiece strings."""
        if isinstance(tokens, (str, bytes)):
            raise TypeError("tokens must be a sequence of token IDs or pieces.")
        return self._processor.decode(list(tokens))

    def decode_batch(self, batch: Sequence[Sequence[int] | Sequence[str]]) -> list[str]:
        """Decode a batch of token sequences in order."""
        return [self.decode(tokens) for tokens in batch]

    def id_to_piece(self, token_id: int) -> str:
        """Return the readable SentencePiece string for an ID."""
        return self._processor.id_to_piece(token_id)

    def piece_to_id(self, piece: str) -> int:
        """Return the ID for a piece, or the model's unknown ID if absent."""
        return self._processor.piece_to_id(piece)

    @staticmethod
    def _check_text(text: str) -> None:
        if not isinstance(text, str):
            raise TypeError(f"text must be str, got {type(text).__name__}.")
