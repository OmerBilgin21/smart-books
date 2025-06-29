import { User } from "src/schemas/user";

export interface AuthContext {
  isAuthenticated: boolean;
  user: User | undefined;
  signUp: (user: User) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
}
