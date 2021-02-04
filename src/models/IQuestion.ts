import { BaseEntity } from "./BaseEntity";

export interface IQuestion extends BaseEntity {
  data: string;
  description?: string;

  author_id: string;
}

export interface IQuestionExtended extends IQuestion {
  answers_count: number;
}
