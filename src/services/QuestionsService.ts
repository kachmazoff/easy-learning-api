import { IQuestion, IQuestionExtended } from "../models";
import { IQuestionsRepository } from "src/repositories/QuestionsRepository";
import { ICreateQuestionDTO } from "src/dto/Question";
import { IAnswersService } from "./AnswersService";

export interface IQuestionsService {
  getAll(): Promise<IQuestionExtended[]>;
  getById(id: string): Promise<IQuestion | void>;
  add(dto: ICreateQuestionDTO): Promise<void>;
  search(queryString: string): Promise<IQuestion[]>;
  enrich(question: IQuestion): Promise<IQuestionExtended>;
  getUnansweredQuestions(): Promise<IQuestion[]>;
}

export class QuestionsService implements IQuestionsService {
  constructor(
    private readonly questionsRepo: IQuestionsRepository,
    private readonly answersService: IAnswersService
  ) {}

  async getAll(): Promise<IQuestionExtended[]> {
    const questions = await this.questionsRepo.getAll();
    const enrichedAnswers = await Promise.all(
      questions.map((x) => this.enrich(x))
    );

    return enrichedAnswers;
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

  async enrich(question: IQuestion): Promise<IQuestionExtended> {
    const answersCount = await this.answersService.getAnswersCountForQuestion(
      question.id
    );

    return {
      ...question,
      answers_count: answersCount,
    };
  }

  getUnansweredQuestions(): Promise<IQuestion[]> {
    return this.questionsRepo.getUnansweredQuestions();
  }
}
