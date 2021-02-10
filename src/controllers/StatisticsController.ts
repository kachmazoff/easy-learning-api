import { Request, Response, Router } from "express";
import { requiredAuthMiddleware, RequestWithUser } from "../middlewares";
import { IController } from "./IController";
import { StatisticsRepository } from "../repositories/StatisticsRepository";
import { StatisticsService } from "../services/StatisticsService";

const statisticsService = new StatisticsService(new StatisticsRepository());

export class StatisticsController implements IController {
  public path = "/statistics";
  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/`, this.getOpenCommonStat);
  }

  private getOpenCommonStat = async (req: Request, res: Response) => {
    res.json(await statisticsService.getOpenCommonStat());
  };
}
