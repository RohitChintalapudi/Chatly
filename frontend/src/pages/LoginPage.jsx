import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, Lock, Mail, ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

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
    <div className="min-h-screen bg-[var(--surface)] flex items-center justify-center relative overflow-y-auto px-4 pt-24 pb-12 transition-colors">
      {/* Subtle Floating Ambient Background Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-72 h-72 rounded-full bg-[var(--accent)]/10 blur-[100px] top-[15%] left-[10%] animate-float" />
        <div className="absolute w-80 h-80 rounded-full bg-[var(--accent)]/8 blur-[120px] bottom-[15%] right-[10%] animate-float-slow" />
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
          style={{
            backgroundImage: `radial-gradient(var(--line) 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />
      </div>

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
              <span>Welcome Back</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--primary-text)] tracking-tight">
              Sign In to Chatly
            </h1>
            <p className="text-xs text-[var(--secondary-text)] font-semibold">
              Enter your credentials to continue your conversations
            </p>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Email Input */}
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

            {/* Password Input */}
            <motion.div variants={itemVariants} className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[var(--primary-text)]">Password</label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--secondary-text)]">
                  <Lock className="size-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
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
            </motion.div>

            {/* Submit Button */}
            <motion.div variants={itemVariants} className="pt-2">
              <motion.button
                type="submit"
                disabled={isLoggingIn}
                whileHover={{ scale: 1.01, translateY: -1 }}
                whileTap={{ scale: 0.98, translateY: 1 }}
                className="w-full group inline-flex items-center justify-center gap-2 bg-[var(--accent)] text-black py-3 rounded-2xl font-black text-sm border-2 border-[var(--line)] shadow-[3px_3px_0px_0px_var(--line)] hover:shadow-[1px_1px_0px_0px_var(--line)] hover:translate-x-[1px] hover:translate-y-[1px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="size-4 animate-spin stroke-[2.5]" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="size-4 stroke-[2.5] group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </motion.button>
            </motion.div>
          </form>

          {/* Switch Link */}
          <motion.div variants={itemVariants} className="text-center pt-3 border-t border-[var(--line)]/15">
            <p className="text-[var(--secondary-text)] text-xs font-semibold">
              Don&apos;t have an account?{" "}
              <Link
                to="/signup"
                className="text-[var(--primary-text)] font-black underline underline-offset-2 hover:text-[var(--accent)] transition-colors"
              >
                Create account
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
