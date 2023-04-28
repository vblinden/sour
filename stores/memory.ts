import { SessionData } from "../types.ts";
import Store from "./store.ts";

export default class Memory implements Store {
  data: Map<string, SessionData>;

  constructor() {
    this.data = new Map();
  }

  exists(sessionId: string): boolean | Promise<boolean> {
    return this.data.has(sessionId);
  }

  byId(sessionId: string) {
    return this.data.has(sessionId) ? this.data.get(sessionId)! : null;
  }

  persist(sessionId: string, data: SessionData): void | Promise<void> {
    this.data.set(sessionId, data);
  }

  delete(sessionId: string): void | Promise<void> {
    this.data.delete(sessionId);
  }

  valid(data: SessionData): boolean | Promise<boolean> {
    // TODO: Implement

    return true;
  }

  gc(): void | Promise<void> {
    // TODO: Implement
  }
}
