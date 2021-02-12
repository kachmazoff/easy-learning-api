import { IAnswer } from "../models";
import { IAnswersRepository } from "src/repositories/AnswersRepository";

export interface IAnswersListService {
  getAll(): Promise<IAnswer[]>;
  getAnswersForQuestion(questionId: string): Promise<IAnswer[]>;
  search(queryString: string): Promise<IAnswer[]>;
}

export class AnswersListService implements IAnswersListService {
  constructor(private readonly answersRepo: IAnswersRepository) {}

  async getAll(): Promise<IAnswer[]> {
    return this.answersRepo.getAll();
  }

  async getAnswersForQuestion(questionId: string): Promise<IAnswer[]> {
    return this.answersRepo.getAnswersForQuestion(questionId);
  }

  async search(queryString: string): Promise<IAnswer[]> {
    return this.answersRepo.search(queryString);
  }
}
