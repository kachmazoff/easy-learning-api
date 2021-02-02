import express, { Application } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import morgan from "morgan";

import { IController } from "./controllers/IController";

export class App {
  public app: Application;

  constructor(controllers: IController[]) {
    this.app = express();

    // this.connectToTheDatabase();
    this.initializeMiddlewares();
    this.initializeControllers(controllers);
    // this.initializeErrorHandling();
  }

  public listen(port: number): void {
    this.app.listen(port, () => {
      console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
    });
  }

  public getServer(): Application {
    return this.app;
  }

  private initializeMiddlewares() {
    this.app.use(morgan("tiny"));

    this.app.use(cors());
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));
  }

  // private initializeErrorHandling() {
  //   this.app.use(errorMiddleware);
  // }

  private initializeControllers(controllers: IController[]) {
    controllers.forEach((controller) => {
      this.app.use("/", controller.router);
    });
  }
}
