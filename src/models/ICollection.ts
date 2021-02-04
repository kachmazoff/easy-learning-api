import { BaseEntity } from "./BaseEntity";

export interface ICollectionInfo extends BaseEntity {
  title: string;
  description: string;
  author_id: string;
}

export interface ICollectionInfoExtended extends ICollectionInfo {
  questions_count: number;
}
