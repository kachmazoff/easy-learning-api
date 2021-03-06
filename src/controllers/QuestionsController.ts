import { Request, Response, Router } from "express";
import { requiredAuthMiddleware, RequestWithUser } from "../middlewares";
import { IController } from "./IController";
import { ICreateQuestionDTO } from "../dto/Question";
import { QuestionsRepository } from "../repositories/QuestionsRepository";
import {
  AnswersService,
  QuestionsListService,
  QuestionsService,
} from "../services";
import { AnswersRepository } from "../repositories/AnswersRepository";

const questionsRepo = new QuestionsRepository();
const answersService = new AnswersService(new AnswersRepository());
const questionsService = new QuestionsService(questionsRepo);
const questionsListService = new QuestionsListService(
  questionsRepo,
  answersService
);

export class QuestionsController implements IController {
  public path = "/questions";
  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/`, this.getAllQuestions);
    this.router.get(`${this.path}/search`, this.searchQuestions);
    this.router.get(`${this.path}/unanswered`, this.getUnansweredQuestions);
    this.router.get(`${this.path}/:id`, this.getQuestionById);
    this.router.post(
      `${this.path}/`,
      requiredAuthMiddleware,
      this.createQuestion
    );
  }

  private getAllQuestions = async (req: Request, res: Response) => {
    const { collectionId } = req.query;

    let result;
    // TODO: validate as uuid
    if (!!collectionId && typeof collectionId === "string") {
      // Получение списка вопросов, привязанных к конкретной коллекции

      // TODO: Add meta fields to model. (answers_count)
      result = await questionsListService.getCollectionQuestions(collectionId);
    } else {
      result = await questionsListService.getAll();
    }

    res.json(result);
  };

  private getQuestionById = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const question = await questionsService.getById(id);
    if (!question) {
      res.sendStatus(404);
    } else {
      res.json(question);
    }
  };

  private createQuestion = async (req: RequestWithUser, res: Response) => {
    const dto = req.body as ICreateQuestionDTO;
    dto.author_id = req.user?.userId as string;

    questionsService
      .add(dto)
      .then(() => res.sendStatus(200))
      .catch((err) => {
        console.error(err);
        res.sendStatus(500);
      });
  };

  private searchQuestions = async (req: Request, res: Response) => {
    const { query } = req.query;
    const questions = await questionsListService.search(query as string);
    res.json(questions);
  };

  private getUnansweredQuestions = async (req: Request, res: Response) => {
    const questions = await questionsListService.getUnansweredQuestions();
    res.json(questions);
  };
}
