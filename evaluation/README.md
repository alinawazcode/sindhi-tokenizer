# Tokenizer Evaluation & Metrics

This module provides standard and novel evaluation metrics for assessing subword tokenizers on Sindhi text.

## Metrics Implemented

1. **Fertility (`evaluate_tokenizer_on_sentences`)**:
   - Average number of subword tokens produced per whitespace-delimited word. Lower fertility represents higher representation efficiency.
2. **Compression Ratio**:
   - Average characters encoded per subword token. Higher compression means fewer tokens needed to encode the same sequence length.
3. **Single-Token Word Share (`single_token_pct`)**:
   - The percentage of running vocabulary words preserved as a single, intact token.
4. **UNK Rate (`unk_rate_pct`)**:
   - Percentage of tokens emitted as the unknown token (`<unk>` / `[UNK]`).
5. **Byte-Fallback Rate (`compute_byte_fallback_rate`)**:
   - Measures genuine fallback to raw UTF-8 byte tokens by checking for individual token IDs decoding to `\ufffd` (replacement character). Strictly isolates genuine fallback from tokens decoding to empty strings (e.g. `\u2581`).
6. **Round-Trip Character Fidelity (`check_roundtrip_fidelity`)**:
   - Encodes and decodes sentences to identify silent character deletion. Pre-applies Unicode NFKC normalization, removes zero-width formatting characters, and collapses whitespace before measuring loss, ensuring only destructive character loss is flagged.

## Command-Line Usage

To evaluate a trained SentencePiece `.model` on a text file:

```bash
python evaluation/metrics.py --model models/sindhi_custom_64000.model --text data/test_sentences.txt
```

## Python API Usage

```python
from evaluation.metrics import SPMTokenizerAdapter, evaluate_tokenizer_on_sentences, check_roundtrip_fidelity

# Load raw SentencePiece model with safe adapter wrapper
tokenizer = SPMTokenizerAdapter("models/sindhi_custom_64000.model")

sentences = [
    "خداوند ڪريم کيس اعليٰ ذهانت سان نوازيو هو",
    "سنڌ جي تاريخ تمام قديم آهي"
]

# Run basic metrics
stats = evaluate_tokenizer_on_sentences(tokenizer, sentences)
print(f"Fertility: {stats['fertility']:.3f}")
print(f"Single-token %: {stats['single_token_pct']:.1f}%")

# Check round-trip preservation
loss_pct, lost, total, affected, worst = check_roundtrip_fidelity(tokenizer, sentences)
print(f"Character loss: {loss_pct:.4f}% across {affected} sentences")
```
