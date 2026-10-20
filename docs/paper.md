**A Corpus-Driven Sindhi Subword Tokenizer: Design, Empirical Validation, and Benchmark Comparison Against Fourteen Existing Tokenizers**

Ali Nawaz

*Department of Computer Science, Shaikh Ayaz University, Shikarpur, Pakistan*

*Supervised by Dr. Attaullah Sahito*

# **Abstract**

Sindhi, an under-resourced Indo-Aryan language written in a Perso-Arabic script with retroflex and implosive consonants absent from Arabic, Urdu, and Persian, lacks a subword tokenizer purpose-built for its orthography. We benchmark fourteen existing tokenizers against a new one at full scale across four independent registers (a standardized multilingual benchmark, formal encyclopedic text, informal social text, and contemporary news), using five metrics: fertility, single-token retention, UNK rate, byte-fallback rate, and round-trip character fidelity, the last introduced in this work after standard metrics were found to miss a real failure mode. Fourteen baseline tokenizers were identified in total: the original ten (four marketed as Sindhi-specific, six general-purpose multilingual models) plus four additional Sindhi-adjacent tokenizers found during a pre-publication search after initial benchmarking was complete. Our tokenizer, trained with SentencePiece Unigram and byte-level fallback on a four-source, disjoint, non-overlapping corpus, achieves a clean sweep with no exceptions at vocabulary sizes of 64,000 and above; at 32,000 one exception exists, a narrow loss to a fine-tuned general-purpose tokenizer on the standardized benchmark register specifically. Round-trip fidelity testing, introduced after a competing tokenizer was found to silently delete characters without producing UNK or byte-fallback tokens, found our tokenizer has zero measurable content loss across all four registers, while two competitors show real, mechanistically distinct data-integrity defects: one systematically drops individual Latin letters in code-switched text, the other silently deletes a native Sindhi letter and severely corrupts text in an alternate Unicode encoding of Arabic script. We report these findings, including the two reversed design decisions and the three methodological corrections made over the course of the project, and the limitations of the present work, including a still-unresolved classical/literary Sindhi evaluation register.

# **1 Introduction** {#introduction}

Sindhi is spoken by an estimated 25--30 million people, primarily in the Sindh province of Pakistan and parts of India, and is written predominantly in a Perso-Arabic script extended with letters for retroflex and implosive consonants (ٻ, ڄ, ڏ, ڳ, ڀ, ٿ, ڇ, ٺ, ڻ) that do not occur in Arabic, Urdu, or Persian. Despite this substantial speaker population, Sindhi remains severely under-resourced in NLP: no large, clean, openly licensed text corpus comparable to those available for high-resource languages exists, and no subword tokenizer has been purpose-built and rigorously validated against the language\'s specific orthographic and morphological properties.

This work makes four contributions. First, we conduct a systematic benchmark of fourteen existing tokenizers across four independent evaluation registers and show that no single existing tokenizer performs well on all axes simultaneously; each tokenizer\'s strengths trace directly and explainably to its training data and vocabulary size. Second, we design, train, and validate a new tokenizer, testing two design choices that prior literature on morphologically rich, low-resource languages would suggest, explicit marking of clitic boundaries and forcing target vocabulary items to remain single tokens, and empirically demonstrating that both are unnecessary or counterproductive given a sufficiently large and diverse training corpus. Third, we introduce round-trip character fidelity as a fifth evaluation metric after discovering, during pre-publication verification, that a competing tokenizer silently deletes characters in a way neither UNK rate nor byte-fallback rate can detect; applying this check across all fourteen baselines surfaces two previously undocumented data-integrity defects. Fourth, we document every methodological correction made during this project, most consequentially a byte-fallback detection method that was found to silently under-report fallback for four tokenizers, including one that was not expected to need correction, as a record of the verification process and a caution for future comparative tokenizer studies.

We deliberately state the limitations of this work alongside its results. A classical and literary Sindhi evaluation register, represented by, among other works, Shah Jo Risalo, remains absent: five independent candidate sources were investigated over the course of this project, each failing for a distinct, documented reason. We also note a partial, non-identical overlap in source publications between one evaluation register and a component of the training corpus, and that our new tokenizer\'s advantage over the strongest competitors, while real and consistent, is narrower than its advantage over the weakest ones. These limitations are discussed in Section 6.

# **2 Existing Tokenizers Surveyed** {#existing-tokenizers-surveyed}

Fourteen existing tokenizers were included as baselines, in three groups:

- Sindhi-specific, identified at the start of the project (4): three tokenizers published under the SindhiLM name (v1--v3, varying in algorithm and vocabulary size) and one independently published Sindhi BPE tokenizer (FahadQazi_BPE).

- General-purpose multilingual (6): XLM-RoBERTa, mT5, Qwen2.5, BLOOM, Gemma3, and Llama3.2, none trained with Sindhi as a primary target language but all including Sindhi or related-script coverage.

- Sindhi-specific, identified during a pre-publication search (4): mBERT_Sindhi_Kashif786 (mBERT extended with a 20K-token Sindhi Unigram vocabulary), TinyLlama_Sindhi_jamalimubashirali (TinyLlama extended with 10,681 Sindhi tokens), and two tokenizers from the hellosindh organization, hellosindh_SindhiBERT and hellosindh_SindhiBERT_NER, confirmed during this study to be genuinely distinct tokenizers (different vocabulary sizes, different underlying file formats, different tokenization behavior on identical input) rather than one tokenizer reused across two repositories.

