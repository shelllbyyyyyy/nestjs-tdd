import { User } from '../entities/user.entity';

export const toUserDomain = (data: any) => {
  return new User(data.id, data.username, data.email, data.password);
};

export const toUserResponse = (data: User) => {
  return {
    id: data.username,
    username: data.username,
    email: data.email,
  };
};
