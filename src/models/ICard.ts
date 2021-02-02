import { BaseEntity } from "./BaseEntity";

export interface ICard extends BaseEntity {
  title: string;
  description: string;
  author_id: string;
}
