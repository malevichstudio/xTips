import { useCallback, useMemo } from "react";
import { useApolloClient } from "@apollo/client";
import { useLocationChange } from "hooks";
import { useNavigate } from "react-router-dom";
import { checkToken, setTokenWithExpiry } from "utils/localStorage";
import { PATHS } from "constants/constants";
import AuthContext from "context/auth/auth.context";

function AuthProvider({ children }) {
  const client = useApolloClient();
  const isAuthenticated = useLocationChange(checkToken);

  const navigate = useNavigate();

  const handleLogout = useCallback(() => {
    localStorage.removeItem("TOKEN");
    localStorage.removeItem("TOKEN_EXPIRY");
    client.clearStore();
    navigate(PATHS.login);
  }, [navigate]);

  const handleLogin = useCallback(
    (token, tokenLifeTime) => {
      setTokenWithExpiry(token, tokenLifeTime);
      client.resetStore();
      navigate(PATHS.cab);
    },
    [navigate]
  );

  const authData = useMemo(
    () => ({
      isAuth: isAuthenticated,
      logout: handleLogout,
      login: handleLogin,
    }),
    [handleLogout, handleLogin, isAuthenticated]
  );

  return (
    <AuthContext.Provider value={authData}>{children}</AuthContext.Provider>
  );
}

export default AuthProvider;
