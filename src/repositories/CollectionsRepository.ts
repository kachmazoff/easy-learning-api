import { v4 as uuidv4, validate as uuidValidate } from "uuid";
import { query } from "../database";
import { ICollectionInfo, IQuestion, IAnswer } from "../models";
import {
  ICreateCollectionDTO,
  ICollectionFull,
  IQAPair,
} from "../dto/Collection";

interface IFullQueryResponse {
  questionId: string;
  question: string;
  questionAuthorId: string;
  answerId: string;
  answer: string;
  answerAuthorId: string;
}

export interface ICollectionsRepository {
  TABLE_NAME: string;

  getAll(): Promise<ICollectionInfo[]>;
  getById(id: string): Promise<ICollectionInfo | void>;
  add(dto: ICreateCollectionDTO): Promise<void>;
  search(queryString: string): Promise<ICollectionInfo[]>;

  addQAsToCollection(
    collectionId: string,
    qasIds: { questionId: string; answerId?: string }[]
  ): Promise<void>;
  getFullById(id: string): Promise<ICollectionFull | void>;
  getCollectionQAs(collectionId: string): Promise<IQAPair[]>;

  getCollectionQuestions(collectionId: string): Promise<IQuestion[]>;
  addQuestionsToCollection(
    collectionId: string,
    questionsIds: string[]
  ): Promise<void>;
  deleteQuestionsFromCollection(
    collectionId: string,
    questionsIds: string[]
  ): Promise<void>;

  getSelectedAnswersForQuestion(
    collectionId: string,
    questionId: string
  ): Promise<IAnswer[]>;
  setAnswersForQuestion(
    collectionId: string,
    questionId: string,
    answersIds: string[]
  ): Promise<void>;

  getAttachedQuestionsCount(collectionId: string): Promise<number>;
}

export class CollectionsRepository implements ICollectionsRepository {
  TABLE_NAME = "COLLECTIONS";
  COLLECTION_QUESTION = "COLLECTION_QUESTION";
  REL_COLLECTION_ANSWERS = "REL_COLLECTION_ANSWERS";

  async getAll() {
    const res = await query<ICollectionInfo[]>(
      `SELECT * FROM \`${this.TABLE_NAME}\` ORDER BY created DESC`
    );
    return !!res ? res : [];
  }

  async getById(id: string) {
    const res = await query<ICollectionInfo[]>(
      `SELECT * FROM \`${this.TABLE_NAME}\` WHERE id=?`,
      [id]
    );
    return !!res ? res[0] : undefined;
  }

  async add(dto: ICreateCollectionDTO) {
    await query<ICollectionInfo>(
      `INSERT INTO \`${this.TABLE_NAME}\` (id, \`title\`, \`description\`, author_id) VALUES (?, ?, ?, ?)`,
      [uuidv4(), dto.title, dto.description, dto.author_id]
    );
  }

  async search(queryString: string) {
    // TODO: возможны проблемы с производительностью. Проверить через EXPLAIN
    const sqlQuery = `SELECT * FROM \`${this.TABLE_NAME}\` WHERE title LIKE "%${queryString}%" ORDER BY created DESC`;
    const res = await query<ICollectionInfo[]>(sqlQuery);
    return !!res ? res : [];
  }

  async addQAsToCollection(
    collectionId: string,
    qasIds: { questionId: string; answerId?: string }[]
  ) {
    let sqlQuery = `INSERT INTO \`${this.REL_COLLECTION_ANSWERS}\` (collection_id, question_id, answer_id) VALUES`;
    if (
      !uuidValidate(collectionId) ||
      !qasIds.every(
        (x) =>
          uuidValidate(x.questionId) &&
          (!x.answerId || uuidValidate(x.answerId))
      )
    ) {
      throw new Error("Not valid data");
    }
    qasIds.forEach(
      (qa, index) =>
        (sqlQuery +=
          (index > 0 ? ", " : " ") +
          `('${collectionId}', '${qa.questionId}', ${
            !!qa.answerId ? `'${qa.answerId}'` : "NULL"
          })`)
    );
    const res = await query(sqlQuery);
    // TODO: обработка добавления существующей связи. Возвращать код ошибки 400
  }

  async getFullById(id: string) {
    if (!uuidValidate(id)) {
      throw new Error("Not valid data");
    }

    const collectionInfo = await this.getById(id);

    if (!collectionInfo) {
      return undefined;
    }

    const sqlQuery = `
    SELECT q.id AS questionId,
       q.data AS question,
       q.author_id AS questionAuthorId,
       ans.id AS answerId,
       ans.data AS answer,
       ans.author_id AS answerAuthorId
    FROM
        (SELECT answer_id
        FROM ${this.REL_COLLECTION_ANSWERS}
        WHERE collection_id='${id}') rel
    JOIN \`ANSWERS\` ans ON rel.answer_id=ans.id
    JOIN \`QUESTIONS\` q ON ans.question_id=q.id
    ORDER BY rel.created DESC
    `;

    const res = await query<IFullQueryResponse[]>(sqlQuery);
    if (!res) {
      return undefined;
    }

    const fullModel: ICollectionFull = {
      info: collectionInfo,
      qaPairs: res.map((qa) => {
        const question: IQuestion = {
          id: qa.questionId,
          data: qa.question,
          author_id: qa.questionAuthorId,
        };
        const answer: IAnswer = {
          id: qa.answerId,
          data: qa.answer,
          author_id: qa.answerAuthorId,
          question_id: qa.questionId,
        };
        return {
          question,
          answer,
        };
      }),
    };
    return fullModel;
  }

