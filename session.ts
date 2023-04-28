import { SessionData } from "./types.ts";

export class Session {
  id: string;

  private data;

  constructor(
    id: string,
    data: SessionData,
  ) {
    this.id = id;
    this.data = data;
  }

  delete() {
    this.data._delete = true;
  }

  get(key: string) {
    if (key in this.data) {
      return this.data[key];
    }

    const value = this.data._flash[key];
    delete this.data._flash[key];

    return value;
  }

  set(key: string, value: unknown) {
    if (value === null || value === undefined) {
      delete this.data[key];
    }

    this.data[key] = value;
  }

  flash(key: string, value: unknown) {
    this.data._flash[key] = value;
  }

  has(key: string) {
    return key in this.data || key in this.data._flash;
  }
}
