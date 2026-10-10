// Thèmes disponibles.
// - icons : pictos utilisés pour masquer les lettres (au moins 14 pour couvrir les mots longs)
// - decor : pictos décoratifs en fond de page
// - bg    : dégradé de fond [haut, bas]
// - accent: couleur des titres / de la correction
window.THEMES = {
  hiver: {
    name: "Hiver",
    emoji: "❄️",
    bg: ["#d6e4f2", "#f7fbff"],
    accent: "#2c4f7c",
    decor: ["❄️", "🌨️", "❄️", "⛄"],
    icons: ["⛄", "❄️", "🧣", "🧤", "🎿", "⛸️", "🏔️", "☕", "🧊", "🐧", "🛷", "🧦", "🦭", "🌨️", "🐻‍❄️", "🏒"],
  },
  automne: {
    name: "Automne",
    emoji: "🍂",
    bg: ["#f6dcc0", "#fff8ef"],
    accent: "#9a4a12",
    decor: ["🍂", "🍁", "🍂", "🍄"],
    icons: ["🍂", "🍁", "🍄", "🌰", "🦔", "🍎", "🐿️", "☔", "🍇", "🥧", "🌽", "🦉", "🧺", "🍐", "🎃", "🌂"],
  },
  paques: {
    name: "Pâques",
    emoji: "🐣",
    bg: ["#e6f4d7", "#fffdf2"],
    accent: "#5d8a2f",
    decor: ["🌷", "🌼", "🥚", "🌸"],
    icons: ["🐣", "🐰", "🥚", "🌷", "🐥", "🍫", "🧺", "🌼", "🐑", "🦋", "🌸", "🔔", "🥕", "🐤", "🐇", "🪺"],
  },
  noel: {
    name: "Noël",
    emoji: "🎄",
    bg: ["#f3d9d9", "#fffaf5"],
    accent: "#a3222a",
    decor: ["🎄", "⭐", "❄️", "🎁"],
    icons: ["🎄", "🎅", "🎁", "⭐", "🔔", "🦌", "🕯️", "🍪", "🧦", "☃️", "🍬", "🎀", "🤶", "🛷", "🌟", "🧑‍🎄"],
  },
  halloween: {
    name: "Halloween",
    emoji: "🎃",
    bg: ["#e7dcf0", "#fff6ea"],
    accent: "#6a2c91",
    decor: ["🦇", "🕸️", "🎃", "🌙"],
    icons: ["🎃", "👻", "🦇", "🕷️", "🕸️", "🧙", "💀", "🍬", "🌙", "🐈‍⬛", "🧛", "🍭", "🔮", "🧹", "🧟", "🦉"],
  },
  valentin: {
    name: "Saint-Valentin",
    emoji: "💘",
    bg: ["#fbdde6", "#fff7fa"],
    accent: "#c2185b",
    decor: ["❤️", "💕", "🌹", "💗"],
    icons: ["❤️", "💌", "🌹", "💘", "🍫", "💐", "💍", "🧸", "💝", "🕊️", "💋", "🎀", "🍓", "💞", "🦢", "🧁"],
  },
  ete: {
    name: "Été",
    emoji: "☀️",
    bg: ["#cdeffa", "#fff6d6"],
    accent: "#0a7ea4",
    decor: ["☀️", "🌴", "🐚", "🌊"],
    icons: ["☀️", "🏖️", "🍉", "🍦", "🌴", "🐚", "🩴", "🕶️", "🏄", "🦀", "🍹", "⛱️", "🐠", "🌻", "🐬", "⛵"],
  },
  printemps: {
    name: "Printemps",
    emoji: "🌸",
    bg: ["#e3f5e1", "#fdfbff"],
    accent: "#2e7d4f",
    decor: ["🌸", "🌱", "🦋", "🌼"],
    icons: ["🌸", "🌷", "🐝", "🦋", "🌱", "🌈", "🐞", "🌼", "☔", "🐦", "🍓", "🌿", "🐌", "🪺", "🐛", "🌳"],
  },
  anniversaire: {
    name: "Anniversaire",
    emoji: "🎂",
    bg: ["#fde8c8", "#f4f0ff"],
    accent: "#d0570f",
    decor: ["🎈", "🎉", "🎊", "🎈"],
    icons: ["🎂", "🎈", "🎉", "🎁", "🥳", "🍰", "🎊", "🧁", "🎀", "🍭", "🪅", "🍬", "🎵", "🃏", "👑", "🍕"],
  },
  mer: {
    name: "Mer",
    emoji: "🐳",
    bg: ["#c9e8f5", "#effaff"],
    accent: "#11577a",
    decor: ["🌊", "🐚", "🐟", "🫧"],
    icons: ["🐳", "🐙", "🦀", "🐠", "🐚", "⚓", "🦈", "🐢", "🦑", "🐬", "⛵", "🪸", "🦞", "🐡", "🧜", "🌊"],
  },
};
