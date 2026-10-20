"""
Sindhi Tokenizer Comparison Demo
--------------------------------
Type a Sindhi sentence, pick which tokenizers to run it through, and see the
token count and the actual tokens each one produces.

The published tokenizer is loaded from the Hugging Face Hub
(alinawazmahar/sindhi-tokenizer). Baselines are loaded from their own public
repositories. Models load on first use, so the app opens instantly.

Run locally:   python demo/app.py
Gated models (Gemma3, Llama3.2) need an HF_TOKEN environment variable with
access granted on their model pages; they are simply reported as unavailable
otherwise.
"""

import os
import gradio as gr
import sentencepiece as spm
from transformers import AutoTokenizer

# ---------------------------------------------------------------------------
# Raw SentencePiece models need a small wrapper. Do not load these files with
# transformers.LlamaTokenizer: it can silently return a 3-token vocabulary.
# ---------------------------------------------------------------------------


class SPMTokenizerAdapter:
    def __init__(self, model_path):
        self.sp = spm.SentencePieceProcessor(model_file=model_path)
        self.unk_token = "<unk>"

    @property
    def vocab_size(self):
        return self.sp.get_piece_size()

    def encode(self, text, add_special_tokens=False):
        return self.sp.encode(text, out_type=int)

    def convert_ids_to_tokens(self, ids):
        return [self.sp.id_to_piece(i) for i in ids]

    def convert_tokens_to_string(self, tokens):
        return self.sp.decode(tokens)

    def decode(self, ids):
        return self.sp.decode(ids)


def decode_tokens_pretty(tokenizer, token_ids):
    """Show each token as readable text. Byte-level BPE tokenizers would otherwise
    print raw byte-mapped strings; pieces that decode to nothing (such as the
    SentencePiece word-boundary marker) are shown in their raw form instead of
    as a blank gap."""
    tokens = tokenizer.convert_ids_to_tokens(token_ids)
    pieces = []
    for t in tokens:
        text = tokenizer.convert_tokens_to_string([t])
        pieces.append(text if text != "" else t)
    return pieces


# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

# Where the published tokenizer files live. "hub" downloads them from the public
# model repo; "local" reads sindhi_custom_<size>.model from LOCAL_MODEL_DIR.
CUSTOM_MODEL_SOURCE = os.environ.get("SINDHI_TOKENIZER_SOURCE", "hub")
HUB_REPO = "alinawazmahar/sindhi-tokenizer"
LOCAL_MODEL_DIR = "./models"

VOCAB_SIZES = [32000, 64000, 100000, 150000]

SINDHI_TOKENIZER_IDS = {
    "SindhiLM_v1": "aakashMeghwar01/SindhiLM-Tokenizer-v1",
    "SindhiLM_v2": "aakashMeghwar01/SindhiLM-Tokenizer-v2",
    "SindhiLM_v3": "aakashMeghwar01/SindhiLM-Tokenizer-v3",
    "FahadQazi_BPE": "fahadqazi/Sindhi-BPE-Tokenizer",
    "mBERT_Sindhi_Kashif786": "Kashif786/mbert-sindhi-tokenizer",
    "TinyLlama_Sindhi_jamalimubashirali": "jamalimubashirali/sindhi-tinyllama-tokenizer",
    "hellosindh_SindhiBERT": "hellosindh/sindhi-bert-base",
}

# hellosindh/sindhi-bert-ner ships a raw SentencePiece file, not a tokenizer.json.
RAW_SPM_FILES = {
    "hellosindh_SindhiBERT_NER": ("hellosindh/sindhi-bert-ner", "sindhi_bpe_32k.model"),
}

MULTILINGUAL_TOKENIZER_IDS = {
    "XLM-RoBERTa": "FacebookAI/xlm-roberta-base",
    "mT5": "google/mt5-base",
    "Qwen2.5": "Qwen/Qwen2.5-0.5B",
    "BLOOM": "bigscience/bloom-560m",
}

GATED_TOKENIZER_IDS = {
    "Gemma3": "google/gemma-3-1b-pt",
    "Llama3.2": "meta-llama/Llama-3.2-1B",
}

BYT5_ID = {"ByT5-small": "google/byt5-small"}

CUSTOM_NAMES = [f"CustomSindhi_{vs // 1000}k" for vs in VOCAB_SIZES]

ALL_MODEL_NAMES = (
    CUSTOM_NAMES
    + list(SINDHI_TOKENIZER_IDS)
    + list(RAW_SPM_FILES)
    + list(MULTILINGUAL_TOKENIZER_IDS)
    + list(GATED_TOKENIZER_IDS)
    + list(BYT5_ID)
)

DEFAULT_SELECTION = [
    "CustomSindhi_64k",
    "TinyLlama_Sindhi_jamalimubashirali",
    "XLM-RoBERTa",
    "SindhiLM_v3",
]

# ---------------------------------------------------------------------------
# Lazy loading
# ---------------------------------------------------------------------------

_loaded = {}
_hf_token = os.environ.get("HF_TOKEN")


