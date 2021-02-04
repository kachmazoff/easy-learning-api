import { Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
import { IUser } from "src/models";
import { UsersRepository } from "../repositories/UsersRepository";
import { IController } from "./IController";

const MIN_PASSWORD_LENGTH =
  ((process.env.MIN_PASSWORD_LENGTH as unknown) as number) || 4;

const PRIVATE_KEY = process.env.JWT_PRIVATE_KEY || "secret";

const TOKEN_EXPIRATION = (process.env.JWT_EXPIRATION as string) || 60 * 60;

export class AuthController implements IController {
  public path = "/auth";
  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}/registration`, this.registration);
    this.router.post(`${this.path}/login`, this.login);
    this.router.get(`${this.path}/check`, this.check);
  }

  private registration = async (req: Request, res: Response) => {
    const newUserData = req.body as IUser;
    if (
      !newUserData.username ||
      !newUserData.email ||
      !newUserData.password ||
      newUserData.password.length < MIN_PASSWORD_LENGTH
    ) {
      res.sendStatus(400);
    } else {
      try {
        await UsersRepository.add(newUserData);
        res.sendStatus(200);
      } catch (err) {
        res.sendStatus(500);
      }
    }
  };

  private login = async (req: Request, res: Response) => {
    const loginData = req.body as { username: string; password: string };
    const userData = await UsersRepository.searchByUsername(loginData.username);
    if (!userData) {
      // Такого пользователя не существует
      res.sendStatus(400);
    } else if (userData.password !== loginData.password) {
      // Неверный пароль
      res.sendStatus(400);
    } else {
      const generatedToken = jwt.sign(
        { userId: userData.id, username: userData.username },
        PRIVATE_KEY,
        { expiresIn: TOKEN_EXPIRATION }
      );

      res.json({ token: generatedToken });
    }
  };

  private logout = async (req: Request, res: Response) => {
    res.sendStatus(404);
  };

  private check = async (req: Request, res: Response) => {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader || !authorizationHeader?.startsWith("Bearer ")) {
      res.sendStatus(401);
      return;
    }

    const token = authorizationHeader.split(" ")[1];
    try {
      const tokenData = jwt.verify(token, PRIVATE_KEY);
      res.sendStatus(200);
    } catch (error) {
      res.sendStatus(401);
    }
  };
}
