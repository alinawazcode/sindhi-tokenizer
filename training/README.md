# Training

`train_tokenizer.py` holds the final settings. This file describes how the corpus was assembled; the exact code is in `notebooks/`.

## Settings

SentencePiece Unigram, `byte_fallback=True`, `character_coverage=1.0`, ids unk/bos/eos = 0/1/2, no pad token, no user-defined symbols. Four vocabulary sizes: 32,000, 64,000, 100,000, 150,000.

Two ideas were tested and removed. Forcing common postpositions and two loanwords to stay single tokens made the training objective worse (about 14.9 forced against 9.6 unforced at the same size). Pre-marking clitics with spaces did nothing, because the supposed fused forms were coincidental letter overlaps with unrelated words.

## Corpus recipe

The released models were trained on the corpus built by `notebooks/training.ipynb`. That notebook is the source of truth; this file summarizes it.

Sentences are split on the Arabic full stop, `.`, `!`, the Arabic question mark and newlines (`[\u06d4.!\u061f\n]+`); fragments of three characters or fewer are dropped. There is no upper length limit and no language filter.

1. **Sindhi Wikipedia.** Shuffle `wikimedia/wikipedia` (`20231101.sd`) with seed 42. The first 2,000 articles are reserved for testing; the next 6,000 are used for training, so the two sets cannot overlap. 104,775 sentences.
2. **Sindhi-NLP.** Four CSV files from the repository (two Twitter accounts, Awami Awaz, Daily Kawish). Some folder names contain spaces, so URL-encode them when downloading by URL. 363,164 sentences.
3. **shaikhsalman/sindhi-llm-corpus.** Shuffle with seed 7 and take 20,000 rows. Detect the text column rather than assuming a name. 630,180 sentences. No language filter was applied; a diagnostic found about 11.3% of sampled sentences were mostly Latin script, and they remain in the training text.
4. **Urdu, Persian, Arabic Wikipedia.** 1,500 articles each (seed 42). 89,449 unique sentences, 4,933,682 characters.
5. **Mix.** The Sindhi side (1,098,119 sentences, 102,682,270 characters) is combined with the Urdu, Persian and Arabic sentences repeated four times, because the unique cross-lingual text was smaller than the 15% target. The result is 83.9% Sindhi and 16.1% cross-lingual by character count. One sentence per line goes to `corpus.txt` (1,455,915 lines).
6. **Train** with the SentencePiece settings above. `normalization_rule_name` is not set, so SentencePiece's default `nmt_nfkc` applies. No random seed is passed to SentencePiece, and `input_sentence_size` is left at its default, so all lines are used.

The corpus is not included here; see `DATA_SOURCES.md` for the licenses. `train_tokenizer.py` holds only the training step and expects a `corpus.txt` built as above.
