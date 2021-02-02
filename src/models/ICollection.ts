import { BaseEntity } from "./BaseEntity";

export interface ICollectionInfo extends BaseEntity {
  title: string;
  description: string;
  author_id: string;
}
