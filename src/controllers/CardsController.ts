import { Request, Response, Router } from "express";
import { requiredAuthMiddleware, RequestWithUser } from "../middlewares";
import { CardsRepository } from "../repositories/CardsRepository";
import { ICardsService, CardsService } from "../services/CardsService";
import { IController } from "./IController";

const cardsService: ICardsService = new CardsService(CardsRepository);

export class CardsController implements IController {
  public path = "/cards";
  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/`, this.getAllCards);
    this.router.post(`${this.path}/`, requiredAuthMiddleware, this.createCard);
    this.router.get(`${this.path}/search`, this.searchCard);
    this.router.get(`${this.path}/:id`, this.getCardById);
  }

  private getAllCards = async (req: Request, res: Response): Promise<void> => {
    res.json(await cardsService.getCards());
  };

  private getCardById = async (req: Request, res: Response): Promise<void> => {
    const card = await cardsService.getCardById(req.params.id as string);
    if (card === undefined) {
      res.sendStatus(404);
    } else {
      res.json(card);
    }
  };

  private createCard = async (
    req: RequestWithUser,
    res: Response
  ): Promise<void> => {
    const { title, description } = req.body;
    cardsService
      .createCard(title, description, req.user?.userId as string)
      .then(() => res.sendStatus(200))
      .catch((err) => {
        console.error(err);
        res.sendStatus(500);
      });
  };

  private searchCard = async (req: Request, res: Response): Promise<void> => {
    const { query } = req.query;
    const cards = await cardsService.searchCards(query as string);
    res.json(cards);
  };
}
