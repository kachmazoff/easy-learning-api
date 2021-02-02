import { ICollectionInfo, IQuestion } from "../models";
import { ICollectionsRepository } from "src/repositories/CollectionsRepository";
import {
  ICollectionFull,
  ICreateCollectionDTO,
  IQAPair,
} from "../dto/Collection";

export interface ICollectionsService {
  getAll(): Promise<ICollectionInfo[]>;
  getById(id: string): Promise<ICollectionInfo | void>;
  add(dto: ICreateCollectionDTO): Promise<void>;
  search(queryString: string): Promise<ICollectionInfo[]>;

  addQAsToCollection(
    collectionId: string,
    qasIds: { questionId: string; answerId?: string }[]
  ): Promise<void>;
  getFullById(id: string): Promise<ICollectionFull | void>;
  getCollectionQAs(collectionId: string): Promise<IQAPair[]>;

  getCollectionQuestions(collectionId: string): Promise<IQuestion[]>;
  addQuestionsToCollection(
    collectionId: string,
    questionsIds: string[]
  ): Promise<void>;
  deleteQuestionsFromCollection(
    collectionId: string,
    questionsIds: string[]
  ): Promise<void>;
}

export class CollectionsService implements ICollectionsService {
  constructor(private readonly collectionsRepo: ICollectionsRepository) {}

  async getAll(): Promise<ICollectionInfo[]> {
    const res: ICollectionInfo[] = await this.collectionsRepo.getAll();

    return res;
  }

  async getById(id: string): Promise<ICollectionInfo | void> {
    return this.collectionsRepo.getById(id);
  }

  async add(dto: ICreateCollectionDTO): Promise<void> {
    this.collectionsRepo.add(dto);
  }

  async search(queryString: string): Promise<ICollectionInfo[]> {
    return this.collectionsRepo.search(queryString);
  }

  async addQAsToCollection(
    collectionId: string,
    qasIds: { questionId: string; answerId?: string }[]
  ): Promise<void> {
    this.collectionsRepo.addQAsToCollection(collectionId, qasIds);
  }

  async getFullById(id: string): Promise<ICollectionFull | void> {
    return this.collectionsRepo.getFullById(id);
  }

  async getCollectionQAs(collectionId: string) {
    return this.collectionsRepo.getCollectionQAs(collectionId);
  }

  async addQuestionsToCollection(collectionId: string, questionsIds: string[]) {
    return this.collectionsRepo.addQuestionsToCollection(
      collectionId,
      questionsIds
    );
  }

  async getCollectionQuestions(collectionId: string) {
    return this.collectionsRepo.getCollectionQuestions(collectionId);
  }

  async deleteQuestionsFromCollection(
    collectionId: string,
    questionsIds: string[]
  ) {
    return this.collectionsRepo.deleteQuestionsFromCollection(
      collectionId,
      questionsIds
    );
  }
}
