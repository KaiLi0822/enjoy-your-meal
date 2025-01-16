import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Recipes from "./recipes/Recipes.tsx";
import SignIn from "./sign-in/SignIn.tsx"; // Your SignIn component
import SignUp from "./sign-up/SignUp.tsx"; // Your SignUp component
import { AuthProvider } from "./contexts/AuthContext.tsx";

const isDev = import.meta.env.MODE === "development";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Recipes />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

createRoot(document.getElementById("root")!).render(
  isDev ? (
    <StrictMode>
      <App />
    </StrictMode>
  ) : (
    <App />
  )
);
