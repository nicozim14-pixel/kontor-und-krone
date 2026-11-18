/**
 * Prüfen von Daten mit einem Prüfschema (Werkzeug: zod, Entscheidung E-016)
 * und Übersetzen der Fehler in verständliches Deutsch.
 *
 * Ein Schema ist wie eine Formular-Vorlage: Es legt fest, welche Felder es gibt,
 * welche Art von Wert darin stehen darf und welche Grenzen gelten.
 */
import * as z from "zod/mini";
import { de } from "zod/locales";

// Deutsche Grundmeldungen für alle Fälle, die unten nicht eigens übersetzt werden.
z.config(de());

/** Ergebnis einer Prüfung: entweder der geprüfte Wert oder eine Liste deutscher Fehlermeldungen. */
export type CheckResult<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly errors: readonly string[] };

/**
 * Erlaubte Form einer Kennung (ID) in den Spieldaten: Kleinbuchstaben, Ziffern und Unterstriche,
 * beginnend mit einem Buchstaben. Beispiele: "wood", "test_woodcutter".
 */
export const ID_PATTERN = /^[a-z][a-z0-9_]*$/;

/** Schema-Baustein für eine Kennung. */
export function idSchema(): z.ZodMiniString {
  return z.string().check(
    z.regex(ID_PATTERN, {
      error:
        "Nur Kleinbuchstaben (a–z), Ziffern und Unterstriche erlaubt, Beginn mit einem Buchstaben (z. B. „wood“).",
    }),
  );
}

/** Schema-Baustein für einen Anzeigetext, der nicht leer sein darf. */
export function displayTextSchema(): z.ZodMiniString {
  return z.string().check(z.minLength(1, { error: "Darf nicht leer sein." }));
}

const TYPE_NAMES: Readonly<Record<string, string>> = {
  string: "einen Text",
  number: "eine Zahl",
  int: "eine ganze Zahl",
  boolean: "ja oder nein (true/false)",
  array: "eine Liste [ … ]",
  object: "ein Objekt { … }",
  tuple: "eine Liste [ … ]",
};

/** Beschreibt einen gefundenen Wert in Alltagssprache. */
function describeValue(value: unknown): string {
  if (value === null) {
    return "null (leer)";
  }
  if (typeof value === "string") {
    return `den Text „${value}“`;
  }
  if (typeof value === "number") {
    return `die Zahl ${String(value)}`;
  }
  if (typeof value === "boolean") {
    return value ? "true (ja)" : "false (nein)";
  }
  if (Array.isArray(value)) {
    return "eine Liste";
  }
  if (typeof value === "object") {
    return "ein Objekt";
  }
  return value === undefined ? "nichts" : "einen unbekannten Wert";
}

/** Übersetzt einen einzelnen Fehler aus zod in eine verständliche deutsche Meldung. */
function describeIssue(issue: z.core.$ZodIssue): string {
  switch (issue.code) {
    case "invalid_type": {
      const expected = TYPE_NAMES[issue.expected] ?? issue.expected;
      if (issue.input === undefined) {
        return `Pflichtfeld fehlt (erwartet ${expected}).`;
      }
      return `Erwartet ${expected}, gefunden ${describeValue(issue.input)}.`;
    }
    case "too_small": {
      const min = String(issue.minimum);
      if (issue.origin === "string") {
        return issue.minimum === 1
          ? "Darf nicht leer sein."
          : `Muss mindestens ${min} Zeichen lang sein.`;
      }
      if (issue.origin === "array") {
        return `Braucht mindestens ${min} Einträge.`;
      }
      return issue.inclusive === false
        ? `Muss größer als ${min} sein.`
        : `Muss mindestens ${min} sein.`;
    }
    case "too_big": {
      const max = String(issue.maximum);
      if (issue.origin === "string") {
        return `Darf höchstens ${max} Zeichen lang sein.`;
      }
      if (issue.origin === "array") {
        return `Darf höchstens ${max} Einträge haben.`;
      }
      return issue.inclusive === false
        ? `Muss kleiner als ${max} sein.`
        : `Darf höchstens ${max} sein.`;
    }
    case "unrecognized_keys": {
      const names = issue.keys.map((key) => `„${key}“`).join(", ");
      return issue.keys.length === 1
        ? `Unbekanntes Feld ${names}. Tippfehler?`
        : `Unbekannte Felder ${names}. Tippfehler?`;
    }
    case "invalid_value":
      return `Erlaubt ist nur: ${issue.values.map((value) => String(value)).join(", ")}.`;
    default:
      // Eigene Meldungen aus den Schemas (z. B. bei Kennungen) und die deutschen Grundmeldungen
      return issue.message;
  }
}

/** Liest die Kennung eines Eintrags, falls vorhanden (für verständlichere Fehlerorte). */
function readEntryId(entry: unknown): string | undefined {
  if (typeof entry === "object" && entry !== null && "id" in entry) {
    const id = entry.id;
    if (typeof id === "string" || typeof id === "number") {
      return String(id);
    }
  }
  return undefined;
}

/**
 * Beschreibt, wo in einer Datei ein Fehler steckt, z. B. „Eintrag 2 („wood“) → Feld „name““.
 * Einträge werden ab 1 gezählt, wie im Alltag.
 */
export function describePath(path: readonly PropertyKey[], data: unknown): string {
  const parts: string[] = [];
  let current: unknown = data;
  for (const key of path) {
    if (typeof key === "number") {
      const entry: unknown = Array.isArray(current) ? current[key] : undefined;
      const id = readEntryId(entry);
      parts.push(
        id === undefined ? `Eintrag ${String(key + 1)}` : `Eintrag ${String(key + 1)} („${id}“)`,
      );
      current = entry;
    } else {
      const name = String(key);
      parts.push(`Feld „${name}“`);
      current =
        typeof current === "object" && current !== null
          ? (current as Record<string, unknown>)[name]
          : undefined;
    }
  }
  return parts.join(" → ");
}

/**
 * Prüft Daten gegen ein Schema.
 * @param source Name der Quelle für die Fehlermeldungen, z. B. "goods.json"
 */
export function checkWithSchema<S extends z.ZodMiniType>(
  source: string,
  schema: S,
  data: unknown,
): CheckResult<z.infer<S>> {
  const result = z.safeParse(schema, data, { reportInput: true });
  if (result.success) {
    return { ok: true, value: result.data };
  }
  const errors = result.error.issues.map((issue) => {
    const where = describePath(issue.path, data);
    return where === ""
      ? `${source}: ${describeIssue(issue)}`
      : `${source} → ${where}: ${describeIssue(issue)}`;
  });
  return { ok: false, errors };
}

/**
 * Prüft, dass jede Kennung in einer Liste nur einmal vorkommt.
 * @returns deutsche Fehlermeldungen (leer, wenn alles stimmt)
 */
export function findDuplicateIds(
  source: string,
  entries: readonly { readonly id: string }[],
): string[] {
  const firstIndexById = new Map<string, number>();
  const errors: string[] = [];
  entries.forEach((entry, index) => {
    const firstIndex = firstIndexById.get(entry.id);
    if (firstIndex === undefined) {
      firstIndexById.set(entry.id, index);
    } else {
      errors.push(
        `${source} → Eintrag ${String(index + 1)} („${entry.id}“): ` +
          `Die Kennung „${entry.id}“ ist schon an Eintrag ${String(firstIndex + 1)} vergeben.`,
      );
    }
  });
  return errors;
}
