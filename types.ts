import { Session } from "./session.ts";
import Store from "./stores/store.ts";

export interface SessionOptions {
  store: Store;
  expiration?: number;
  cookie?: Partial<CookieOptions>;
}

export interface CookieOptions {
  name: string;
  expiration: number;
}

export interface SessionData {
  _flash: Record<string, unknown>;
  _expire: number | null;
  _delete: boolean;
  [key: string]: unknown;
}

export interface WithSession {
  session: Session;
}