def _custom_model_path(vs):
    filename = f"sindhi_custom_{vs}.model"
    if CUSTOM_MODEL_SOURCE == "local":
        return os.path.join(LOCAL_MODEL_DIR, filename)
    if CUSTOM_MODEL_SOURCE == "hub":
        from huggingface_hub import hf_hub_download
        return hf_hub_download(repo_id=HUB_REPO, filename=filename)
    raise ValueError(f"Unknown SINDHI_TOKENIZER_SOURCE: {CUSTOM_MODEL_SOURCE}")


def load_tokenizer(name):
    if name in _loaded:
        if _loaded[name] is None:
            raise RuntimeError(f"{name} is unavailable (an earlier load failed)")
        return _loaded[name]
    try:
        if name in CUSTOM_NAMES:
            vs = int(name.split("_")[1].rstrip("k")) * 1000
            tok = SPMTokenizerAdapter(_custom_model_path(vs))
        elif name in RAW_SPM_FILES:
            from huggingface_hub import hf_hub_download
            repo, filename = RAW_SPM_FILES[name]
            tok = SPMTokenizerAdapter(hf_hub_download(repo_id=repo, filename=filename))
        elif name in SINDHI_TOKENIZER_IDS:
            tok = AutoTokenizer.from_pretrained(SINDHI_TOKENIZER_IDS[name])
        elif name in MULTILINGUAL_TOKENIZER_IDS:
            tok = AutoTokenizer.from_pretrained(MULTILINGUAL_TOKENIZER_IDS[name])
        elif name in GATED_TOKENIZER_IDS:
            tok = AutoTokenizer.from_pretrained(GATED_TOKENIZER_IDS[name], token=_hf_token)
        elif name in BYT5_ID:
            tok = AutoTokenizer.from_pretrained(BYT5_ID[name])
        else:
            raise ValueError(f"Unknown model: {name}")
        _loaded[name] = tok
        return tok
    except Exception as e:
        _loaded[name] = None
        raise RuntimeError(f"Could not load {name}: {e}")


# ---------------------------------------------------------------------------
# Comparison logic
# ---------------------------------------------------------------------------


def compare_tokenizers(sentence, selected_models):
    if not sentence or not sentence.strip():
        return "Enter a sentence above, then click Compare."
    if not selected_models:
        return "Select at least one model to compare."

    rows = []
    for name in selected_models:
        try:
            tok = load_tokenizer(name)
            ids = tok.encode(sentence, add_special_tokens=False)
            pieces = decode_tokens_pretty(tok, ids)
            # "|" is the markdown table column separator, so escape any literal pipe
            # inside a token and join pieces with a broken bar instead.
            safe = [p.replace("|", "\\|") for p in pieces]
            rows.append((name, len(pieces), " \u00a6 ".join(safe)))
        except Exception as e:
            rows.append((name, "n/a", f"(unavailable: {e})"))

    # Fewest tokens first; failures go last.
    rows.sort(key=lambda r: (r[1] if isinstance(r[1], int) else 10**9))

    lines = ["| Model | Tokens | Segmentation |", "|---|---|---|"]
    for name, n, pieces in rows:
        lines.append(f"| **{name}** | {n} | {pieces} |")
    return "\n".join(lines)


# ---------------------------------------------------------------------------
# UI
# ---------------------------------------------------------------------------

with gr.Blocks(title="Sindhi Tokenizer Comparison") as demo:
    gr.Markdown(
        "# Sindhi Tokenizer Comparison\n"
        "Type a Sindhi sentence, choose which tokenizers to compare, and see how many "
        "tokens each produces and what those tokens are. Results are sorted by token "
        "count, fewest first. Fewer tokens is not the only thing that matters: a "
        "tokenizer that silently drops characters can also look efficient."
    )
    with gr.Row():
        sentence_input = gr.Textbox(label="Sindhi sentence", rtl=True, lines=2)
    with gr.Row():
        model_selector = gr.CheckboxGroup(
            choices=ALL_MODEL_NAMES, value=DEFAULT_SELECTION, label="Models to compare"
        )
    compare_btn = gr.Button("Compare", variant="primary")
    output = gr.Markdown()
    compare_btn.click(fn=compare_tokenizers, inputs=[sentence_input, model_selector], outputs=output)
    gr.Markdown(
        "---\n"
        "**Sindhi Tokenizer Project** · Developed at Department of Computer Science, Shaikh Ayaz University, Shikarpur\n\n"
        "**Team:** Ali Nawaz ([GitHub](https://github.com/alinawazcode)), "
        "Muqadas Fareed ([LinkedIn](https://www.linkedin.com/in/muqadas-fareed-24a07837b/)), "
        "Soonh Sadaf ([LinkedIn](https://www.linkedin.com/in/sadaf-khaliq-a69215411/)) · "
        "**Supervision:** [Dr. Attaullah Sahito](https://www.linkedin.com/in/attaullah-sahito/?isSelfProfile=false)"
    )

if __name__ == "__main__":
    demo.launch()