  async getCollectionQAs(collectionId: string) {
    // TODO: sql query
    return [] as IQAPair[];
  }

  async addQuestionsToCollection(
    collectionId: string,
    questionsIds: string[]
  ): Promise<void> {
    let sqlQuery = `INSERT INTO \`${this.COLLECTION_QUESTION}\` (id, collection_id, question_id) VALUES`;
    if (!uuidValidate(collectionId) || !questionsIds.every(uuidValidate)) {
      throw new Error("Not valid data");
    }

    questionsIds.forEach(
      (questionId, index) =>
        (sqlQuery +=
          (index > 0 ? ", " : " ") +
          `('${uuidv4()}', '${collectionId}', '${questionId}')`)
    );

    const res = await query(sqlQuery);
  }

  async getCollectionQuestions(collectionId: string) {
    const sqlQuery = `
    SELECT q.id AS id,
       q.data AS data,
       q.author_id AS author_id
    FROM
        (SELECT question_id
        FROM \`${this.COLLECTION_QUESTION}\`
        WHERE collection_id='${collectionId}' ORDER BY created DESC) rel
    JOIN \`QUESTIONS\` q ON rel.question_id=q.id
    `;
    const res = await query<IQuestion[]>(sqlQuery);
    return !!res ? res : [];
  }

  async deleteQuestionsFromCollection(
    collectionId: string,
    questionsIds: string[]
  ) {
    let questionsArr = "";
    questionsIds.forEach(
      (questionId, index) =>
        (questionsArr += (index > 0 ? ", " : "") + `'${questionId}'`)
    );
    questionsArr = "(" + questionsArr + ")";

    const sqlGetRelIds = `SELECT id FROM ${this.COLLECTION_QUESTION} WHERE collection_id='${collectionId}' AND question_id IN ${questionsArr}`;
    const relations = (await query<{ id: string }[]>(sqlGetRelIds)) || [];

    let relationsArr = "";
    relations.forEach(
      (rel, index) => (relationsArr += (index > 0 ? ", " : "") + `'${rel.id}'`)
    );
    relationsArr = "(" + relationsArr + ")";

    const sqlDeleteAnswers = `DELETE FROM \`${this.REL_COLLECTION_ANSWERS}\` WHERE rel_id IN ${relationsArr}`;
    await query(sqlDeleteAnswers);

    const sqlDeleteQuestions = `DELETE FROM \`${this.COLLECTION_QUESTION}\` WHERE id IN ${relationsArr}`;
    await query(sqlDeleteQuestions);
  }

  async getSelectedAnswersForQuestion(
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
      JOIN ANSWERS ans ON rels.answer_id=ans.id
    `;
    const answers = await query<IAnswer[]>(sqlGetAnswers);

    return !!answers ? answers : [];
  }

  // TODO: refactoring
  async setAnswersForQuestion(
    collectionId: string,
    questionId: string,
    answersIds: string[]
  ) {
    const sqlGetRelIds = `
      SELECT id
      FROM ${this.COLLECTION_QUESTION}
      WHERE collection_id='${collectionId}'
        AND question_id='${questionId}'
    `;
    const relations = (await query<{ id: string }[]>(sqlGetRelIds)) || [];
    const rel_id = relations[0]?.id;
    if (!rel_id) {
      throw new Error("Question not in collection");
    }

    const sqlGetAnswers = `SELECT answer_id from ${this.REL_COLLECTION_ANSWERS} WHERE \`rel_id\`='${rel_id}'`;
    const currAnswers =
      (await query<{ answer_id: string }[]>(sqlGetAnswers)) || [];

    const currAnswersIds = currAnswers.map((x) => x.answer_id);

    const needToDelete = currAnswersIds.filter((x) => !answersIds.includes(x));
    const needToAdd = answersIds.filter((x) => !currAnswersIds.includes(x));

    if (needToDelete.length > 0) {
      const deleteArr: string = "(" + needToDelete.join(", ") + ")";
      const sqlDeleteQuery = `DELETE FROM ${this.REL_COLLECTION_ANSWERS} WHERE \`rel_id\`='${rel_id}' AND answer_id IN ${deleteArr}`;
      await query(sqlDeleteQuery);
    }

    if (needToAdd.length > 0) {
      let insertValues = "";
      needToAdd.forEach(
        (id, index) =>
          (insertValues += (index > 0 ? ", " : "") + `('${rel_id}', '${id}')`)
      );
      const sqlInsertQuery = `INSERT INTO \`${this.REL_COLLECTION_ANSWERS}\` (rel_id, answer_id) VALUES ${insertValues}`;
      await query(sqlInsertQuery);
    }
  }

  async getAttachedQuestionsCount(collectionId: string) {
    const sqlQuery = `SELECT COUNT(1) as qCnt FROM \`${this.COLLECTION_QUESTION}\` WHERE collection_id='${collectionId}'`;
    const res = await query<{ [key: string]: number }[]>(sqlQuery);
    return !!res ? res[0]["qCnt"] : 0;
  }
}
