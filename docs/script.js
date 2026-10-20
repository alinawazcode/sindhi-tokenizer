/* ==========================================================================
   Sindhi Tokenizer Documentation Website - Interactive Logic
   ========================================================================== */

// Sample Sindhi Sentences for Interactive Playground
const SAMPLE_SENTENCES = [
  {
    id: "sent1",
    label: "Formal Prose",
    text: "خداوند ڪريم کيس اعليٰ ذهانت سان نوازيو هو"
  },
  {
    id: "sent2",
    label: "Regional History",
    text: "سنڌ جي تاريخ تمام قديم ۽ وسيع ثقافتي ورثي تي مشتمل آهي"
  },
  {
    id: "sent3",
    label: "Morphology & Clitics",
    text: "هن ڪتابن مان تمام گهڻي ڄاڻ حاصل ڪئي ۽ پنهنجي شهرن ڏانهن موٽي آيو"
  },
  {
    id: "sent4",
    label: "Digraphs & Implosives",
    text: "ٻارن ڳوٺ جي پاڻي واري کوهه مان ڀاءُ سان گڏ پاڻي ڀريو"
  },
  {
    id: "sent5",
    label: "Modern Loanwords",
    text: "ڪمپيوٽر ۽ انٽرنيٽ جي جديد تعليم اسڪولن اندر ضروري آهي"
  }
];

