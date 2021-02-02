import { IQuestion } from "../models";
import { IQuestionsRepository } from "src/repositories/QuestionsRepository";
import { ICreateQuestionDTO } from "src/dto/Question";

export interface IQuestionsService {
  getAll(): Promise<IQuestion[]>;
  getById(id: string): Promise<IQuestion | void>;
  add(dto: ICreateQuestionDTO): Promise<void>;
  search(queryString: string): Promise<IQuestion[]>;
}

export class QuestionsService implements IQuestionsService {
  constructor(private readonly questionsRepo: IQuestionsRepository) {}

  async getAll(): Promise<IQuestion[]> {
    return this.questionsRepo.getAll();
  }

  async getById(id: string): Promise<IQuestion | void> {
    return this.questionsRepo.getById(id);
  }

  async add(dto: ICreateQuestionDTO): Promise<void> {
    this.questionsRepo.add(dto);
  }

  async search(queryString: string): Promise<IQuestion[]> {
    return this.questionsRepo.search(queryString);
  }
}
