import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Landing from "./pages/Landing";
import Main from "./pages/Main";
import Onboarding from "./pages/Onboarding";

const AuthRoute: React.FC = ({ children }) => {
  const { active } = useWeb3React<Web3Provider>();

  return active ? <>{children}</> : <Navigate to="/" replace />;
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route
          path="/app"
          element={
            <AuthRoute>
              <Main />
            </AuthRoute>
          }
        />
        <Route
          path="/onboarding"
          element={
            <AuthRoute>
              <Onboarding />
            </AuthRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