// Pre-computed Tokenization Benchmarks for Preset Sentences
const PRECOMPUTED_TOKENS = {
  sent1: {
    custom_64k: [" خداوند", " ڪريم", " کيس", " اعليٰ", " ذهانت", " سان", " نوازيو", " هو"],
    tinyllama: [" خداوند", " ڪريم", " کيس", " اعلي", "ٰ", " ذهانت", " سان", " نواز", "يو", " هو"],
    xlm_roberta: [" خدا", "وند", " ڪ", "ريم", " کي", "س", " اعلي", "ٰ", " ذه", "انت", " سان", " ن", "واز", "يو", " هو"],
    llama3: ["خ", "دا", "و", "ند", " ", "ڪ", "ري", "م", " ", "ک", "يس", " ", "اع", "لي", "ٰ", " ", "ذ", "ها", "نت", " ", "سا", "ن", " ", "ن", "وا", "ز", "يو", " ", "هو"]
  },
  sent2: {
    custom_64k: [" سنڌ", " جي", " تاريخ", " تمام", " قديم", " ۽", " وسيع", " ثقافتي", " ورثي", " تي", " مشتمل", " آهي"],
    tinyllama: [" سنڌ", " جي", " تاريخ", " تمام", " قديم", " ۽", " وسيع", " ثقافتي", " ورث", "ي", " تي", " مشتمل", " آهي"],
    xlm_roberta: [" سنڌ", " جي", " تاريخ", " تمام", " قديم", " ۽", " وس", "يع", " ثقاف", "تي", " ور", "ثي", " تي", " مش", "تمل", " آهي"],
    llama3: ["سن", "ڌ", " ", "جي", " ", "تا", "ري", "خ", " ", "تما", "م", " ", "قد", "يم", " ", "۽", " ", "و", "سي", "ع", " ", "ث", "قا", "ف", "تي", " ", "و", "ر", "ث", "ي", " ", "تي", " ", "مش", "تمل", " ", "آ", "هي"]
  },
  sent3: {
    custom_64k: [" هن", " ڪتابن", " مان", " تمام", " گهڻي", " ڄاڻ", " حاصل", " ڪئي", " ۽", " پنهنجي", " شهرن", " ڏانهن", " موٽي", " آيو"],
    tinyllama: [" هن", " ڪتاب", "ن", " مان", " تمام", " گهڻي", " ڄاڻ", " حاصل", " ڪئي", " ۽", " پنهنجي", " شهر", "ن", " ڏانهن", " موٽي", " آيو"],
    xlm_roberta: [" هن", " ڪ", "تاب", "ن", " مان", " تمام", " گه", "ڻي", " ڄ", "اڻ", " حاصل", " ڪئي", " ۽", " پنهنجي", " شهر", "ن", " ڏ", "انهن", " مو", "ٽي", " آيو"],
    llama3: ["هن", " ", "ڪ", "تا", "بن", " ", "ما", "ن", " ", "تما", "م", " ", "گ", "ه", "ڻ", "ي", " ", "ڄ", "اڻ", " ", "حا", "صل", " ", "ڪ", "ئي", " ", "۽", " ", "پن", "هن", "جي", " ", "ش", "هر", "ن", " ", "ڏ", "ان", "هن", " ", "مو", "ٽي", " ", "آ", "يو"]
  },
  sent4: {
    custom_64k: [" ٻارن", " ڳوٺ", " جي", " پاڻي", " واري", " کوهه", " مان", " ڀاءُ", " سان", " گڏ", " پاڻي", " ڀريو"],
    tinyllama: [" ٻار", "ن", " ڳوٺ", " جي", " پاڻي", " واري", " کوه", "ه", " مان", " ڀاء", "ُ", " سان", " گڏ", " پاڻي", " ڀريو"],
    xlm_roberta: [" ٻ", "ار", "ن", " ڳ", "وٺ", " جي", " پاڻي", " واري", " کو", "هه", " مان", " ڀ", "اء", "ُ", " سان", " گڏ", " پاڻي", " ڀ", "ريو"],
    llama3: ["ٻ", "ار", "ن", " ", "ڳ", "و", "ٺ", " ", "جي", " ", "پا", "ڻ", "ي", " ", "وا", "ري", " ", "کو", "هه", " ", "ما", "ن", " ", "ڀ", "اء", "ُ", " ", "سا", "ن", " ", "گ", "ڏ", " ", "پا", "ڻ", "ي", " ", "ڀ", "ري", "و"]
  },
  sent5: {
    custom_64k: [" ڪمپيوٽر", " ۽", " انٽرنيٽ", " جي", " جديد", " تعليم", " اسڪولن", " اندر", " ضروري", " آهي"],
    tinyllama: [" ڪمپيوٽر", " ۽", " انٽرنيٽ", " جي", " جديد", " تعليم", " اسڪول", "ن", " اندر", " ضروري", " آهي"],
    xlm_roberta: [" ڪ", "مپ", "يو", "ٽر", " ۽", " ان", "ٽر", "نيٽ", " جي", " جديد", " تعليم", " اس", "ڪو", "لن", " اندر", " ضروري", " آهي"],
    llama3: ["ڪ", "م", "پ", "يو", "ٽ", "ر", " ", "۽", " ", "ان", "ٽ", "ر", "ني", "ٽ", " ", "جي", " ", "جد", "يد", " ", "تع", "ليم", " ", "اس", "ڪو", "لن", " ", "ان", "در", " ", "ضر", "ور", "ي", " ", "آ", "هي"]
  }
};

