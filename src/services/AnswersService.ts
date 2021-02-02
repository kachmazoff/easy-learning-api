import { IAnswer } from "../models";
import { ICreateAnswerDTO } from "src/dto/Answer";
import { IAnswersRepository } from "src/repositories/AnswersRepository";

export interface IAnswersService {
  getAll(): Promise<IAnswer[]>;
  getById(id: string): Promise<IAnswer | void>;
  getAnswersForQuestion(questionId: string): Promise<IAnswer[]>;
  add(dto: ICreateAnswerDTO): Promise<void>;
  search(queryString: string): Promise<IAnswer[]>;
}

export class AnswersService implements IAnswersService {
  constructor(private readonly answersRepo: IAnswersRepository) {}

  async getAll(): Promise<IAnswer[]> {
    return this.answersRepo.getAll();
  }

  async getById(id: string): Promise<IAnswer | void> {
    return this.answersRepo.getById(id);
  }

  async getAnswersForQuestion(questionId: string): Promise<IAnswer[]> {
    return this.answersRepo.getAnswersForQuestion(questionId);
  }

  async add(dto: ICreateAnswerDTO): Promise<void> {
    this.answersRepo.add(dto);
  }

  async search(queryString: string): Promise<IAnswer[]> {
    return this.answersRepo.search(queryString);
  }
}
