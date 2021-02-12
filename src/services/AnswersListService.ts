import { IAnswer } from "../models";
import { IAnswersRepository } from "src/repositories/AnswersRepository";

export interface IAnswersListService {
  getAll(): Promise<IAnswer[]>;
  getAnswersForQuestion(questionId: string): Promise<IAnswer[]>;
  search(queryString: string): Promise<IAnswer[]>;
  getSelectedAnswersForQuestionInCollection(
    collectionId: string,
    questionId: string
  ): Promise<IAnswer[]>;
}

export class AnswersListService implements IAnswersListService {
  constructor(private readonly answersRepo: IAnswersRepository) {}

  getAll(): Promise<IAnswer[]> {
    return this.answersRepo.getAll();
  }

  getAnswersForQuestion(questionId: string): Promise<IAnswer[]> {
    return this.answersRepo.getAnswersForQuestion(questionId);
  }

  search(queryString: string): Promise<IAnswer[]> {
    return this.answersRepo.search(queryString);
  }

  getSelectedAnswersForQuestionInCollection(
    collectionId: string,
    questionId: string
  ) {
    return this.answersRepo.getSelectedAnswersForQuestionInCollection(
      collectionId,
      questionId
    );
  }
}
