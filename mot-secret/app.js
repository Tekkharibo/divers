(() => {
  "use strict";

  const THEMES = window.THEMES;
  const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const STORAGE_KEY = "mot-secret:v0";
  // Polices lisibles pour les enfants dys (fichiers dans fonts/).
  const FONTS = {
    andika: { name: "Andika (lettres d'école)", family: '"Andika", sans-serif' },
    // OpenDyslexic est plus large : titre réduit pour tenir sur une ligne.
    opendyslexic: { name: "OpenDyslexic", family: '"OpenDyslexic", sans-serif', titleScale: 0.72 },
    lexend: { name: "Lexend", family: '"Lexend", sans-serif' },
    atkinson: { name: "Atkinson Hyperlegible", family: '"Atkinson Hyperlegible", sans-serif' },
  };
  // Nombre de lignes par page de correction.
  const ANSWERS_PER_PAGE = 10;
  // En français, Y est classé avec les voyelles.
  const VOWELS = "AEIOUY";
  // Options de lisibilité (cases à cocher) → classe ajoutée sur chaque page.
  const READABILITY = { lowercase: "is-lower", bigText: "is-big", spaced: "is-spaced", colorVowels: "is-colored" };
  // Positions des pictos décoratifs en fond de page (en % de la page) et taille en mm.
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
    font: $("#font"),
    correction: $("#correction"),
    showName: $("#showName"),
    showNumber: $("#showNumber"),
    shuffle: $("#shuffle"),
    warnings: $("#warnings"),
    preview: $("#preview"),
  };

  const state = {
    theme: "hiver",
    words: "hiver\nneige\nbonhomme de neige",
    title: "",
    font: "andika",
    correction: "end",
    showName: false,
    showNumber: true,
    lowercase: false,
    bigText: false,
    spaced: false,
    colorVowels: false,
    seed: 1,
  };

  // ---------- Persistance (confort uniquement) ----------
  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (saved) Object.assign(state, saved);
    } catch (_) {}
    if (!THEMES[state.theme]) state.theme = "hiver";
    if (!FONTS[state.font]) state.font = "andika";
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

  // Découpe un mot après chaque tiret / apostrophe : « arc-en-ciel » → « arc- », « en- », « ciel »,
  // pour pouvoir passer à la ligne à ces endroits et garder de grandes cases.
  function segments(group) {
    const out = [[]];
    group.forEach((t, i) => {
      out[out.length - 1].push(t);
      if (t.kind === "char" && i < group.length - 1) out.push([]);
    });
    return out;
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
      longest: Math.max(...groups.flatMap((g) => segments(g).map((s) => s.length))),
    };
  }

  // ---------- Rendu ----------
  const h = (tag, cls, html) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  };
  const letterEl = (l) => h("span", "letter " + (VOWELS.includes(l) ? "vowel" : "consonant"), l);
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  // Page A4 vide avec fond et décor du thème.
  function blankPage(cls) {
    const theme = THEMES[state.theme];
    const page = h("section", "page " + cls);
    Object.entries(READABILITY).forEach(([opt, c]) => state[opt] && page.classList.add(c));
    page.style.setProperty("--bg-top", theme.bg[0]);
    page.style.setProperty("--bg-bottom", theme.bg[1]);
    page.style.setProperty("--accent", theme.accent);
    page.style.setProperty("--page-font", FONTS[state.font].family);
    page.style.setProperty("--title-scale", FONTS[state.font].titleScale || 1);

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
      // Bordures haut/gauche seulement sur les bords de la grille (Y n'a pas de voisin à gauche).
      const edges = (i < 4 ? " edge-top" : "") + (i % 4 === 0 || l === "Y" ? " edge-left" : "");
      const cell = h("div", "alpha-cell" + edges);
      if (icon) cell.appendChild(h("span", "icon", icon));
      else cell.appendChild(letterEl(l));
      grid.appendChild(cell);
    });
    page.appendChild(grid);

    // Bande du mot : pictos en haut, cases à remplir en bas.
    // Taille de départ : le plus long morceau tient sur une ligne (max 180 mm).
    // fitStrips() la réduit ensuite si la bande dépasse le bas de la page.
    const gapMm = state.spaced ? 1.5 : 0;
    const longest = Math.max(puzzle.longest, 1);
    const cellMm = Math.min(30, (180 - (longest - 1) * gapMm) / longest);
    const strip = h("div", "word");
    strip.dataset.cell = cellMm;
    strip.style.setProperty("--cell", `${cellMm}mm`);
    puzzle.groups.forEach((group) => {
      const g = h("div", "word-group");
      segments(group).forEach((seg) => {
        const s = h("div", "word-seg");
        seg.forEach((t, ti) => {
          const col = h("div", "word-col" + (t.kind === "char" ? " is-char" : ti === 0 ? " edge-left" : ""));
          if (t.kind === "letter") {
            // Lettre sans picto (thème à court de dessins) : donnée en indice.
            col.appendChild(h("div", "word-icon", puzzle.iconOf[t.letter] || t.letter));
            col.appendChild(h("div", "word-answer"));
          } else {
            col.appendChild(h("div", "word-icon"));
            col.appendChild(h("div", "word-answer", esc(t.ch)));
          }
          s.appendChild(col);
        });
        g.appendChild(s);
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
          {
            const first = !boxes.lastChild || boxes.lastChild.classList.contains("is-space");
            const box = h("div", "answer-box" + (first ? " edge-left" : ""), t.kind === "letter" ? "" : esc(t.ch));
            if (t.kind === "letter") box.appendChild(letterEl(t.letter));
            boxes.appendChild(box);
          }
          );
        });
        // Police réduite si les cases deviennent étroites (longues expressions).
        const scale = state.bigText ? 1.3 : 1;
        boxes.style.fontSize = `${Math.min(8 * scale, (150 / boxes.children.length) * 0.7)}mm`;
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
    fitStrips();
    save();
  }

  // Réduit les cases de la bande du mot (par pas de 1 mm) tant qu'elle dépasse le bas de la page.
  function fitStrips() {
    els.preview.querySelectorAll(".page.is-puzzle").forEach((page) => {
      const strip = page.querySelector(".word");
      const pr = page.getBoundingClientRect();
      const limit = pr.bottom - (12 * pr.height) / 297; // 12 mm de marge basse
      let cell = Number(strip.dataset.cell);
      while (cell > 10 && strip.getBoundingClientRect().bottom > limit) {
        cell -= 1;
        strip.style.setProperty("--cell", `${cell}mm`);
      }
    });
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
    els.font.replaceChildren(
      ...Object.entries(FONTS).map(([key, f]) => {
        const o = h("option", "", f.name);
        o.value = key;
        o.style.fontFamily = f.family;
        return o;
      })
    );
    els.font.value = state.font;
    els.correction.value = state.correction;
    els.showName.checked = state.showName;
    els.showNumber.checked = state.showNumber;
    Object.keys(READABILITY).forEach((opt) => {
      const input = $("#" + opt);
      input.checked = state[opt];
      input.addEventListener("change", () => ((state[opt] = input.checked), render()));
    });

    els.words.addEventListener("input", () => ((state.words = els.words.value), render()));
    els.title.addEventListener("input", () => ((state.title = els.title.value), render()));
    els.font.addEventListener("change", () => ((state.font = els.font.value), render()));
    els.correction.addEventListener("change", () => ((state.correction = els.correction.value), render()));
    els.showName.addEventListener("change", () => ((state.showName = els.showName.checked), render()));
    els.showNumber.addEventListener("change", () => ((state.showNumber = els.showNumber.checked), render()));
    els.shuffle.addEventListener("click", () => (state.seed++, render()));
    document.querySelectorAll(".js-print").forEach((b) => b.addEventListener("click", () => window.print()));
    window.addEventListener("resize", fitPreview);
    window.addEventListener("beforeprint", () => (els.preview.style.zoom = 1));
    window.addEventListener("afterprint", fitPreview);
  }

  load();
  renderThemePicker();
  bind();
  render();
  // La hauteur du titre dépend de la police : réajuste une fois les polices chargées.
  if (document.fonts) document.fonts.ready.then(fitStrips);
})();
