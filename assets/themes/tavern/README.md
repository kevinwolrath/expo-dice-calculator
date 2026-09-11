# Dice Job Manager Tavern Theme Asset Pack

Day-only theme pack. Night view is not customised by this pack.

Files:
- theme.json – colour tokens and asset filenames
- assets.ts – Metro `require()` map for bundled images
- tavern_background.jpg – full-screen portrait background (day)
- tavern_background_dark.jpg – unused at runtime (night is locked black)
- dice_job_manager_banner.jpg – Jobs screen/header banner
- app_icon.png / splash_screen.jpg – build-time Expo icon/splash, not swapped at runtime
- panel_background.png / button_*.png – optional decoration, not used as 9-slice chrome
- dice_d20.png / dice_d12.png / dice_d8.png / dice_d6.png – transparent dice artwork
- icon_*.png – transparent fantasy field icons
- CURSOR_PROMPTS.md – original staged restyle notes; do not follow as a one-off rewrite

A second pack should use the same folder shape: `assets/themes/<id>/theme.json` and `assets.ts`.