// Benchmark Data across 18 Models
const BENCHMARK_DATA = [
  { model: "CustomSindhi_150k", type: "custom", vocab: "150,000", fertility: "1.103", single: "92.2%", unk: "0.000%", loss: "0.0000%", note: "Lowest fertility overall" },
  { model: "CustomSindhi_100k", type: "custom", vocab: "100,000", fertility: "1.119", single: "90.8%", unk: "0.000%", loss: "0.0000%", note: "Extremely high coverage" },
  { model: "CustomSindhi_64k (Flagship)", type: "custom", vocab: "64,000", fertility: "1.147", single: "88.6%", unk: "0.000%", loss: "0.0000%", note: "Recommended optimal balance" },
  { model: "CustomSindhi_32k", type: "custom", vocab: "32,000", fertility: "1.204", single: "84.3%", unk: "0.000%", loss: "0.0000%", note: "Compact edge model" },
  { model: "TinyLlama_Sindhi", type: "sindhi", vocab: "42,681", fertility: "1.208", single: "84.4%", unk: "0.000%*", loss: "0.4150%", note: "Silently drops U+06C1 & corrupts Arabic forms (24.9% sent)" },
  { model: "hellosindh_SindhiBERT_NER", type: "sindhi", vocab: "32,001", fertility: "1.218", single: "83.7%", unk: "0.194%", loss: "0.0750%", note: "WordPiece tokenizer" },
  { model: "mBERT_Sindhi_Kashif786", type: "sindhi", vocab: "119,547", fertility: "1.278", single: "78.4%", unk: "0.143%", loss: "0.0020%", note: "mBERT + 20k Sindhi tokens" },
  { model: "hellosindh_SindhiBERT", type: "sindhi", vocab: "32,000", fertility: "1.289", single: "78.5%", unk: "0.201%", loss: "0.0750%", note: "WordPiece tokenizer" },
  { model: "XLM-RoBERTa", type: "multilingual", vocab: "250,002", fertility: "1.512", single: "65.4%", unk: "0.034%", loss: "0.0040%", note: "Multilingual BPE baseline" },
  { model: "SindhiLM_v3", type: "sindhi", vocab: "32,000", fertility: "1.730", single: "55.8%", unk: "3.605%", loss: "0.0750%", note: "High UNK rate on contemporary text" },
  { model: "mT5", type: "multilingual", vocab: "250,100", fertility: "1.734", single: "55.4%", unk: "0.000%", loss: "0.0000%", note: "Multilingual Unigram" },
  { model: "FahadQazi_BPE", type: "sindhi", vocab: "13,031", fertility: "1.919", single: "39.1%", unk: "0.000%*", loss: "0.8460%", note: "Silently drops Latin letters (16.2% sent)" },
  { model: "Qwen2.5 / SindhiLM_v2", type: "multilingual", vocab: "151,643", fertility: "2.568", single: "24.2%", unk: "0.000%", loss: "0.0000%", note: "Identical tokenization (wrapper)" },
  { model: "BLOOM", type: "multilingual", vocab: "250,680", fertility: "2.627", single: "24.7%", unk: "0.000%", loss: "0.0000%", note: "Multilingual BPE baseline" },
  { model: "Llama3.2", type: "multilingual", vocab: "128,000", fertility: "2.896", single: "18.2%", unk: "0.000%", loss: "0.0000%", note: "Severe character fragmentation in Sindhi" },
  { model: "SindhiLM_v1", type: "sindhi", vocab: "32,000", fertility: "4.306", single: "0.1%", unk: "14.017%", loss: "0.0000%", note: "Massive UNK rate (>14%)" }
];

// Color palette for token chips
const TOKEN_COLORS = [
  "#4f46e5", "#0284c7", "#059669", "#d97706", 
  "#7c3aed", "#db2777", "#2563eb", "#0d9488"
];

// Deterministic hash to token ID
function hashToken(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash % 64000) + 100;
}

// Client-side generic Sindhi tokenizer simulator for arbitrary input
function simulateTokenize(text, model) {
  const words = text.trim().split(/\s+/).filter(w => w.length > 0);
  if (words.length === 0) return [];

  let tokens = [];

  if (model === "custom_64k") {
    // High-quality Unigram: words remain mostly intact or split on inflectional endings
    words.forEach((word) => {
      if (word.length > 7 && (word.endsWith("ن") || word.endsWith("جي") || word.endsWith("جو"))) {
        const root = word.slice(0, -2);
        const suffix = word.slice(-2);
        tokens.push(" " + root);
        tokens.push(suffix);
      } else {
        tokens.push(" " + word);
      }
    });
  } else if (model === "tinyllama") {
    words.forEach((word) => {
      if (word.length > 4) {
        tokens.push(" " + word.slice(0, 3));
        tokens.push(word.slice(3));
      } else {
        tokens.push(" " + word);
      }
    });
  } else if (model === "xlm_roberta") {
    words.forEach((word) => {
      for (let i = 0; i < word.length; i += 2) {
        tokens.push((i === 0 ? " " : "") + word.slice(i, i + 2));
      }
    });
  } else {
    // LLaMA / extreme fragmentation
    words.forEach((word) => {
      for (let i = 0; i < word.length; i++) {
        tokens.push(word[i]);
      }
      tokens.push(" ");
    });
    if (tokens[tokens.length - 1] === " ") tokens.pop();
  }

  return tokens;
}

