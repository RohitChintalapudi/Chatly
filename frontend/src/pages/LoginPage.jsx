import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare, ArrowRight } from "lucide-react";

const LoginPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const { login, isLoggingIn } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(formData);
    if (success) {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--surface)] flex items-center justify-center relative overflow-y-auto px-4 pt-24 pb-8">
      {/* Floating Bubbles */}
      <div className="absolute w-40 h-40 rounded-full bg-[var(--accent)] opacity-8 border-2 border-[var(--line)] top-[10%] left-[5%] animate-float pointer-events-none" />
      <div className="absolute w-24 h-24 rounded-full bg-[var(--accent)] opacity-6 border-2 border-[var(--line)] bottom-[15%] right-[8%] animate-float-slow pointer-events-none" />
      <div className="absolute w-16 h-16 rounded-full bg-[var(--accent)] opacity-5 border-2 border-[var(--line)] top-[20%] right-[20%] animate-float pointer-events-none" style={{ animationDelay: "2s" }} />
      <div className="absolute w-20 h-20 rounded-full bg-[var(--accent)] opacity-6 border-2 border-[var(--line)] bottom-[25%] left-[15%] animate-float pointer-events-none" style={{ animationDelay: "1s" }} />

      {/* Glow behind card */}
      <div className="absolute w-[500px] h-[500px] bg-[var(--accent)] opacity-10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-sm relative my-auto">
        {/* Card */}
        <div className="bg-[var(--surface)] rounded-3xl border-2 border-[var(--line)] p-6 sm:p-7 shadow-[0_0_40px_color-mix(in_srgb,var(--accent)_15%,transparent)]">
          {/* Logo */}
          <div className="text-center mb-4 sm:mb-5">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-2.5">
              <div className="w-12 h-12 rounded-xl bg-[var(--accent)] border-2 border-[var(--line)] flex items-center justify-center shadow-[3px_3px_0px_0px_var(--line)]">
                <MessageSquare className="w-6 h-6 text-[var(--primary-text)]" strokeWidth={2.5} />
              </div>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--primary-text)]">Welcome Back</h1>
            <p className="text-xs sm:text-sm text-[var(--secondary-text)] font-medium mt-0.5">Sign in to your account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
            <div className="space-y-1">
              <label className="text-xs sm:text-sm font-extrabold text-[var(--primary-text)]">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4.5 w-4.5 text-[var(--secondary-text)]" />
                </div>
                <input
                  type="email"
                  autoComplete="email"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border-2 border-[var(--line)] bg-[var(--surface)] text-[var(--primary-text)] font-medium text-sm placeholder:text-[var(--secondary-text)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs sm:text-sm font-extrabold text-[var(--primary-text)]">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4.5 w-4.5 text-[var(--secondary-text)]" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border-2 border-[var(--line)] bg-[var(--surface)] text-[var(--primary-text)] font-medium text-sm placeholder:text-[var(--secondary-text)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4.5 w-4.5 text-[var(--secondary-text)]" />
                  ) : (
                    <Eye className="h-4.5 w-4.5 text-[var(--secondary-text)]" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full group inline-flex items-center justify-center gap-2 bg-[var(--accent)] text-[var(--primary-text)] py-2.5 sm:py-3 mt-1 rounded-xl font-extrabold text-sm border-2 border-[var(--line)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-[var(--accent-hover)] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="text-center mt-4 sm:mt-5">
            <p className="text-[var(--secondary-text)] text-xs sm:text-sm font-medium">
              Don&apos;t have an account?{" "}
              <Link to="/signup" className="text-[var(--primary-text)] font-extrabold hover:text-[var(--accent)] transition-colors">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default LoginPage;
