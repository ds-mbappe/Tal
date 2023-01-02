import React, { createContext, useMemo, useState } from "react";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [isLoggedin, setIsLoggedIn] = useState(false);

  return (
    <AuthContext.Provider value={useMemo(() => isLoggedin, setIsLoggedIn)}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
