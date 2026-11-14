import pytest

from sindhi_tokenizer import SindhiTokenizer
from sindhi_tokenizer import tokenizer as tokenizer_module


class FakeSentencePieceProcessor:
    def __init__(self, model_file):
        self.model_file = model_file

    def get_piece_size(self):
        return 64_000

    def encode(self, text, out_type=int):
        values = [ord(char) for char in text]
        return values if out_type is int else [f"▁{char}" for char in text]

    def decode(self, tokens):
        if tokens and isinstance(tokens[0], str):
            return "".join(token.removeprefix("▁") for token in tokens)
        return "".join(chr(token) for token in tokens)

    def id_to_piece(self, token_id):
        return f"piece-{token_id}"

    def piece_to_id(self, piece):
        return 7 if piece == "known" else 0


@pytest.fixture
def fake_processor(monkeypatch):
    monkeypatch.setattr(tokenizer_module.spm, "SentencePieceProcessor", FakeSentencePieceProcessor)


def test_local_load_encode_decode_and_batches(tmp_path, fake_processor):
    model_path = tmp_path / "model.model"
    model_path.touch()
    tokenizer = SindhiTokenizer.from_file(model_path)

    assert tokenizer.vocab_size == 64_000
    assert tokenizer.encode("سنڌ") == [ord(char) for char in "سنڌ"]
    assert tokenizer.decode(tokenizer.encode("سنڌ")) == "سنڌ"
    assert tokenizer.encode("سنڌ", out_type="pieces") == [f"▁{char}" for char in "سنڌ"]
    assert tokenizer.decode_batch(tokenizer.encode_batch(["الف", "ب"], out_type="ids")) == ["الف", "ب"]
    assert tokenizer.id_to_piece(12) == "piece-12"
    assert tokenizer.piece_to_id("known") == 7


def test_from_pretrained_uses_expected_hub_file(tmp_path, monkeypatch, fake_processor):
    model_path = tmp_path / "downloaded.model"
    model_path.touch()
    call = {}

    def fake_download(**kwargs):
        call.update(kwargs)
        return str(model_path)

    monkeypatch.setattr(tokenizer_module, "hf_hub_download", fake_download)
    tokenizer = SindhiTokenizer.from_pretrained(vocab_size=100_000, revision="main")

    assert tokenizer.vocab_size == 64_000
    assert call["repo_id"] == "alinawazmahar/sindhi-tokenizer"
    assert call["filename"] == "sindhi_custom_100000.model"
    assert call["revision"] == "main"


def test_rejects_unsupported_vocabulary_without_downloading(monkeypatch):
    def fail_if_called(**kwargs):
        raise AssertionError("hub download should not run for an invalid vocabulary")

    monkeypatch.setattr(tokenizer_module, "hf_hub_download", fail_if_called)
    with pytest.raises(ValueError, match="Unsupported vocab_size"):
        SindhiTokenizer.from_pretrained(vocab_size=42_000)


def test_validates_inputs_and_local_files(tmp_path, fake_processor):
    with pytest.raises(FileNotFoundError):
        SindhiTokenizer.from_file(tmp_path / "missing.model")

    model_path = tmp_path / "model.model"
    model_path.touch()
    tokenizer = SindhiTokenizer.from_file(model_path)

    with pytest.raises(TypeError, match="text must be str"):
        tokenizer.encode(123)  # type: ignore[arg-type]
    with pytest.raises(TypeError, match="sequence of strings"):
        tokenizer.encode_batch("single string")
    with pytest.raises(ValueError, match="out_type"):
        tokenizer.encode("text", out_type="tokens")  # type: ignore[arg-type]
