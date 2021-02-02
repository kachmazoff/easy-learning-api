import { BaseEntity } from "./BaseEntity";

export interface IAnswer extends BaseEntity {
  data: string;
  description?: string;

  question_id: string;
  author_id: string;
}
