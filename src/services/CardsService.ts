import { ICard } from "../models";
import { ICardsRepository } from "src/repositories/CardsRepository";

export interface ICardsService {
  getCards: () => Promise<ICard[]>;
  createCard: (
    title: string,
    description: string,
    authorId: string
  ) => Promise<void>;
  getCardById: (id: string) => Promise<ICard | undefined>;
  searchCards: (query: string) => Promise<ICard[]>;
}

export class CardsService implements ICardsService {
  constructor(private readonly cardsRepo: ICardsRepository) {}

  async getCards(): Promise<ICard[]> {
    const res: ICard[] = await this.cardsRepo.getAll();

    return res;
  }

  async createCard(
    title: string,
    description: string,
    authorId: string
  ): Promise<void> {
    await this.cardsRepo.add(title, description, authorId);
  }

  async getCardById(id: string): Promise<ICard | undefined> {
    return this.cardsRepo.getById(id);
  }

  async searchCards(query: string): Promise<ICard[]> {
    return this.cardsRepo.searchByTitle(query);
  }
}
