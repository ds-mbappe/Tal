import React from "react";
import AuthProvider from "./AuthProvider";
import Router from "./Navigation/Router";

const App = () => {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
};

export default App;
