/* ==========================================================================
   Sindhi Tokenizer Documentation — Interactive Logic & Documentation Engine
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

// Complete Verified 17-Model Macro Benchmark Matrix (Source of Truth: paper.md & README.md)
const BENCHMARK_DATA = [
  { model: "CustomSindhi_150k", type: "custom", vocab: "150,000", fertility: "1.125", single: "89.7%", unk: "0.000%", fallback: "0.154%", loss: "0.0000%", note: "SentencePiece Unigram; lowest overall fertility" },
  { model: "CustomSindhi_100k", type: "custom", vocab: "100,000", fertility: "1.133", single: "89.3%", unk: "0.000%", fallback: "0.149%", loss: "0.0000%", note: "SentencePiece Unigram; ultra-high lexical coverage" },
  { model: "CustomSindhi_64k (Flagship)", type: "custom", vocab: "64,000", fertility: "1.147", single: "88.6%", unk: "0.000%", fallback: "0.138%", loss: "0.0000%", note: "Flagship model; optimal Pareto balance of memory & speed" },
  { model: "CustomSindhi_32k", type: "custom", vocab: "32,000", fertility: "1.184", single: "86.5%", unk: "0.000%", fallback: "0.113%", loss: "0.0000%", note: "SentencePiece Unigram; compact edge deployment model" },
  { model: "TinyLlama_Sindhi", type: "sindhi", vocab: "42,681", fertility: "1.208", single: "84.4%", unk: "0.000%*", fallback: "0.000%*", loss: "0.4147%", note: "Silently deletes U+06C1 (HEH GOAL), corrupting 24.9% of sentences" },
  { model: "hellosindh_SindhiBERT_NER", type: "sindhi", vocab: "32,001", fertility: "1.218", single: "83.7%", unk: "0.194%", fallback: "0.197%", loss: "0.0751%", note: "WordPiece tokenizer trained for Named Entity Recognition" },
  { model: "mBERT_Sindhi_Kashif786", type: "sindhi", vocab: "119,547", fertility: "1.278", single: "78.4%", unk: "0.143%", fallback: "0.000%", loss: "0.0021%", note: "Multilingual BERT expanded with 20k Sindhi tokens" },
  { model: "XLM-RoBERTa", type: "multilingual", vocab: "250,002", fertility: "1.512", single: "65.4%", unk: "0.034%", fallback: "1.402%", loss: "0.0040%", note: "Multilingual SentencePiece BPE baseline" },
  { model: "SindhiLM_v3", type: "sindhi", vocab: "32,000", fertility: "1.730", single: "55.8%", unk: "3.605%", fallback: "0.000%", loss: "0.0754%", note: "High UNK rate on contemporary text registers" },
  { model: "FahadQazi_BPE", type: "sindhi", vocab: "13,031", fertility: "1.919", single: "39.1%", unk: "0.000%*", fallback: "7.127%*", loss: "0.8461%", note: "Silently discards Latin letters, corrupting 16.2% of sentences" },
  { model: "hellosindh_SindhiBERT", type: "sindhi", vocab: "32,000", fertility: "1.960", single: "35.5%", unk: "0.122%", fallback: "0.114%", loss: "0.0089%", note: "WordPiece tokenizer baseline" },
  { model: "mT5", type: "multilingual", vocab: "250,100", fertility: "2.280", single: "21.7%", unk: "0.022%", fallback: "12.746%", loss: "0.0040%", note: "Multilingual SentencePiece Unigram baseline" },
  { model: "Gemma3", type: "multilingual", vocab: "262,144", fertility: "2.308", single: "26.8%", unk: "0.000%", fallback: "0.105%", loss: "0.0000%", note: "Large vocabulary multilingual BPE baseline" },
  { model: "Qwen2.5 / SindhiLM_v2", type: "multilingual", vocab: "151,643", fertility: "2.580", single: "23.8%", unk: "0.000%", fallback: "8.665%", loss: "0.0000%", note: "Byte-level BPE; SindhiLM_v2 is a wrapper with identical tokenization" },
  { model: "BLOOM", type: "multilingual", vocab: "250,680", fertility: "2.627", single: "24.7%", unk: "0.000%", fallback: "31.660%", loss: "0.0000%", note: "Byte-level BPE; severe byte fallback in Sindhi" },
  { model: "Llama3.2", type: "multilingual", vocab: "128,000", fertility: "2.896", single: "18.2%", unk: "0.000%", fallback: "28.472%", loss: "0.0000%", note: "Severe character fragmentation (2.90 tok/wd, 28.5% byte fallback)" },
  { model: "SindhiLM_v1", type: "sindhi", vocab: "43", fertility: "4.306", single: "0.1%", unk: "14.017%", fallback: "0.000%", loss: "0.0790%", note: "Deficient 43-token alphabet; unacceptable >14% UNK rate" }
];

// Token chip colors
const TOKEN_COLORS = [
  "#2060a0", "#1a73e8", "#2e7d32", "#c0392b", 
  "#6a1b9a", "#d97706", "#00838f", "#4e342e"
];

// Hash token string to stable integer
function hashToken(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash % 64000) + 100;
}

// Client-side Sindhi subword simulation for arbitrary input
function simulateTokenize(text, model) {
  const words = text.trim().split(/\s+/).filter(w => w.length > 0);
  if (words.length === 0) return [];

  let tokens = [];

  if (model === "custom_64k") {
    // Unigram preservation: stems stay whole, only frequent clitics detach
    words.forEach(word => {
      if (word.length > 7 && (word.endsWith("ن") || word.endsWith("جي") || word.endsWith("جو") || word.endsWith("ين"))) {
        const root = word.slice(0, -2);
        const suffix = word.slice(-2);
        tokens.push(" " + root);
        tokens.push(suffix);
      } else {
        tokens.push(" " + word);
      }
    });
  } else if (model === "tinyllama") {
    words.forEach(word => {
      if (word.length > 4) {
        tokens.push(" " + word.slice(0, 3));
        tokens.push(word.slice(3));
      } else {
        tokens.push(" " + word);
      }
    });
  } else if (model === "xlm_roberta") {
    words.forEach(word => {
      for (let i = 0; i < word.length; i += 2) {
        tokens.push((i === 0 ? " " : "") + word.slice(i, i + 2));
      }
    });
  } else {
    // LLaMA byte/character fragmentation
    words.forEach(word => {
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
  initMobileNav();
  initTableOfContents();
  initPlayground();
  initBenchmarkTable();
  initFAQ();
  initScrollSpy();
  initCopyButtons();
  initSearch();
});

// Theme Management
function initTheme() {
  const toggleBtn = document.getElementById("theme-toggle");
  const savedTheme = localStorage.getItem("sindhi_doc_theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme");
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("sindhi_doc_theme", next);
    });
  }
}

// Mobile Drawer Navigation
function initMobileNav() {
  const toggleBtn = document.getElementById("nav-toggle");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebar-overlay");

  if (!toggleBtn || !sidebar || !overlay) return;

  function openDrawer() {
    sidebar.classList.add("open");
    overlay.classList.add("active");
  }

  function closeDrawer() {
    sidebar.classList.remove("open");
    overlay.classList.remove("active");
  }

  toggleBtn.addEventListener("click", () => {
    if (sidebar.classList.contains("open")) {
      closeDrawer();
    } else {
      openDrawer();
    }
  });

  overlay.addEventListener("click", closeDrawer);

  sidebar.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", () => {
      if (window.innerWidth <= 768) {
        closeDrawer();
      }
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && sidebar.classList.contains("open")) {
      closeDrawer();
    }
  });
}

// Dynamic Right-Sidebar Table of Contents
function initTableOfContents() {
  const tocList = document.getElementById("toc-list");
  if (!tocList) return;

  const headings = document.querySelectorAll(".doc-article h2, .doc-article h3");
  if (headings.length === 0) return;

  tocList.innerHTML = "";

  headings.forEach(heading => {
    let id = heading.getAttribute("id");
    if (!id) {
      id = heading.textContent.toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      heading.setAttribute("id", id);
    }

    const li = document.createElement("li");
    li.className = "toc-item";

    const a = document.createElement("a");
    a.href = `#${id}`;
    a.className = heading.tagName.toLowerCase() === "h3" ? "toc-link toc-link-h3" : "toc-link";
    a.textContent = heading.textContent.replace(/^[0-9]+\.\s*/, "").replace(/[→↓↑].*$/, "").trim();

    li.appendChild(a);
    tocList.appendChild(li);
  });
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

    if (currentSampleId && PRECOMPUTED_TOKENS[currentSampleId] && PRECOMPUTED_TOKENS[currentSampleId][model]) {
      tokens = PRECOMPUTED_TOKENS[currentSampleId][model];
    } else {
      tokens = simulateTokenize(text, model);
    }

    if (tokens.length === 0) {
      tokenBox.innerHTML = '<span style="color:var(--color-text-faint);font-family:var(--font-body);direction:ltr;font-size:0.85rem;">Enter text above or select a preset to inspect tokens...</span>';
      if (statTokens) statTokens.textContent = "0";
      if (statWords) statWords.textContent = "0";
      if (statFertility) statFertility.textContent = "0.00";
      return;
    }

    tokenBox.innerHTML = tokens.map((tok, idx) => {
      const color = TOKEN_COLORS[idx % TOKEN_COLORS.length];
      const id = hashToken(tok);
      return `<span class="token-chip" style="background:${color}">
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
        statFidelity.style.color = "var(--cd-b)";
      } else {
        statFidelity.textContent = "100.00% (Lossless)";
        statFidelity.style.color = "var(--ct-b)";
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

  textarea.value = SAMPLE_SENTENCES[0].text;
  renderTokens();
}

// Benchmark Matrix Table Engine
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
      const isFlagship = row.model.includes("Flagship");
      const hasDefect = row.loss !== "0.0000%";
      const rowClass = isFlagship ? "row-flagship" : (isCustom ? "row-custom" : "");

      const badgeType = isCustom ? "tb-custom" : (row.type === "sindhi" ? "tb-sindhi" : "tb-multi");
      const lossBadge = hasDefect
        ? `<span class="type-badge tb-defect">${row.loss} Loss</span>`
        : `<span class="type-badge tb-custom">0.0000%</span>`;

      return `<tr class="${rowClass}">
        <td>
          <span class="type-badge ${badgeType}" style="margin-right:6px;">${row.type}</span>
          <strong>${row.model}</strong>
        </td>
        <td><code>${row.vocab}</code></td>
        <td><strong style="color:${isCustom ? 'var(--ct-b)' : 'inherit'}">${row.fertility}</strong></td>
        <td>${row.single}</td>
        <td>${row.unk}</td>
        <td><code>${row.fallback}</code></td>
        <td>${lossBadge}</td>
        <td><span style="font-size:0.8125rem;color:var(--color-text-muted);">${row.note}</span></td>
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

// Collapsible FAQ Accordion
function initFAQ() {
  document.querySelectorAll(".faq-question").forEach(q => {
    q.addEventListener("click", () => {
      const item = q.closest(".faq-item");
      item.classList.toggle("open");
    });
  });
}

// ScrollSpy Navigation (Sidebar & TOC)
function initScrollSpy() {
  const navLinks = document.querySelectorAll(".sidebar .nav-link");
  const tocLinks = document.querySelectorAll(".toc-sidebar .toc-link");
  const sections = document.querySelectorAll(".doc-article section");

  window.addEventListener("scroll", () => {
    let currentId = "";
    sections.forEach(sec => {
      const secTop = sec.offsetTop - 100;
      if (window.scrollY >= secTop) {
        currentId = sec.getAttribute("id");
      }
    });

    if (!currentId && sections.length > 0) {
      currentId = sections[0].getAttribute("id");
    }

    navLinks.forEach(link => {
      const href = link.getAttribute("href");
      if (href === "#" + currentId) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });

    tocLinks.forEach(link => {
      const href = link.getAttribute("href");
      if (href === "#" + currentId) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  });
}

// Copy Code Buttons
function initCopyButtons() {
  document.querySelectorAll(".btn-copy").forEach(btn => {
    btn.addEventListener("click", () => {
      const targetSelector = btn.getAttribute("data-target");
      const targetElem = document.querySelector(targetSelector);
      if (!targetElem) return;

      const text = targetElem.innerText || targetElem.textContent;
      navigator.clipboard.writeText(text).then(() => {
        showToast("Code copied to clipboard");
        const originalText = btn.textContent;
        btn.textContent = "Copied!";
        setTimeout(() => {
          btn.textContent = originalText;
        }, 2000);
      });
    });
  });
}

// Header Search Keyboard Shortcut & Navigation
function initSearch() {
  const searchInput = document.getElementById("site-search");
  if (!searchInput) return;

  // Press "/" to focus search
  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && document.activeElement !== searchInput && !["TEXTAREA", "INPUT"].includes(document.activeElement.tagName)) {
      e.preventDefault();
      searchInput.focus();
    } else if (e.key === "Escape" && document.activeElement === searchInput) {
      searchInput.blur();
    }
  });

  // Search through headings on Enter
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const q = searchInput.value.toLowerCase().trim();
      if (!q) return;

      const headings = Array.from(document.querySelectorAll(".doc-article h2, .doc-article h3"));
      const match = headings.find(h => h.textContent.toLowerCase().includes(q));
      if (match) {
        match.scrollIntoView({ behavior: "smooth" });
        showToast(`Navigated to: ${match.textContent.trim()}`);
      } else {
        showToast(`No section found matching "${q}"`);
      }
    }
  });
}

// Toast System
function showToast(msg) {
  let toast = document.getElementById("toast-notice");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast-notice";
    toast.className = "toast-notice";
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

// Helper: Escape HTML
function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
