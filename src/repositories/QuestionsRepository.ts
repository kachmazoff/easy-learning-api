import { v4 as uuidv4 } from "uuid";
import { ICreateQuestionDTO } from "src/dto/Question";
import { query } from "../database";
import { IQuestion } from "../models";

export interface IQuestionsRepository {
  TABLE_NAME: string;

  getAll(): Promise<IQuestion[]>;
  getById(id: string): Promise<IQuestion | void>;
  add(dto: ICreateQuestionDTO): Promise<void>;
  search(queryString: string): Promise<IQuestion[]>;
  getUnansweredQuestions(): Promise<IQuestion[]>;
}

export class QuestionsRepository implements IQuestionsRepository {
  TABLE_NAME = "QUESTIONS";

  async getAll() {
    const res = await query<IQuestion[]>(
      `SELECT * FROM \`${this.TABLE_NAME}\` ORDER BY created DESC`
    );
    return !!res ? res : [];
  }

  async getById(id: string) {
    const res = await query<IQuestion[]>(
      `SELECT * FROM \`${this.TABLE_NAME}\` WHERE id=?`,
      [id]
    );
    return !!res ? res[0] : undefined;
  }

  async add(dto: ICreateQuestionDTO) {
    await query<IQuestion>(
      `INSERT INTO \`${this.TABLE_NAME}\` (id, \`data\`, \`description\`, author_id) VALUES (?, ?, ?, ?)`,
      [uuidv4(), dto.data, dto.description, dto.author_id]
    );
  }

  async search(queryString: string) {
    // TODO: возможны проблемы с производительностью. Проверить через EXPLAIN
    const sqlQuery = `SELECT * FROM \`${this.TABLE_NAME}\` WHERE data LIKE "%${queryString}%" ORDER BY created DESC`;
    const res = await query<IQuestion[]>(sqlQuery);
    return !!res ? res : [];
  }

  async getUnansweredQuestions() {
    const sqlQuery = `SELECT * FROM \`${this.TABLE_NAME}\` WHERE id NOT IN (SELECT DISTINCT question_id FROM \`ANSWERS\`) ORDER BY created DESC`;
    const res = await query<IQuestion[]>(sqlQuery);
    return !!res ? res : [];
  }
}
