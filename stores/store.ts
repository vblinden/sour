import { SessionData } from "../session.ts";

export default interface Store {
  exists(sessionId: string): Promise<boolean> | boolean;
  byId(sessionId: string): Promise<SessionData | null> | SessionData | null;
  persist(sessionId: string, data: SessionData): Promise<void> | void;
  delete(sessionId: string): Promise<void> | void;
  valid(data: SessionData): Promise<boolean> | boolean;
  gc(): Promise<void> | void;
}
