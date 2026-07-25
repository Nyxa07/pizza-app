# Calculator paths own independent drafts

ADR-0002 made Guided and Expert two views over one persisted Draft. That kept
switching frictionless, but also let technical Expert values silently affect a
Guided calculation. Flour strength and the ambient/cold rest split were the
clearest examples: the Guided path did not expose those inputs while its engine
still consumed them.

We now keep one persisted Draft per calculator path. Guided stores only the
answers it asks for and uses an adapter to derive a complete engine input.
Expert keeps the complete technical input. Switching paths never copies values.

## Consequences

- « Nouveau calcul » resets only the current path.
- A Method identifies its originating path and reads that path's Draft.
- Saved Dough documents remain one shared library. « Ajuster » and Recipe
  suggestions explicitly replace the Expert Draft.
- Existing shared Drafts migrate to Expert; Guided starts from its own Defaults.
- The `calculator:draft` preference is replaced by
  `calculator:draft:guided` and `calculator:draft:expert`.
