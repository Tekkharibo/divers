#!/usr/bin/env node
// Copie dans emoji/ les dessins Fluent Emoji (Microsoft, licence MIT) utilisés par themes.js.
// Usage : node tools/copy-fluent-emoji.js /chemin/vers/fluentui-emoji
//   (clone de https://github.com/microsoft/fluentui-emoji ; seuls les SVG sont nécessaires)
// Fichiers produits : emoji/{flat,hc}/<points de code hexadécimaux séparés par "-">.svg
const fs = require("fs");
const path = require("path");

const repo = process.argv[2];
if (!repo) {
  console.error("Usage : node tools/copy-fluent-emoji.js /chemin/vers/fluentui-emoji");
  process.exit(1);
}
const root = path.join(__dirname, "..");
const assets = path.join(repo, "assets");
global.window = {};
require(path.join(root, "themes.js"));

// Même nommage que emojiFile() dans app.js (sans le sélecteur de variante FE0F).
const code = (e) =>
  [...e]
    .map((c) => c.codePointAt(0))
    .filter((c) => c !== 0xfe0f)
    .map((c) => c.toString(16))
    .join("-");

const index = {};
for (const dir of fs.readdirSync(assets)) {
  const meta = path.join(assets, dir, "metadata.json");
  if (fs.existsSync(meta)) index[code(JSON.parse(fs.readFileSync(meta, "utf8")).glyph)] = dir;
}

const used = new Set();
for (const t of Object.values(window.THEMES)) [...t.icons, ...t.decor].forEach((e) => used.add(e));

const styles = { flat: "Flat", hc: "High Contrast" };
const missing = [];
for (const e of used) {
  const dir = index[code(e)];
  if (!dir) {
    missing.push(e);
    continue;
  }
  // Emojis avec teintes de peau : variante « Default ».
  const base = fs.existsSync(path.join(assets, dir, "Default")) ? path.join(assets, dir, "Default") : path.join(assets, dir);
  for (const [out, style] of Object.entries(styles)) {
    const src = path.join(base, style);
    const svg = fs.readdirSync(src).find((f) => f.endsWith(".svg"));
    fs.mkdirSync(path.join(root, "emoji", out), { recursive: true });
    fs.copyFileSync(path.join(src, svg), path.join(root, "emoji", out, code(e) + ".svg"));
  }
}
fs.copyFileSync(path.join(repo, "LICENSE"), path.join(root, "emoji", "LICENSE.txt"));
console.log(`${used.size - missing.length} emojis copiés.`);
if (missing.length) {
  console.error("Introuvables dans Fluent Emoji :", missing.join(" "));
  process.exit(1);
}
