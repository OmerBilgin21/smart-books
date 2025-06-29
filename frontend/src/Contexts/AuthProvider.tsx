import { useState, useEffect } from "preact/compat";
import { AuthContext } from "./AuthContext";
import { useApi } from "../hooks/useApi";
import { User } from "src/schemas/user";
import type { JSX } from "preact/compat";
import type { ReactNode } from "preact/compat";

const AuthContextProvider = ({
  children,
}: {
  children: ReactNode;
}): JSX.Element => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User>();
  const { usersApi, toastRequest, rawRequest } = useApi();

  useEffect(() => {
    const isAuthenticated = async () => {
      try {
        const res = await rawRequest<User>(usersApi, { method: "get" });

        console.log("res: ", res);
        setIsAuthenticated(true);
        setUser(res);
      } catch (authError) {
        console.error("not authenticated");
      }
    };

    isAuthenticated();
  }, []);

  const signIn = async (email: string, password: string) => {
    const user = await toastRequest<User | null>(
      usersApi,
      { url: `${email}/${password}`, method: "get" },
      { success: "Signed In!", pending: "Signing In..." },
    );

    if (user) {
      setUser(user);
      setIsAuthenticated(true);
    }
  };

  const signUp = async (user: User): Promise<void> => {
    const { email, firstName, lastName, password } = user;
    if (!email || !firstName || !lastName || !password) {
      window.alert("name, surname, email and password are required");
      return;
    }

    try {
      const user = await toastRequest<User>(
        usersApi,
        {
          data: {
            firstName,
            lastName,
            password,
            email,
          },
          method: "post",
        },
        {
          error: "failed to sign up",
          pending: "Signing up...",
          success: "Signed up successfully",
        },
      );

      setUser(user);
    } catch (signUpError) {
      window.alert(signUpError);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        signUp,
        signIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;
