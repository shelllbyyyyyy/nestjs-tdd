export type TUser = {
  id: string;
  username: string;
  email: string;
  password: string;
};

export class User {
  private _id: string;
  private _username: string;
  private readonly _email: string;
  private _password: string;
  private _createdAt?: Date;
  private _updatedAt?: Date;

  constructor(id: string, username: string, email: string, password: string) {
    this._id = id;
    this._username = username;
    this._password = password;
    this._email = email;
    this._createdAt = new Date();
  }

  get id() {
    return this._id;
  }

  get username() {
    return this._username;
  }

  get email() {
    return this._email;
  }

  get password() {
    return this._password;
  }

  get createdAt() {
    return this._createdAt;
  }

  get updatedAt() {
    return this._updatedAt;
  }

  set username(username: string) {
    this._username = username;
  }

  set password(password: string) {
    this._password = password;
  }

  static create({ id, email, password, username }: TUser) {
    return new User(id, username, email, password);
  }
}
