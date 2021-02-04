import { v4 as uuidv4 } from "uuid";
import { query } from "../database";
import { IUser } from "../models";
import { CRUDRepository } from "./BaseRepositories";

const TABLE_NAME = "USERS";

export interface IUsersRepository extends CRUDRepository<string, IUser> {
  add: (newUser: IUser) => Promise<void>;
  searchByUsername: (username: string) => Promise<IUser | undefined>;
}

export const UsersRepository: IUsersRepository = {
  getAll: async () => {
    const res = await query<IUser[]>(
      `SELECT * FROM \`${TABLE_NAME}\` ORDER BY created DESC`
    );
    if (!res) {
      return [];
    }
    return res;
  },
  getById: async (id: string) => {
    const res = await query<IUser[]>(
      `SELECT * FROM \`${TABLE_NAME}\` WHERE id=?`,
      [id]
    );
    return !!res ? res[0] : undefined;
  },
  add: async (newUser: IUser) => {
    const res = await query<IUser>(
      `INSERT INTO \`${TABLE_NAME}\` (id, \`username\`, \`password\`, \`email\`) VALUES (?, ?, ?, ?)`,
      [uuidv4(), newUser.username, newUser.password, newUser.email]
    );
  },
  update: async (updatedCard: IUser) => {
    // TODO
    throw new Error("Not Implemented");
  },
  searchByUsername: async (username: string) => {
    const res = await query<IUser[]>(
      `SELECT * FROM \`${TABLE_NAME}\` WHERE username=?`,
      [username]
    );
    return !!res ? res[0] : undefined;
  },
};
