# Notebooks

Kaggle notebooks the published numbers were produced in. They are kept as run, so they contain diagnostic cells alongside the main pipeline.

| Notebook | Purpose |
|---|---|
| `training.ipynb` | Builds the corpus and trains the four tokenizers |
| `benchmark.ipynb` | Loads all tokenizers and runs the four test sets: fertility, single-token share, UNK, byte-fallback, round-trip fidelity, and the 22-word morpheme check |

Both read Hugging Face credentials from a Kaggle secret named `HF_TOKEN`. No token is stored in the files.
