import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "../store/useThemeStore";
import { LogOut, MessageSquare, Settings, User, Menu, X, Sun, Moon, Radio, Share2, Gamepad2 } from "lucide-react";
import { useState } from "react";
import LogoutModal from "./LogoutModal";

const landingLinks = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "Arcade", href: "#arcade" },
  { label: "Feedback", href: "#feedback" },
  { label: "Contact", href: "#contact" },
];

const appSections = [
  { label: "Chat", href: "/", icon: MessageSquare },
  { label: "Audio Rooms", href: "/audio-rooms", icon: Radio },
  { label: "File Transfer", href: "/test-p2p", icon: Share2 },
  { label: "Mini Games", href: "/games", icon: Gamepad2 },
];

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileAppOpen, setMobileAppOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const location = useLocation();
  const isLanding = location.pathname === "/" && !authUser;

  return (
    <>
      <header className="bg-[var(--surface)] border-b-2 border-[var(--line)] fixed w-full top-0 z-40 transition-colors">
        <div className="container mx-auto px-4 h-16">
          <div className="flex items-center justify-between h-full">
            <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-all">
              <img
                src="/chatly-logo.png"
                alt="Chatly Logo"
                className="size-9 rounded-xl object-contain shadow-sm"
              />
              <h1 className="text-lg font-extrabold text-[var(--primary-text)] transition-colors">Chatly</h1>
            </Link>

            {isLanding && (
              <nav className="hidden xl:flex items-center gap-1">
                {landingLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="px-4 py-2 rounded-xl text-sm font-bold text-[var(--primary-text)] border-2 border-transparent hover:border-[var(--line)] hover:bg-[var(--accent)]/10 transition-all duration-200"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            )}

            {authUser && !isLanding && (
              <nav className="hidden xl:flex items-center gap-1">
                {appSections.map((section) => {
                  const Icon = section.icon;
                  const isActive = location.pathname === section.href;
                  return (
                    <Link
                      key={section.label}
                      to={section.href}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border-2 transition-colors duration-200 ${
                        isActive
                          ? "bg-[var(--accent)] text-black border-[var(--line)] font-extrabold"
                          : "text-[var(--primary-text)] border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--accent)]/10"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {section.label}
                    </Link>
                  );
                })}
              </nav>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="w-9 h-9 rounded-xl border-2 border-[var(--line)] bg-[var(--surface)] flex items-center justify-center hover:bg-[var(--accent)]/10 transition-all cursor-pointer"
                title={isDark ? "Switch to light mode" : "Switch to dark mode"}
              >
                {isDark ? (
                  <Sun className="w-4 h-4 text-[var(--accent)]" />
                ) : (
                  <Moon className="w-4 h-4 text-[var(--primary-text)]" />
                )}
              </button>

              {authUser ? (
                <>
                  <Link
                    to="/settings"
                    className="hidden xl:inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-[var(--primary-text)] border-2 border-[var(--line)] hover:shadow-[3px_3px_0px_0px_var(--line)] hover:-translate-y-0.5 transition-all bg-[var(--surface)]"
                  >
                    <Settings className="w-4 h-4" />
                    <span className="hidden sm:inline">Settings</span>
                  </Link>
                  <Link
                    to="/profile"
                    className="hidden xl:inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-[var(--primary-text)] border-2 border-[var(--line)] hover:shadow-[3px_3px_0px_0px_var(--line)] hover:-translate-y-0.5 transition-all bg-[var(--surface)]"
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">Profile</span>
                  </Link>
                  <button
                    className="hidden xl:inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-red-500 border-2 border-red-500/40 bg-red-500/10 hover:shadow-[3px_3px_0px_0px_rgba(239,68,68,0.3)] hover:-translate-y-0.5 hover:bg-red-500/20 transition-all cursor-pointer"
                    onClick={() => setShowLogout(true)}
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                  <button
                    className="xl:hidden inline-flex items-center justify-center w-9 h-9 rounded-xl border-2 border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--accent)]/10 transition-all cursor-pointer"
                    onClick={() => setMobileAppOpen(!mobileAppOpen)}
                    aria-label="Open menu"
                  >
                    {mobileAppOpen ? <X className="w-4 h-4 text-[var(--primary-text)]" /> : <Menu className="w-4 h-4 text-[var(--primary-text)]" />}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 px-3 sm:px-5 py-2 rounded-xl text-sm font-extrabold text-[var(--primary-text)] border-2 border-[var(--line)] hover:shadow-[3px_3px_0px_0px_var(--line)] hover:-translate-y-0.5 transition-all bg-[var(--surface)]"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="inline-flex items-center gap-2 px-3 sm:px-5 py-2 rounded-xl text-sm font-extrabold text-black border-2 border-[var(--line)] bg-[var(--accent)] hover:shadow-[3px_3px_0px_0px_var(--line)] hover:-translate-y-0.5 hover:bg-[var(--accent-hover)] transition-all"
                  >
                    Sign Up
                  </Link>
                </>
              )}

              {isLanding && (
                <button
                  className="xl:hidden inline-flex items-center justify-center w-9 h-9 rounded-xl border-2 border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--accent)]/10 transition-all cursor-pointer"
                  onClick={() => setMobileOpen(!mobileOpen)}
                >
                  {mobileOpen ? <X className="w-4 h-4 text-[var(--primary-text)]" /> : <Menu className="w-4 h-4 text-[var(--primary-text)]" />}
                </button>
              )}
            </div>
          </div>
        </div>

        {authUser && !isLanding && !location.pathname.startsWith("/room") && (
          <nav className="xl:hidden bg-[var(--surface)] border-t-2 border-[var(--line)]/10">
            <div className="container mx-auto px-2 py-1.5 flex items-center gap-1 overflow-x-auto no-scrollbar">
              {appSections.map((section) => {
                const Icon = section.icon;
                const isActive = location.pathname === section.href;
                return (
                  <Link
                    key={section.label}
                    to={section.href}
                    className={`flex-1 min-w-[100px] inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border-2 transition-all ${
                      isActive
                        ? "bg-[var(--accent)] text-black border-[var(--line)] font-extrabold"
                        : "text-[var(--secondary-text)] border-[var(--line)]/20 hover:bg-[var(--accent)]/10 hover:text-[var(--primary-text)] hover:border-[var(--line)]/50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{section.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        )}

      {authUser && !isLanding && mobileAppOpen && (
        <nav className="xl:hidden bg-[var(--surface)] border-t-2 border-[var(--line)]/10 px-2 py-2 flex flex-col gap-1">
          {appSections.map((section) => {
            const Icon = section.icon;
            const isActive = location.pathname === section.href;
            return (
              <Link
                key={section.label}
                to={section.href}
                onClick={() => setMobileAppOpen(false)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${
                  isActive
                    ? "bg-[var(--accent)] text-black border-[var(--line)] font-extrabold"
                    : "text-[var(--primary-text)] border-transparent hover:border-[var(--line)] hover:bg-[var(--accent)]/10"
                }`}
              >
                <Icon className="w-4 h-4" />
                {section.label}
              </Link>
            );
          })}
          <div className="my-1 border-t-2 border-[var(--line)]/10" />
          <Link
            to="/settings"
            onClick={() => setMobileAppOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-bold text-[var(--primary-text)] border-2 border-transparent hover:border-[var(--line)] hover:bg-[var(--accent)]/10 transition-all"
          >
            <Settings className="w-4 h-4" />
            Settings
          </Link>
          <Link
            to="/profile"
            onClick={() => setMobileAppOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-bold text-[var(--primary-text)] border-2 border-transparent hover:border-[var(--line)] hover:bg-[var(--accent)]/10 transition-all"
          >
            <User className="w-4 h-4" />
            Profile
          </Link>
          <button
            onClick={() => { setMobileAppOpen(false); setShowLogout(true); }}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-bold text-red-500 border-2 border-red-500/40 bg-red-500/10 hover:bg-red-500/20 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </nav>
      )}

      {isLanding && mobileOpen && (
        <nav className="xl:hidden bg-[var(--surface)] border-t-2 border-[var(--line)]/10 px-2 py-2 flex flex-col gap-1">
          {landingLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="px-4 py-2.5 rounded-xl text-sm font-bold text-[var(--primary-text)] border-2 border-transparent hover:border-[var(--line)] hover:bg-[var(--accent)]/10 transition-all"
            >
              {link.label}
            </a>
          ))}
        </nav>
      )}
      </header>

      <LogoutModal isOpen={showLogout} onClose={() => setShowLogout(false)} onConfirm={() => { setShowLogout(false); logout(); }} />
    </>
  );
};
export default Navbar;
