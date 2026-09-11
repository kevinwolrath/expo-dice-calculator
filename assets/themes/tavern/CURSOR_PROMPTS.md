# Cursor prompts – Dice Job Manager Tavern Theme

## Prompt 1 – Audit and plan before editing

I have an existing React Native Expo application called Dice Job Manager. Do not rebuild it and do not change its business logic.

First inspect the project and identify:
- the Jobs screen/component shown in the current app
- app navigation
- reusable Button, Input, Select/Picker, Switch and Card components
- theme/style files
- app.json or app.config.* Expo configuration
- current assets folder
- whether I use Expo Router, React Navigation, NativeWind, StyleSheet, or another styling system

Then give me a short implementation plan for applying a fantasy tavern/dice theme using the supplied assets.

Important constraints:
- preserve all current functionality and data handling
- preserve accessibility
- keep forms highly readable
- avoid adding unnecessary packages
- use existing project conventions
- do not make edits until you have shown the plan

Assets I will add under assets/tavern/:
tavern_background.jpg
tavern_background_dark.jpg
dice_job_manager_banner.jpg
app_icon.png
splash_screen.jpg
panel_background.png
button_primary.png
button_wood.png
button_outline.png
dice_d20.png
dice_d12.png
dice_d8.png
dice_d6.png
icon_notes.png
icon_material.png
icon_method.png
icon_colour.png
icon_dice.png


## Prompt 2 – Create the reusable tavern theme

Implement a reusable theme layer for my existing React Native Expo app.

Design direction:
- fantasy dice maker / medieval tavern
- immersive but not gimmicky
- warm wood and lantern atmosphere
- dark charcoal translucent form panels
- existing bright blue remains the main interactive colour
- gold is only an accent
- form text must remain easy to read

Use these colours:
primaryDark #0B1F3A
primaryBlue #2D8CFF
accentBlue #5AB3FF
gold #F4C74B
wood #8B5E3C
panel #1E1E1E
parchment #EAD3B1
textPrimary #F6EAD3
textSecondary #C9A27E

Create reusable styles/components where they fit the existing architecture:
TavernScreenBackground
TavernPanel
TavernButton
TavernField
SectionHeading

For the screen background:
- use assets/tavern/tavern_background_dark.jpg
- cover the full screen
- include SafeAreaView handling
- keep ScrollView content readable
- add a subtle dark overlay if needed
- do not put ImageBackground around every small component

For panels:
- rgba(14,18,26,0.82)
- rounded corners around 14-18
- thin warm/gold/brown border
- subtle shadow/elevation
- consistent spacing

Do not change business logic.


## Prompt 3 – Redesign the Jobs screen

Now update the existing Jobs screen to match the tavern theme while preserving every current field and action.

At the top:
- retain the application header/navigation controls
- add dice_job_manager_banner.jpg as a responsive decorative banner below the header
- keep aspect ratio
- use resizeMode="cover"
- cap its height so it does not dominate smaller phones

Form layout:
- group logical areas into TavernPanel cards
- do not make one giant card for the entire screen
- retain Name, Notes, Excluded colour types, Generate, Preview, Material type, Production method, Colour count, Number colour, Add job, Save job and Cancel
- retain all Lock switches and current disabled/enabled behaviour
- preserve required field indicators

Suggested groups:
1. Job details: Name + Notes
2. Randomiser: Excluded colour types + Generate + Preview
3. Dice setup: Material type + Production method + Colour count + Number colour
4. Actions: Add job + Save job + Cancel

Style:
- labels: textPrimary or muted blue/gold
- input background: rgba(20,25,34,0.88)
- input border: rgba(244,199,75,0.30)
- focused input border: primaryBlue
- placeholder: muted grey/tan
- dropdown chevrons remain clear
- primary actions use bright blue
- secondary actions may use wood styling
- Cancel remains visually distinct but not overly aggressive

Use the supplied small icons sparingly:
Name: icon_dice.png
Notes: icon_notes.png
Material type: icon_material.png
Production method: icon_method.png
Colour count: icon_colour.png
Number colour: icon_dice.png

Do not place decorative icons where they reduce usability.


## Prompt 4 – Generate and Preview area

Improve the randomiser section.

Requirements:
- Generate remains the strongest call to action
- Preview is secondary
- show one of the supplied dice assets near the section title or Preview area
- do not put an image behind button text
- maintain current onPress handlers exactly
- buttons must have at least 44px touch height
- use flex wrapping or responsive widths so Generate/Preview work on narrow Android screens
- no hard-coded screen widths

If the app already has a generated-colour preview, enhance that existing preview rather than creating a competing feature.


## Prompt 5 – Bottom navigation

Restyle the current bottom navigation without changing routes.

Use:
- deep navy/charcoal background
- small gold or warm off-white icons for inactive tabs
- bright blue for the active tab
- subtle top border
- active indicator can be a thin blue line or glow
- preserve the existing labels:
Jobs
Colours
Material Types
Types
Methods
Number Colours

Avoid putting a detailed background image behind the navigation labels because readability is more important.

Make sure long labels do not clip badly. Use smaller text or two-line labels if necessary.


## Prompt 6 – Expo icon and splash screen

Configure the existing Expo app to use:
assets/tavern/app_icon.png
assets/tavern/splash_screen.jpg

Inspect whether this project uses app.json or app.config.js/app.config.ts and update the correct file.

Keep existing package name, bundle identifiers, permissions, plugins, version numbers, Android adaptive icon configuration and other current settings.

For Android adaptive icons:
- use app_icon.png for foreground if compatible with the current Expo config
- retain or choose a dark navy background matching #0B1F3A
- do not remove existing Android configuration

For splash:
- use splash_screen.jpg
- resizeMode cover or contain based on the Expo version/current config
- use #0B1F3A as the fallback background


## Prompt 7 – Responsive cleanup

Review the themed Jobs screen at approximately:
- 360px wide Android
- 390px wide phone
- 430px wide phone
- tablet width if the current app supports tablets

Fix:
- clipped dropdowns
- overflowing buttons
- lock switch alignment
- bottom navigation label truncation
- keyboard avoidance
- scroll behaviour
- status bar contrast
- safe area spacing

Do not solve responsiveness by adding arbitrary device-specific pixel checks unless the existing app already uses them.


## Prompt 8 – Final quality pass

Perform a final review of the implementation.

Check:
- no business logic changed
- Generate, Preview, Add job, Save job and Cancel still call their original handlers
- form validation works
- lock switches work
- picker/select disabled states work
- keyboard does not hide fields
- screen remains scrollable
- background assets are locally bundled and require no network connection
- no missing imports
- no TypeScript errors
- no unused packages added
- accessibility labels are preserved
- sufficient text contrast
- Android and iOS compatible Expo APIs only

Then show me:
1. files changed
2. any new reusable components
3. any assets referenced
4. any commands I need to run
5. anything you deliberately did not change
