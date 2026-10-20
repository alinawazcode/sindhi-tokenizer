"""Train the Sindhi SentencePiece Unigram tokenizers (one model per vocabulary size).

Usage:
    python training/train_tokenizer.py --corpus corpus.txt --out-dir models

The corpus is a plain-text file with one sentence per line. See
training/README.md for how the published corpus was assembled.

Settings are the final ones used for the published tokenizers:
  * Unigram model, byte_fallback=True, character_coverage=1.0
  * no user_defined_symbols (forcing tokens was tested and made results worse)
  * unk/bos/eos ids 0/1/2, no pad token
"""
import argparse
import os
import sentencepiece as spm


def train_one(corpus, prefix, vocab_size):
    spm.SentencePieceTrainer.train(
        input=corpus,
        model_prefix=prefix,
        vocab_size=vocab_size,
        model_type="unigram",
        byte_fallback=True,
        character_coverage=1.0,
        unk_id=0, bos_id=1, eos_id=2, pad_id=-1,
        unk_piece="<unk>", bos_piece="<s>", eos_piece="</s>",
    )
    # A silent failure once produced 3-token "models" with exit code 0,
    # so verify the output instead of trusting the return value.
    with open(prefix + ".vocab", encoding="utf-8") as f:
        n_pieces = sum(1 for _ in f)
    if n_pieces < vocab_size * 0.9:
        raise RuntimeError(f"{prefix}.vocab has only {n_pieces} pieces for vocab_size={vocab_size}")
    return n_pieces


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--corpus", required=True, help="text file, one sentence per line")
    ap.add_argument("--out-dir", default="models")
    ap.add_argument("--vocab-sizes", type=int, nargs="+", default=[32000, 64000, 100000, 150000])
    args = ap.parse_args()

    os.makedirs(args.out_dir, exist_ok=True)
    for vs in args.vocab_sizes:
        prefix = os.path.join(args.out_dir, f"sindhi_custom_{vs}")
        n = train_one(args.corpus, prefix, vs)
        print(f"vocab_size={vs}: wrote {prefix}.model / .vocab ({n} pieces)")


if __name__ == "__main__":
    main()
