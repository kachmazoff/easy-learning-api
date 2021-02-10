import { IStatisticsRepository } from "src/repositories/StatisticsRepository";
import { IStatistics } from "src/dto/Statistics";

export interface IStatisticsService {
  getOpenCommonStat(): Promise<{ [key: string]: IStatistics }>;
}

export class StatisticsService implements IStatisticsService {
  constructor(private readonly statisticsRepo: IStatisticsRepository) {}

  async getOpenCommonStat(): Promise<{ [key: string]: IStatistics }> {
    return Promise.all([
      this.statisticsRepo.getCollectionsCreated(),
      this.statisticsRepo.getQuestionsCreated(),
      this.statisticsRepo.getAnswersCreated(),
    ]).then((res) => {
      const totalStatObj: { [key: string]: string } = {};
      res.forEach((statistics) => {
        statistics.forEach(
          (unit) =>
            (totalStatObj[unit.day.toISOString()] =
              (totalStatObj[unit.day.toISOString()] || 0) + unit.value)
        );
      });

      const total: IStatistics = Object.keys(totalStatObj).map((x) => ({
        day: new Date(x),
        value: totalStatObj[x],
      }));

      return {
        collections: res[0],
        questions: res[1],
        answers: res[2],
        total,
      };
    });
  }
}