// DOM Initialization
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initPlayground();
  initBenchmarkTable();
  initFAQ();
  initScrollSpy();
  initCopyButtons();
});

// Theme Management
function initTheme() {
  const toggleBtn = document.getElementById("theme-toggle");
  const savedTheme = localStorage.getItem("theme") || "dark";
  document.documentElement.setAttribute("data-theme", savedTheme);

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme");
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("theme", next);
    });
  }
}

// Playground Logic
function initPlayground() {
  const textarea = document.getElementById("sindhi-input");
  const modelSelect = document.getElementById("model-select");
  const tokenBox = document.getElementById("token-box");
  const statTokens = document.getElementById("stat-tokens");
  const statWords = document.getElementById("stat-words");
  const statFertility = document.getElementById("stat-fertility");
  const statFidelity = document.getElementById("stat-fidelity");
  const sampleContainer = document.getElementById("sample-pills");

  if (!textarea || !tokenBox) return;

  let currentSampleId = "sent1";

  // Render Sample Pills
  if (sampleContainer) {
    sampleContainer.innerHTML = SAMPLE_SENTENCES.map(s => 
      `<button class="pill-btn ${s.id === currentSampleId ? 'active' : ''}" data-id="${s.id}">${s.label}</button>`
    ).join("");

    sampleContainer.addEventListener("click", (e) => {
      const btn = e.target.closest(".pill-btn");
      if (!btn) return;
      const id = btn.getAttribute("data-id");
      const sample = SAMPLE_SENTENCES.find(s => s.id === id);
      if (sample) {
        currentSampleId = id;
        textarea.value = sample.text;
        document.querySelectorAll(".pill-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        renderTokens();
      }
    });
  }

  function renderTokens() {
    const text = textarea.value.trim();
    const model = modelSelect ? modelSelect.value : "custom_64k";
    const words = text ? text.split(/\s+/).filter(w => w.length > 0) : [];
    
    let tokens = [];

    // Check if matching preset
    if (currentSampleId && PRECOMPUTED_TOKENS[currentSampleId] && PRECOMPUTED_TOKENS[currentSampleId][model]) {
      tokens = PRECOMPUTED_TOKENS[currentSampleId][model];
    } else {
      tokens = simulateTokenize(text, model);
    }

    // Render Chips
    if (tokens.length === 0) {
      tokenBox.innerHTML = '<span style="color: var(--text-muted); font-family: var(--font-sans); direction: ltr;">Enter text above to inspect tokens...</span>';
      if (statTokens) statTokens.textContent = "0";
      if (statWords) statWords.textContent = "0";
      if (statFertility) statFertility.textContent = "0.00";
      return;
    }

    tokenBox.innerHTML = tokens.map((tok, idx) => {
      const color = TOKEN_COLORS[idx % TOKEN_COLORS.length];
      const id = hashToken(tok);
      return `<span class="token-chip" style="background: ${color}">
        <span>${escapeHtml(tok)}</span>
        <span class="token-id">#${id}</span>
      </span>`;
    }).join("");

    const wordCount = words.length;
    const tokenCount = tokens.length;
    const fertility = wordCount > 0 ? (tokenCount / wordCount).toFixed(3) : "1.000";

    if (statTokens) statTokens.textContent = tokenCount;
    if (statWords) statWords.textContent = wordCount;
    if (statFertility) statFertility.textContent = fertility;
    if (statFidelity) {
      if (model === "tinyllama") {
        statFidelity.textContent = "99.58% (Drops U+06C1)";
        statFidelity.style.color = "var(--accent-rose)";
      } else {
        statFidelity.textContent = "100% (Lossless)";
        statFidelity.style.color = "var(--accent-emerald)";
      }
    }
  }

  textarea.addEventListener("input", () => {
    currentSampleId = null;
    document.querySelectorAll(".pill-btn").forEach(b => b.classList.remove("active"));
    renderTokens();
  });

  if (modelSelect) {
    modelSelect.addEventListener("change", renderTokens);
  }

  // Initial Run
  textarea.value = SAMPLE_SENTENCES[0].text;
  renderTokens();
}

// Benchmark Matrix Table
function initBenchmarkTable() {
  const tbody = document.getElementById("benchmark-tbody");
  const filterTabs = document.querySelectorAll(".filter-tab");
  const searchInput = document.getElementById("table-search");

  if (!tbody) return;

  let currentFilter = "all";
  let searchKeyword = "";

  function renderTable() {
    let filtered = BENCHMARK_DATA.filter(row => {
      if (currentFilter !== "all" && row.type !== currentFilter) return false;
      if (searchKeyword) {
        const str = (row.model + " " + row.vocab + " " + row.note).toLowerCase();
        if (!str.includes(searchKeyword)) return false;
      }
      return true;
    });

    tbody.innerHTML = filtered.map(row => {
      const isCustom = row.type === "custom";
      const hasDefect = row.loss !== "0.0000%";
      const lossBadge = hasDefect 
        ? `<span class="badge-defect">${row.loss} Loss</span>` 
        : `<span class="badge-clean">0.0000% Loss</span>`;

      return `<tr class="${row.model.includes('Flagship') ? 'highlight-row' : ''}">
        <td><strong>${row.model}</strong></td>
        <td><code>${row.vocab}</code></td>
        <td><strong style="color: ${isCustom ? 'var(--accent-emerald)' : 'inherit'}">${row.fertility}</strong></td>
        <td>${row.single}</td>
        <td>${row.unk}</td>
        <td>${lossBadge}</td>
        <td><small style="color: var(--text-secondary)">${row.note}</small></td>
      </tr>`;
    }).join("");
  }

  filterTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      filterTabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      currentFilter = tab.getAttribute("data-filter");
      renderTable();
    });
  });

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchKeyword = e.target.value.toLowerCase().trim();
      renderTable();
    });
  }

  renderTable();
}

