/**
 * Schreibgeschützte Sicht auf Daten: Jedes Feld, auch tief verschachtelt, ist nur lesbar.
 * Darstellung und Oberfläche bekommen den Spielzustand nur so zu sehen.
 * Ein Änderungsversuch ist dann ein TypeScript-Fehler.
 */

/** Zahlenfelder (Typed Arrays), wie sie das Kachel-Raster benutzt (sim/world.ts). */
export type NumberGrid = Uint8Array | Uint16Array | Int32Array;

/**
 * Schreibgeschützte Sicht auf ein Zahlenfeld: Lesen über `[index]` und `length`, kein Schreiben.
 * (Ein Zahlenfeld hat viele Funktionen zum Ändern, z. B. `fill`; die fallen hier bewusst weg.)
 */
export interface ReadonlyNumberGrid {
  readonly length: number;
  readonly [index: number]: number;
}

export type DeepReadonly<T> = T extends NumberGrid
  ? ReadonlyNumberGrid
  : T extends (infer Item)[]
    ? readonly DeepReadonly<Item>[]
    : T extends object
      ? { readonly [Key in keyof T]: DeepReadonly<T[Key]> }
      : T;