During evaluation we established, via direct tokenizer comparison, that SindhiLM_v2 is a re-published wrapper around Qwen2.5\'s tokenizer rather than an independently trained model: fertility, single-token retention, and total token counts are identical to Qwen2.5\'s to three decimal places across every register and every independent verification run conducted in this study. We retain SindhiLM_v2 in the quantitative tables for completeness but exclude it from the qualitative morpheme analysis (Section 5.4), where its row would be a verbatim duplicate of Qwen2.5\'s. The late discovery of four additional tokenizers after initial benchmarking illustrates that even a systematic search is unlikely to be fully exhaustive in a fast-moving space; we recommend a final discoverability check immediately before publication as standard practice for comparative tokenizer work.

# **3 Methodology** {#methodology}

## **3.1 Training Corpus** {#training-corpus}

The training corpus was assembled from four sources, chosen to be independent of the ambile-official "Mega Corpus" that SindhiLM_v1--v3 were confirmed to be trained on; training on the same corpus as the baselines would reproduce rather than differentiate from them.

| **Source** | **Notes** |
|:--:|----|
| Sindhi Wikipedia | 6,000-article slice, disjoint from the evaluation sample (same seeded shuffle, training begins after the eval cutoff index) |
| Sindhi-NLP (GitHub) | Two Twitter accounts, Awami Awaz articles, Daily Kawish articles |
| shaikhsalman/sindhi-llm-corpus | 20,000-row sample; Latin-script contamination (11.3% majority-English sentences) detected and filtered before training |
| Urdu + Persian + Arabic Wikipedia | \~15% of the corpus by character count, for cross-script/loanword coverage |

*Table 1. Training corpus composition. The Sindhi-side sources are mixed with the cross-lingual slice at an approximately 85:15 ratio by character count.*

A Latin-script contamination issue was identified in the shaikhsalman/sindhi-llm-corpus source during a pre-training diagnostic: 11.3% of sampled sentences were majority-Latin-character text. This was filtered (Latin-character-ratio threshold of 0.3) before the corpus was finalized; the fix was verified by re-running the same diagnostic and confirming 0.0% majority-Latin sentences post-filter.

## **3.2 Tokenizer Architecture and Design Decisions** {#tokenizer-architecture-and-design-decisions}

This tokenizer is published as alinawazmahar/sindhi-tokenizer on Hugging Face, with the 64,000-vocabulary variant as the default file; it is referred to as CustomSindhi\_\<vocabulary size\> throughout this paper to label each of the four evaluated vocabulary sizes individually. The tokenizer uses the SentencePiece Unigram algorithm with byte-level fallback enabled and full character coverage, the latter chosen specifically to guarantee that Sindhi-specific retroflex and implosive letters can never be dropped or mapped to \<unk\>, the principal failure mode identified in SindhiLM_v1. Four vocabulary sizes were trained and evaluated: 32,000, 64,000, 100,000, and 150,000.

Two design choices motivated by patterns reported for morphologically rich, clitic-heavy languages were tested empirically rather than adopted by assumption, and both were reversed:

- Clitic pre-marking. Explicit space-separation of six common Sindhi postpositions/clitics before training was implemented, then tested with a corpus-wide fused-word diagnostic. Apparent fusion rates of 17--39% for three of the six clitics were found to be coincidental letter-overlap with unrelated vocabulary rather than genuine postposition attachment, confirmed against a control character with no plausible coincidental overlap (0.2% baseline rate). The preprocessing step was removed.

- Forced single-token status. The same six clitics plus two high-frequency loanwords were initially forced to single-token status via user_defined_symbols. A controlled comparison found this measurably worsened the Unigram training objective (final objective value ≈14.9 forced vs. ≈9.6 unforced) and produced a token-count penalty for the very words it targeted. Forcing was removed; all target words reach single-token status naturally in the final training run.

## **3.3 Evaluation Registers** {#evaluation-registers}

Every tokenizer was evaluated at full scale (no sampling) against four independent registers:

| **Register** | **Source** | **Sentences** | **Words** | **Character** |
|:--:|----|----|----|----|
| FLORES+ (snd_Arab, devtest) | openlanguagedata/flores_plus | 1,012 | 25,356 | Standardized anchor |
| Wikipedia (formal) | wikimedia/wikipedia (20231101.sd), 3--100 words/sentence filter | 25,480 | 435,947 | Formal / encyclopedic |
| Sentiment (informal) | alinawazmahar/Sindhi_Sentiment_dataset | 3,536 | 47,156 | Informal / social⁵ |
| Sindh Line Publishers | Mozilla Data Collective, CC-BY-SA-4.0 | 87,158 | 1,014,998 | Contemporary news⁶ |

*Table 2. Evaluation registers, all disjoint from the tokenizer\'s training corpus with the caveat noted below.*

⁵ The Sentiment register and the Sindhi-NLP component of the training corpus both draw from Kawish- and Awami Awaz-adjacent Sindhi news sources; the specific files do not overlap, but genre-level independence between this register and the training corpus is not fully established. ⁶ The Sindh Line Publishers register has no overlap with any training source; the corpus was obtained via manual download under its stated CC-BY-SA-4.0 license, as no scriptable download interface was available.

The Wikipedia register is defined once, applied consistently throughout this study: raw sentence-splitting followed by a 3--100-word-per-sentence filter.

## **3.4 Evaluation Metrics** {#evaluation-metrics}

- Fertility --- mean tokens per whitespace-delimited word.

- Compression ratio --- mean characters per token.

- Single-token retention --- percentage of words that remain a single token.

- UNK rate --- percentage of output tokens equal to the tokenizer\'s unknown-token placeholder.

