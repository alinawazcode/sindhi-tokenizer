# Data sources and licenses

Nothing listed here is redistributed in this repository. The tokenizer is a vocabulary learned from text; the text itself stays at its original source.

## Training data

| Source | Used for | License |
|---|---|---|
| [wikimedia/wikipedia](https://huggingface.co/datasets/wikimedia/wikipedia), Sindhi (`20231101.sd`) | 6,000 articles, kept separate from the test articles | Creative Commons Attribution-ShareAlike (version as stated on the dataset card) |
| Wikipedia in Urdu, Persian and Arabic (same dataset) | About 15% of the corpus, for shared script and loanwords | Creative Commons Attribution-ShareAlike (version as stated on the dataset card) |
| [Sindhi-NLP/sindhi-NLP-dataset](https://github.com/Sindhi-NLP/sindhi-NLP-dataset) | Two Twitter accounts, Awami Awaz articles, Daily Kawish articles | MIT (notice below) |
| [shaikhsalman/sindhi-llm-corpus](https://huggingface.co/datasets/shaikhsalman/sindhi-llm-corpus) | A 20,000-row sample, after removing mostly-English rows | **No license stated on the dataset card** |

### Note on the unlicensed source

The shaikhsalman corpus does not state a license, so its terms are unknown. It supplied roughly a third of the Sindhi-side training sentences. It was used only to learn a vocabulary, and no text from it is included here. If the author adds a license, this file will be updated to match.

### MIT notice for Sindhi-NLP

> Copyright (c) 2021 sindhi-NLP-dataset
>
> Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## Evaluation data (used for testing only)

| Source | Size used | License |
|---|---|---|
| [openlanguagedata/flores_plus](https://huggingface.co/datasets/openlanguagedata/flores_plus), Sindhi (`snd_Arab`), devtest | 1,012 sentences | See the dataset card |
| Sindhi Wikipedia, articles not used for training | 25,480 sentences after filtering | Creative Commons Attribution-ShareAlike |
| [alinawazmahar/Sindhi_Sentiment_dataset](https://huggingface.co/datasets/alinawazmahar/Sindhi_Sentiment_dataset) | 3,536 sentences | CC BY 4.0 |
| [Sindh Line Publishers corpus](https://prod.datacollective.mozillafoundation.org/datasets/cmk1bfsez3htsmk07xfzaf9oe) (Mozilla Data Collective) | 87,158 sentences after filtering | CC BY-SA 4.0 |

## Tokenizers compared

The benchmark loads these from their own repositories and does not redistribute them: SindhiLM-Tokenizer v1, v2 and v3 (aakashMeghwar01), Sindhi-BPE-Tokenizer (fahadqazi), mbert-sindhi-tokenizer (Kashif786), sindhi-tinyllama-tokenizer (jamalimubashirali), sindhi-bert-base and sindhi-bert-ner (hellosindh), XLM-RoBERTa, mT5, Qwen2.5, BLOOM, Gemma 3 and Llama 3.2.

## Licensing of this project

Code is MIT. The tokenizer model files are released under CC BY-SA 4.0, chosen because the Wikipedia training data is share-alike. This is a cautious default and not legal advice.
