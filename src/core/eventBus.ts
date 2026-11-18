/**
 * Der Ereignis-Bus: das „Lautsprecher-System“ des Spiels.
 *
 * Die Simulation macht Durchsagen („Takt 12 fertig“, „Holz jetzt 24“), Darstellung und
 * Bedienoberfläche melden sich für die Durchsagen an, die sie interessieren (Beobachter-Prinzip).
 *
 * Durchsagen werden zuerst gesammelt (`emit`) und erst mit `flush` verteilt.
 * So sieht jeder Zuhörer einen fertig durchgerechneten, stimmigen Spielzustand.
 *
 * Typisiert: Die Liste der Durchsagen (`Events`) legt für jeden Namen den Inhalt fest.
 * Ein falscher Name oder Inhalt ist ein TypeScript-Fehler.
 */

export type EventHandler<Payload> = (payload: Payload) => void;

/** Meldet einen Zuhörer wieder ab. */
export type Unsubscribe = () => void;

/** Schutz gegen Endlosschleifen: Zuhörer, die bei jeder Durchsage neue Durchsagen auslösen. */
export const MAX_EVENTS_PER_FLUSH = 100_000;

type HandlerSets<Events> = { [K in keyof Events]?: Set<EventHandler<Events[K]>> };

export class EventBus<Events extends object> {
  private readonly handlers: HandlerSets<Events> = {};
  /** Gesammelte, noch nicht verteilte Durchsagen (als kleine Zustell-Aufträge). */
  private queue: ((onError: (error: unknown) => void) => void)[] = [];

  /** Meldet einen Zuhörer für eine Durchsage an. Gibt eine Funktion zum Abmelden zurück. */
  on<K extends keyof Events>(type: K, handler: EventHandler<Events[K]>): Unsubscribe {
    const handlers: Set<EventHandler<Events[K]>> = this.handlers[type] ?? new Set();
    this.handlers[type] = handlers;
    handlers.add(handler);
    return () => {
      handlers.delete(handler);
    };
  }

  /** Nimmt eine Durchsage in die Warteschlange auf. Verteilt wird erst mit `flush`. */
  emit<K extends keyof Events>(type: K, payload: Events[K]): void {
    this.queue.push((onError) => {
      this.deliver(type, payload, onError);
    });
  }

  /** Anzahl der wartenden Durchsagen. */
  get pendingCount(): number {
    return this.queue.length;
  }

  /**
   * Verteilt alle wartenden Durchsagen in der Reihenfolge ihres Eingangs.
   * Durchsagen, die Zuhörer dabei neu auslösen, werden im selben Durchgang mit verteilt.
   * Wirft ein Zuhörer einen Fehler, bekommen die übrigen ihre Durchsagen trotzdem;
   * der erste Fehler wird danach weitergereicht, damit er sichtbar wird.
   */
  flush(): void {
    const errors: unknown[] = [];
    const onError = (error: unknown): void => {
      errors.push(error);
    };
    let delivered = 0;
    while (this.queue.length > 0) {
      const batch = this.queue;
      this.queue = [];
      for (const deliver of batch) {
        delivered += 1;
        if (delivered > MAX_EVENTS_PER_FLUSH) {
          this.queue = [];
          throw new Error(
            `Ereignis-Bus: mehr als ${String(MAX_EVENTS_PER_FLUSH)} Durchsagen auf einmal. ` +
              "Vermutlich lösen sich Zuhörer gegenseitig endlos aus.",
          );
        }
        deliver(onError);
      }
    }
    if (errors.length > 0) {
      throw errors[0];
    }
  }

  /** Verwirft alle wartenden Durchsagen (z. B. beim Laden eines anderen Spielstands). */
  clear(): void {
    this.queue = [];
  }

  private deliver<K extends keyof Events>(
    type: K,
    payload: Events[K],
    onError: (error: unknown) => void,
  ): void {
    const set = this.handlers[type];
    if (set === undefined) {
      return;
    }
    // Kopie, damit An- und Abmelden während der Zustellung nichts durcheinanderbringt
    for (const handler of Array.from(set)) {
      try {
        handler(payload);
      } catch (error) {
        onError(error);
      }
    }
  }
}