- Byte-fallback rate --- percentage of output tokens that, decoded individually, yield a UTF-8 replacement character. An initial regex-based implementation was found to silently report 0% for four tokenizers with substantial true fallback, discussed further in Section 7.

- Round-trip character fidelity (introduced in this work) --- the percentage of characters lost when a sentence is encoded then decoded, after NFKC normalization and removal of zero-width/bidirectional control characters on both sides to exclude benign, expected normalization from the measurement. Neither UNK rate nor byte-fallback rate can detect a tokenizer that silently omits characters from its output without marking them in any way; this metric was added specifically because such a defect was found in a competitor during pre-publication verification (Section 5.3).

# **4 Results** {#results}

## **4.1 Quantitative Benchmark** {#quantitative-benchmark}

Table 3 reports each tokenizer\'s performance averaged across all four evaluation registers, sorted by fertility.

| **Tokenizer** | **Vocab size** | **Fertility ↓** | **Single-token % ↑** | **UNK % ↓** | **Byte-fallback % ↓** |
|:--:|----|----|----|----|----|
| CustomSindhi_150k | 150,000 | 1.125 | 89.7 | 0.000 | 0.154 |
| CustomSindhi_100k | 100,000 | 1.133 | 89.3 | 0.000 | 0.149 |
| CustomSindhi_64k | 64,000 | 1.147 | 88.6 | 0.000 | 0.138 |
| CustomSindhi_32k | 32,000 | 1.184 | 86.5 | 0.000 | 0.113 |
| TinyLlama_Sindhi¹ | 42,681 | 1.208 | 84.4 | 0.000 | 0.000 |
| hellosindh_SindhiBERT_NER² | 32,001 | 1.218 | 83.7 | 0.194 | 0.197 |
| mBERT_Sindhi_Kashif786 | 119,547 | 1.278 | 78.4 | 0.143 | 0.000 |
| XLM-RoBERTa | 250,002 | 1.512 | 65.4 | 0.034 | 1.402 |
| SindhiLM_v3 | 32,000 | 1.730 | 55.8 | 3.605 | 0.000 |
| FahadQazi_BPE³ | 13,031 | 1.919 | 39.1 | 0.000 | 7.127 |
| hellosindh_SindhiBERT | 32,000² | 1.960 | 35.5 | 0.122 | 0.114 |
| mT5 | 250,100 | 2.280 | 21.7 | 0.022 | 12.746 |
| Gemma3 | 262,144 | 2.308 | 26.8 | 0.000 | 0.105 |
| Qwen2.5 / SindhiLM_v2⁴ | 151,643 | 2.580 | 23.8 | 0.000 | 8.665 |
| BLOOM | 250,680 | 2.627 | 24.7 | 0.000 | 31.660 |
| Llama3.2 | 128,000 | 2.896 | 18.2 | 0.000 | 28.472 |
| SindhiLM_v1 | 43 | 4.306 | 0.1 | 14.017 | 0.000 |

*Table 3. Mean performance across all four registers. ¹ Zero UNK/byte-fallback reflects silent character deletion rather than genuine robustness (see Section 4.3). ² Distinct tokenizers despite similar naming, confirmed via direct comparison (Section 2). ³ Shows real, severe content loss on round-trip fidelity testing (see Section 4.3). ⁴ SindhiLM_v2 is numerically identical to Qwen2.5.*

At vocabulary sizes of 64,000 and above, the new tokenizer wins every metric in every register with no exceptions. At 32,000 one exception exists: on the FLORES+ register specifically, TinyLlama_Sindhi beats CustomSindhi_32k on both fertility (1.193 vs. 1.233) and single-token retention (84.4% vs. 82.4%). We tested whether this exception was an artifact of TinyLlama\'s character-deletion defect (Section 4.3) by normalizing the deleted character to its standard form and re-measuring; fertility changed by less than 0.002 in both directions, confirming the exception is genuine rather than an artifact of the defect. We therefore recommend 64,000 as the flagship vocabulary size: it is the smallest size with a clean sweep, and the quantitative gain from 100,000 or 150,000 is marginal by comparison.

Three tokenizers beat XLM-RoBERTa, previously the strongest baseline, on both fertility and single-token retention: TinyLlama_Sindhi, hellosindh_SindhiBERT_NER, and mBERT_Sindhi_Kashif786. None approaches the new tokenizer\'s performance, but this materially changes the framing of the comparison: the relevant competitive set is these three fine-tuned, Sindhi-adapted general-purpose tokenizers, not XLM-RoBERTa alone.

## **4.2 Per-Register Winner Analysis** {#per-register-winner-analysis}

Comparing the best-performing candidate vocabulary size against the best competitor in each register and metric (16 cells: four registers × four metrics) yields 15 outright wins or ties for the new tokenizer and one loss: CustomSindhi_32k against TinyLlama_Sindhi on FLORES+ fertility and single-token retention, counted as a single exception since both metrics reflect the same underlying segmentation. At 64,000 and above, the same comparison yields a clean 16 of 16.

## **4.3 Round-Trip Fidelity** {#round-trip-fidelity}

Round-trip fidelity was introduced after the following was observed during adversarial testing of TinyLlama_Sindhi: encoding and decoding emoji, Chinese, Cyrillic, and mathematical-symbol strings produced neither UNK tokens nor byte-fallback tokens, yet the decoded output was shorter than the input: characters had been silently omitted. Applying the same check to real register text, after excluding benign whitespace and Unicode-normalization differences, found this defect is real but narrow for TinyLlama (concentrated on one character), and found a second, independently discovered defect in FahadQazi_BPE affecting a much larger share of sentences.

