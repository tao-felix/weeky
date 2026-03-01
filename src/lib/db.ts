import Dexie, { type Table } from "dexie";
import type { Entry, Week, Synthesis, Setting } from "./types";

export class WeekyDB extends Dexie {
  entries!: Table<Entry, string>;
  weeks!: Table<Week, string>;
  syntheses!: Table<Synthesis, string>;
  settings!: Table<Setting, string>;

  constructor() {
    super("weeky");
    this.version(1).stores({
      entries: "id, [weekId+createdAt], weekId, createdAt",
      weeks: "id, weekNumber",
      syntheses: "id, weekId",
      settings: "key",
    });
  }
}

export const db = new WeekyDB();
