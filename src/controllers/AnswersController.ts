import { Request, Response, Router } from "express";
import { requiredAuthMiddleware, RequestWithUser } from "../middlewares";
import { IController } from "./IController";
import { ICreateAnswerDTO } from "../dto/Answer";
import { AnswersRepository } from "../repositories/AnswersRepository";
import { AnswersListService, AnswersService } from "../services";

const answersRepo = new AnswersRepository();
const answersService = new AnswersService(answersRepo);
const answersListService = new AnswersListService(answersRepo);

export class AnswersController implements IController {
  public path = "/answers";
  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/`, this.getAllAnswers);
    this.router.get(`${this.path}/:id`, this.getAnswerById);
    this.router.post(
      `${this.path}/`,
      requiredAuthMiddleware,
      this.createAnswer
    );
    this.router.get(`${this.path}/search`, this.searchAnswers);
  }

  private getAllAnswers = async (req: Request, res: Response) => {
    const { collectionId, questionId } = req.query;

    let result;
    // TODO: validate as uuid
    if (!!collectionId && !!questionId) {
      result = await answersListService.getSelectedAnswersForQuestionInCollection(
        collectionId as string,
        questionId as string
      );
    } else if (!!questionId) {
      result = await answersListService.getAnswersForQuestion(
        questionId as string
      );
    } else {
      result = await answersListService.getAll();
    }

    res.json(result);
  };

  private getAnswerById = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const answer = await answersService.getById(id);
    if (!answer) {
      res.sendStatus(404);
    } else {
      res.json(answer);
    }
  };

  private createAnswer = async (req: RequestWithUser, res: Response) => {
    const dto = req.body as ICreateAnswerDTO;
    dto.author_id = req.user?.userId as string;

    answersService
      .add(dto)
      .then(() => res.sendStatus(200))
      .catch((err) => {
        console.error(err);
        res.sendStatus(500);
      });
  };

  private searchAnswers = async (req: Request, res: Response) => {
    const { query } = req.query;
    const answers = await answersListService.search(query as string);
    res.json(answers);
  };
}
