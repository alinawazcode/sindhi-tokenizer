# Training

`train_tokenizer.py` holds the final settings. This file describes how the corpus was assembled; the exact code is in `notebooks/`.

## Settings

SentencePiece Unigram, `byte_fallback=True`, `character_coverage=1.0`, ids unk/bos/eos = 0/1/2, no pad token, no user-defined symbols. Four vocabulary sizes: 32,000, 64,000, 100,000, 150,000.

Two ideas were tested and removed. Forcing common postpositions and two loanwords to stay single tokens made the training objective worse (about 14.9 forced against 9.6 unforced at the same size). Pre-marking clitics with spaces did nothing, because the supposed fused forms were coincidental letter overlaps with unrelated words.

## Corpus recipe

Sentences are split on the Arabic full stop, `.`, `!`, the Arabic question mark and newlines (`[\u06d4.!\u061f\n]+`); fragments of three characters or fewer are dropped.

1. **Sindhi Wikipedia.** Shuffle `wikimedia/wikipedia` (`20231101.sd`) with seed 42. The first 2,000 articles are reserved for testing; the next 6,000 are used for training, so the two sets cannot overlap. Keep sentences of 3 to 100 words.
2. **Sindhi-NLP.** Four CSV files from the repository (two Twitter accounts, Awami Awaz, Daily Kawish). Some folder names contain spaces, so URL-encode them when downloading by URL.
3. **shaikhsalman/sindhi-llm-corpus.** Shuffle with seed 7 and take 20,000 rows. Detect the text column rather than assuming a name.
4. **Urdu, Persian, Arabic Wikipedia.** 1,500 articles each (seed 42).
5. **Filter.** Drop any sentence where more than 30% of characters are Latin letters. This removed about 11% of the shaikhsalman sample, which contained English text.
6. **Mix.** Trim or repeat the Urdu/Persian/Arabic sentences so they make up about 15% of characters. Write one sentence per line to `corpus.txt`.
7. **Train** with `train_tokenizer.py`.

The corpus has roughly 1.46 million sentences. It is not included here; see `DATA_SOURCES.md` for the licenses.