| **Tokenizer** | **FLORES+ loss%** | **FLORES+ aff.%** | **Wiki loss%** | **Wiki aff.%** | **Sent. loss%** | **Sent. aff.%** | **Sindh Line loss%** | **Sindh Line aff.%** |
|:--:|----|----|----|----|----|----|----|----|
| CustomSindhi_32k/64k/100k/150k | 0.0000 | 0.00 | 0.0000 | 0.00 | 0.0000 | 0.00 | 0.0000 | 0.00 |
| Qwen2.5 / SindhiLM_v2 | 0.0000 | 0.00 | 0.0000 | 0.00 | 0.0000 | 0.00 | 0.0000 | 0.00 |
| BLOOM | 0.0000 | 0.00 | 0.0000 | 0.00 | 0.0000 | 0.00 | 0.0000 | 0.00 |
| Gemma3 | 0.0000 | 0.00 | 0.0000 | 0.00 | 0.0000 | 0.00 | 0.0000 | 0.00 |
| Llama3.2 | 0.0000 | 0.00 | 0.0000 | 0.00 | 0.0000 | 0.00 | 0.0000 | 0.00 |
| XLM-RoBERTa | 0.0000 | 0.00 | 0.0040 | 0.04 | 0.0000 | 0.00 | 0.0030 | 0.02 |
| mT5 | 0.0000 | 0.00 | 0.0040 | 0.04 | 0.0000 | 0.00 | 0.0030 | 0.02 |
| mBERT_Sindhi_Kashif786 | 0.0000 | 0.00 | 0.0021 | 0.04 | 0.0000 | 0.00 | 0.0001 | 0.00 |
| hellosindh_SindhiBERT | 0.0000 | 0.00 | 0.0089 | 0.09 | 0.0000 | 0.00 | 0.0031 | 0.02 |
| SindhiLM_v1 | 0.0000 | 0.00 | 0.0790 | 0.69 | 0.0000 | 0.00 | 0.0005 | 0.01 |
| SindhiLM_v3 | 0.0010 | 0.10 | 0.0754 | 1.13 | 0.0086 | 0.31 | 0.0029 | 0.04 |
| hellosindh_SindhiBERT_NER | 0.0021 | 0.10 | 0.0751 | 0.49 | 0.0017 | 0.06 | 0.0072 | 0.11 |
| TinyLlama_Sindhi¹ | 0.4147 | 24.90 | 0.3114 | 6.95 | 0.0409 | 1.67 | 0.0413 | 1.44 |
| FahadQazi_BPE³ | 0.4105 | 15.81 | 0.8461 | 16.15 | 0.0847 | 1.87 | 0.2272 | 6.08 |

*Table 4. Round-trip character fidelity, all 14 baselines plus the new tokenizer (all four sizes identical at 0.0000%). "Loss%" is the percentage of characters lost after normalization; "Aff.%" is the percentage of sentences in that register containing at least one lost character.*

FahadQazi_BPE shows severe, systematic loss on a specific content type: individual Latin letters scattered throughout code-switched text (e.g. "An update on my situation, stay safe everyone" decodes with the letters A, p, f, and v silently removed, among others), affecting up to 16.15% of sentences in the Wikipedia register, where embedded citations and transliterations are common.

TinyLlama_Sindhi shows a different, also severe defect: the native Sindhi letter ہ (ARABIC LETTER HEH GOAL, used in common function words including تہ "that/so," بہ "also," and نہ "not") is silently deleted in every occurrence, and text encoded in the Arabic Presentation Forms Unicode block is severely corrupted, in the worst observed case reducing a full sentence to seven isolated characters. ہ appears in 24.8% of FLORES+ sentences and 6.2% of Wikipedia sentences, explaining the register-dependent severity of this tokenizer\'s fidelity loss.

Every other tokenizer, including the new tokenizer at all four vocabulary sizes, shows either exactly zero loss or loss below 0.08% concentrated in a handful of sentences, consistent with rare, incidental encoding artifacts in the source text rather than a systematic defect in the tokenizer.

## **4.4 Qualitative Morpheme and Category Analysis** {#qualitative-morpheme-and-category-analysis}

Twenty-two hand-selected words spanning four linguistic categories were tokenized by all thirteen non-duplicate baselines and the new tokenizer, compared by raw token count. With the four newly identified tokenizers included, the new tokenizer ties the best competitor on 21 of 22 words and loses one (هنجي, to FahadQazi_BPE and mBERT_Sindhi_Kashif786 jointly); it does not win outright on any word. Two words that were outright wins in an earlier 14-tokenizer version of this analysis (شهرن and توهانڪي) became ties once the newly identified tokenizers matched them. The full table is provided as Appendix B.

This qualitative result does not contradict the quantitative results in Section 4.1: it shows that on a small set of curated, common, linguistically well-behaved words, several competitors already perform near-optimally, matching the new tokenizer. The new tokenizer\'s advantage is specifically in consistency across the full breadth of real text, visible in the aggregate fertility and single-token statistics, not in any single hand-picked example. We report this plainly rather than selecting a word list that would show an outright win, since the original list was fixed before the four additional tokenizers were found and re-run unchanged.

# **5 Discussion** {#discussion}

The new tokenizer\'s advantage is attributable to two concrete, checkable factors: a training corpus substantially larger and more genre-diverse than any confirmed baseline corpus, and the Unigram algorithm\'s tendency toward more linguistically motivated segmentation than plain BPE. The margin over the three strongest competitors (TinyLlama_Sindhi, hellosindh_SindhiBERT_NER, mBERT_Sindhi_Kashif786) is real but substantially narrower than the margin over XLM-RoBERTa or the original four Sindhi-specific baselines, indicating that fine-tuning a general-purpose tokenizer\'s vocabulary on Sindhi text, even without the corpus-construction rigor applied here, closes much of the gap. What a purpose-built corpus and training run contribute beyond that is primarily in the tail: consistency at scale, measured in Section 4.1, and genuine data integrity, measured in Section 4.3, rather than a uniformly large margin on every metric.

