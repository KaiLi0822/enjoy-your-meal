import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Recipes from './recipes/Recipes.tsx';
import SignIn from './sign-in/SignIn.tsx'; // Your SignIn component
import SignUp from './sign-up/SignUp.tsx'; // Your SignUp component

const isDev = import.meta.env.MODE === 'development';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Recipes />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    </Router>
  );
};

createRoot(document.getElementById('root')!).render(
  isDev ? (
    <StrictMode>
      <App />
    </StrictMode>
  ) : (
    <App />
  )
);
