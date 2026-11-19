/**
 * Hilfen für die automatischen Tests. Wird nur von Tests benutzt und landet nicht im Spiel.
 *
 * Tests geben nur die Daten an, um die es ihnen geht (z. B. eigene Waren); alles andere
 * kommt aus den mitgelieferten Datendateien.
 */
import { BUNDLED_DATA_FILES } from "./bundledData";
import { loadGameData, type GameData, type RawGameDataFiles } from "./gameData";
import type { BuildingDefinition } from "./schemas";

/** Die mitgelieferten Datendateien, einzelne davon ersetzt. */
export function testDataFiles(overrides: Partial<RawGameDataFiles> = {}): RawGameDataFiles {
  return { ...BUNDLED_DATA_FILES, ...overrides };
}

/** Lädt Test-Daten und bricht den Test mit allen Meldungen ab, wenn sie fehlerhaft sind. */
export function loadTestData(overrides: Partial<RawGameDataFiles> = {}): GameData {
  const result = loadGameData(testDataFiles(overrides));
  if (!result.ok) {
    throw new Error(result.errors.join("\n"));
  }
  return result.value;
}

/**
 * Eine Gebäudeart für Tests. Ohne Angabe ist sie 1 × 1 Kachel groß und steht auf Ebenen.
 */
export function testBuilding(
  fields: Pick<BuildingDefinition, "id" | "name"> & Partial<BuildingDefinition>,
): BuildingDefinition {
  return { size: { width: 1, depth: 1 }, allowedTerrain: ["plain"], ...fields };
}