The round-trip fidelity defects found in FahadQazi_BPE and TinyLlama_Sindhi illustrate a specific risk in tokenizer evaluation: a tokenizer that silently discards unrecognized input will appear to have excellent UNK and byte-fallback statistics for the wrong reason. We recommend round-trip fidelity testing, at minimum via the normalized-length check used here, as a standard component of future comparative tokenizer studies, alongside fertility and UNK rate rather than as an optional addition.

The byte-fallback detection correction made earlier in this project (Section 7) is, independent of the tokenizer comparison itself, a methodological finding of note: a plausible, commonly used detection heuristic was found to silently misreport results not only for byte-level BPE tokenizers, a known limitation of that method, but also for a SentencePiece-based tokenizer, XLM-RoBERTa, whose reported byte-fallback rate changed from 0.000% to over 1% under correction.

# **6 Limitations** {#limitations}

- Classical/literary register absent. No classical or literary Sindhi evaluation register is included. Five independent candidate sources were investigated: a corrupted CSV export, an unrelated SQL dump, two unusable OCR scans (one also incompatibly licensed), and a government-affiliated platform gated behind an institutional subscription not available for this project.

- Partial source overlap between one evaluation register and the training corpus. The Sentiment register and a component of the training corpus share adjacent news-source provenance; full genre-level independence is not established for this pair.

- Narrowing margin against the strongest competitors. Against TinyLlama_Sindhi, hellosindh_SindhiBERT_NER, and mBERT_Sindhi_Kashif786, the advantage is real but modest; against FLORES+ specifically, CustomSindhi_32k has one confirmed loss. The headline "clean sweep" claim holds unconditionally only at 64,000 and above.

- Qualitative test no longer differentiates at the word level. On the 22-word morpheme/category list, the new tokenizer ties rather than beats the best competitor on 21 of 22 words once the four newly identified tokenizers are included; the advantage shown in this work is aggregate, not example-level.

- Search for existing tokenizers may still be incomplete. Four additional tokenizers were found after initial benchmarking was complete; a similarly diligent search immediately before publication found no further additions, but the space is active enough that this cannot be guaranteed exhaustive.

- Downstream application undetermined. The tokenizer\'s target downstream use is a future Sindhi language model or general NLP applications. It is not validated for automatic speech recognition, where existing systems use a fixed tokenizer, or text-to-speech, where the appropriate input representation depends on an architecture not yet selected.

- Register weighting choice. The four evaluation registers differ substantially in size; Table 3 uses an unweighted mean across registers rather than a token-pooled mean, which would be dominated by Sindh Line News.

# **7 Conclusion and Future Work** {#conclusion-and-future-work}

We presented a new Sindhi subword tokenizer trained on a broad, multi-source, deliberately non-overlapping corpus, and validated it against fourteen existing tokenizers across four full-scale evaluation registers, five quantitative metrics, and a targeted linguistic test set. At vocabulary sizes of 64,000 and above the tokenizer achieves a clean sweep with no exceptions; at 32,000 one exception exists against a fine-tuned competitor on one register. Round-trip fidelity testing, introduced in this work after discovering a real defect in a competitor, found zero measurable content loss in the new tokenizer and two distinct, real defects in competitors that standard metrics alone would have missed entirely.

Future work includes: resolving the classical/literary register gap; establishing full independence between the Sentiment evaluation register and the training corpus; selecting a text-to-speech architecture and determining whether this tokenizer\'s subword representation is appropriate for it; running a final discoverability check for additional Sindhi tokenizers immediately before publication; and, pending a data-source licensing review, publishing the tokenizer and accompanying model card.

# **References**

