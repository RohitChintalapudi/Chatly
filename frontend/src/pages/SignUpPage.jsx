import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare, User, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const { signup, isSigningUp } = useAuthStore();
  const navigate = useNavigate();

  const validateForm = () => {
    if (!formData.fullName.trim()) return toast.error("Full name is required");
    if (!formData.email.trim()) return toast.error("Email is required");
    if (!/\S+@\S+\.\S+/.test(formData.email)) return toast.error("Invalid email format");
    if (!formData.password) return toast.error("Password is required");
    if (formData.password.length < 6) return toast.error("Password must be at least 6 characters");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = validateForm();
    if (success === true) {
      const registered = await signup(formData);
      if (registered) {
        navigate("/");
        useAuthStore.getState().connectSocket();
      }
    }
  };

  return (
    <div className="min-h-screen bg-[var(--surface)] flex items-start justify-center relative overflow-hidden px-4 pt-24 pb-10">
      {/* Floating Bubbles */}
      <div className="absolute w-40 h-40 rounded-full bg-[var(--accent)] opacity-8 border-2 border-[var(--line)] top-[10%] left-[5%] animate-float" />
      <div className="absolute w-24 h-24 rounded-full bg-[var(--accent)] opacity-6 border-2 border-[var(--line)] bottom-[15%] right-[8%] animate-float-slow" />
      <div className="absolute w-16 h-16 rounded-full bg-[var(--accent)] opacity-5 border-2 border-[var(--line)] top-[20%] right-[20%] animate-float" style={{ animationDelay: "2s" }} />
      <div className="absolute w-20 h-20 rounded-full bg-[var(--accent)] opacity-6 border-2 border-[var(--line)] bottom-[25%] left-[15%] animate-float" style={{ animationDelay: "1s" }} />

      {/* Glow behind card */}
      <div className="absolute w-[500px] h-[500px] bg-[var(--accent)] opacity-10 blur-[120px] rounded-full" />

      <div className="w-full max-w-sm relative mt-12">
        {/* Card */}
        <div className="bg-[var(--surface)] rounded-3xl border-2 border-[var(--line)] p-8 shadow-[0_0_40px_color-mix(in_srgb,var(--accent)_15%,transparent)]">
          {/* Logo */}
          <div className="text-center mb-6">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--accent)] border-2 border-[var(--line)] flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-[var(--primary-text)]" strokeWidth={2.5} />
              </div>
            </Link>
            <h1 className="text-3xl font-extrabold text-[var(--primary-text)]">Create Account</h1>
            <p className="text-[var(--secondary-text)] font-medium mt-1">Get started with your free account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-extrabold text-[var(--primary-text)]">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-[var(--secondary-text)]" />
                </div>
                <input
                  type="text"
                  autoComplete="name"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-[var(--line)] bg-[var(--surface)] text-[var(--primary-text)] font-medium placeholder:text-[var(--secondary-text)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-extrabold text-[var(--primary-text)]">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-[var(--secondary-text)]" />
                </div>
                <input
                  type="email"
                  autoComplete="email"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-[var(--line)] bg-[var(--surface)] text-[var(--primary-text)] font-medium placeholder:text-[var(--secondary-text)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-extrabold text-[var(--primary-text)]">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-[var(--secondary-text)]" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  className="w-full pl-11 pr-12 py-3 rounded-xl border-2 border-[var(--line)] bg-[var(--surface)] text-[var(--primary-text)] font-medium placeholder:text-[var(--secondary-text)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-[var(--secondary-text)]" />
                  ) : (
                    <Eye className="h-5 w-5 text-[var(--secondary-text)]" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full group inline-flex items-center justify-center gap-2 bg-[var(--accent)] text-[var(--primary-text)] py-3 rounded-xl font-extrabold text-sm border-2 border-[var(--line)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-[var(--accent-hover)] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={isSigningUp}
            >
              {isSigningUp ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-[var(--secondary-text)] text-sm font-medium">
              Already have an account?{" "}
              <Link to="/login" className="text-[var(--primary-text)] font-extrabold hover:text-[var(--accent)] transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SignUpPage;
