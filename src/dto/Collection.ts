import { IAnswer, IQuestion, ICollectionInfo } from "src/models";

export interface ICreateCollectionDTO {
  title: string;
  description: string;

  author_id: string;
}

// export interface IQAIds {
//   questionId: string;
//   answerId?: string;
// }

export interface IQAPair {
  question: IQuestion;
  answer: IAnswer;
}

export interface ICollectionFull {
  info: ICollectionInfo;
  qaPairs: IQAPair[];
}
