export type User = {
  id: string;
  name: string;
};

export interface UsersRepository {
  fetchUser(userId: string): Promise<User>;
}
