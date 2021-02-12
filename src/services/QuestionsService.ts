import { IQuestion } from "../models";
import { IQuestionsRepository } from "src/repositories/QuestionsRepository";
import { ICreateQuestionDTO } from "src/dto/Question";

export interface IQuestionsService {
  getById(id: string): Promise<IQuestion | void>;
  add(dto: ICreateQuestionDTO): Promise<void>;
}

export class QuestionsService implements IQuestionsService {
  constructor(private readonly questionsRepo: IQuestionsRepository) {}

  async getById(id: string): Promise<IQuestion | void> {
    return this.questionsRepo.getById(id);
  }

  async add(dto: ICreateQuestionDTO): Promise<void> {
    this.questionsRepo.add(dto);
  }
}
