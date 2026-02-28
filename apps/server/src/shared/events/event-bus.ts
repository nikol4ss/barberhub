type EventHandler<T = unknown> = (payload: T) => void | Promise<void>;

const listeners = new Map<string, EventHandler[]>();

export const EventBus = {
  on<T>(event: string, handler: EventHandler<T>): void {
    const existing = listeners.get(event) ?? [];
    listeners.set(event, [...existing, handler as EventHandler]);
  },

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
