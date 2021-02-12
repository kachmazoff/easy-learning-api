import { IAnswer, ICollectionInfo, ICollectionInfoExtended } from "../models";
import { ICollectionsRepository } from "src/repositories/CollectionsRepository";
import {
  ICollectionFull,
  ICreateCollectionDTO,
  IQAPair,
} from "../dto/Collection";

export interface ICollectionsService {
  getAll(): Promise<ICollectionInfoExtended[]>;
  getById(id: string): Promise<ICollectionInfo | void>;
  add(dto: ICreateCollectionDTO): Promise<void>;
  search(queryString: string): Promise<ICollectionInfo[]>;

  addQAsToCollection(
    collectionId: string,
    qasIds: { questionId: string; answerId?: string }[]
  ): Promise<void>;
  getFullById(id: string): Promise<ICollectionFull | void>;
  getCollectionQAs(collectionId: string): Promise<IQAPair[]>;

  addQuestionsToCollection(
    collectionId: string,
    questionsIds: string[]
  ): Promise<void>;
  deleteQuestionsFromCollection(
    collectionId: string,
    questionsIds: string[]
  ): Promise<void>;

  setAnswersForQuestion(
    collectionId: string,
    questionId: string,
    answersIds: string[]
  ): Promise<void>;

  enrich(collection: ICollectionInfo): Promise<ICollectionInfoExtended>;
}

export class CollectionsService implements ICollectionsService {
  constructor(private readonly collectionsRepo: ICollectionsRepository) {}

  // TODO: подумать над производительностью
  async getAll(): Promise<ICollectionInfoExtended[]> {
    const collections = await this.collectionsRepo.getAll();
    const enrichedCollections = await Promise.all(
      collections.map((x) => this.enrich(x))
    );

    return enrichedCollections;
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

  async deleteQuestionsFromCollection(
    collectionId: string,
    questionsIds: string[]
  ) {
    return this.collectionsRepo.deleteQuestionsFromCollection(
      collectionId,
      questionsIds
    );
  }

  async setAnswersForQuestion(
    collectionId: string,
    questionId: string,
    answersIds: string[]
  ) {
    this.collectionsRepo.setAnswersForQuestion(
      collectionId,
      questionId,
      answersIds
    );
  }

  async enrich(collection: ICollectionInfo): Promise<ICollectionInfoExtended> {
    const questionsCount = await this.collectionsRepo.getAttachedQuestionsCount(
      collection.id
    );

    return {
      ...collection,
      questions_count: questionsCount,
    };
  }
}
