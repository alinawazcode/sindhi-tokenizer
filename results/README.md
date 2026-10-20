# Benchmark Results

This directory contains benchmark tables and evaluation outputs for all evaluated tokenizers across the four independent registers:
- **`flores200_anchor`**: Standardized cross-lingual anchor (FLORES+ `snd_Arab`).
- **`wikipedia_formal`**: Canonical 3–100 word filtered encyclopedic prose (25,480 sentences).
- **`sentiment_informal`**: Sindhi news sentiment sentences (3,536 sentences).
- **`sindh_line_news`**: Contemporary daily news (87,158 sentences).

## Key Findings Summary

Across all registers evaluated at full scale:
- **CustomSindhi (64k, 100k, 150k)** outperforms all 17 baseline tokenizers on fertility and single-token retention without exception.
- **CustomSindhi (32k)** outperforms all baselines on 3 registers, narrowly trailing TinyLlama on FLORES+.
- **Zero Character Loss**: Custom models achieve 0.0000% character loss on round-trip fidelity, while detecting critical defects in competitors (silent deletion of `U+06C1` in TinyLlama and Latin character loss in FahadQazi BPE).

The full tables and methodology can be found in [`docs/paper.md`](../docs/paper.md) and [`docs/explainer.md`](../docs/explainer.md).
