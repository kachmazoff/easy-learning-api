import { IQuestion, IQuestionExtended } from "../models";
import { IQuestionsRepository } from "src/repositories/QuestionsRepository";
import { IAnswersService } from "./AnswersService";
import { IQuestionUtils, QuestionUtilsService } from "./QuestionUtilsService";

export interface IQuestionsListService {
  getAll(): Promise<IQuestionExtended[]>;
  search(queryString: string): Promise<IQuestion[]>;
  getUnansweredQuestions(): Promise<IQuestion[]>;
}

export class QuestionsListService implements IQuestionsListService {
  questionUtils: IQuestionUtils;

  constructor(
    private readonly questionsRepo: IQuestionsRepository,
    private readonly answersService: IAnswersService
  ) {
    this.questionUtils = new QuestionUtilsService(this.answersService);
  }

  async getAll(): Promise<IQuestionExtended[]> {
    const questions = await this.questionsRepo.getAll();
    const enrichedAnswers = await Promise.all(
      questions.map((x) => this.questionUtils.enrich(x))
    );

    return enrichedAnswers;
  }

  async search(queryString: string): Promise<IQuestion[]> {
    return this.questionsRepo.search(queryString);
  }

  getUnansweredQuestions(): Promise<IQuestion[]> {
    return this.questionsRepo.getUnansweredQuestions();
  }
}
