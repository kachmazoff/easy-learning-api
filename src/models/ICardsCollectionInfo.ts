import { BaseEntity } from "./BaseEntity";

export interface ICardsCollectionInfo extends BaseEntity {
  title: string;
  description: string;
  author_id: string;
}
