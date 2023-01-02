import AuthProvider from "./AuthProvider";
import Router from "./Navigation/Router";

export function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
}
