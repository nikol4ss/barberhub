/**
 * Representa um manipulador de evento.
 *
 * @template T Tipo do payload recebido.
 *
 * Pode ser síncrono ou assíncrono.
 */
export type EventHandler<T = unknown> = (payload: T) => void | Promise<void>;