\[1\] T. Kudo and J. Richardson, "SentencePiece: A simple and language independent subword tokenizer and detokenizer for neural text processing," in Proc. EMNLP: System Demonstrations, 2018. [[https://aclanthology.org/D18-2012/]{.underline}](https://aclanthology.org/D18-2012/)

\[2\] A. Conneau et al., "Unsupervised cross-lingual representation learning at scale," in Proc. ACL, 2020. \[XLM-RoBERTa\] [[https://huggingface.co/FacebookAI/xlm-roberta-base]{.underline}](https://huggingface.co/FacebookAI/xlm-roberta-base)

\[3\] L. Xue et al., "mT5: A massively multilingual pre-trained text-to-text transformer," in Proc. NAACL-HLT, 2021. [[https://huggingface.co/google/mt5-base]{.underline}](https://huggingface.co/google/mt5-base)

\[4\] BigScience Workshop, "BLOOM: A 176B-parameter open-access multilingual language model," arXiv:2211.05100, 2022. [[https://huggingface.co/bigscience/bloom-560m]{.underline}](https://huggingface.co/bigscience/bloom-560m)

\[5\] Gemma Team, Google DeepMind, "Gemma 3 technical report," 2025. \[model: google/gemma-3-1b-pt\] [[https://huggingface.co/google/gemma-3-1b-pt]{.underline}](https://huggingface.co/google/gemma-3-1b-pt)

\[6\] Qwen Team, Alibaba Group, "Qwen2.5 technical report," arXiv:2412.15115, 2024. [[https://huggingface.co/Qwen/Qwen2.5-0.5B]{.underline}](https://huggingface.co/Qwen/Qwen2.5-0.5B)

\[7\] Meta AI, "Llama 3.2 model card," 2024. \[model: meta-llama/Llama-3.2-1B\] [[https://huggingface.co/meta-llama/Llama-3.2-1B]{.underline}](https://huggingface.co/meta-llama/Llama-3.2-1B)

\[8\] aakashMeghwar01, "SindhiLM-Tokenizer-v1," Hugging Face model repository, n.d. [[https://huggingface.co/aakashMeghwar01/SindhiLM-Tokenizer-v1]{.underline}](https://huggingface.co/aakashMeghwar01/SindhiLM-Tokenizer-v1)

\[9\] aakashMeghwar01, "SindhiLM-Tokenizer-v2," Hugging Face model repository, n.d. [[https://huggingface.co/aakashMeghwar01/SindhiLM-Tokenizer-v2]{.underline}](https://huggingface.co/aakashMeghwar01/SindhiLM-Tokenizer-v2)

\[10\] aakashMeghwar01, "SindhiLM-Tokenizer-v3," Hugging Face model repository, n.d. [[https://huggingface.co/aakashMeghwar01/SindhiLM-Tokenizer-v3]{.underline}](https://huggingface.co/aakashMeghwar01/SindhiLM-Tokenizer-v3)

\[11\] fahadqazi, "Sindhi-BPE-Tokenizer," Hugging Face model repository, n.d. [[https://huggingface.co/fahadqazi/Sindhi-BPE-Tokenizer]{.underline}](https://huggingface.co/fahadqazi/Sindhi-BPE-Tokenizer)

\[12\] Kashif786, "mbert-sindhi-tokenizer," Hugging Face model repository, n.d. [[https://huggingface.co/Kashif786/mbert-sindhi-tokenizer]{.underline}](https://huggingface.co/Kashif786/mbert-sindhi-tokenizer)

\[13\] jamalimubashirali, "sindhi-tinyllama-tokenizer," Hugging Face model repository, n.d. [[https://huggingface.co/jamalimubashirali/sindhi-tinyllama-tokenizer]{.underline}](https://huggingface.co/jamalimubashirali/sindhi-tinyllama-tokenizer)

\[14\] hellosindh, "sindhi-bert-base," Hugging Face model repository, n.d. [[https://huggingface.co/hellosindh/sindhi-bert-base]{.underline}](https://huggingface.co/hellosindh/sindhi-bert-base)

\[15\] hellosindh, "sindhi-bert-ner," Hugging Face model repository, n.d. [[https://huggingface.co/hellosindh/sindhi-bert-ner]{.underline}](https://huggingface.co/hellosindh/sindhi-bert-ner)

\[16\] NLLB Team et al., "No language left behind: Scaling human-centered machine translation," arXiv:2207.04672, 2022. \[source of the FLORES-200 / FLORES+ evaluation benchmark, maintained by Open Language Data, openlanguagedata/flores_plus\] [[https://huggingface.co/datasets/openlanguagedata/flores_plus]{.underline}](https://huggingface.co/datasets/openlanguagedata/flores_plus)

\[17\] Wikimedia Foundation, "Wikipedia dataset," wikimedia/wikipedia, Sindhi (20231101.sd) configuration, Hugging Face dataset repository. [[https://huggingface.co/datasets/wikimedia/wikipedia]{.underline}](https://huggingface.co/datasets/wikimedia/wikipedia)

\[18\] Sindhi-NLP, "sindhi-NLP-dataset" (Twitter data, Awami Awaz articles, Daily Kawish articles), GitHub repository, n.d. [[https://github.com/Sindhi-NLP/sindhi-NLP-dataset]{.underline}](https://github.com/Sindhi-NLP/sindhi-NLP-dataset)

\[19\] shaikhsalman, "sindhi-llm-corpus," Hugging Face dataset repository, n.d. [[https://huggingface.co/datasets/shaikhsalman/sindhi-llm-corpus]{.underline}](https://huggingface.co/datasets/shaikhsalman/sindhi-llm-corpus)

\[20\] Mozilla Data Collective / Mozilla Foundation, "Sindh Line Publishers corpus," CC-BY-SA-4.0, 2026. [[https://prod.datacollective.mozillafoundation.org/datasets/cmk1bfsez3htsmk07xfzaf9oe]{.underline}](https://prod.datacollective.mozillafoundation.org/datasets/cmk1bfsez3htsmk07xfzaf9oe)

\[21\] alinawazmahar, "Sindhi_Sentiment_dataset," Hugging Face dataset repository, built from Kawish and Awami Awaz newspaper corpora, CC BY 4.0. [[https://huggingface.co/datasets/alinawazmahar/Sindhi_Sentiment_dataset]{.underline}](https://huggingface.co/datasets/alinawazmahar/Sindhi_Sentiment_dataset)

\[22\] Abdul Majid Bhurgri Institute of Language Engineering, "Bhittaipedia," Government of Sindh, Culture, Tourism, Antiquities & Archives Department. Also released as "Shah Jo Risalo labeled dataset," IEEE DataPort, CC-BY-NC-4.0. [[https://bhittaipedia.org]{.underline}](https://bhittaipedia.org)

Citations follow an IEEE-style numbered format. Entries for repositories and model cards without a formal accompanying paper (SindhiLM v1--v3, FahadQazi_BPE, Sindhi-NLP, shaikhsalman/sindhi-llm-corpus, Sindh Line Publishers, the Sentiment dataset, and the four tokenizers identified during the pre-publication search) are cited as such rather than attributed to a fabricated publication; readers preparing a submission to a venue with stricter reference requirements should verify each entry against the venue\'s own citation guidelines before submission.

# **Appendix A: Full Per-Register Results**

Complete per-register breakdown underlying the register-mean summary in Table 3, all fourteen baselines plus all four candidate vocabulary sizes of the new tokenizer.

| **Tokenizer** | **Register** | **Fertility** | **Single-token %** | **UNK %** | **Byte-fallback %** |
|:--:|----|----|----|----|----|
| CustomSindhi_150k | FLORES+ | 1.167 | 85.9 | 0.000 | 0.199 |
| CustomSindhi_150k | Wikipedia | 1.157 | 88.6 | 0.000 | 0.179 |
| CustomSindhi_150k | Sentiment | 1.099 | 91.0 | 0.000 | 0.137 |
| CustomSindhi_150k | Sindh Line | 1.078 | 93.3 | 0.000 | 0.100 |
| CustomSindhi_100k | FLORES+ | 1.176 | 85.5 | 0.000 | 0.198 |
| CustomSindhi_100k | Wikipedia | 1.171 | 88.0 | 0.000 | 0.173 |
| CustomSindhi_100k | Sentiment | 1.103 | 90.8 | 0.000 | 0.133 |
| CustomSindhi_100k | Sindh Line | 1.084 | 93.0 | 0.000 | 0.091 |
| CustomSindhi_64k | FLORES+ | 1.191 | 84.7 | 0.000 | 0.172 |
| CustomSindhi_64k | Wikipedia | 1.194 | 86.9 | 0.000 | 0.167 |
| CustomSindhi_64k | Sentiment | 1.110 | 90.3 | 0.000 | 0.126 |
| CustomSindhi_64k | Sindh Line | 1.093 | 92.4 | 0.000 | 0.085 |
| CustomSindhi_32k | FLORES+ | 1.233 | 82.4 | 0.000 | 0.099 |
| CustomSindhi_32k | Wikipedia | 1.249 | 84.0 | 0.000 | 0.158 |
| CustomSindhi_32k | Sentiment | 1.130 | 89.0 | 0.000 | 0.126 |
| CustomSindhi_32k | Sindh Line | 1.124 | 90.5 | 0.000 | 0.068 |
| TinyLlama_Sindhi¹ | FLORES+ | 1.193 | 84.4 | 0.000 | 0.000 |
| TinyLlama_Sindhi¹ | Wikipedia | 1.292 | 80.5 | 0.000 | 0.000 |
| TinyLlama_Sindhi¹ | Sentiment | 1.149 | 87.6 | 0.000 | 0.000 |
| TinyLlama_Sindhi¹ | Sindh Line | 1.198 | 85.2 | 0.000 | 0.000 |
| hellosindh_SindhiBERT_NER | FLORES+ | 1.261 | 79.7 | 0.106 | 0.109 |
| hellosindh_SindhiBERT_NER | Wikipedia | 1.272 | 82.6 | 0.495 | 0.411 |
| hellosindh_SindhiBERT_NER | Sentiment | 1.182 | 84.6 | 0.084 | 0.068 |
| hellosindh_SindhiBERT_NER | Sindh Line | 1.155 | 87.9 | 0.090 | 0.201 |
| mBERT_Sindhi_Kashif786 | FLORES+ | 1.341 | 73.9 | 0.056 | 0.000 |
| mBERT_Sindhi_Kashif786 | Wikipedia | 1.373 | 73.5 | 0.440 | 0.000 |
| mBERT_Sindhi_Kashif786 | Sentiment | 1.223 | 81.2 | 0.040 | 0.000 |
| mBERT_Sindhi_Kashif786 | Sindh Line | 1.176 | 85.0 | 0.038 | 0.000 |
| XLM-RoBERTa | FLORES+ | 1.552 | 61.8 | 0.010 | 1.303 |
| XLM-RoBERTa | Wikipedia | 1.589 | 63.1 | 0.111 | 1.774 |
| XLM-RoBERTa | Sentiment | 1.434 | 69.3 | 0.009 | 1.133 |
| XLM-RoBERTa | Sindh Line | 1.475 | 67.4 | 0.007 | 1.400 |
| SindhiLM_v3 | FLORES+ | 1.824 | 52.7 | 4.650 | 0.000 |
| SindhiLM_v3 | Wikipedia | 1.726 | 55.4 | 4.949 | 0.000 |
| SindhiLM_v3 | Sentiment | 1.739 | 55.3 | 2.941 | 0.000 |
| SindhiLM_v3 | Sindh Line | 1.630 | 59.9 | 1.881 | 0.000 |
| FahadQazi_BPE | FLORES+ | 1.940 | 37.7 | 0.000 | 7.199 |
| FahadQazi_BPE | Wikipedia | 2.002 | 37.4 | 0.000 | 8.613 |
| FahadQazi_BPE | Sentiment | 1.831 | 42.2 | 0.000 | 6.318 |
| FahadQazi_BPE | Sindh Line | 1.903 | 39.3 | 0.000 | 6.376 |
| hellosindh_SindhiBERT | FLORES+ | 1.983 | 34.5 | 0.068 | 0.070 |
| hellosindh_SindhiBERT | Wikipedia | 1.988 | 36.1 | 0.317 | 0.246 |
| hellosindh_SindhiBERT | Sentiment | 1.915 | 36.2 | 0.052 | 0.020 |
| hellosindh_SindhiBERT | Sindh Line | 1.953 | 35.2 | 0.053 | 0.118 |
| mT5 | FLORES+ | 2.318 | 19.9 | 0.007 | 13.040 |
| mT5 | Wikipedia | 2.285 | 22.1 | 0.077 | 13.079 |
| mT5 | Sentiment | 2.259 | 22.4 | 0.001 | 12.120 |
| mT5 | Sindh Line | 2.259 | 22.3 | 0.004 | 12.746 |
| Gemma3 | FLORES+ | 2.341 | 25.6 | 0.000 | 0.000 |
| Gemma3 | Wikipedia | 2.317 | 28.0 | 0.000 | 0.259 |
| Gemma3 | Sentiment | 2.276 | 27.0 | 0.000 | 0.162 |
| Gemma3 | Sindh Line | 2.299 | 26.7 | 0.000 | 0.000 |
| Qwen2.5 / SindhiLM_v2⁴ | FLORES+ | 2.617 | 22.3 | 0.000 | 9.223 |
| Qwen2.5 / SindhiLM_v2⁴ | Wikipedia | 2.568 | 25.5 | 0.000 | 7.498 |
| Qwen2.5 / SindhiLM_v2⁴ | Sentiment | 2.562 | 23.5 | 0.000 | 8.968 |
| Qwen2.5 / SindhiLM_v2⁴ | Sindh Line | 2.574 | 23.9 | 0.000 | 8.969 |
| BLOOM | FLORES+ | 2.692 | 23.4 | 0.000 | 32.700 |
| BLOOM | Wikipedia | 2.569 | 25.3 | 0.000 | 29.959 |
| BLOOM | Sentiment | 2.645 | 24.7 | 0.000 | 32.653 |
| BLOOM | Sindh Line | 2.600 | 25.5 | 0.000 | 31.328 |
| Llama3.2 | FLORES+ | 2.951 | 17.0 | 0.000 | 30.015 |
| Llama3.2 | Wikipedia | 2.856 | 18.5 | 0.000 | 26.716 |
| Llama3.2 | Sentiment | 2.907 | 18.4 | 0.000 | 29.384 |
| Llama3.2 | Sindh Line | 2.871 | 19.0 | 0.000 | 27.774 |
| SindhiLM_v1 | FLORES+ | 4.307 | 0.0 | 14.019 | 0.000 |
| SindhiLM_v1 | Wikipedia | 4.271 | 0.2 | 15.137 | 0.000 |
| SindhiLM_v1 | Sentiment | 4.258 | 0.1 | 12.542 | 0.000 |
| SindhiLM_v1 | Sindh Line | 4.388 | 0.0 | 14.368 | 0.000 |

*Table A1. Full per-register results, 18 rows per metric (14 baselines, 4 custom sizes), 4 registers each.*

# **Appendix B: Full Morpheme/Category Test Results**

All 22 words from the qualitative morpheme/category analysis (Section 4.4), with the best-performing candidate vocabulary size of the new tokenizer and the best-performing baseline (of thirteen, excluding the confirmed SindhiLM_v2/Qwen2.5 duplicate) for each word, compared by raw token count.

| **Category** | **Word** | **Best custom** | **Best competitor** | **Result** |
|:--:|----|----|----|----|
| Genitive/possessive | دنيا جو | 32k (2) | 2 (5 tokenizers) | Tie |
| Genitive/possessive | خدا جو | 32k (2) | 2 (6 tokenizers) | Tie |
| Genitive/possessive | پاڻي جي | 32k (2) | 2 (5 tokenizers) | Tie |
| Genitive/possessive | ماڻهن جو | 32k (2) | 2 (5 tokenizers) | Tie |
| Inflectional suffix | ڪتابن | 32k (1) | 1 (5 tokenizers) | Tie |
| Inflectional suffix | شهرن | 32k (1) | 1 (3 tokenizers) | Tie |
| Inflectional suffix | توهانڪي | 64k (1) | 1 (hellosindh_NER) | Tie |
| Inflectional suffix | منهنجو | 32k (1) | 1 (5 tokenizers) | Tie |
| Inflectional suffix | هنجي | 32k (2) | 1 (FahadQazi_BPE, mBERT_Sindhi) | FahadQazi_BPE |
| Aspirated digraph | ٻار | 32k (1) | 1 (5 tokenizers) | Tie |
| Aspirated digraph | ڄاڻ | 32k (1) | 1 (5 tokenizers) | Tie |
| Aspirated digraph | ڏينهن | 32k (1) | 1 (4 tokenizers) | Tie |
| Aspirated digraph | ڳوٺ | 32k (1) | 1 (7 tokenizers) | Tie |
| Aspirated digraph | ڀاءُ | 32k (1) | 1 (4 tokenizers) | Tie |
| Aspirated digraph | ٿورو | 32k (1) | 1 (5 tokenizers) | Tie |
| Aspirated digraph | ڇوڪرو | 32k (1) | 1 (4 tokenizers) | Tie |
| Loanword | علم | 32k (1) | 1 (8 tokenizers) | Tie |
| Loanword | تعليم | 32k (1) | 1 (9 tokenizers) | Tie |
| Loanword | دنيا | 32k (1) | 1 (6 tokenizers) | Tie |
| Loanword | اسڪول | 32k (1) | 1 (5 tokenizers) | Tie |
| Loanword | ڪمپيوٽر | 32k (1) | 1 (5 tokenizers) | Tie |
| Loanword | انٽرنيٽ | 32k (1) | 1 (5 tokenizers) | Tie |

*Table B1. Full 22-word morpheme/category comparison against all 13 non-duplicate baselines. 21 ties, 0 outright wins, 1 loss (to FahadQazi_BPE and mBERT_Sindhi_Kashif786 jointly, on هنجي).*
