export interface IUser {
  id?: string;
  created?: Date;
  updated?: Date;

  username: string;
  password: string;
  email: string;

  firstName?: string;
  lastName?: string;
  patronymic?: string;
}
