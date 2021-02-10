import dotenv from "dotenv";
dotenv.config();

import { App } from "./app";

import {
  AnswersController,
  AuthController,
  CollectionsController,
  QuestionsController,
  StatisticsController,
} from "./controllers";

const PORT = ((process.env.PORT as unknown) as number) || 8080;

const app = new App([
  new AuthController(),
  new AnswersController(),
  new QuestionsController(),
  new CollectionsController(),
  new StatisticsController(),
]);

app.listen(PORT);

// TODO:
// Единый вид ответа
