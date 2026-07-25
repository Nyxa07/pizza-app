# Doughs are documents; the calculator has a single shared draft

> The single-Draft decision in this ADR is superseded by ADR-0003. Dough
> documents and explicit « Ajuster » copies remain unchanged.

v1 kept one auto-persisted work-in-progress per calculator mode (simple/complex/assist), with named saves siloed per mode, and loading a save silently overwrote the current values — persisted immediately, unrecoverable. For v2 we decided: a saved **Dough** is a document opened in its own view (detail + its Method); loading it into the calculator is an explicit copy (« Ajuster »); there is exactly **one Draft** shared by the Guided and Expert paths; a new calculation seeds from the user's **Defaults** (which become real, user-editable values instead of the hardcoded `DEFAULT_INPUT`).

## Why

- A silent, destructive load is data loss dressed up as a feature; the fear of "coming back and finding my values overwritten" was confirmed in code (`loadState()` → `state.update()`).
- Per-mode silos made a Dough saved in one mode invisible in the others.
- Named things stable, scratchpad alive: that is the mental model of document-based premium apps, and it keeps the two paths (Guided/Expert) working on the same calculation.

## Consequences

- One-way data migration: merge the `calculator:<mode>` drafts and `calculator:<mode>:states` save silos into a single Dough list and single Draft.
- The per-field visibility toggles screen ("calculator settings") is removed — superseded by the Expert path's progressive disclosure.
