import { Request, Response, Router } from "express";
import { requiredAuthMiddleware, RequestWithUser } from "../middlewares";
import { CardsCollectionsRepository } from "../repositories/CardsCollectionsRepository";
import {
  ICardsCollectionsService,
  CardsCollectionsService,
} from "../services/CardsCollectionsService";
import { IController } from "./IController";

const cardsCollectionsService: ICardsCollectionsService = new CardsCollectionsService(
  CardsCollectionsRepository
);

export class CardsCollectionsController implements IController {
  public path = "/collections";
  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/`, this.getAllCollections);
    this.router.post(
      `${this.path}/`,
      requiredAuthMiddleware,
      this.createCollection
    );
    this.router.get(`${this.path}/:id`, this.getCollectionInfoById);
    this.router.get(
      `${this.path}/:collectionId/cards`,
      this.getCardsFromCollection
    );
    this.router.post(
      `${this.path}/:collectionId/cards`,
      this.addCardsToCollection
    );
  }

  private getAllCollections = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    res.json(await cardsCollectionsService.getCollections());
  };

  private getCollectionInfoById = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const card = await cardsCollectionsService.getCollectionInfoById(
      req.params.id as string
    );
    if (card === undefined) {
      res.sendStatus(404);
    } else {
      res.json(card);
    }
  };

  private createCollection = async (
    req: RequestWithUser,
    res: Response
  ): Promise<void> => {
    const { title, description } = req.body;
    cardsCollectionsService
      .createCollection(title, description, req.user?.userId as string)
      .then(() => res.sendStatus(200))
      .catch((err) => {
        console.error(err);
        res.sendStatus(500);
      });
  };

  private getCardsFromCollection = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const collectionId = req.params.collectionId as string;
    const cards = await cardsCollectionsService.getCardsFromCollection(
      collectionId
    );
    res.json(cards);
  };

  private addCardsToCollection = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const collectionId = req.params.collectionId as string;
    const cardsIds: string[] = req.body;
    cardsCollectionsService
      .addCardsToCollection(collectionId, cardsIds)
      .then(() => res.sendStatus(200))
      .catch((err) => {
        console.error(err);
        res.sendStatus(500);
      });
  };
}
