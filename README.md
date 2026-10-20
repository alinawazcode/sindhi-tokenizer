# Sindhi Tokenizer

A SentencePiece Unigram tokenizer for Sindhi, benchmarked against 14 existing tokenizers on four test sets, with an extra check for tokenizers that silently delete characters.

Model files: https://huggingface.co/alinawazmahar/sindhi-tokenizer

## Why this exists

Sindhi is written in a Perso-Arabic script with extra letters (ٻ ڄ ڏ ڳ ڀ ٿ ڇ ٺ ڻ) that Arabic, Urdu and Persian do not have. Existing tokenizers split these into fragments, map them to unknown tokens, or, in two cases found during this project, silently delete characters. This repo contains a tokenizer trained for the script, the code to train and evaluate it, and the full comparison.

## Results

Mean over four test sets (FLORES+, Wikipedia, Sentiment, Sindh Line news), every sentence used, no sampling. Fertility is tokens per word (lower is better).

| Tokenizer | Vocab size | Fertility | Single-token words % | UNK % | Worst-case characters lost in round trip |
|---|---|---|---|---|---|
| **This tokenizer (64k)** | 64,000 | **1.147** | **88.6** | 0.000 | 0.000% |
| TinyLlama_Sindhi | 42,681 | 1.208 | 84.4 | 0.000* | 0.415% |
| hellosindh_SindhiBERT_NER | 32,001 | 1.218 | 83.7 | 0.194 | 0.075% |
| mBERT_Sindhi_Kashif786 | 119,547 | 1.278 | 78.4 | 0.143 | 0.002% |
| XLM-RoBERTa | 250,002 | 1.512 | 65.4 | 0.034 | 0.004% |
| SindhiLM_v3 | 32,000 | 1.730 | 55.8 | 3.605 | 0.075% |
| FahadQazi_BPE | 13,031 | 1.919 | 39.1 | 0.000* | 0.846% |

\* These two tokenizers do not produce unknown tokens because they delete characters they cannot handle instead. See the round-trip check below. The full table (all 18 tokenizers, all four test sets) is in the report and in `results/`.

How to read this:

- At 64k, 100k and 150k the tokenizer has the lowest fertility and the highest single-token share of everything compared, on every test set. The 32k size loses one comparison: TinyLlama_Sindhi is better on FLORES+.
- The closest competitors are three Sindhi-adapted general-purpose tokenizers, not XLM-RoBERTa. The margin over them is real but much smaller than the margin over the older Sindhi-specific tokenizers.
- Byte-fallback rates are being re-measured with a stricter definition and are not reported here yet.

### Round-trip fidelity

UNK rate and byte-fallback rate cannot detect a tokenizer that drops characters without marking them. The round-trip check encodes text, decodes it, and counts characters that disappeared, after Unicode normalisation (NFKC), zero-width marks and whitespace are removed from both sides so ordinary normalisation is not counted.

- This tokenizer loses no characters on any of the four test sets, at all four vocabulary sizes.
- TinyLlama_Sindhi deletes a native Sindhi letter (U+06C1, HEH GOAL) and badly corrupts text written in Arabic Presentation Forms. It alters up to 24.9% of sentences (FLORES+).
- FahadQazi_BPE deletes scattered Latin letters in code-switched text and alters up to 16.2% of sentences (Wikipedia).

## Quickstart

```python
from huggingface_hub import hf_hub_download
import sentencepiece as spm

path = hf_hub_download("alinawazmahar/sindhi-tokenizer", "sindhi_custom_64000.model")
sp = spm.SentencePieceProcessor(model_file=path)

print(sp.encode("خداوند ڪريم کيس اعليٰ ذهانت سان نوازيو هو", out_type=str))
```

Available files: `sindhi_custom_32000.model`, `sindhi_custom_64000.model` (recommended), `sindhi_custom_100000.model`, `sindhi_custom_150000.model`.

Load the files with `sentencepiece` directly. Loading them through `transformers.LlamaTokenizer` can silently return a 3-token vocabulary.

## Repository layout

| Path | Contents |
|---|---|
| `docs/` | Full academic paper (`docs/paper.md`) and comprehensive engineering explainer (`docs/explainer.md`) |
| `training/` | `train_tokenizer.py` (final training settings) and the corpus recipe |
| `evaluation/` | `metrics.py`: fertility, single-token share, UNK rate, byte-fallback rate, round-trip fidelity |
| `demo/` | `app.py`: Gradio app that compares tokenizers on a sentence you type |
| `notebooks/` | The Kaggle notebooks the results were produced in |
| `results/` | Benchmark outputs |
| `DATA_SOURCES.md` | Every dataset used, with its license |

## Reproduce

```bash
pip install -r requirements.txt

# train (needs a corpus file, one sentence per line; see training/README.md)
python training/train_tokenizer.py --corpus corpus.txt --out-dir models

# evaluate one model on a text file
python evaluation/metrics.py --model models/sindhi_custom_64000.model --text sentences.txt

# interactive comparison (local model files)
SINDHI_TOKENIZER_SOURCE=local python demo/app.py
```

The training corpus is not included in this repo. `training/README.md` explains how to rebuild it from the original sources, and `DATA_SOURCES.md` lists their licenses.

## Limitations

- There is no classical or literary Sindhi test set (for example Shah Jo Risalo). Five candidate sources were tried and none was usable, so the results say nothing about classical text.
- The Sentiment test set and part of the training data both come from Kawish and Awami Awaz style news. The files are different, but the two are not fully independent.
- One training source (`shaikhsalman/sindhi-llm-corpus`) has no license stated on its dataset card. It was used for training only and no text from it is redistributed. See `DATA_SOURCES.md`.
- The tokenizer has not been evaluated for speech recognition or text-to-speech.
- The comparison covers tokenizers that could be found when the benchmark was run. New ones may have appeared since.

## License

- Code in this repository: MIT, see `LICENSE`.
- Tokenizer model files (on Hugging Face): CC BY-SA 4.0.
- Datasets: see `DATA_SOURCES.md`. No dataset text is redistributed here.

## Citation

```bibtex
@misc{nawaz2026sindhitokenizer,
  author = {Nawaz, Ali},
  title  = {Sindhi Tokenizer: a SentencePiece Unigram tokenizer for Sindhi, benchmarked against 14 existing tokenizers},
  year   = {2026},
  howpublished = {\url{https://github.com/Ali-Nawaz-devt/sindhi-tokenizer}}
}
```

## Acknowledgments

Developed at the Department of Computer Science, Shaikh Ayaz University, under the supervision of Engr. Attaullah Sahito.
