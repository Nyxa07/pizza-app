/**
 * One Fiche: a short contextual explanation of a dough concept, shipped
 * in every locale (issue #70).
 */
export interface IInfoSheetContent {
  title: string;
  subtitle?: string;
  body: string[];
  tips?: string[];
}
