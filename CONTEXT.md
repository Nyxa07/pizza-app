# Pizza App

A pizza dough calculator (poolish and direct doughs) for two audiences: guided general-public users and prosumer home pizzaiolos. Currently undergoing a full UX + design-system overhaul aimed at a premium, sellable finish.

## Language

### Core concepts

**Dough**:
A named, saved snapshot of calculator inputs, opened as a document (detail + its Dough method). Loading one into the calculator is always an explicit copy (« Ajuster »), never a silent overwrite. UI: « Pâte », « Mes pâtes ».
_Avoid_: calculator state, saved state

**Draft**:
The single in-progress calculation, shared by the Guided and Expert paths and persisted automatically. Replaced only by an explicit act (new calculation, « Ajuster » from a Dough). UI: « Calcul en cours », « Reprendre ».
_Avoid_: per-mode state, scratchpad

**Defaults**:
User-configurable seed values (hydration, salt, ball weight…) applied when starting a new calculation. Live in settings. UI: « Mes défauts de pâte ».
_Avoid_: constants, DEFAULT_INPUT

**Dough method**:
The instructions (ingredient weights + steps) the calculator generates for a Dough. UI: « Méthode ».
_Avoid_: recipe (never for dough output), protocol

**Pizza recipe**:
A topped-pizza composition (e.g. Reine, 3 fromages) offered as browsable content, decoupled from the calculator. UI: « Recette ».
_Avoid_: using "recipe"/« recette » for anything dough-related

**Info sheet**:
A short contextual explanation of a dough concept (hydration, poolish, rest…), opened in place from the screen where the concept appears. UI: « Fiche ».
_Avoid_: FAQ, guide

### Calculator paths

**Guided path**:
The step-by-step calculator flow for general-public users; asks one thing at a time and applies smart defaults.
_Avoid_: assistant, assist mode, wizard

**Expert path**:
The single dense calculator form for prosumers; advanced options are folded by default and revealed on demand.
_Avoid_: simple mode, complex mode

### Appearance

**Theme**:
The app's single visual identity, expressed as design tokens. There is exactly one; it is not user-selectable (see ADR-0001).
_Avoid_: public theme, theme catalog, skin, secret theme

**Appearance**:
The light or dark rendering of the theme, following the system by default with a manual override in settings. UI: « Apparence » (système / clair / sombre).
_Avoid_: dark mode as a separate theme
