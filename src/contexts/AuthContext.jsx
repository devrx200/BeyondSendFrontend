import { createContext, useContext } from "react";

export const AuthContext =
  createContext();

export const AuthProvider = ({
  children
}) => {

  return (
    <AuthContext.Provider
      value={{

        userRole:
          window.userRole,

        employeeType:
          window.employeeType

      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () =>
  useContext(AuthContext);