# Interactive Tokenizer Comparison Demo

A Gradio web interface to test and compare subword tokenization across multiple tokenizers in real time on any Sindhi text.

## Features

- **Side-by-side comparison**: View token counts and visual subword segmentations.
- **Three tokenizer categories**:
  1. **Custom Sindhi Models** (32k, 64k flagship, 100k, 150k)
  2. **Sindhi-Adapted Models** (SindhiLM v1/v2/v3, FahadQazi BPE, mBERT Sindhi, TinyLlama Sindhi, SindhiBERT base & NER)
  3. **Multilingual LLM Baselines** (XLM-RoBERTa, mT5, Qwen2.5, BLOOM, Gemma 3, Llama 3.2)
- **Token inspector**: Visually inspect subword boundaries with whitespace/prefix markers preserved.

## Running Locally

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Launch the app:
   ```bash
   python demo/app.py
   ```
   By default, models are fetched from the Hugging Face Hub (`alinawazmahar/sindhi-tokenizer`).

3. Using local model files:
   ```bash
   SINDHI_TOKENIZER_SOURCE=local python demo/app.py
   ```
   (Expects `.model` files placed in `./models/`).

## Deploying to Hugging Face Spaces

1. Create a new Space on [Hugging Face](https://huggingface.co/new-space) with the **Gradio** SDK.
2. Push or upload `demo/app.py` as the entrypoint `app.py`.
3. Include `requirements.txt` in the root of the Space.
