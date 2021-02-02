import dotenv from "dotenv";
dotenv.config();

import { App } from "./app";

import {
  AnswersController,
  AuthController,
  CollectionsController,
  QuestionsController,
} from "./controllers";

const PORT = ((process.env.PORT as unknown) as number) || 8080;

const app = new App([
  new AuthController(),
  new AnswersController(),
  new QuestionsController(),
  new CollectionsController(),
]);

app.listen(PORT);

// TODO:
// Единый вид ответа
