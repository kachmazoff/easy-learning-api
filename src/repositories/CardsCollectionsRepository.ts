import { v4 as uuidv4, validate as uuidValidate } from "uuid";
import { connection, query } from "../database";
import { ICard, ICardsCollectionInfo } from "../models";
import { CRUDRepository } from "./BaseRepositories";

const TABLE_NAME = "COLLECTIONS";
const CARDS_TABLE_NAME = "CARDS";
const UTILITY_TABLE_NAME = "CARD_COLLECTION";

export interface ICardsCollectionsRepository
  extends CRUDRepository<string, ICardsCollectionInfo> {
  add: (title: string, description: string, authorId: string) => Promise<void>;
  addCardsToCollection: (
    collectionId: string,
    cardsIds: string[]
  ) => Promise<void>;
  getCardsFromCollection: (collectionId: string) => Promise<ICard[]>;
}

export const CardsCollectionsRepository: ICardsCollectionsRepository = {
  getAll: async () => {
    const res = await query<ICardsCollectionInfo[]>(
      `SELECT * FROM \`${TABLE_NAME}\` ORDER BY created DESC`
    );
    if (!res) {
      return [];
    }
    return res;
  },
  getById: async (id: string) => {
    const res = await query<ICardsCollectionInfo[]>(
      `SELECT * FROM \`${TABLE_NAME}\` WHERE id=?`,
      [id]
    );
    return !!res ? res[0] : undefined;
  },
  add: async (title: string, description: string, authorId: string) => {
    const res = await query<ICardsCollectionInfo>(
      `INSERT INTO \`${TABLE_NAME}\` (id, \`title\`, \`description\`, author_id) VALUES (?, ?, ?, ?)`,
      [uuidv4(), title, description, authorId]
    );
    console.log("inserted:", { title, description, authorId }, res);
  },
  update: async (updatedCard: ICardsCollectionInfo) => {
    throw new Error("Not Implemented");
  },
  addCardsToCollection: async (collectionId: string, cardsIds: string[]) => {
    let sqlQuery = `INSERT INTO \`${UTILITY_TABLE_NAME}\` (collection_id, card_id) VALUES`;
    if (!uuidValidate(collectionId) || !cardsIds.every(uuidValidate)) {
      throw new Error("Not valid data");
    }
    cardsIds.forEach(
      (id, index) =>
        (sqlQuery += (index > 0 ? ", " : " ") + `('${collectionId}', '${id}')`)
    );
    const res = await query<ICardsCollectionInfo>(sqlQuery);
    // TODO: обработка добавления существующей связи. Возвращать код ошибки 400
  },
  getCardsFromCollection: async (collectionId: string) => {
    if (!uuidValidate(collectionId)) {
      throw new Error("Not valid data");
    }
    const sqlQuery = `SELECT c.id, c.title, c.description FROM ${CARDS_TABLE_NAME} c JOIN (SELECT * FROM ${UTILITY_TABLE_NAME} WHERE collection_id='${collectionId}') rel ON c.id=rel.card_id ORDER BY rel.created DESC`;

    // `SELECT * FROM ${TABLE_NAME} JOIN (SELECT * FROM ${UTILITY_TABLE_NAME} WHERE collection_id='${collectionId}'`;
    const res = await query<ICard[]>(sqlQuery);
    if (!res) {
      return [];
    }
    return res;
  },
};
