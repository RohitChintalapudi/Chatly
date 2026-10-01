import { useState, useMemo } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Eye, EyeOff, Loader2, Lock, Mail, User, ArrowRight, Sparkles, Check } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import AuthBackgroundBubbles from "../components/auth/AuthBackgroundBubbles";

const containerVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.35,
      ease: [0.16, 1, 0.3, 1],
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 28,
    },
  },
};

const SignUpPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const { signup, isSigningUp } = useAuthStore();

  // Dynamic Password Strength Meter
  const passwordStrength = useMemo(() => {
    const pass = formData.password;
    if (!pass) return { score: 0, label: "", color: "bg-transparent" };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    switch (score) {
      case 1:
        return { score: 25, label: "Weak", color: "bg-red-500", text: "text-red-500" };
      case 2:
        return { score: 50, label: "Fair", color: "bg-amber-500", text: "text-amber-500" };
      case 3:
        return { score: 75, label: "Strong", color: "bg-emerald-500", text: "text-emerald-500" };
      case 4:
        return { score: 100, label: "Unbreakable 🛡️", color: "bg-cyan-400", text: "text-cyan-500" };
      default:
        return { score: 15, label: "Too short", color: "bg-red-400", text: "text-red-400" };
    }
  }, [formData.password]);

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
    if (validateForm() !== true) return;
    const registered = await signup(formData);
    if (registered) {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--surface)] flex items-center justify-center relative overflow-y-auto px-4 pt-24 pb-12 transition-colors">
      {/* Dynamic Theme-Reactive Floating Background Bubbles */}
      <AuthBackgroundBubbles />

      {/* Main Centered Card Container */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md relative z-10 my-auto"
      >
        <div className="bg-[var(--surface)] rounded-3xl border-2 border-[var(--line)] p-6 sm:p-8 shadow-[6px_6px_0px_0px_var(--line)] space-y-5 transition-all">
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center space-y-1.5">
            <Link
              to="/"
              className="inline-flex items-center justify-center group mb-1 hover:scale-105 transition-transform"
            >
              <img
                src="/chatly-logo.png"
                alt="Chatly Logo"
                className="w-11 h-11 object-contain rounded-xl drop-shadow-sm"
              />
            </Link>
            <div className="flex items-center justify-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-[var(--accent)]">
              <Sparkles className="size-3 text-[var(--accent)]" />
              <span>Get Started Free</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--primary-text)] tracking-tight">
              Create Account
            </h1>
            <p className="text-xs text-[var(--secondary-text)] font-semibold">
              Join the Chatly network with instant peer-to-peer connection
            </p>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Full Name */}
            <motion.div variants={itemVariants} className="space-y-1">
              <label className="text-xs font-bold text-[var(--primary-text)]">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--secondary-text)]">
                  <User className="size-4" />
                </div>
                <input
                  type="text"
                  autoComplete="name"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border-2 border-[var(--line)] bg-[var(--surface-muted)] text-[var(--primary-text)] font-medium text-sm placeholder:text-[var(--secondary-text)]/50 focus:outline-none focus:border-[var(--accent)] focus:bg-[var(--surface)] transition-colors"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>
            </motion.div>

            {/* Email */}
            <motion.div variants={itemVariants} className="space-y-1">
              <label className="text-xs font-bold text-[var(--primary-text)]">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--secondary-text)]">
                  <Mail className="size-4" />
                </div>
                <input
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border-2 border-[var(--line)] bg-[var(--surface-muted)] text-[var(--primary-text)] font-medium text-sm placeholder:text-[var(--secondary-text)]/50 focus:outline-none focus:border-[var(--accent)] focus:bg-[var(--surface)] transition-colors"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </motion.div>

            {/* Password */}
            <motion.div variants={itemVariants} className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[var(--primary-text)]">Password</label>
                {formData.password.length > 0 && (
                  <span className={`text-[10px] font-black uppercase tracking-wider ${passwordStrength.text}`}>
                    {passwordStrength.label}
                  </span>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--secondary-text)]">
                  <Lock className="size-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border-2 border-[var(--line)] bg-[var(--surface-muted)] text-[var(--primary-text)] font-medium text-sm placeholder:text-[var(--secondary-text)]/50 focus:outline-none focus:border-[var(--accent)] focus:bg-[var(--surface)] transition-colors"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[var(--secondary-text)] hover:text-[var(--primary-text)] transition-colors cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>

              {/* Strength Progress Indicator */}
              {formData.password.length > 0 && (
                <div className="space-y-1 pt-1">
                  <div className="w-full h-1 bg-[var(--line)]/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${passwordStrength.score}%` }}
                      transition={{ duration: 0.2 }}
                      className={`h-full ${passwordStrength.color}`}
                    />
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-semibold text-[var(--secondary-text)]">
                    <span className={`flex items-center gap-1 ${formData.password.length >= 6 ? "text-emerald-500 font-bold" : ""}`}>
                      <Check className="size-3 stroke-[3]" /> 6+ chars
                    </span>
                    <span className={`flex items-center gap-1 ${/[0-9]/.test(formData.password) ? "text-emerald-500 font-bold" : ""}`}>
                      <Check className="size-3 stroke-[3]" /> Contains number
                    </span>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Submit Button */}
            <motion.div variants={itemVariants} className="pt-2">
              <motion.button
                type="submit"
                disabled={isSigningUp}
                whileHover={{ scale: 1.01, translateY: -1 }}
                whileTap={{ scale: 0.98, translateY: 1 }}
                className="w-full group inline-flex items-center justify-center gap-2 bg-[var(--accent)] text-black py-3 rounded-2xl font-black text-sm border-2 border-[var(--line)] shadow-[3px_3px_0px_0px_var(--line)] hover:shadow-[1px_1px_0px_0px_var(--line)] hover:translate-x-[1px] hover:translate-y-[1px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSigningUp ? (
                  <>
                    <Loader2 className="size-4 animate-spin stroke-[2.5]" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="size-4 stroke-[2.5] group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </motion.button>
            </motion.div>
          </form>

          {/* Switch Link */}
          <motion.div variants={itemVariants} className="text-center pt-3 border-t border-[var(--line)]/15">
            <p className="text-[var(--secondary-text)] text-xs font-semibold">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-[var(--primary-text)] font-black underline underline-offset-2 hover:text-[var(--accent)] transition-colors"
              >
                Sign in
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default SignUpPage;
