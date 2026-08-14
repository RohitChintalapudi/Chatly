import Navbar from "./components/Navbar";

import HomePage from "./pages/HomePage";
import LandingPage from "./pages/LandingPage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import AudioRoomPage from "./pages/AudioRoomPage";
import AudioRoomsDashboardPage from "./pages/AudioRoomsDashboardPage";
import P2PTestPage from "./pages/P2PTestPage";

import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore, getAccentByKey } from "./store/useThemeStore";
import { useEffect, useMemo } from "react";

import { MessageSquare } from "lucide-react";
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
      <div
        className={isDark ? "dark" : ""}
        style={{ "--accent": accent.accent, "--accent-hover": accent.hover }}
      >
        <div className="flex flex-col items-center justify-center gap-4 h-screen bg-[var(--surface)] transition-colors">
          <div className="relative flex items-center justify-center">
            {/* Glowing pulsating rings */}
            <span className="absolute -inset-3.5 rounded-2xl bg-[var(--accent)] opacity-20 animate-ping duration-1000" />
            <span className="absolute -inset-1 rounded-2xl bg-[var(--accent)] opacity-10 animate-pulse" />
            
            <div className="size-16 rounded-2xl bg-[var(--accent)] border-2 border-[var(--line)] flex items-center justify-center shadow-[4px_4px_0px_0px_var(--line)] transition-all">
              <MessageSquare className="w-8 h-8 text-black animate-bounce" strokeWidth={2.5} />
            </div>
          </div>
          
          <div className="flex flex-col items-center mt-3 select-none">
            <span className="text-sm font-black text-[var(--primary-text)] tracking-wider uppercase">
              Chatly
            </span>
            <span className="text-[10px] font-extrabold text-[var(--secondary-text)] tracking-widest uppercase mt-1 animate-pulse">
              Loading...
            </span>
          </div>
        </div>
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
          <Route path="/audio-rooms" element={authUser ? <AudioRoomsDashboardPage /> : <Navigate to="/login" />} />
          <Route path="/room/:roomId" element={<AudioRoomPage />} />
          <Route path="/test-p2p" element={<P2PTestPage />} />
        </Routes>
        <Toaster
          position="top-center"
          gutter={12}
          toastOptions={{
            duration: 3000,
            style: {
              background: "var(--surface)",
              color: "var(--primary-text)",
              border: "2px solid var(--line)",
              borderRadius: "16px",
              padding: "12px 16px",
              fontWeight: 700,
              fontSize: "13px",
              boxShadow: "4px 4px 0px 0px var(--line)",
              maxWidth: "380px",
            },
            success: {
              iconTheme: {
                primary: "#22c55e",
                secondary: "var(--surface)",
              },
            },
            error: {
              iconTheme: {
                primary: "#ef4444",
                secondary: "var(--surface)",
              },
            },
            className: "toast-enter",
          }}
        />
      </div>
    </div>
  );
};
export default App;
