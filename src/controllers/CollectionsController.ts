import { Request, Response, Router } from "express";
import { validate as uuidValidate } from "uuid";
import { requiredAuthMiddleware, RequestWithUser } from "../middlewares";
import { IController } from "./IController";
import { ICreateCollectionDTO } from "../dto/Collection";
import { CollectionsService } from "../services";
import { CollectionsRepository } from "../repositories/CollectionsRepository";

const collectionsService = new CollectionsService(new CollectionsRepository());

export class CollectionsController implements IController {
  public path = "/collections";
  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/`, this.getAllCollections);
    this.router.get(`${this.path}/:id`, this.getCollectionById);
    this.router.get(`${this.path}/:id/full`, this.getFullCollection);
    this.router.get(`${this.path}/:id/qas`, this.getQAs);

    this.router.post(
      `${this.path}/:id/questions`,
      requiredAuthMiddleware,
      this.addQuestions
    );

    this.router.post(
      `${this.path}/:id/questions/:questionId/answers`,
      requiredAuthMiddleware,
      this.selectAnswersForQuestion
    );
    this.router.delete(
      `${this.path}/:id/questions`,
      requiredAuthMiddleware,
      this.deleteQuestions
    );

    this.router.post(
      `${this.path}/:id/qas`,
      requiredAuthMiddleware,
      this.addQAs
    );
    this.router.post(
      `${this.path}/`,
      requiredAuthMiddleware,
      this.createCollection
    );
    this.router.get(`${this.path}/search`, this.searchCollections);
  }

  private getAllCollections = async (req: Request, res: Response) => {
    res.json(await collectionsService.getAll());
  };

  private getCollectionById = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const collection = await collectionsService.getById(id);
    if (!collection) {
      res.sendStatus(404);
    } else {
      res.json(collection);
    }
  };

  private createCollection = async (req: RequestWithUser, res: Response) => {
    const dto = req.body as ICreateCollectionDTO;
    dto.author_id = req.user?.userId as string;

    collectionsService
      .add(dto)
      .then(() => res.sendStatus(200))
      .catch((err) => {
        console.error(err);
        res.sendStatus(500);
      });
  };

  private searchCollections = async (req: Request, res: Response) => {
    const { query } = req.query;
    const collections = await collectionsService.search(query as string);
    res.json(collections);
  };

  private getFullCollection = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const answer = await collectionsService.getFullById(id);
    res.json(answer);
  };

  private getQAs = async (req: RequestWithUser, res: Response) => {
    const collectionId = req.params.id as string;
    const answer = await collectionsService.getCollectionQAs(collectionId);
    res.json(answer);
  };

  private addQAs = async (req: RequestWithUser, res: Response) => {
    const collectionId = req.params.id as string;
    const qasIds: { questionId: string; answerId?: string }[] = req.body;

    if (
      !uuidValidate(collectionId) ||
      !qasIds.every(
        (x) =>
          uuidValidate(x.questionId) &&
          (!x.answerId || uuidValidate(x.answerId))
      )
    ) {
      res.sendStatus(400);
      return;
    }

    try {
      await collectionsService.addQAsToCollection(collectionId, qasIds);
      res.sendStatus(200);
    } catch (error) {
      res.sendStatus(500);
    }
  };

  private addQuestions = async (req: RequestWithUser, res: Response) => {
    const collectionId = req.params.id as string;
    const questionsIds = req.body as string[];

    try {
      await collectionsService.addQuestionsToCollection(
        collectionId,
        questionsIds
      );
      res.sendStatus(200);
    } catch (error) {
      res.sendStatus(500);
    }
  };

  private deleteQuestions = async (req: RequestWithUser, res: Response) => {
    const collectionId = req.params.id as string;
    const questionsIds = req.body as string[];

    try {
      await collectionsService.deleteQuestionsFromCollection(
        collectionId,
        questionsIds
      );
      res.sendStatus(200);
    } catch (error) {
      res.sendStatus(500);
    }
  };

  private selectAnswersForQuestion = async (
    req: RequestWithUser,
    res: Response
  ) => {
    const collectionId = req.params.id as string;
    const questionId = req.params.questionId as string;

    const answersIds = req.body as string[];

    try {
      collectionsService.setAnswersForQuestion(
        collectionId,
        questionId,
        answersIds
      );
      res.sendStatus(200);
    } catch (error) {
      console.error(error);
      res.sendStatus(500);
    }
  };
}
