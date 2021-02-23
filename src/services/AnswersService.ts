import { IAnswer } from "../models";
import { ICreateAnswerDTO } from "src/dto/Answer";
import { IAnswersRepository } from "src/repositories/AnswersRepository";

export interface IAnswersService {
  getById(id: string): Promise<IAnswer | void>;
  add(dto: ICreateAnswerDTO): Promise<void>;
  getAnswersCountForQuestion(questionId: string): Promise<number>;
}

export class AnswersService implements IAnswersService {
  constructor(private readonly answersRepo: IAnswersRepository) {}

  async getById(id: string): Promise<IAnswer | void> {
    return this.answersRepo.getById(id);
  }

  async add(dto: ICreateAnswerDTO): Promise<void> {
    this.answersRepo.add(dto);
  }

  async getAnswersCountForQuestion(questionId: string): Promise<number> {
    return this.answersRepo.getAnswersCountForQuestion(questionId);
  }
}
