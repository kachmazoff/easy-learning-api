import { IQuestion, IQuestionExtended } from "../models";
import { IAnswersService } from "./AnswersService";

export interface IQuestionUtils {
  enrich(question: IQuestion): Promise<IQuestionExtended>;
}

export class QuestionUtilsService implements IQuestionUtils {
  constructor(private readonly answersService: IAnswersService) {}

  async enrich(question: IQuestion): Promise<IQuestionExtended> {
    const answersCount = await this.answersService.getAnswersCountForQuestion(
      question.id
    );

    return {
      ...question,
      answers_count: answersCount,
    };
  }
}
