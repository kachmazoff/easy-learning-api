import { ICard, ICardsCollectionInfo } from "../models";
import { ICardsCollectionsRepository } from "src/repositories/CardsCollectionsRepository";

export interface ICardsCollectionsService {
  getCollections: () => Promise<ICardsCollectionInfo[]>;
  createCollection: (
    title: string,
    description: string,
    authorId: string
  ) => Promise<void>;
  getCollectionInfoById: (
    id: string
  ) => Promise<ICardsCollectionInfo | undefined>;
  addCardsToCollection: (
    collectionId: string,
    cardsIds: string[]
  ) => Promise<void>;
  getCardsFromCollection: (collectionId: string) => Promise<ICard[]>;
}

export class CardsCollectionsService implements ICardsCollectionsService {
  constructor(
    private readonly cardsCollectionsRepo: ICardsCollectionsRepository
  ) {}

  async getCollections(): Promise<ICardsCollectionInfo[]> {
    const res: ICardsCollectionInfo[] = await this.cardsCollectionsRepo.getAll();

    return res;
  }

  async createCollection(
    title: string,
    description: string,
    authorId: string
  ): Promise<void> {
    await this.cardsCollectionsRepo.add(title, description, authorId);
  }

  async getCollectionInfoById(
    id: string
  ): Promise<ICardsCollectionInfo | undefined> {
    return this.cardsCollectionsRepo.getById(id);
  }

  async addCardsToCollection(
    collectionId: string,
    cardsIds: string[]
  ): Promise<void> {
    return this.cardsCollectionsRepo.addCardsToCollection(
      collectionId,
      cardsIds
    );
  }

  async getCardsFromCollection(collectionId: string): Promise<ICard[]> {
    return this.cardsCollectionsRepo.getCardsFromCollection(collectionId);
  }
}
