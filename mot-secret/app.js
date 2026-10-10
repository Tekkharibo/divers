(() => {
  "use strict";

  const THEMES = window.THEMES;
  const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const STORAGE_KEY = "mot-secret:v0";
  // Positions des pictos décoratifs en fond de page (en % de la page) et taille en mm.
  // Nombre de lignes par page de correction.
  const ANSWERS_PER_PAGE = 10;
  const DECOR_SPOTS = [
    { x: -4, y: -2, s: 46, r: -15 },
    { x: 84, y: 1, s: 34, r: 20 },
    { x: 90, y: 30, s: 22, r: 10 },
    { x: -3, y: 42, s: 26, r: -8 },
    { x: 88, y: 58, s: 30, r: -20 },
    { x: 2, y: 82, s: 40, r: 12 },
    { x: 80, y: 86, s: 44, r: -10 },
    { x: 45, y: 92, s: 20, r: 5 },
  ];

  const $ = (sel) => document.querySelector(sel);
  const els = {
    themes: $("#themes"),
    words: $("#words"),
    title: $("#title"),
    correction: $("#correction"),
    showName: $("#showName"),
    showNumber: $("#showNumber"),
    shuffle: $("#shuffle"),
    print: $("#print"),
    warnings: $("#warnings"),
    preview: $("#preview"),
  };

  const state = {
    theme: "hiver",
    words: "hiver\nneige\nbonhomme de neige",
    title: "",
    correction: "end",
    showName: false,
    showNumber: true,
    seed: 1,
  };

  // ---------- Persistance (confort uniquement) ----------
  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (saved) Object.assign(state, saved);
    } catch (_) {}
    if (!THEMES[state.theme]) state.theme = "hiver";
    if (state.correction !== "none") state.correction = "end";
  }
  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (_) {}
  }

  // ---------- Aléatoire reproductible ----------
  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }
  function mulberry32(a) {
    return () => {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function shuffled(list, rand) {
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // ---------- Analyse d'un mot ----------
  // Renvoie une liste de groupes (un par mot), chaque groupe = liste de tokens
  // { kind: "letter", letter: "E" } ou { kind: "char", ch: "-" }.
  function parse(raw) {
    const text = raw
      .replace(/[œŒ]/g, "OE")
      .replace(/[æÆ]/g, "AE")
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toUpperCase();
    return text
      .split(/\s+/)
      .filter(Boolean)
      .map((word) =>
        Array.from(word).map((ch) => (ALPHABET.includes(ch) ? { kind: "letter", letter: ch } : { kind: "char", ch }))
      );
  }

  function buildPuzzle(raw, index) {
    const theme = THEMES[state.theme];
    const groups = parse(raw);
    const unique = [];
    groups.flat().forEach((t) => {
      if (t.kind === "letter" && !unique.includes(t.letter)) unique.push(t.letter);
    });
    if (!unique.length) return null;
    const rand = mulberry32(hash(`${state.theme}|${raw}|${state.seed}`));
    const icons = shuffled(theme.icons, rand);
    const iconOf = {};
    unique.forEach((l, i) => (iconOf[l] = icons[i]));
    return {
      raw,
      index,
      groups,
      iconOf,
      tooMany: unique.length > theme.icons.length,
      cellCount: groups.reduce((n, g) => n + g.length, 0),
      longest: Math.max(...groups.map((g) => g.length)),
    };
  }

  // ---------- Rendu ----------
  const h = (tag, cls, html) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  };
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  // Page A4 vide avec fond et décor du thème.
  function blankPage(cls) {
    const theme = THEMES[state.theme];
    const page = h("section", "page " + cls);
    page.style.setProperty("--bg-top", theme.bg[0]);
    page.style.setProperty("--bg-bottom", theme.bg[1]);
    page.style.setProperty("--accent", theme.accent);

    const decor = h("div", "decor");
    DECOR_SPOTS.forEach((spot, i) => {
      const d = h("span", "", theme.decor[i % theme.decor.length]);
      d.style.cssText = `left:${spot.x}%;top:${spot.y}%;font-size:${spot.s}mm;transform:rotate(${spot.r}deg)`;
      decor.appendChild(d);
    });
    page.appendChild(decor);
    return page;
  }

  function renderPage(puzzle) {
    const page = blankPage("is-puzzle");

    const head = h("header", "page-head");
    const title = esc(state.title.trim() || "Trouve le mot secret !");
    head.appendChild(h("h2", "", title));
    if (state.showName) head.appendChild(h("p", "name-line", "Prénom : <span></span>"));
    page.appendChild(head);

    // Grille alphabet : 6 lignes de 4 (A→X) puis Y, Z centrés.
    const grid = h("div", "alpha");
    const cells = ALPHABET.slice(0, 24);
    cells.push(null, "Y", "Z", null);
    cells.forEach((l, i) => {
      if (l === null) {
        const blank = h("div", "alpha-blank");
        if (i === 24 && state.showNumber) blank.appendChild(h("span", "badge", String(puzzle.index)));
        grid.appendChild(blank);
        return;
      }
      const icon = puzzle.iconOf[l];
      const cell = h("div", "alpha-cell");
      if (icon) cell.appendChild(h("span", "icon", icon));
      else cell.textContent = l;
      grid.appendChild(cell);
    });
    page.appendChild(grid);

    // Bande du mot : pictos en haut, cases à remplir en bas.
    // Taille des cases calculée pour que le mot le plus long tienne sur une ligne (max 180 mm).
    // Si le texte passe sur plusieurs lignes, cases plus petites pour garder la fiche sur une page.
    const oneLineMm = puzzle.cellCount * 30 + (puzzle.groups.length - 1) * 15;
    const cellMm = Math.min(oneLineMm > 180 ? 22 : 30, 180 / Math.max(puzzle.longest, 1));
    const strip = h("div", "word");
    strip.style.setProperty("--cell", `${cellMm}mm`);
    puzzle.groups.forEach((group) => {
      const g = h("div", "word-group");
      group.forEach((t) => {
        const col = h("div", "word-col" + (t.kind === "char" ? " is-char" : ""));
        if (t.kind === "letter") {
          // Lettre sans picto (thème à court de dessins) : donnée en indice.
          col.appendChild(h("div", "word-icon", puzzle.iconOf[t.letter] || t.letter));
          col.appendChild(h("div", "word-answer"));
        } else {
          col.appendChild(h("div", "word-icon"));
          col.appendChild(h("div", "word-answer", esc(t.ch)));
        }
        g.appendChild(col);
      });
      strip.appendChild(g);
    });
    page.appendChild(strip);

    return page;
  }

  // Correction : une ligne par mot, toutes de même largeur ; les cases se partagent la largeur
  // (un mot court a des cases larges, un mot long des cases étroites).
  function renderAnswerPages(puzzles) {
    const pages = [];
    for (let start = 0; start < puzzles.length; start += ANSWERS_PER_PAGE) {
      const page = blankPage("is-answers");
      const head = h("header", "page-head");
      head.appendChild(h("h2", "", "Correction"));
      page.appendChild(head);

      const list = h("div", "answers");
      puzzles.slice(start, start + ANSWERS_PER_PAGE).forEach((p) => {
        const row = h("div", "answer-row");
        row.appendChild(h("span", "badge", String(p.index)));
        const boxes = h("div", "answer-boxes");
        p.groups.forEach((group, gi) => {
          if (gi > 0) boxes.appendChild(h("div", "answer-box is-space"));
          group.forEach((t) =>
            boxes.appendChild(h("div", "answer-box", t.kind === "letter" ? t.letter : esc(t.ch)))
          );
        });
        // Police réduite si les cases deviennent étroites (longues expressions).
        boxes.style.fontSize = `${Math.min(8, (150 / boxes.children.length) * 0.7)}mm`;
        row.appendChild(boxes);
        list.appendChild(row);
      });
      page.appendChild(list);
      pages.push(page);
    }
    return pages;
  }

  function render() {
    const lines = state.words.split(/\n/).map((s) => s.trim()).filter(Boolean);
    const puzzles = [];
    lines.forEach((line) => {
      const p = buildPuzzle(line, puzzles.length + 1);
      if (p) puzzles.push(p);
    });

    const warnings = puzzles
      .filter((p) => p.tooMany)
      .map((p) => `« ${esc(p.raw)} » contient trop de lettres différentes pour ce thème.`);
    els.warnings.innerHTML = warnings.join("<br>");

    const frag = document.createDocumentFragment();
    puzzles.forEach((p) => frag.appendChild(renderPage(p)));
    if (state.correction === "end") renderAnswerPages(puzzles).forEach((pg) => frag.appendChild(pg));
    if (!puzzles.length) frag.appendChild(h("p", "empty", "Ajoute au moins un mot pour générer une fiche."));

    els.preview.replaceChildren(frag);
    fitPreview();
    save();
  }

  // Mise à l'échelle de l'aperçu à l'écran (l'impression reste à 100 %).
  function fitPreview() {
    const avail = els.preview.parentElement.clientWidth - 32;
    const pageWidthPx = 210 * 3.7795;
    els.preview.style.zoom = Math.min(1, avail / pageWidthPx);
  }

  // ---------- Interface ----------
  function renderThemePicker() {
    els.themes.replaceChildren(
      ...Object.entries(THEMES).map(([key, t]) => {
        const b = h("button", "theme-btn", `<span>${t.emoji}</span>${t.name}`);
        b.type = "button";
        b.setAttribute("role", "radio");
        b.setAttribute("aria-checked", String(key === state.theme));
        b.addEventListener("click", () => {
          state.theme = key;
          renderThemePicker();
          render();
        });
        return b;
      })
    );
  }

  function bind() {
    els.words.value = state.words;
    els.title.value = state.title;
    els.correction.value = state.correction;
    els.showName.checked = state.showName;
    els.showNumber.checked = state.showNumber;

    els.words.addEventListener("input", () => ((state.words = els.words.value), render()));
    els.title.addEventListener("input", () => ((state.title = els.title.value), render()));
    els.correction.addEventListener("change", () => ((state.correction = els.correction.value), render()));
    els.showName.addEventListener("change", () => ((state.showName = els.showName.checked), render()));
    els.showNumber.addEventListener("change", () => ((state.showNumber = els.showNumber.checked), render()));
    els.shuffle.addEventListener("click", () => (state.seed++, render()));
    els.print.addEventListener("click", () => window.print());
    window.addEventListener("resize", fitPreview);
    window.addEventListener("beforeprint", () => (els.preview.style.zoom = 1));
    window.addEventListener("afterprint", fitPreview);
  }

  load();
  renderThemePicker();
  bind();
  render();
})();
