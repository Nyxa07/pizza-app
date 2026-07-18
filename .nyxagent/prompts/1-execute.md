Récupère le ticket à implémenter dans {{ current.selection.artefacts.selected.md }} tu y trouvera le ticket choisi ainsi qu'un peu de contexte (issue parente, branche à utiliser etc..). Si la branche spécifiée n'existe pas, créer la, sinon réutilise l'existant.

Implémente en utilisant /implement

Une fois terminé:
- ajoute un label `implemented` sur l'issue et produit un petit résumé de ton travail dans {{ current.artefacts.implementation.md }}
- Si l'issue fait partie d'un lot (sous issue) et que toutes les issues on étés implémentées, tu peux ouvrir une PR qui cloture toutes les sous issues + l'issue parente.
- Si l'issue est isolée, ouvre une PR qui cloture cette issue.