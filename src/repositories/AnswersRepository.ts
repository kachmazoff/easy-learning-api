import { v4 as uuidv4 } from "uuid";
import { query } from "../database";
import { IAnswer } from "../models";
import { ICreateAnswerDTO } from "src/dto/Answer";

export interface IAnswersRepository {
  TABLE_NAME: string;

  getAll(): Promise<IAnswer[]>;
  getById(id: string): Promise<IAnswer | void>;
  getAnswersForQuestion(questionId: string): Promise<IAnswer[]>;
  add(dto: ICreateAnswerDTO): Promise<void>;
  search(queryString: string): Promise<IAnswer[]>;
  getAnswersCountForQuestion(questionId: string): Promise<number>;
  getSelectedAnswersForQuestionInCollection(
    collectionId: string,
    questionId: string
  ): Promise<IAnswer[]>;
}

export class AnswersRepository implements IAnswersRepository {
  TABLE_NAME = "ANSWERS";
  COLLECTION_QUESTION = "COLLECTION_QUESTION";
  REL_COLLECTION_ANSWERS = "REL_COLLECTION_ANSWERS";

  async getAll() {
    const res = await query<IAnswer[]>(
      `SELECT * FROM \`${this.TABLE_NAME}\` ORDER BY created DESC`
    );
    return !!res ? res : [];
  }

  async getById(id: string) {
    const res = await query<IAnswer[]>(
      `SELECT * FROM \`${this.TABLE_NAME}\` WHERE id=?`,
      [id]
    );
    return !!res ? res[0] : undefined;
  }

  async getAnswersForQuestion(questionId: string) {
    const res = await query<IAnswer[]>(
      `SELECT * FROM \`${this.TABLE_NAME}\` WHERE question_id=?`,
      [questionId]
    );
    return !!res ? res : [];
  }

  async add(dto: ICreateAnswerDTO) {
    await query<IAnswer>(
      `INSERT INTO \`${this.TABLE_NAME}\` (id, \`data\`, \`description\`, author_id, question_id) VALUES (?, ?, ?, ?, ?)`,
      [uuidv4(), dto.data, dto.description, dto.author_id, dto.question_id]
    );
  }

  async search(queryString: string) {
    // TODO: возможны проблемы с производительностью. Проверить через EXPLAIN
    const sqlQuery = `SELECT * FROM \`${this.TABLE_NAME}\` WHERE data LIKE "%${queryString}%" ORDER BY created DESC`;
    const res = await query<IAnswer[]>(sqlQuery);
    return !!res ? res : [];
  }

  async getAnswersCountForQuestion(questionId: string) {
    const sqlQuery = `SELECT COUNT(1) as ansCnt FROM \`${this.TABLE_NAME}\` WHERE question_id='${questionId}'`;
    const res = await query<{ [key: string]: number }[]>(sqlQuery);
    return !!res ? res[0]["ansCnt"] : 0;
  }

  async getSelectedAnswersForQuestionInCollection(
    collectionId: string,
    questionId: string
  ): Promise<IAnswer[]> {
    const sqlGetRelIds = `SELECT id FROM ${this.COLLECTION_QUESTION} WHERE collection_id='${collectionId}' AND question_id='${questionId}'`;
    const relations = (await query<{ id: string }[]>(sqlGetRelIds)) || [];
    const rel_id = relations[0]?.id;
    if (!rel_id) {
      throw new Error("Question not in collection");
    }

    const sqlGetAnswers = `
      SELECT ans.id AS id,
        ans.created AS created,
        ans.data AS data,
        ans.description AS description,
        ans.question_id AS question_id,
        ans.author_id AS author_id
      FROM
        (SELECT *
        FROM ${this.REL_COLLECTION_ANSWERS}
        WHERE rel_id='${rel_id}') rels
      JOIN \`${this.TABLE_NAME}\` ans ON rels.answer_id=ans.id
    `;
    const answers = await query<IAnswer[]>(sqlGetAnswers);

    return !!answers ? answers : [];
  }
}
