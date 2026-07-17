import Navbar from "./components/Navbar";

import HomePage from "./pages/HomePage";
import LandingPage from "./pages/LandingPage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";

import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore, getAccentByKey } from "./store/useThemeStore";
import { useEffect, useMemo } from "react";

import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
  const { isDark, accentKey } = useThemeStore();
  const accent = useMemo(() => getAccentByKey(accentKey), [accentKey]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth && !authUser)
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--surface)]">
        <Loader className="size-10 animate-spin text-[var(--accent)]" />
      </div>
    );

  return (
    <div
      className={isDark ? "dark" : ""}
      style={{ "--accent": accent.accent, "--accent-hover": accent.hover }}
    >
      <div className="bg-[var(--surface)] min-h-screen transition-colors duration-300">
        <Navbar />
        <Routes>
          <Route path="/" element={authUser ? <HomePage /> : <LandingPage />} />
          <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
          <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
        </Routes>
        <Toaster />
      </div>
    </div>
  );
};
export default App;
