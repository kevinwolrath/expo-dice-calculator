const packAssets = {
  background: require("./tavern_background.jpg"),
  backgroundDark: require("./tavern_background_dark.jpg"),
  banner: require("./dice_job_manager_banner.jpg"),
  icon: require("./app_icon.png"),
  splash: require("./splash_screen.jpg"),
  panel: require("./panel_background.png"),
  buttonPrimary: require("./button_primary.png"),
  buttonWood: require("./button_wood.png"),
  buttonOutline: require("./button_outline.png"),
  dice: {
    d20: require("./dice_d20.png"),
    d12: require("./dice_d12.png"),
    d8: require("./dice_d8.png"),
    d6: require("./dice_d6.png"),
  },
  icons: {
    notes: require("./icon_notes.png"),
    material: require("./icon_material.png"),
    method: require("./icon_method.png"),
    colour: require("./icon_colour.png"),
    dice: require("./icon_dice.png"),
  },
} as const;

export default packAssets;
