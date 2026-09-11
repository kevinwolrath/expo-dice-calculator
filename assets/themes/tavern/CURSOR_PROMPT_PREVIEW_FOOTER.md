# Cursor prompt — Dice Preview footer using supplied assets

Add a themed footer/status panel to the bottom of the existing Dice Preview modal.

Do NOT change the current dice rendering, Generate button behaviour, modal close behaviour,
job state structure, or navigation.

Copy these supplied assets into:

assets/tavern/preview/

Files:
- assets/tavern/preview/preview_footer_parchment.png
- assets/tavern/preview/preview_quote_card.png
- assets/tavern/preview/preview_icon_palette.png
- assets/tavern/preview/preview_icon_dice.png

Optional reference asset:
- assets/tavern/preview/preview_footer_dark_reference.png

IMPORTANT:
All changing settings text must be rendered dynamically by React Native.
Do NOT bake current job values into an image.

Desired modal hierarchy:

Dice Preview                                      X

        [existing dice preview]

Generate until you find your next set.

[ ✨ Generate New Colours ]

[ Current settings parchment footer ]


IMPLEMENTATION

Create a reusable component named:

PreviewSettingsFooter

Place it directly below the existing "Generate New Colours" button.

Use:

assets/tavern/preview/preview_footer_parchment.png

as the ImageBackground for the footer.

Use resizeMode="stretch" so the parchment border can fill the available width.

Inside the footer, use a two-column layout.

LEFT SECTION — approximately 65-70%

Render a heading:
Current settings

Use the supplied decorative icon:
assets/tavern/preview/preview_icon_palette.png

Then dynamically render the current values from the EXISTING job/form state:

Colours: <current colour count>
Numbers: <current number colour>
Material: <selected material type>
Method: <selected production method>

If any value is unavailable, render:
Not set

Do not create duplicate preview state.

Suggested visual layout:

Current settings
🎨 Colours: 2
   Numbers: Gold
   Material: Resin
   Method: Dirty Pour


RIGHT SECTION — approximately 30-35%

Use:

assets/tavern/preview/preview_quote_card.png

as a decorative image.

This quote card already contains the visual "Good Dice Better Adventures" artwork,
so do not render duplicate quote text over it.

Optionally place:

assets/tavern/preview/preview_icon_dice.png

as a small decorative icon only if it improves the layout.
Do not clutter the footer.


STYLE

The footer should feel like parchment sitting inside the dark tavern modal.

Suggested dimensions:
- width: 100%
- minHeight: 120
- maxHeight: around 150 on normal phones
- borderRadius: match the asset shape naturally
- internal horizontal padding: approximately 18-22
- internal vertical padding: approximately 14-18

Text over parchment:
- dark brown / near-black
- heading semi-bold
- values clear and readable
- avoid tiny fantasy fonts for data values

Suggested text colours:
heading: #3B2414
body: #4A2D1A
muted: #6A4A34

Long Material/Method values may wrap to a second line.

Do not allow important values to overflow outside the parchment.


RESPONSIVENESS

Test approximately:
- 360px wide
- 390px wide
- 430px wide
- tablet/web

On narrow screens:
- reduce the right decorative quote card width before reducing settings readability
- keep the left settings section dominant
- allow wrapped values
- do not create horizontal scrolling

On web/tablet:
- footer max width should match the modal content width
- do not stretch it far beyond the modal


STATE

Reuse the same state/properties already used by the Jobs form and current preview.

Do not introduce separate copies of:
- colour count
- number colour
- material
- production method

The footer must update immediately when "Generate New Colours" changes the existing form/job state.


ACCESSIBILITY

The Current settings values must remain actual Text elements.

Decorative images should either:
- be marked non-accessible
or
- have an appropriate accessibility role/label if necessary.


FINAL CHECK

After implementation confirm:

1. the exact state properties used for Colours, Numbers, Material and Method
2. the component file created for PreviewSettingsFooter
3. where PreviewSettingsFooter is rendered in the modal
4. all image asset imports/requires
5. that Generate still uses the original generation handler
6. that closing the modal still uses the original close handler