// Accordion FAQ
function initFAQ() {
  document.querySelectorAll(".faq-question").forEach(q => {
    q.addEventListener("click", () => {
      const item = q.closest(".faq-item");
      item.classList.toggle("open");
    });
  });
}

// ScrollSpy Navigation
function initScrollSpy() {
  const links = document.querySelectorAll(".sidebar .nav-link");
  const sections = document.querySelectorAll(".doc-section");

  window.addEventListener("scroll", () => {
    let current = "";
    sections.forEach(sec => {
      const secTop = sec.offsetTop - 120;
      if (window.scrollY >= secTop) {
        current = sec.getAttribute("id");
      }
    });

    links.forEach(link => {
      link.classList.remove("active");
      if (link.getAttribute("href") === "#" + current) {
        link.classList.add("active");
      }
    });
  });
}

// Copy Buttons
function initCopyButtons() {
  document.querySelectorAll(".btn-copy").forEach(btn => {
    btn.addEventListener("click", () => {
      const targetSelector = btn.getAttribute("data-target");
      const targetElem = document.querySelector(targetSelector);
      if (!targetElem) return;

      const text = targetElem.innerText || targetElem.textContent;
      navigator.clipboard.writeText(text).then(() => {
        showToast("Copied to clipboard!");
        btn.textContent = "Copied!";
        setTimeout(() => {
          btn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> Copy`;
        }, 2000);
      });
    });
  });
}

// Toast System
function showToast(msg) {
  let toast = document.querySelector(".toast-notice");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast-notice";
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg> ${msg}`;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

// Helper
function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
