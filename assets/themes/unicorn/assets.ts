const packAssets = {
  background: require("./background.jpg"),
  banner: require("./banner.jpg"),
  icons: {
    notes: require("./icon_notes.png"),
    material: require("./icon_material.png"),
    method: require("./icon_method.png"),
    colour: require("./icon_colour.png"),
    dice: require("./icon_dice.png"),
  },
  preview: {
    footerParchment: require("./preview_footer_parchment.png"),
    quoteCard: require("./preview_quote_card.png"),
    diceIcon: require("./preview_icon_dice.png"),
    paletteIcon: require("./preview_icon_palette.png"),
  },
} as const;

export default packAssets;
