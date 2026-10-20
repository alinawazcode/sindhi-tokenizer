**The Sindhi Tokenizer Project**

*A complete, plain-language walkthrough of everything done, found, and decided*

*This is NOT the paper. It\'s the companion explainer: every dataset, every number, every bug, every decision, in full detail, in plain language, in the order things actually happened. Read this to understand the whole project top to bottom; use the paper (sindhi-tokenizer-report.docx) for the condensed, formal, citable version.*

# **What\'s in this document**

- Part 1 --- The goal, and how it changed

- Part 2 --- Every dataset used, with exact sizes, sources, and links

- Part 3 --- The classical-register search that never succeeded

- Part 4 --- How the tokenizer itself was built, including the two ideas that got tested and killed

- Part 5 --- All 18 tokenizers in the comparison, what each one is

- Part 6 --- What each metric actually measures, in plain terms

- Part 7 --- Every bug found during the project, in the order it was found, with before/after numbers

- Part 8 --- The final results, in full

- Part 9 --- What got decided, and why

- Part 10 --- What\'s still open

# **Part 1 --- The goal, and how it changed** {#part-1-the-goal-and-how-it-changed}

Start here, because the goal at the end is not the goal we started with, and that matters for understanding every decision after it.

The project started as: build a Sindhi tokenizer that beats every existing tokenizer on every metric. That goal was rejected early --- not because it was unambitious, but because it was incoherent. Metrics trade off against each other by construction: a tokenizer tuned for low fertility on one register (XLM-RoBERTa\'s huge vocabulary, for example) will not automatically also have the lowest UNK rate, the lowest byte-fallback rate, AND the best performance on rare proper nouns. You can\'t maximize five things that pull against each other at once; you can only find the best achievable balance and report it honestly.

The goal was then narrowed and made concrete: build a general-purpose Sindhi subword tokenizer, benchmark it rigorously and honestly against everything else that exists, and publish both the tokenizer and the full benchmark. Two downstream uses were considered and explicitly ruled out along the way:

- Speech recognition (ASR): ruled out early. Whisper, the ASR system already in use, has its own fixed tokenizer baked into the trained model. A better standalone tokenizer can\'t plug into it without retraining the whole ASR model from scratch --- a completely different, much bigger project.

- Text-to-speech (TTS): never ruled in. Most TTS systems consume characters or phonemes, not subword tokens, so whether this tokenizer would even be the right input representation for TTS depends on a TTS architecture that was never chosen. This is listed as open future work, not solved.

So the final, honest scope is: a general-purpose Sindhi subword tokenizer for NLP / future language-model use, benchmarked against everything findable in the space, with every limitation stated rather than hidden.

# **Part 2 --- Every dataset used** {#part-2-every-dataset-used}

Two different kinds of dataset were used, and it matters to keep them separate: TRAINING data (what the tokenizer learned its vocabulary from) and EVALUATION data (what it was tested against afterward). They were deliberately kept non-overlapping wherever possible --- training a tokenizer on the same text you test it on would make the test meaningless.

## **2.1 Training corpus --- 4 sources, combined** {#training-corpus-4-sources-combined}

### **Sindhi Wikipedia**

Source: wikimedia/wikipedia dataset on Hugging Face, Sindhi configuration (20231101.sd). A 6,000-article slice was used, deliberately chosen to be a DIFFERENT set of articles than the ones used for evaluation --- both slices come from the same underlying Wikipedia dump, shuffled with the same random seed, but the training slice starts right after the evaluation slice ends, so there is zero overlap between the two.

**Link:** [[https://huggingface.co/datasets/wikimedia/wikipedia]{.underline}](https://huggingface.co/datasets/wikimedia/wikipedia)

### **Sindhi-NLP (GitHub)**

Source: a GitHub repository containing scraped Sindhi social media and news content --- two Twitter/X accounts, Awami Awaz newspaper articles, and Daily Kawish newspaper articles. This was originally called the "informal" source, but once the real numbers came in, that label turned out to be wrong: only about 1.6% of the sentences from this source are actually tweets. The other 98.4% are formal Awami Awaz and Daily Kawish news articles. The variable name was kept for convenience but the framing was corrected in the final report --- this source is mostly a second formal-news corpus, not an informal one.

**Link:** [[https://github.com/Sindhi-NLP/sindhi-NLP-dataset]{.underline}](https://github.com/Sindhi-NLP/sindhi-NLP-dataset)

### **shaikhsalman/sindhi-llm-corpus**

Source: a large, recent Sindhi corpus on Hugging Face. A 20,000-row sample was used, for modern/contemporary vocabulary coverage. A real problem was found and fixed here: 11.3% of the sampled sentences were majority English text, not Sindhi at all (English contamination inside a dataset labeled as Sindhi). This was detected with a simple character-ratio check and filtered out before training --- any sentence where more than 30% of characters were Latin letters was dropped. After the filter, a re-check confirmed 0.0% majority-Latin sentences remained.

**Link:** [[https://huggingface.co/datasets/shaikhsalman/sindhi-llm-corpus]{.underline}](https://huggingface.co/datasets/shaikhsalman/sindhi-llm-corpus)

### **Urdu + Persian + Arabic Wikipedia** {#urdu-persian-arabic-wikipedia}

Source: the same wikimedia/wikipedia dataset, but the Urdu, Persian, and Arabic language configurations instead of Sindhi. Mixed in at roughly 15% of the total corpus by character count (the Sindhi-side sources make up the other 85%). The reasoning: Sindhi shares script and vocabulary with these three languages, especially for loanwords, so some cross-lingual exposure should help the tokenizer handle borrowed words without needing to see every one of them in Sindhi text specifically.

*Total final training corpus after all fixes: roughly 1.46 million sentences, combined from all four sources above.*

## **2.2 Evaluation registers --- 4 independent test sets** {#evaluation-registers-4-independent-test-sets}

### **FLORES+ (Sindhi, snd_Arab, devtest split)**

1,012 sentences. This is a professionally curated, standardized multilingual benchmark --- the same sentences translated into dozens of languages, used across the NLP field as a common reference point. It\'s the "anchor" register: the one most comparable to what other papers report.

**Link:** [[https://huggingface.co/datasets/openlanguagedata/flores_plus]{.underline}](https://huggingface.co/datasets/openlanguagedata/flores_plus)

### **Wikipedia (formal / encyclopedic)** {#wikipedia-formal-encyclopedic}

25,480 sentences (435,947 words), after cleaning. The raw Wikipedia text was first split into sentences with a simple rule-based splitter, which produced some junk: short fragments like page titles ("List of all pages beginning with \'Pakistani\'") and the occasional very long unsplit block. A filter was added --- keep only sentences with between 3 and 100 words --- which removed both extremes. This exact definition was used consistently everywhere in the project after it was introduced; early on there was a real inconsistency where two different sentence counts for "Wikipedia" (25,480 vs. 33,512) were floating around from before vs. after this filter, and that had to be tracked down and resolved to one single definition.

### **Sentiment (informal / social)** {#sentiment-informal-social}

3,536 sentences (47,156 words). This is Ali\'s own existing dataset, built earlier from Kawish and Awami Awaz newspaper corpora using semi-supervised pseudo-labeling. One honest limitation: this register and the Sindhi-NLP training source both draw from Kawish/Awami Awaz-adjacent news --- not the exact same files, but similar enough in style and vocabulary that this register isn\'t perfectly independent from part of the training data. Stated plainly in the report rather than hidden.

**Link:** [[https://huggingface.co/datasets/alinawazmahar/Sindhi_Sentiment_dataset]{.underline}](https://huggingface.co/datasets/alinawazmahar/Sindhi_Sentiment_dataset)

### **Sindh Line Publishers (contemporary news)**

87,158 sentences (1,014,998 words) --- by far the largest register, almost 2.5 times the size of all the other three registers combined. Source: a Karachi Sindhi newspaper corpus hosted on Mozilla\'s Data Collective platform, covering 2024--2025, licensed CC-BY-SA-4.0. This one had no scriptable download link --- the page has a download button but no direct file URL --- so it had to be downloaded manually and uploaded as a Kaggle dataset, the same way the trained tokenizer models were later shared between notebooks. Chosen specifically because it has zero overlap with any training source --- a genuinely independent fourth register.

**Link:** [[https://prod.datacollective.mozillafoundation.org/datasets/cmk1bfsez3htsmk07xfzaf9oe]{.underline}](https://prod.datacollective.mozillafoundation.org/datasets/cmk1bfsez3htsmk07xfzaf9oe)

*Because Sindh Line is so much larger than the other three registers, the final report\'s summary numbers use an UNWEIGHTED mean across the four registers (each register counts equally), not a token-weighted average (which would be dominated almost entirely by Sindh Line). This choice is stated explicitly in the report rather than left implicit.*

# **Part 3 --- The classical-register search that never succeeded** {#part-3-the-classical-register-search-that-never-succeeded}

A fifth register --- classical/literary Sindhi, specifically Shah Jo Risalo, the most important work of classical Sindhi poetry --- was wanted from early on and never obtained. Five separate sources were tried, across two different sessions of this project, and every single one failed for a different reason. This is worth documenting in full because it shows real, thorough effort rather than giving up after one try.

| **\#** | **Source tried** | **What happened** |
|:--:|----|----|
| 1 | A Mendeley-hosted CSV export of Shah Jo Risalo | The Sindhi script was corrupted during an Excel round-trip at some point --- unrecoverable garbled encoding, not usable. |
| 2 | A Kaggle dataset claiming to be Shah Jo Risalo | Turned out to actually be an unrelated SQL database dump, not poetry text at all. |
| 3 | An Internet Archive OCR scan (first one found) | Real Sindhi script, but the OCR quality was too noisy: misrecognized characters, footnote numbers bleeding into the main text. |
| 4 | A second Internet Archive OCR scan (different scan, found later) | Even worse than \#3 --- the extracted text was largely unreadable mojibake. Also discovered to be licensed Attribution-NonCommercial-NoDerivatives, which would have blocked training on it even if the text had been clean, since "No Derivative Works" arguably rules out using it to train a model. |
| 5 | Bhittaipedia / AMBILE (a real, professionally maintained digital-humanities platform run by a Government of Sindh institute) | The only genuinely clean, high-quality source found. But: the live website publishes no stated reuse license at all (checked directly, nothing found), and the one place it IS published with a license (IEEE DataPort, CC-BY-NC-4.0) requires a paid subscription this project didn\'t have. A free-account check and a direct-email-to-the-institute path were both identified as next steps, but neither was completed before this document was written. |

*All five attempts at a classical/literary register, in the order they were tried.*

Bottom line: this register is still missing, and the report states this plainly as a limitation rather than pretending it doesn\'t matter. If this gets resolved later (free IEEE account, or a reply from AMBILE), it would be a genuinely strong addition --- no other tokenizer in this comparison has been tested on classical Sindhi at all.

# **Part 4 --- How the tokenizer itself was built** {#part-4-how-the-tokenizer-itself-was-built}

## **4.1 The algorithm** {#the-algorithm}

SentencePiece Unigram, not BPE. Decided early and never changed. Reasoning: Unigram tends to produce cleaner linguistic splits (keeping a root and a suffix as separate meaningful pieces) for morphologically rich languages like Sindhi, rather than the somewhat arbitrary merge-pairs that plain BPE produces.

- byte_fallback = True: if the tokenizer sees a character combination it doesn\'t recognize, it falls back to raw bytes instead of either crashing or silently destroying the text. This was a deliberate design choice, and it turned out to matter a lot (see Part 7).

- character_coverage = 1.0: guarantees that Sindhi\'s own special letters (the nine letters listed in the Appendix) can never be dropped from the vocabulary, no matter how rare they are in the training text. This directly targets the single biggest weakness found in one of the older Sindhi tokenizers (SindhiLM_v1), which drops these letters constantly.

- Four vocabulary sizes were trained and tested side by side: 32,000 / 64,000 / 100,000 / 150,000 --- rather than guessing one size, all four were benchmarked and compared.

## **4.2 Two ideas that were tried, tested, and killed** {#two-ideas-that-were-tried-tested-and-killed}

Both of these came from reading general tokenization advice for morphologically rich, clitic-heavy languages. Both were implemented, then tested against the real data, then removed because the data said they didn\'t help --- or actively hurt.

### **Idea 1: Clitic pre-marking**

Sindhi has a handful of very common short \"clitic\" words that attach grammatically to the word before them --- postpositions like the ones meaning \"of\", \"at\", \"to\", \"with\". The idea was to explicitly force a space around these before training, so the tokenizer would be guaranteed to treat them as separate units. A diagnostic was run on the real training corpus to check how often these clitics actually appear fused (no space) versus already separated. The surprising result: in the cases that looked like \"fusion,\" it was almost always just coincidence --- ordinary unrelated words that happen to end in the same two or three letters as a clitic, not the clitic actually attached to anything. A control character with no plausible coincidental overlap confirmed a near-zero true fusion rate. Conclusion: Sindhi already writes these as separate words almost all the time. The whole preprocessing step was removed --- it would have added a permanent extra step every future user of this tokenizer would have had to replicate, for zero actual benefit.

### **Idea 2: Forcing specific words to always be a single token**

The same clitics, plus two common tech loanwords, were then forced into the vocabulary as fixed single pieces (using SentencePiece\'s user_defined_symbols option), so they would be guaranteed to come out as one token no matter what. Tested head-to-head against a version without this forcing, same corpus, same vocabulary size. Result: forcing made things WORSE, not better. Measured directly via the training objective value (roughly 14.9 with forcing vs. roughly 9.6 without --- lower is better), and visibly worse in practice: the forced loanword for \"computer,\" for example, came out as two tokens (the forced word plus an isolated leading space) instead of one clean token, because the trainer couldn\'t also learn the more natural space-fused version once the plain version was locked in. This was reversed too. In the final version, every one of these words reaches single-token status on its own, with no forcing at all --- the corpus is simply large and clean enough that it doesn\'t need help.

*Both of these reversed decisions are reported in the paper as real findings, not hidden as false starts --- \"we tried this, tested it, and it didn\'t work\" is itself useful information for anyone building a tokenizer for a similar language.*

# **Part 5 --- All 18 tokenizers in the final comparison** {#part-5-all-18-tokenizers-in-the-final-comparison}

Fourteen baseline tokenizers (things other people built) plus four sizes of the new one. The fourteen baselines split into three groups by when they were found.

## **5.1 Group A --- Sindhi-specific, found at the start of the project (4)** {#group-a-sindhi-specific-found-at-the-start-of-the-project-4}

- SindhiLM_v1 --- vocab size 43 (!). Extremely small, BPE. Its headline weakness: a 12--15% UNK rate --- roughly one in every seven or eight words comes out as completely unrecognized. It also has no byte-fallback mechanism at all, so unrecognized content just becomes \<unk\> with no alternative.

- SindhiLM_v2 --- vocab size 151,643. Later discovered (and confirmed four separate times across this project, using different checks each time) to be a re-published wrapper around Qwen2.5\'s tokenizer, not an independently trained one. Its numbers are kept in the results tables for completeness but it\'s excluded from the word-by-word comparison, since its row would just be a duplicate of Qwen2.5\'s.

- SindhiLM_v3 --- vocab size 32,000. The best of the three SindhiLM tokenizers by far --- genuinely good single-token performance on common words and loanwords. Its main weakness is a real UNK rate (3--5%) and a specific, confirmed blind spot: it completely fails on the word ڏينهن (meaning \"day\"), breaking it into three separate pieces every time, even though it handles almost every other digraph-letter word perfectly.

- FahadQazi_BPE --- vocab size 13,031. A plain BPE tokenizer with no byte-fallback. Later found during round-trip testing (Part 7) to have a serious, previously undocumented bug: it silently deletes individual Latin letters scattered through code-switched text.

## **5.2 Group B --- General-purpose multilingual (6)** {#group-b-general-purpose-multilingual-6}

- XLM-RoBERTa --- vocab size 250,002. The strongest general-purpose competitor for most of this project, until three Sindhi-adapted tokenizers from Group C beat it (Part 8).

- mT5 --- vocab size 250,100. Much worse fertility than XLM-RoBERTa despite a similar vocab size --- a useful real-world example that vocabulary size alone doesn\'t determine quality; training-data composition matters more.

- Qwen2.5 --- vocab size 151,643. Numerically identical to SindhiLM_v2 (see above).

- BLOOM --- vocab size 250,680. Has the worst byte-fallback rate of anything tested once correctly measured --- around 30%, meaning roughly one in three tokens on Sindhi text is a raw byte fallback rather than a real subword.

- Gemma3 --- vocab size 262,144. The one tokenizer whose byte-fallback performance stays genuinely close to the new tokenizer\'s --- the only close competitor on that specific metric.

- Llama3.2 --- vocab size 128,000. Similarly poor byte-fallback rate to BLOOM once correctly measured (around 26--30%).

## **5.3 Group C --- Found later, during a pre-publication search (4)** {#group-c-found-later-during-a-pre-publication-search-4}

These four were NOT in the original comparison. They were only found while checking whether the name "sindhi-tokenizer" was available before publishing --- a search that turned up competitors nobody had benchmarked against yet. Adding them changed some real conclusions (Part 8), which is exactly why that search mattered.

- mBERT_Sindhi_Kashif786 --- mBERT (Google\'s multilingual BERT) with its vocabulary extended by 20,000 Sindhi Unigram tokens, built for a thesis project. Vocab size 119,547 total.

- TinyLlama_Sindhi_jamalimubashirali --- TinyLlama extended with 10,681 Sindhi tokens. Vocab size 42,681. This one came the closest to matching the new tokenizer of anything tested, and also turned out to have a real, specific bug (Part 7).

- hellosindh_SindhiBERT --- a base model from a small, apparently active Sindhi-NLP community org. Vocab size 32,000. Relatively weak fertility performance on its own.

- hellosindh_SindhiBERT_NER --- confirmed to be a genuinely DIFFERENT tokenizer from the base model above, not a reused copy (different vocab size, different file format --- raw SentencePiece .model vs. a fast-tokenizer file --- and different actual output on test text). Much better fertility than its own base model.

# **Part 6 --- What each metric actually measures** {#part-6-what-each-metric-actually-measures}

### **Fertility**

Average number of tokens produced per real word. Lower is better --- it means the tokenizer needs fewer pieces to represent the same text, which is more efficient for anything built on top of it (shorter sequences, less compute).

### **Single-token retention**

The percentage of words that come out as exactly one token, not split into pieces at all. Higher is better. A word split into 5 pieces instead of 1 is a sign the tokenizer doesn\'t "know" that word as a unit.

### **UNK rate**

The percentage of output tokens that are the tokenizer\'s "I don\'t know this" placeholder. Lower is better --- every UNK token represents real information thrown away, since whatever character or word triggered it is now unrecoverable from the output.

### **Byte-fallback rate**

The percentage of output tokens that are raw byte fragments rather than real linguistic pieces --- what happens when a tokenizer with byte_fallback=True meets something it doesn\'t recognize: instead of UNK, it falls back to representing the raw bytes. Lower is better, but it\'s not inherently bad the way UNK is --- it\'s a safety net, not a failure, as long as it\'s rare.

### **Round-trip character fidelity (added partway through the project)**

This one didn\'t exist in the original plan. It measures: if you encode a sentence into tokens and then decode those tokens back into text, do you get the same sentence back? Specifically, the percentage of characters that go missing in that round trip. This was added after discovering that neither UNK rate nor byte-fallback rate can catch a tokenizer that just silently DELETES characters without marking them in any way at all --- see Part 7 for exactly how that was found.

# **Part 7 --- Every bug found during the project, in order** {#part-7-every-bug-found-during-the-project-in-order}

This is the longest part of this document on purpose. Almost every real finding in the paper exists because a bug was found and fixed along the way --- this is the actual debugging story, not a cleaned-up summary.

## **7.1 LlamaTokenizer silently produced empty models** {#llamatokenizer-silently-produced-empty-models}

First attempt at loading the trained custom tokenizer used transformers\' LlamaTokenizer class. It loaded without any error, but reported vocab_size=3 --- meaning only the three special tokens (\<unk\>, \<s\>, \</s\>) were actually loaded, nothing else. The actual .vocab file on disk was confirmed correct (32,000+ real lines) by reading it directly with plain Python, proving the problem was in LlamaTokenizer\'s loading code, not the trained model itself. Fixed by writing a small custom wrapper class around sentencepiece.SentencePieceProcessor directly, bypassing LlamaTokenizer\'s broken loading path entirely.

## **7.2 Training silently failed when run in a background process** {#training-silently-failed-when-run-in-a-background-process}

To show live training progress, the training call was moved into a background thread, then a separate process (multiprocessing with 'fork'), to avoid blocking the notebook. The fork approach silently produced the same broken "vocab_size=3" result as 7.1, for an unrelated reason: fork() copies the parent process\'s memory into the child, including some internal logging state SentencePiece had already initialized earlier in the same notebook session --- and that corrupted state made training silently no-op in the child process. Fixed by writing training to an actual .py file on disk and running it as a real subprocess (python3 train_one_spm.py \...) instead --- a genuinely separate process with no inherited state at all.

## **7.3 Forced tokens made fertility worse, not better** {#forced-tokens-made-fertility-worse-not-better}

Covered in Part 4.2 --- listed again here because it was discovered specifically through a side-by-side comparison test, the same evidence-before-conclusion approach as every other bug in this list.

## **7.4 The byte-fallback detection method was wrong --- for four different tokenizers** {#the-byte-fallback-detection-method-was-wrong-for-four-different-tokenizers}

This is the single most consequential bug found in the whole project. The original way of detecting byte-fallback tokens was a simple pattern match: check if a token\'s text looks like "\<0xNN\>", SentencePiece\'s standard way of writing a raw byte. This works fine for SentencePiece-style tokenizers, but two other tokenizer families represent byte-fallback completely differently:

- GPT-2-style byte-level BPE tokenizers (used by Qwen2.5, BLOOM, and Llama3.2) encode bytes using their own different internal symbol mapping, not the \<0xNN\> text format at all. The old detector found ZERO byte-fallback for all three --- completely wrong. The real numbers, found after fixing the detector: Qwen2.5/SindhiLM_v2 around 7--9%, BLOOM around 30--32%, Llama3.2 around 26--30%.

- XLM-RoBERTa was the biggest surprise --- it\'s SentencePiece-based, so there was no obvious reason to suspect its byte-fallback number was wrong, but the old detector still reported exactly 0.000% for it, and the corrected method found the real number was 1.0--1.8%. This was found almost by accident: a visual scan of example tokenizations showed garbled � characters (the "I can\'t display this" replacement symbol) scattered through several tokenizers\' output, which contradicted their reported 0% byte-fallback and triggered the investigation.

The fix: a new detection method that decodes each output token ID individually and checks whether the decoded result contains that � replacement character --- this works correctly regardless of how any given tokenizer internally represents a raw byte. Every byte-fallback number anywhere in the final paper uses this corrected method, applied consistently to every tokenizer including the new one.

## **7.5 SindhiLM_v2 turned out to be Qwen2.5 wearing a different name** {#sindhilm_v2-turned-out-to-be-qwen2.5-wearing-a-different-name}

First suspected, then confirmed directly: loading both tokenizers and comparing their vocabulary size, and their exact token-by-token output on identical text, found them to be numerically identical --- not just similar, identical to several decimal places, every single time this was re-checked across four completely separate test runs over the course of the project (the original benchmark, the full-scale re-run, the final 200-sentence ranking, and again once the new Group C tokenizers were added). SindhiLM_v2 is kept in the quantitative tables since it costs nothing to include, but dropped from the word-by-word comparison table so its row doesn\'t just repeat Qwen2.5\'s.

## **7.6 Two different "Wikipedia" sentence counts were floating around** {#two-different-wikipedia-sentence-counts-were-floating-around}

Early in the project, the raw (uncleaned) Wikipedia register had 33,512 sentences. After the 3--100-word cleaning filter was introduced (see Part 2.2), the real number became 25,480 --- a meaningfully different dataset. For a while, both numbers appeared in different places without anyone noticing they disagreed. This was caught, and resolved by making the cleaned, filtered version the one and only definition of "Wikipedia (formal)" used anywhere in the project from that point forward.

## **7.7 A folder path with a space in it broke a download** {#a-folder-path-with-a-space-in-it-broke-a-download}

The Sindhi-NLP GitHub dataset has folder names with spaces in them (e.g. "awamiawaz articles classification dataset/"). Downloading these files directly by URL failed with a "URL can\'t contain control characters" error, because raw spaces aren\'t valid inside a URL. Fixed with Python\'s urllib.parse.quote(), which properly encodes the space as %20. This one fix alone added roughly 9,500 more articles to the training corpus that had been silently missing --- the "informal" source had actually only been using about 3,800 tweets from two accounts before this was caught, not the full dataset.

## **7.8 A wrong Kaggle dataset path (typo\'d username)** {#a-wrong-kaggle-dataset-path-typod-username}

When loading the trained custom tokenizer files from a separately uploaded Kaggle dataset, the path was first set to /kaggle/input/alinawaz04/models --- username typo\'d as "alinawaz04" instead of the real account "alinawaz06". This was caught by directly listing the actual contents of /kaggle/input/ rather than assuming the path was right, and fixed to the real path, /kaggle/input/models.

## **7.9 TinyLlama_Sindhi silently deletes a real Sindhi letter** {#tinyllama_sindhi-silently-deletes-a-real-sindhi-letter}

This is one of the two most important findings from round-trip fidelity testing. A deliberate stress test (encoding emoji, Chinese characters, Cyrillic text, and math symbols) found that TinyLlama_Sindhi\'s tokenizer sometimes produces OUTPUT SHORTER THAN THE INPUT, with no UNK token and no byte-fallback token anywhere to explain the missing content --- it just silently drops characters it doesn\'t know what to do with. Tracked down to one specific character: ہ (Unicode name \"ARABIC LETTER HEH GOAL\"), a real, commonly-used Sindhi letter that appears in very common function words --- the words meaning \"that/so,\" \"also/too,\" and \"not.\" Every single time this letter shows up, TinyLlama\'s tokenizer deletes it. It appears in 24.8% of the FLORES+ test sentences and 6.2% of the Wikipedia sentences, so this isn\'t a rare edge case --- it\'s a real, frequent data-integrity problem that nobody had previously documented, found specifically because this project added a check that had never been run before.

### **A second TinyLlama bug, found in the same investigation**

Separately, text written using a different Unicode encoding of Arabic script (called "Presentation Forms" --- a set of codepoints that represent pre-shaped letter variants, used by some older software and OCR output) gets severely mangled by TinyLlama\'s tokenizer --- in the worst observed case, a full sentence was reduced down to just seven isolated characters. Most other tokenizers (including the new one) handle this correctly because SentencePiece normalizes these presentation-form characters to their standard equivalents automatically; TinyLlama\'s tokenizer does not do this normalization.

## **7.10 FahadQazi_BPE silently deletes random Latin letters** {#fahadqazi_bpe-silently-deletes-random-latin-letters}

Found by the same round-trip fidelity check. Where TinyLlama\'s bug is concentrated on one specific character, FahadQazi_BPE\'s bug is broader and messier: individual Latin letters scattered through English text embedded in Sindhi sentences just vanish. A real example found in the Sentiment register: the English sentence \"An update on my situation, stay safe everyone\" came back after a round trip as \"n udate on my situation, stay sae eeryone\" --- missing the A, the p, the f, the v, and more, each one gone without a trace. This is the single worst data-integrity problem found anywhere in the whole comparison: up to 16.15% of sentences in the Wikipedia register (which has a lot of embedded English citations and transliterations) are affected.

## **7.11 The round-trip fidelity check itself needed fixing, twice** {#the-round-trip-fidelity-check-itself-needed-fixing-twice}

The first version of the fidelity check just compared raw string lengths before and after a round trip. That flagged a lot of false positives --- things like double spaces getting collapsed to single spaces, or non-breaking spaces being normalized, which is completely normal, expected tokenizer behavior, not a real bug. The check was rewritten to first normalize both the original and the decoded text (standard Unicode normalization, plus stripping invisible formatting/direction-control characters and all whitespace) before comparing lengths --- only what\'s left after that normalization counts as genuine lost content. This stricter version is what actually found the two real bugs described above (7.9 and 7.10), separating them cleanly from completely harmless, expected normalization.

## **7.12 Sindhi text was hand-typed incorrectly --- four separate times, in this very explainer\'s companion paper** {#sindhi-text-was-hand-typed-incorrectly-four-separate-times-in-this-very-explainers-companion-paper}

Worth including here even though it\'s about writing the paper, not about the tokenizer itself, because it\'s a real, repeated mistake and the honest record matters. Several times while writing the formal paper, specific Sindhi letters were typed from memory as raw Unicode escape codes (like \u0691) instead of being copied from already-verified correct text. Three of Sindhi\'s nine special digraph letters got mixed up with visually unrelated Pashto/Urdu letters this way on four separate occasions --- once in a list of example letters, once inside the word-comparison table, once in the exact character being described as TinyLlama\'s bug (7.9) --- ironically typed wrong while explaining a bug about a different wrong character --- and once in the word for "computer." Every instance was caught by a full character-by-character sweep of the final document before it was shared, cross-checked against the correct letters computationally rather than by eye. The lesson applied going forward: any Sindhi text needed anywhere now gets pulled from an already-verified source instead of being typed fresh.

# **Part 8 --- The final results, in full** {#part-8-the-final-results-in-full}

## **8.1 Headline numbers (mean across all four registers)** {#headline-numbers-mean-across-all-four-registers}

| **Tokenizer** | **Vocab size** | **Fertility** | **Single-token %** | **UNK %** | **Byte-fallback %** |
|:--:|----|----|----|----|----|
| CustomSindhi_150k | 150,000 | 1.125 | 89.7 | 0.000 | 0.154 |
| CustomSindhi_100k | 100,000 | 1.133 | 89.3 | 0.000 | 0.149 |
| CustomSindhi_64k (recommended) | 64,000 | 1.147 | 88.6 | 0.000 | 0.138 |
| CustomSindhi_32k | 32,000 | 1.184 | 86.5 | 0.000 | 0.113 |
| TinyLlama_Sindhi | 42,681 | 1.208 | 84.4 | 0.000\* | 0.000\* |
| hellosindh_SindhiBERT_NER | 32,001 | 1.218 | 83.7 | 0.194 | 0.197 |
| mBERT_Sindhi_Kashif786 | 119,547 | 1.278 | 78.4 | 0.143 | 0.000 |
| XLM-RoBERTa | 250,002 | 1.512 | 65.4 | 0.034 | 1.402 |
| SindhiLM_v3 | 32,000 | 1.730 | 55.8 | 3.605 | 0.000 |
| FahadQazi_BPE | 13,031 | 1.919 | 39.1 | 0.000\* | 7.127 |
| hellosindh_SindhiBERT | 32,000 | 1.960 | 35.5 | 0.122 | 0.114 |
| mT5 | 250,100 | 2.280 | 21.7 | 0.022 | 12.746 |
| Gemma3 | 262,144 | 2.308 | 26.8 | 0.000 | 0.105 |
| Qwen2.5 / SindhiLM_v2 | 151,643 | 2.580 | 23.8 | 0.000 | 8.665 |
| BLOOM | 250,680 | 2.627 | 24.7 | 0.000 | 31.660 |
| Llama3.2 | 128,000 | 2.896 | 18.2 | 0.000 | 28.472 |
| SindhiLM_v1 | 43 | 4.306 | 0.1 | 14.017 | 0.000 |

*\* marks a number that is only this low because the tokenizer silently deletes problem characters instead of flagging them --- see Part 7.9 and 7.10. Not genuine robustness.*

## **8.2 Round-trip fidelity (the check that found the two real bugs)** {#round-trip-fidelity-the-check-that-found-the-two-real-bugs}

| **Tokenizer** | **Worst register** | **Char loss** | **Sentences affected** |
|:--:|----|----|----|
| Custom (all 4 sizes) | all | 0.000% | 0.00% |
| Qwen2.5, SindhiLM_v2, BLOOM, Gemma3, Llama3.2 | all | 0.000% | 0.00% |
| XLM-RoBERTa, mT5 | Wikipedia | 0.004% | 0.04% |
| mBERT_Sindhi, hellosindh_base | Wikipedia | ≤0.009% | ≤0.09% |
| SindhiLM_v1 | Wikipedia | 0.079% | 0.69% |
| SindhiLM_v3, hellosindh_NER | Wikipedia | ≤0.075% | ≤1.13% |
| FahadQazi_BPE | Wikipedia | 0.846% | 16.15% |
| TinyLlama_Sindhi | FLORES+ | 0.415% | 24.90% |

*Sorted roughly from cleanest to worst. The bottom two rows are the two real, documented defects.*

## **8.3 The 22-word linguistic test --- honest result** {#the-22-word-linguistic-test-honest-result}

Genitive/possessive, inflectional suffixes, the seven special digraph letters, and common loanwords, hand-picked and tested against every tokenizer. Final count, with all 18 tokenizers included: 21 ties, 0 outright wins, 1 loss (to FahadQazi_BPE and mBERT_Sindhi jointly, on the word هنجي). Two words that WERE outright wins before Group C was added (شهرن and توهانکي) turned into ties once those four new tokenizers matched them. This is reported exactly as it came out --- the word list was fixed before Group C was found and re-run unchanged, rather than picking a flattering new list after the fact.

# **Part 9 --- What got decided, and why** {#part-9-what-got-decided-and-why}

- 64,000 is the recommended size to publish as the default/flagship, not 32,000 or 150,000. Reasoning: 64k is the smallest size with a completely clean sweep (wins every metric, every register, no exceptions). 32k has one real, confirmed exception (loses to TinyLlama_Sindhi on the FLORES+ register specifically --- double-checked to make sure this wasn\'t just an artifact of TinyLlama\'s character-deletion bug, and it wasn\'t, it\'s a genuine result). 100k and 150k are only marginally better than 64k, not enough to justify the larger file size for most uses.

- Publish name: sindhi-tokenizer, flat, no extra branding, matching every other real tokenizer in this space (SindhiLM-Tokenizer-v1, Sindhi-BPE-Tokenizer, mbert-sindhi-tokenizer, etc.) --- and matching the literal phrase someone would type into a search bar or ask an AI assistant. "CustomSindhi" was always just an internal label for the benchmark tables, the same way a paper might just call its own result "Ours" --- never meant to be the actual public name.

- One repo with all four vocab sizes as separate files, 64k set as the default, rather than four separate repos. Standard practice for size-variant releases.

- A round-trip fidelity check is now considered a required part of evaluating any tokenizer in this project going forward, not an optional extra --- it\'s the only thing that caught two real, serious, previously undocumented bugs that fertility, UNK rate, and byte-fallback rate all missed completely.

# **Part 10 --- What\'s still open** {#part-10-whats-still-open}

- The classical/literary register (Part 3) --- still unresolved. Next concrete steps identified: try a free (non-paid) IEEE DataPort account, or email the AMBILE institute directly and ask for the dataset for academic use.

- License check on two training sources (Sindhi-NLP GitHub, shaikhsalman\'s corpus) --- never formally verified. This needs to happen before the tokenizer is published under any specific license, since the model\'s license is constrained by the most restrictive license among anything it was trained on.

- GitHub repo and Hugging Face model card --- built, but still reference the earlier 14-tokenizer numbers from before Group C was added. Need updating to match the final report.

- The Gradio comparison demo (letting anyone type a sentence and see how every tokenizer, including this one, splits it) --- planned, not yet built as of this document.

- Final discoverability check immediately before publishing --- to catch any further tokenizers that might have appeared since Group C was found, the same way Group C itself was found by checking before publishing the first time.

- arXiv submission --- planned as the first publication venue (fast, free, highly citable/searchable), with a peer-reviewed regional NLP venue as a follow-up target. Submission requires an endorsement for a first-time author in most categories; this was being looked into but not resolved as of this document.

# **Appendix --- Every special character and every test word** {#appendix-every-special-character-and-every-test-word}

This appendix lists, in one place, every Sindhi letter and every word the project\'s tests and bug reports refer to. All Sindhi text here is generated from the verified source lists, not typed by hand. English glosses are approximate and were not dictionary-checked, so please verify them yourself as a native speaker.

## **A.1 The nine Sindhi-specific letters (what character_coverage=1.0 protects)** {#a.1-the-nine-sindhi-specific-letters-what-character_coverage1.0-protects}

| **Letter** | **Codepoint** | **Unicode name** | **Example test word** |
|:--:|----|----|----|
| ٻ | U+067B | ARABIC LETTER BEEH | ٻار |
| ڄ | U+0684 | ARABIC LETTER DYEH | ڄاڻ |
| ڏ | U+068F | ARABIC LETTER DAL WITH THREE DOTS ABOVE DOWNWARDS | ڏينهن |
| ڳ | U+06B3 | ARABIC LETTER GUEH | ڳوٺ |
| ڀ | U+0680 | ARABIC LETTER BEHEH | ڀاءُ |
| ٿ | U+067F | ARABIC LETTER TEHEH | ٿورو |
| ڇ | U+0687 | ARABIC LETTER TCHEHEH | ڇوڪرو |
| ٺ | U+067A | ARABIC LETTER TTEHEH | ڳوٺ |
| ڻ | U+06BB | ARABIC LETTER RNOON | ڄاڻ |

*Table A1. The nine letters, in the same order as the verified list.*

## **A.2 The 22 test words** {#a.2-the-22-test-words}

|    **Category**     | **Word** | **Approximate meaning** |
|:-------------------:|----------|-------------------------|
| Genitive/possessive | دنيا جو  | of the world            |
| Genitive/possessive | خدا جو   | of God                  |
| Genitive/possessive | پاڻي جي  | of water                |
| Genitive/possessive | ماڻهن جو | of the people           |
| Inflectional suffix | ڪتابن    | books                   |
| Inflectional suffix | شهرن     | cities                  |
| Inflectional suffix | توهانکي  | to you                  |
| Inflectional suffix | منهنجو   | my                      |
| Inflectional suffix | هنجي     | (gloss not verified)    |
|  Aspirated digraph  | ٻار      | child                   |
|  Aspirated digraph  | ڄاڻ      | knowledge               |
|  Aspirated digraph  | ڏينهن    | day                     |
|  Aspirated digraph  | ڳوٺ      | village                 |
|  Aspirated digraph  | ڀاءُ      | brother                 |
|  Aspirated digraph  | ٿورو     | a little                |
|  Aspirated digraph  | ڇوڪرو    | boy                     |
|      Loanword       | علم      | knowledge               |
|      Loanword       | تعليم    | education               |
|      Loanword       | دنيا     | world                   |
|      Loanword       | اسڪول    | school                  |
|      Loanword       | ڪمپيوٽر  | computer                |
|      Loanword       | انٽرنيٽ  | internet                |

*Table A2. All 22 words, in the order used in every morpheme table in this project.*

## **A.3 The look-alike letters that caused the typing mistakes** {#a.3-the-look-alike-letters-that-caused-the-typing-mistakes}

Each row is a letter that is visually close to a correct Sindhi letter and was typed by mistake at some point. Showing them side by side makes the confusion easy to see.

| **Wrong letter** | **Codepoint** | **Unicode name** | **Was mistaken for** |
|:--:|----|----|----|
| ڑ | U+0691 | RREH | the letters ڏ (in ڏينهن), ڳ (in ڳوٺ) and ڻ (in پاڻي جي) |
| ړ | U+0693 | REH WITH RING | the letter ڳ in the list of nine letters |
| ږ | U+0696 | REH WITH DOT BELOW AND DOT ABOVE | the letter ڻ in the list of nine letters |
| ٹ | U+0679 | TTEH | the T-letter in ڪمپيوٽر |
| ڑ | U+0691 | RREH | the HEH GOAL letter in the words below |

*Table A3. Wrong letters and the correct ones they were confused with.*

| **Correct letter** | **Codepoint** | **Unicode name** | **Used in** |
|:--:|----|----|----|
| ہ | U+06C1 | HEH GOAL | تہ بہ نہ (that/so, also, not) --- the letter TinyLlama_Sindhi deletes |
| ه | U+0647 | HEH | ordinary heh, a different letter from HEH GOAL |
| ٽ | U+067D | TEH WITH THREE DOTS ABOVE DOWNWARDS | the T-letter in ڪمپيوٽر and انٽرنيٽ |

*Table A4. The correct HEH GOAL and T-letters.*
