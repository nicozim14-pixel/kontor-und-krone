/**
 * Schreibgeschützte Sicht auf Daten: Jedes Feld, auch tief verschachtelt, ist nur lesbar.
 * Darstellung und Oberfläche bekommen den Spielzustand nur so zu sehen.
 * Ein Änderungsversuch ist dann ein TypeScript-Fehler.
 */
export type DeepReadonly<T> = T extends (infer Item)[]
  ? readonly DeepReadonly<Item>[]
  : T extends object
    ? { readonly [Key in keyof T]: DeepReadonly<T[Key]> }
    : T;
