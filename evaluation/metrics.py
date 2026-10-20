"""Tokenizer evaluation metrics used in the benchmark.

Works with any tokenizer object exposing:
    encode(text, add_special_tokens=False) -> list[int]
    decode(ids) -> str
    convert_ids_to_tokens(ids) -> list[str]
    unk_token                                  (str or None)
(Hugging Face tokenizers already do; for raw SentencePiece models use SPMTokenizerAdapter.)

Metrics:
    fertility, compression, single-token %, UNK %   -> evaluate_tokenizer_on_sentences
    byte-fallback % (U+FFFD tokens only)             -> compute_byte_fallback_rate
    round-trip character fidelity                    -> check_roundtrip_fidelity
"""
import re
import unicodedata


class SPMTokenizerAdapter:
    """Minimal wrapper so a raw SentencePiece .model behaves like a HF tokenizer.

    Do not load these models with transformers.LlamaTokenizer: it can silently
    return a 3-token vocabulary for byte-fallback Unigram models.
    """

    def __init__(self, model_path):
        import sentencepiece as spm
        self.sp = spm.SentencePieceProcessor(model_file=model_path)
        self.unk_token = "<unk>"

    @property
    def vocab_size(self):
        return self.sp.get_piece_size()

    def encode(self, text, add_special_tokens=False):
        return self.sp.encode(text, out_type=int)

    def decode(self, ids):
        return self.sp.decode(ids)

    def convert_ids_to_tokens(self, ids):
        return [self.sp.id_to_piece(i) for i in ids]

    def convert_tokens_to_string(self, tokens):
        return self.sp.decode(tokens)


def word_split(text):
    return [w for w in text.strip().split() if w]


def evaluate_tokenizer_on_sentences(tokenizer, sentences, max_sentences=None):
    """Fertility, compression, single-token % and UNK % over whitespace-split words."""
    if max_sentences:
        sentences = sentences[:max_sentences]
    total_words = total_tokens = total_chars = single = unk = 0
    unk_str = tokenizer.unk_token
    for sent in sentences:
        if not sent or not sent.strip():
            continue
        words = word_split(sent)
        total_words += len(words)
        total_chars += len(sent)
        for w in words:
            ids = tokenizer.encode(w, add_special_tokens=False)
            toks = tokenizer.convert_ids_to_tokens(ids)
            n = max(len(ids), 1)
            total_tokens += n
            if n == 1:
                single += 1
            if unk_str is not None:
                unk += sum(1 for t in toks if t == unk_str)
    if total_words == 0 or total_tokens == 0:
        return None
    return {
        "n_sentences": len(sentences),
        "n_words": total_words,
        "n_tokens": total_tokens,
        "fertility": total_tokens / total_words,
        "compression_chars_per_token": total_chars / total_tokens,
        "single_token_pct": 100 * single / total_words,
        "unk_rate_pct": 100 * unk / total_tokens,
    }


def compute_byte_fallback_rate(tokenizer, sentences, max_sentences=None):
    """% of tokens that decode, on their own, to U+FFFD (an incomplete byte sequence).

    Decoding each id individually works for SentencePiece <0xNN> pieces and for
    GPT-2-style byte-level BPE alike. Pattern-matching "<0xNN>" strings does not:
    it reported 0% for several tokenizers whose true rate was 1-30%.

    Only U+FFFD counts. Tokens that merely decode to an empty string (for example
    the lone SentencePiece word-boundary piece "\u2581") are NOT byte-fallback;
    counting them inflated rates for SentencePiece tokenizers. Use
    compute_empty_decode_rate to inspect those separately.
    """
    sample = sentences if max_sentences is None else sentences[:max_sentences]
    total = fallback = 0
    for s in sample:
        for tid in tokenizer.encode(s, add_special_tokens=False):
            total += 1
            if "\ufffd" in tokenizer.decode([tid]):
                fallback += 1
    return (100 * fallback / total if total else 0.0), fallback, total


def compute_empty_decode_rate(tokenizer, sentences, max_sentences=None, top=5):
    """Diagnostic: % of tokens whose standalone decode is empty, with the most common pieces."""
    sample = sentences if max_sentences is None else sentences[:max_sentences]
    total = empty = 0
    pieces = {}
    for s in sample:
        for tid in tokenizer.encode(s, add_special_tokens=False):
            total += 1
            if tokenizer.decode([tid]) == "":
                empty += 1
                p = tokenizer.convert_ids_to_tokens([tid])[0]
                pieces[p] = pieces.get(p, 0) + 1
    top_pieces = sorted(pieces.items(), key=lambda kv: -kv[1])[:top]
    return (100 * empty / total if total else 0.0), empty, total, top_pieces


_ZERO_WIDTH = re.compile(r"[\u200b-\u200f\u202a-\u202e\u2066-\u2069\ufeff]")


def _canon(s):
    s = unicodedata.normalize("NFKC", s)   # folds Arabic Presentation Forms etc.
    s = _ZERO_WIDTH.sub("", s)             # invisible direction / joiner marks
    return re.sub(r"\s+", "", s)           # spacing differences are not content


def check_roundtrip_fidelity(tokenizer, sentences, max_sentences=None):
    """Encode then decode; count characters that disappear.

    Both sides are canonicalised first (NFKC, zero-width marks, whitespace), so
    ordinary normalisation is ignored and only real content loss is counted.
    Catches tokenizers that silently delete characters, which UNK rate and
    byte-fallback rate cannot see.

    Returns (char_loss_pct, lost_chars, total_chars, sentences_affected, worst_examples).
    """
    sample = sentences if max_sentences is None else sentences[:max_sentences]
    total = lost = affected = 0
    worst = []
    for s in sample:
        dec = tokenizer.decode(tokenizer.encode(s, add_special_tokens=False))
        o, d = _canon(s), _canon(dec)
        total += len(o)
        diff = len(o) - len(d)
        if diff > 0:
            lost += diff
            affected += 1
            worst.append((diff, s, dec))
    worst.sort(reverse=True)
    return (100 * lost / total if total else 0.0), lost, total, affected, worst[:3]


if __name__ == "__main__":
    import argparse
    ap = argparse.ArgumentParser(description="Evaluate a SentencePiece .model on a text file (one sentence per line).")
    ap.add_argument("--model", required=True)
    ap.add_argument("--text", required=True)
    a = ap.parse_args()
    tok = SPMTokenizerAdapter(a.model)
    sents = [l.rstrip("\n") for l in open(a.text, encoding="utf-8") if l.strip()]
    m = evaluate_tokenizer_on_sentences(tok, sents)
    fb, _, _ = compute_byte_fallback_rate(tok, sents)
    loss, _, _, aff, _ = check_roundtrip_fidelity(tok, sents)
    print(f"vocab_size={tok.vocab_size}  sentences={m['n_sentences']}")
    print(f"fertility={m['fertility']:.3f}  single_token%={m['single_token_pct']:.1f}  "
          f"unk%={m['unk_rate_pct']:.3f}  byte_fallback%={fb:.3f}  "
          f"char_loss%={loss:.4f}  sentences_affected={aff}")
