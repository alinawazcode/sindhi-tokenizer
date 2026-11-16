# Benchmark Results

This directory contains benchmark tables and evaluation outputs for all evaluated tokenizers across four evaluation registers (with a documented publisher-proximity limitation for the sentiment set):
- **`flores200_anchor`**: Standardized cross-lingual anchor (FLORES+ `snd_Arab`).
- **`wikipedia_formal`**: Canonical 3–100 word filtered encyclopedic prose (25,480 sentences).
- **`sentiment_informal`** (legacy ID): newspaper text with sentiment labels (3,536 sentences).
- **`sindh_line_news`**: Contemporary daily news (87,158 sentences).

## Key Findings Summary

Across all registers evaluated at full scale:
- **CustomSindhi (64k, 100k, 150k)** has the lowest fertility and highest single-token retention in every register. On FLORES+ at 64k the margin is 0.002 fertility and 0.3 points of single-token retention (parity); no significance tests were run.
- **CustomSindhi (32k)** outperforms all baselines on 3 registers, narrowly trailing TinyLlama on FLORES+.
- **Round-trip length check**: Custom models show 0.0000% normalized-length loss on evaluated text. This length-based check detects shortening but does not prove exact character identity; it also exposed length loss in TinyLlama and FahadQazi BPE.

The 64k+ variants lead the baselines on fertility and single-token retention; byte-fallback has a separate trade-off. The full tables and methodology can be found in [`docs/paper.md`](../docs/paper.md) and [`docs/explainer.md`](../docs/explainer.md).

The paper is also available as a [preprint on Preprints.org](https://doi.org/10.20944/preprints202611.1598.v1) (version 1, not peer-reviewed).
