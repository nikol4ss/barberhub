import type { EventHandler } from "../../types/event-handler.type";

const listeners = new Map<string, EventHandler[]>();

export const EventBus = {
  // Registra um handler para um evento específico.
  on<T>(event: string, handler: EventHandler<T>): void {
    const existing = listeners.get(event) ?? [];
    listeners.set(event, [...existing, handler as EventHandler]);
  },

  // Emite um evento e executa todos os handlers registrados.
  async emit<T>(event: string, payload: T): Promise<void> {
    const handlers = listeners.get(event) ?? [];

    await Promise.all(
      handlers.map((handler) =>
        Promise.resolve(handler(payload)).catch((err: unknown) => {
          console.error(
            `[EventBus] Erro no handler do evento "${event}":`,
            err,
          );
        }),
      ),
    );
  },
};
