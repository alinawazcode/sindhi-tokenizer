# Data sources and licenses

Nothing listed here is redistributed in this repository. The tokenizer is a vocabulary learned from text; the text itself stays at its original source.

## Training data

| Source | Used for | License |
|---|---|---|
| [wikimedia/wikipedia](https://huggingface.co/datasets/wikimedia/wikipedia), Sindhi (`20231101.sd`) | 6,000 articles, kept separate from the test articles | Creative Commons Attribution-ShareAlike (version as stated on the dataset card) |
| Wikipedia in Urdu, Persian and Arabic (same dataset) | About 15% of the corpus, for shared script and loanwords | Creative Commons Attribution-ShareAlike (version as stated on the dataset card) |
| [Sindhi-NLP/sindhi-NLP-dataset](https://github.com/Sindhi-NLP/sindhi-NLP-dataset) | Mostly Awami Awaz and Daily Kawish news, plus a small share of Twitter data | Repository includes an MIT notice; whether it covers all underlying text is unverified (notice below) |
| [shaikhsalman/sindhi-llm-corpus](https://huggingface.co/datasets/shaikhsalman/sindhi-llm-corpus) | A 20,000-row sample, after removing mostly-English rows | Project owner reports this source is free to use; the dataset card does not specify the exact license or conditions |

### Note on source-specific license terms

The project lead reports that the shaikhsalman corpus is free to use. Its dataset card does not state a specific license or conditions, so record the source-specific terms and any attribution requirements with the maintainer before making a more precise license claim. It supplied roughly a third of the Sindhi-side training sentences and was used to learn the tokenizer vocabulary; no source text is redistributed here. The model-file license label does not replace the source license or its conditions.

### MIT notice in the Sindhi-NLP repository

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

## Licensing status of this project

The repository code is licensed under MIT. The tokenizer model files are labeled CC BY-SA 4.0 on the project listing. The project lead reports that the source datasets are free to use, mostly under MIT and other open licenses. Each source may have distinct attribution, share-alike, or redistribution conditions; consult its dataset card and the details above. The shaikhsalman card does not state the exact license, and the scope of the Sindhi-NLP repository's MIT notice for underlying text remains to be confirmed. This is a status note, not a legal conclusion.
