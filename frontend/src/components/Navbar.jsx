import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "../store/useThemeStore";
import { LogOut, MessageSquare, Settings, User, Menu, X, Sun, Moon, Phone, Radio, Share2 } from "lucide-react";
import { useState, useEffect } from "react";

const landingLinks = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "Feedback", href: "#feedback" },
  { label: "Contact", href: "#contact" },
];

const appSections = [
  { label: "Chat", href: "/", icon: MessageSquare },
  { label: "Audio Rooms", href: "/audio-rooms", icon: Radio },
  { label: "File Transfer", href: "/test-p2p", icon: Share2 },
];

const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
      return () => cancelAnimationFrame(raf);
    } else if (mounted) {
      setVisible(false);
      const timer = setTimeout(() => setMounted(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-500 ease-out ${
        visible ? "bg-black/60 backdrop-blur-sm" : "bg-black/0 backdrop-blur-0"
      }`}
      onClick={onClose}
    >
      <div
        className={`bg-[var(--surface)] border-2 border-[var(--line)] rounded-2xl p-6 w-[90%] max-w-sm shadow-[6px_6px_0px_0px_var(--line)] transition-all duration-500 ease-out ${
          visible ? "opacity-100 scale-100" : "opacity-0 scale-90"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-12 rounded-xl bg-red-500/15 border-2 border-red-500 flex items-center justify-center mb-4">
          <LogOut className="w-6 h-6 text-red-500" />
        </div>
        <h3 className="text-lg font-extrabold text-[var(--primary-text)]">Log out?</h3>
        <p className="text-sm text-[var(--secondary-text)] font-medium mt-1">Are you sure you want to log out of your account?</p>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border-2 border-[var(--line)] bg-[var(--surface-muted)] text-[var(--primary-text)] font-bold text-sm hover:shadow-[2px_2px_0px_0px_var(--line)] hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-xl border-2 border-red-500 bg-red-500 text-white font-extrabold text-sm hover:shadow-[3px_3px_0px_0px_rgba(239,68,68,0.5)] hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
};

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const location = useLocation();
  const isLanding = location.pathname === "/" && !authUser;

  return (
    <>
      <header className="bg-[var(--surface)] border-b-2 border-[var(--line)] fixed w-full top-0 z-40 transition-colors">
        <div className="container mx-auto px-4 h-16">
          <div className="flex items-center justify-between h-full">
            <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-all">
              <div className="size-9 rounded-xl bg-[var(--accent)] border-2 border-[var(--line)] flex items-center justify-center transition-colors">
                <MessageSquare className="w-5 h-5 text-[var(--primary-text)]" strokeWidth={2.5} />
              </div>
              <h1 className="text-lg font-extrabold text-[var(--primary-text)] transition-colors">Chatly</h1>
            </Link>

            {isLanding && (
              <nav className="hidden lg:flex items-center gap-1">
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
              <nav className="hidden lg:flex items-center gap-1">
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
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-[var(--primary-text)] border-2 border-[var(--line)] hover:shadow-[3px_3px_0px_0px_var(--line)] hover:-translate-y-0.5 transition-all bg-[var(--surface)]"
                  >
                    <Settings className="w-4 h-4" />
                    <span className="hidden sm:inline">Settings</span>
                  </Link>
                  <Link
                    to="/profile"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-[var(--primary-text)] border-2 border-[var(--line)] hover:shadow-[3px_3px_0px_0px_var(--line)] hover:-translate-y-0.5 transition-all bg-[var(--surface)]"
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">Profile</span>
                  </Link>
                  <button
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-red-500 border-2 border-red-500/40 bg-red-500/10 hover:shadow-[3px_3px_0px_0px_rgba(239,68,68,0.3)] hover:-translate-y-0.5 hover:bg-red-500/20 transition-all cursor-pointer"
                    onClick={() => setShowLogout(true)}
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-extrabold text-[var(--primary-text)] border-2 border-[var(--line)] hover:shadow-[3px_3px_0px_0px_var(--line)] hover:-translate-y-0.5 transition-all bg-[var(--surface)]"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-extrabold text-black border-2 border-[var(--line)] bg-[var(--accent)] hover:shadow-[3px_3px_0px_0px_var(--line)] hover:-translate-y-0.5 hover:bg-[var(--accent-hover)] transition-all"
                  >
                    Sign Up
                  </Link>
                </>
              )}

              {isLanding && (
                <button
                  className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-xl border-2 border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--accent)]/10 transition-all cursor-pointer"
                  onClick={() => setMobileOpen(!mobileOpen)}
                >
                  {mobileOpen ? <X className="w-4 h-4 text-[var(--primary-text)]" /> : <Menu className="w-4 h-4 text-[var(--primary-text)]" />}
                </button>
              )}
            </div>
          </div>

          {isLanding && mobileOpen && (
            <nav className="lg:hidden pb-4 flex flex-col gap-1 border-t-2 border-[var(--line)]/10 pt-3">
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
        </div>
      </header>
      <LogoutModal isOpen={showLogout} onClose={() => setShowLogout(false)} onConfirm={() => { setShowLogout(false); logout(); }} />
    </>
  );
};
export default Navbar;
