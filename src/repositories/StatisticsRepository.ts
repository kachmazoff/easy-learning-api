import { query } from "../database";
import { IStatistics } from "src/dto/Statistics";

const TABLE_QUESTIONS = "QUESTIONS";
const TABLE_COLLECTIONS = "COLLECTIONS";
const TABLE_ANSWERS = "ANSWERS";

export interface IStatisticsRepository {
  getQuestionsCreated(): Promise<IStatistics>;
  getAnswersCreated(): Promise<IStatistics>;
  getCollectionsCreated(): Promise<IStatistics>;
}

export class StatisticsRepository implements IStatisticsRepository {
  private async getCreated(tableName: string) {
    const sqlQuery = `SELECT count(1) as value, date(created) as day from \`${tableName}\` GROUP BY date(created) ORDER BY day ASC`;
    const res = await query<IStatistics>(sqlQuery);
    return !!res ? res : [];
  }

  getAnswersCreated() {
    return this.getCreated(TABLE_ANSWERS);
  }

  getCollectionsCreated() {
    return this.getCreated(TABLE_COLLECTIONS);
  }
  getQuestionsCreated() {
    return this.getCreated(TABLE_QUESTIONS);
  }
}
