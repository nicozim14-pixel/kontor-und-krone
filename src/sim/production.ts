/**
 * Produktion (vorläufig, Durchstich aus Unterphase 1.7):
 * Jedes Gebäude, das laut buildings.json etwas herstellt, legt in jedem Wirtschafts-Takt
 * seine feste Menge ins Test-Lager.
 *
 * Echte Produktionsketten (Arbeitszeit, Rohstoffe, Abholung durch Marktkarren) kommen in Phase 3.
 */
import type { GoodId } from "../data/schemas";
import type { SimSystem } from "./simulation";

export const productionSystem: SimSystem = (state, { data, events }) => {
  // Erst alles zusammenzählen, dann pro Ware einmal ins Lager legen und einmal durchsagen.
  const producedByGood = new Map<GoodId, number>();
  for (const building of Object.values(state.buildings)) {
    const output = data.buildings.get(building.type)?.produces;
    if (output !== undefined) {
      producedByGood.set(
        output.good,
        (producedByGood.get(output.good) ?? 0) + output.amountPerTick,
      );
    }
  }

  for (const [good, delta] of producedByGood) {
    const amount = (state.storage[good] ?? 0) + delta;
    state.storage[good] = amount;
    events.emit("storageChanged", { good, amount, delta });
  }
};
