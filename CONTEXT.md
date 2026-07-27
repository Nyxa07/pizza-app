# Pizza App

A pizza dough calculator (poolish and direct doughs) for two audiences: guided general-public users and prosumer home pizzaiolos. Currently undergoing a full UX + design-system overhaul aimed at a premium, sellable finish.

## Language

### Core concepts

**Dough**:
A named, saved snapshot of calculator inputs, opened as a document (detail + its Dough method). Loading one into the calculator is always an explicit copy (« Ajuster »), never a silent overwrite. UI: « Pâte », « Mes pâtes ».
_Avoid_: calculator state, saved state

**Draft**:
An in-progress calculation owned and persisted by one calculator path. Guided, Intermediate and Expert each resume their own Draft; switching paths never copies values. A Dough is adjusted into the Expert Draft only. Reached only through the Calculator paths module, never from a service of its own. UI: « Calcul en cours », « Reprendre ».
_Avoid_: shared calculator state, scratchpad

**Defaults**:
User-configurable seed values (hydration, salt, ball weight…) applied when starting a new calculation. Live in settings. UI: « Mes pâtes par défaut ».
_Avoid_: constants, DEFAULT_INPUT

**Dough method**:
The instructions (ingredient weights + steps) the calculator generates for a Dough. UI: « Méthode ».
_Avoid_: recipe (never for dough output), protocol

**Method module**:
The single module going from a calculator input to a Dough method: `methodFor(input)` for the full run, `previewFor(input)` for the aperçu. It runs the engine, assembles the steps and dates them; nothing outside names a step definition, an engine output or a clock. The aperçu and the Method screen are two readings of the same run, so they cannot disagree on the times, the grams or the number of steps.
_Avoid_: a method builder per screen, passing an engine output or a time to it

**Method clock**:
When a Method starts counting, as a seam: the wall clock in the app, an instant pinned by a spec. Times land on quarter-hours — a Method narrates a plan, not a stopwatch. Only the Method module reads it.
_Avoid_: `new Date()` in a screen, a start time captured per screen

**Pizza recipe**:
A topped-pizza composition (e.g. Reine, 3 fromages) offered as browsable content, decoupled from the calculator. UI: « Recette ».
_Avoid_: using "recipe"/« recette » for anything dough-related

**Info sheet**:
A short contextual explanation of a dough concept (hydration, poolish, rest…), opened in place from the screen where the concept appears. UI: « Fiche ».
_Avoid_: FAQ, guide

**Pizza size**:
The diameter of the finished pizza, in centimetres. It is the answer the user gives in the Intermediate path; the ball weight is derived from it. UI: « Taille de la pizza ».
_Avoid_: diameter as a separate concept, pizza format (that is the model below)

**Pizza format model**:
The single module holding the size ↔ ball-weight conversion, the size range and the weight bounds of each style. Every screen and the engine read their ball weights from it; nothing else writes one.
_Avoid_: weight table, ball-weight constants

**Dough engine**:
The single module turning a complete calculator input into the quantities and rest times a Dough method is written from. Its whole interface is `process(input)`: a `null` field is a request to derive, every other value is used as given. The steps behind it declare which output fields they read and which they write, and the running order is derived from those declarations — never written down, and nothing outside the module names a step.
_Avoid_: processor as a public concept, calling a processor directly, an ordered list of processors

### Calculator paths

**Calculator paths**:
The single module holding every Draft. It hands out one Path draft per path — the only way to read, edit or restart a Draft — and it alone knows how a Draft is seeded, kept inside the bounds of its style, and resolved into a complete engine input. A path is added by declaring one definition; a new one costs no new module. Screens never reach for an individual Draft (ADR-0003).
_Avoid_: calculator initializer, draft registry, path state

**Path draft**:
What the Calculator paths module hands out for a given path: the Draft of that path, its edits, its « Nouveau calcul », and its resolved engine input. Typed to its own path, so a value belonging to another path cannot be written into it.
_Avoid_: draft handle, draft service

**Guided path**:
The step-by-step calculator flow for general-public users; asks one thing at a time and applies smart defaults.
_Avoid_: assistant, assist mode, wizard

**Intermediate path**:
The short single-screen calculator flow for users who reason in pizzas rather than in baker's percentages: style, count, size, method, rest, temperature and yeast. Everything else is pinned and invisible. UI: « Intermédiaire ».
_Avoid_: standard mode, simple mode

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
