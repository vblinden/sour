import Store from "./store.ts";
import { SessionData } from "../types.ts";
import { postgres } from "../deps.ts";

type SqlExecutor = postgres.Sql<Record<string | number | symbol, never>>;

export default class Postgres implements Store {
  private sql: SqlExecutor;
  private tableName: string;

  constructor(sql: SqlExecutor, tableName = "sessions") {
    this.sql = sql;
    this.tableName = tableName;
  }

  async exists(sessionId: string): Promise<boolean> {
    const result = await this.sql`select data from ${
      this.sql(this.tableName)
    } where id = ${sessionId}`;

    return result.length > 0 ? true : false;
  }

  async byId(sessionId: string): Promise<SessionData | null> {
    const results = await this.sql`select data from ${
      this.sql(this.tableName)
    } where id = ${sessionId}`;

    if (results.length === 0) {
      return null;
    }

    const data = JSON.parse(results[0].data) as SessionData;
    if (!this.valid(data)) {
      data._delete = true;
    }

    return data;
  }

  async create(sessionId: string, data: SessionData): Promise<void> {
    await this.sql`insert into ${
      this.sql(this.tableName)
    } (id, data) values (${sessionId}, ${JSON.stringify(data)})`;
  }

  async persist(sessionId: string, data: SessionData): Promise<void> {
    await this.sql`insert into ${
      this.sql(this.tableName)
    } (id, data) values (${sessionId}, ${JSON.stringify(data)})
    on conflict (id) do update set data = ${JSON.stringify(data)}
    `;
  }

  async delete(sessionId: string): Promise<void> {
    await this.sql`delete from ${
      this.sql(this.tableName)
    } where id = ${sessionId}`;
  }

  valid(data: SessionData): boolean {
    const expire = data._expire ?? 0;

    return expire > Date.now();
  }

  async gc(): Promise<void> {
    const min = 2;
    const ticket = Math.floor(Math.random() * (100 - min + 1) + min);

    if (ticket === min) {
      const sessions = await this
        .sql`select * from sessions`;

      for (const session of sessions) {
        const data = JSON.parse(session.data ?? "[]") as SessionData;

        if (!this.valid(data)) {
          await this.sql`delete from sessions where id = ${session.id}`;
        }
      }
    }
  }
}
