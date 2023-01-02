import { useState } from "react";
import AuthProvider from "./AuthProvider";
import Router from "./Navigation/Router";

export default function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
}
