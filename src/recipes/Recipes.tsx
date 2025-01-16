import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import AppAppBar from './components/AppAppBar';
import MainContent from './components/MainContent';
import Footer from './components/Footer';
import AppTheme from '../shared-theme/AppTheme';
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuthContext } from "../contexts/AuthContext";
import { refreshToken } from "../utils/authUtils";

export default function Recipes(props: { disableCustomTheme?: boolean }) {
  const location = useLocation();
  const { setIsAuthenticated } = useAuthContext(); // Get setIsAuthenticated from AuthContext
  useEffect(() => {
    const auth = location.state?.auth || false;

    if (auth) {
      setIsAuthenticated(true);
    } else {
      // Check access token
      const token = sessionStorage.getItem("accessToken");

      if (token) {
        setIsAuthenticated(true);
      } else {
        // Explicitly refresh token
        refreshToken().then((newToken) => {
          setIsAuthenticated(!!newToken); // Set as authenticated if token refresh succeeds
        });
      }
    }
  }, [location.state, setIsAuthenticated]);


  return (
   
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />

      <AppAppBar />
      <Container
        maxWidth="lg"
        component="main"
        sx={{ display: 'flex', flexDirection: 'column', my: 16, gap: 4 }}
      >
        <MainContent />
      </Container>
      <Footer />
    </AppTheme>
  );
}
