import { Request, Response, Router } from "express";
import { requiredAuthMiddleware, RequestWithUser } from "../middlewares";
import { IController } from "./IController";
import { ICreateQuestionDTO } from "../dto/Question";
import { QuestionsRepository } from "../repositories/QuestionsRepository";
import { AnswersService, QuestionsService } from "../services";
import { AnswersRepository } from "../repositories/AnswersRepository";

const answersService = new AnswersService(new AnswersRepository());
const questionsService = new QuestionsService(
  new QuestionsRepository(),
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
    this.router.get(`${this.path}/:id/answers`, this.getAnswersForQuestion);
    this.router.post(
      `${this.path}/`,
      requiredAuthMiddleware,
      this.createQuestion
    );
  }

  private getAllQuestions = async (req: Request, res: Response) => {
    res.json(await questionsService.getAll());
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
    const questions = await questionsService.search(query as string);
    res.json(questions);
  };

  private getAnswersForQuestion = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const answers = await answersService.getAnswersForQuestion(id);
    res.json(answers);
  };

  private getUnansweredQuestions = async (req: Request, res: Response) => {
    const questions = await questionsService.getUnansweredQuestions();
    res.json(questions);
  };
}
