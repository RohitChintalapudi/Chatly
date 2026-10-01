import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, Lock, Mail, ArrowRight, Sparkles, Shield, Radio, Zap } from "lucide-react";
import { motion } from "framer-motion";
import AuthShowcasePattern from "../components/AuthImagePattern";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
    },
  },
};

const LoginPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
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
    <div className="min-h-screen bg-[var(--surface)] grid lg:grid-cols-2 relative overflow-hidden transition-colors">
      {/* Background Neon Glow Mesh & Ambient Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 20, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-80 h-80 rounded-full bg-[var(--accent)]/15 blur-[120px] top-[10%] left-[5%]"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -30, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute w-96 h-96 rounded-full bg-[#00e5ff]/10 blur-[130px] bottom-[10%] right-[5%]"
        />
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
          style={{
            backgroundImage: `radial-gradient(var(--line) 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      {/* Left Form Section */}
      <div className="flex flex-col items-center justify-center p-4 sm:p-8 lg:p-12 z-10 pt-24 pb-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md"
        >
          {/* Main Form Card */}
          <div className="bg-[var(--surface)] rounded-3xl border-2 border-[var(--line)] p-6 sm:p-8 shadow-[8px_8px_0px_0px_var(--line)] relative transition-all duration-300">
            {/* Header / Logo */}
            <motion.div variants={itemVariants} className="text-center mb-6">
              <Link
                to="/"
                className="inline-flex items-center justify-center group mb-3 relative"
              >
                <div className="absolute inset-0 bg-[var(--accent)] rounded-2xl blur-lg opacity-40 group-hover:opacity-80 transition-opacity" />
                <img
                  src="/chatly-logo.png"
                  alt="Chatly Logo"
                  className="size-14 sm:size-16 object-contain rounded-2xl border-2 border-[var(--line)] shadow-[3px_3px_0px_0px_var(--line)] group-hover:scale-105 group-hover:-rotate-2 transition-transform duration-200 relative z-10 bg-[var(--surface)]"
                />
              </Link>
              <div className="flex items-center justify-center gap-1.5 mb-1 text-[11px] font-black uppercase tracking-wider text-[var(--accent)]">
                <Sparkles className="size-3.5 animate-spin" style={{ animationDuration: "6s" }} />
                <span>Chatly Portal</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[var(--primary-text)] tracking-tight">
                Welcome Back
              </h1>
              <p className="text-xs sm:text-sm text-[var(--secondary-text)] font-semibold mt-1">
                Enter your credentials to access the ecosystem
              </p>
            </motion.div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <motion.div variants={itemVariants} className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-[var(--primary-text)] flex items-center justify-between">
                  <span>Email Address</span>
                  {focusedField === "email" && (
                    <span className="text-[10px] text-[var(--accent)] font-bold lowercase">active</span>
                  )}
                </label>
                <div className="relative">
                  <div
                    className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors ${
                      focusedField === "email" ? "text-[var(--accent)]" : "text-[var(--secondary-text)]"
                    }`}
                  >
                    <Mail className="size-4.5 stroke-[2.2]" />
                  </div>
                  <input
                    type="email"
                    autoComplete="email"
                    required
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    className="w-full pl-10 pr-3.5 py-3 rounded-2xl border-2 border-[var(--line)] bg-[var(--surface-muted)] text-[var(--primary-text)] font-semibold text-sm placeholder:text-[var(--secondary-text)]/60 focus:outline-none focus:border-[var(--accent)] focus:bg-[var(--surface)] shadow-[2px_2px_0px_0px_var(--line)] focus:shadow-[4px_4px_0px_0px_var(--line)] transition-all duration-200"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </motion.div>

              {/* Password Input */}
              <motion.div variants={itemVariants} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-[var(--primary-text)]">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <div
                    className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors ${
                      focusedField === "password" ? "text-[var(--accent)]" : "text-[var(--secondary-text)]"
                    }`}
                  >
                    <Lock className="size-4.5 stroke-[2.2]" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    className="w-full pl-10 pr-11 py-3 rounded-2xl border-2 border-[var(--line)] bg-[var(--surface-muted)] text-[var(--primary-text)] font-semibold text-sm placeholder:text-[var(--secondary-text)]/60 focus:outline-none focus:border-[var(--accent)] focus:bg-[var(--surface)] shadow-[2px_2px_0px_0px_var(--line)] focus:shadow-[4px_4px_0px_0px_var(--line)] transition-all duration-200"
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
                    {showPassword ? (
                      <EyeOff className="size-4.5 stroke-[2.2]" />
                    ) : (
                      <Eye className="size-4.5 stroke-[2.2]" />
                    )}
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
                  className="w-full group inline-flex items-center justify-center gap-2 bg-[var(--accent)] text-black py-3.5 rounded-2xl font-black text-sm border-2 border-[var(--line)] shadow-[4px_4px_0px_0px_var(--line)] hover:shadow-[2px_2px_0px_0px_var(--line)] active:shadow-none transition-all duration-150 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="size-4.5 animate-spin stroke-[3]" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to Chatly</span>
                      <ArrowRight className="size-4 stroke-[3] group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </motion.button>
              </motion.div>
            </form>

            {/* Footer Links */}
            <motion.div variants={itemVariants} className="text-center mt-6 pt-4 border-t border-[var(--line)]/20">
              <p className="text-[var(--secondary-text)] text-xs sm:text-sm font-semibold">
                Don&apos;t have an account yet?{" "}
                <Link
                  to="/signup"
                  className="text-[var(--primary-text)] font-black underline underline-offset-4 decoration-2 decoration-[var(--accent)] hover:text-[var(--accent)] transition-colors"
                >
                  Create an account
                </Link>
              </p>
            </motion.div>
          </div>

          {/* Quick Security Guarantee Badge */}
          <motion.div
            variants={itemVariants}
            className="mt-6 flex items-center justify-center gap-2 text-xs font-bold text-[var(--secondary-text)]"
          >
            <Shield className="size-3.5 text-emerald-500" />
            <span>End-to-End Encrypted &bull; Decentralized Mesh</span>
          </motion.div>
        </motion.div>
      </div>

      {/* Right Feature Showcase Pattern on Desktop */}
      <AuthShowcasePattern
        title="Instant Beam & Spatial Voice"
        subtitle="Experience peer-to-peer file transfers and lag-free audio rooms built for modern creators."
        mode="signin"
      />
    </div>
  );
};

export default LoginPage;
