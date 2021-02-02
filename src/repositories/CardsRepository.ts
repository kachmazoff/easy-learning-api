import { v4 as uuidv4 } from "uuid";
import { connection, query } from "../database";
import { ICard } from "../models";
import { CRUDRepository } from "./BaseRepositories";

const TABLE_NAME = "CARDS";

export interface ICardsRepository extends CRUDRepository<string, ICard> {
  add: (title: string, description: string, authorId: string) => Promise<void>;
  searchByTitle: (queryString: string) => Promise<ICard[]>;
}

export const CardsRepository: ICardsRepository = {
  getAll: async () => {
    const res = await query<ICard[]>(
      `SELECT * FROM \`${TABLE_NAME}\` ORDER BY created DESC`
    );
    if (!res) {
      return [];
    }
    return res;
  },
  getById: async (id: string) => {
    const res = await query<ICard[]>(
      `SELECT * FROM \`${TABLE_NAME}\` WHERE id=?`,
      [id]
    );
    return !!res ? res[0] : undefined;
  },
  add: async (title: string, description: string, authorId: string) => {
    const res = await query<ICard>(
      `INSERT INTO \`${TABLE_NAME}\` (id, \`title\`, \`description\`, author_id) VALUES (?, ?, ?, ?)`,
      [uuidv4(), title, description, authorId]
    );
    console.log("inserted:", { title, description, authorId }, res);
  },
  update: async (updatedCard: ICard) => {
    // TODO
    throw new Error("Not Implemented");
  },
  searchByTitle: async (queryString: string) => {
    // TODO: возможны проблемы с производительностью. Проверить через EXPLAIN
    const sqlQuery = `SELECT * FROM \`${TABLE_NAME}\` WHERE title LIKE "%${queryString}%" ORDER BY created DESC`;
    const res = await query<ICard[]>(sqlQuery);
    if (!res) {
      return [];
    }
    return res;
  },
};
