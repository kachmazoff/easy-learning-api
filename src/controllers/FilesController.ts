import path from "path";
import { Request, Response, Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { requiredAuthMiddleware, RequestWithUser } from "../middlewares";
import fileUpload, { UploadedFile } from "express-fileupload";
import { IController } from "./IController";

export class FilesController implements IController {
  public path = "/files";
  public router = Router();
  public filesDirectory = process.env.filesDirectory as string;

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}/upload`,
      requiredAuthMiddleware,
      fileUpload({ debug: false, createParentPath: true }),
      this.uploadFile
    );

    this.router.get(`${this.path}/download`, this.downloadFile);
  }

  private uploadFile = async (req: RequestWithUser, res: Response) => {
    try {
      if (!req.files) {
        res.json({
          status: false,
          message: "No file uploaded",
        });
      } else {
        const avatar = req.files.file as UploadedFile;

        const fileId = uuidv4();
        const extension = avatar.name.split(".").slice(-1)[0];
        const filename = fileId + "." + extension;

        avatar.mv(path.join(this.filesDirectory, filename));

        res.json({
          status: true,
          message: "File is uploaded",
          data: {
            name: avatar.name,
            mimetype: avatar.mimetype,
            size: avatar.size,
            generatedName: filename,
          },
        });
      }
    } catch (err) {
      console.log(err);
      res.sendStatus(500);
    }
  };

  private downloadFile = async (req: Request, res: Response) => {
    const { filename } = req.query;
    console.log(filename);
    if (!filename || typeof filename !== "string") {
      res.sendStatus(404);
      return;
    }

    res.sendFile(path.join(this.filesDirectory, filename));
  };
}
