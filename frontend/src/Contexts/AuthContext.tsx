import { createContext } from "preact";
import { useContext } from "preact/hooks";
import { AuthContext as AuthInterface } from "./Auth.interface";

const AuthContext = createContext<AuthInterface | undefined>(undefined);

const useAuth = (): AuthInterface => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within a AuthProvider");
  }
  return context;
};

export { AuthContext, useAuth };
