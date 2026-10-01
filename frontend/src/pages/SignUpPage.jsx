import { useState, useMemo } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Eye, EyeOff, Loader2, Lock, Mail, User, ArrowRight, Sparkles, Check, ShieldCheck, Shield } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import AuthShowcasePattern from "../components/AuthImagePattern";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
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

const SignUpPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const { signup, isSigningUp } = useAuthStore();

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    const pass = formData.password;
    if (!pass) return { score: 0, label: "Empty", color: "bg-transparent" };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    switch (score) {
      case 1:
        return { score: 25, label: "Weak", color: "bg-red-500", text: "text-red-500" };
      case 2:
        return { score: 50, label: "Medium", color: "bg-amber-500", text: "text-amber-500" };
      case 3:
        return { score: 75, label: "Strong", color: "bg-emerald-500", text: "text-emerald-500" };
      case 4:
        return { score: 100, label: "Invincible 🛡️", color: "bg-cyan-400", text: "text-cyan-500" };
      default:
        return { score: 10, label: "Too short", color: "bg-red-400", text: "text-red-400" };
    }
  }, [formData.password]);

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      toast.error("Full name is required");
      return false;
    }
    if (!formData.email.trim()) {
      toast.error("Email is required");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error("Please enter a valid email format");
      return false;
    }
    if (!formData.password) {
      toast.error("Password is required");
      return false;
    }
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    const registered = await signup(formData);
    if (registered) {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--surface)] grid lg:grid-cols-2 relative overflow-hidden transition-colors">
      {/* Background Ambient Mesh & Dynamic Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.25, 1],
            x: [0, -25, 0],
            y: [0, 25, 0],
          }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-88 h-88 rounded-full bg-[var(--accent)]/15 blur-[120px] top-[15%] left-[10%]"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            x: [0, 30, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute w-96 h-96 rounded-full bg-[#00e5ff]/12 blur-[130px] bottom-[15%] right-[10%]"
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
            <motion.div variants={itemVariants} className="text-center mb-5">
              <Link
                to="/"
                className="inline-flex items-center justify-center group mb-2.5 relative"
              >
                <div className="absolute inset-0 bg-[var(--accent)] rounded-2xl blur-lg opacity-40 group-hover:opacity-80 transition-opacity" />
                <img
                  src="/chatly-logo.png"
                  alt="Chatly Logo"
                  className="size-13 sm:size-15 object-contain rounded-2xl border-2 border-[var(--line)] shadow-[3px_3px_0px_0px_var(--line)] group-hover:scale-105 group-hover:-rotate-2 transition-transform duration-200 relative z-10 bg-[var(--surface)]"
                />
              </Link>
              <div className="flex items-center justify-center gap-1.5 mb-1 text-[11px] font-black uppercase tracking-wider text-[var(--accent)]">
                <Sparkles className="size-3.5 animate-spin" style={{ animationDuration: "6s" }} />
                <span>Join Chatly Free</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[var(--primary-text)] tracking-tight">
                Create Account
              </h1>
              <p className="text-xs sm:text-sm text-[var(--secondary-text)] font-semibold mt-1">
                Unlock instant audio rooms, P2P beam, and mini games
              </p>
            </motion.div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Full Name */}
              <motion.div variants={itemVariants} className="space-y-1">
                <label className="text-xs font-black uppercase tracking-wider text-[var(--primary-text)] flex items-center justify-between">
                  <span>Full Name</span>
                  {focusedField === "fullName" && (
                    <span className="text-[10px] text-[var(--accent)] font-bold lowercase">active</span>
                  )}
                </label>
                <div className="relative">
                  <div
                    className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors ${
                      focusedField === "fullName" ? "text-[var(--accent)]" : "text-[var(--secondary-text)]"
                    }`}
                  >
                    <User className="size-4.5 stroke-[2.2]" />
                  </div>
                  <input
                    type="text"
                    autoComplete="name"
                    required
                    onFocus={() => setFocusedField("fullName")}
                    onBlur={() => setFocusedField(null)}
                    className="w-full pl-10 pr-3.5 py-2.5 sm:py-3 rounded-2xl border-2 border-[var(--line)] bg-[var(--surface-muted)] text-[var(--primary-text)] font-semibold text-sm placeholder:text-[var(--secondary-text)]/60 focus:outline-none focus:border-[var(--accent)] focus:bg-[var(--surface)] shadow-[2px_2px_0px_0px_var(--line)] focus:shadow-[4px_4px_0px_0px_var(--line)] transition-all duration-200"
                    placeholder="Alex Morgan"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                </div>
              </motion.div>

              {/* Email Input */}
              <motion.div variants={itemVariants} className="space-y-1">
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
                    className="w-full pl-10 pr-3.5 py-2.5 sm:py-3 rounded-2xl border-2 border-[var(--line)] bg-[var(--surface-muted)] text-[var(--primary-text)] font-semibold text-sm placeholder:text-[var(--secondary-text)]/60 focus:outline-none focus:border-[var(--accent)] focus:bg-[var(--surface)] shadow-[2px_2px_0px_0px_var(--line)] focus:shadow-[4px_4px_0px_0px_var(--line)] transition-all duration-200"
                    placeholder="alex@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </motion.div>

              {/* Password Input */}
              <motion.div variants={itemVariants} className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-[var(--primary-text)]">
                    Password
                  </label>
                  {formData.password.length > 0 && (
                    <span className={`text-[10px] font-black uppercase tracking-wider ${passwordStrength.text}`}>
                      {passwordStrength.label}
                    </span>
                  )}
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
                    autoComplete="new-password"
                    required
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    className="w-full pl-10 pr-11 py-2.5 sm:py-3 rounded-2xl border-2 border-[var(--line)] bg-[var(--surface-muted)] text-[var(--primary-text)] font-semibold text-sm placeholder:text-[var(--secondary-text)]/60 focus:outline-none focus:border-[var(--accent)] focus:bg-[var(--surface)] shadow-[2px_2px_0px_0px_var(--line)] focus:shadow-[4px_4px_0px_0px_var(--line)] transition-all duration-200"
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

                {/* Password Strength Meter Bar */}
                {formData.password.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <div className="w-full h-1.5 bg-[var(--surface-muted)] border border-[var(--line)]/30 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${passwordStrength.score}%` }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
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
                  className="w-full group inline-flex items-center justify-center gap-2 bg-[var(--accent)] text-black py-3.5 rounded-2xl font-black text-sm border-2 border-[var(--line)] shadow-[4px_4px_0px_0px_var(--line)] hover:shadow-[2px_2px_0px_0px_var(--line)] active:shadow-none transition-all duration-150 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSigningUp ? (
                    <>
                      <Loader2 className="size-4.5 animate-spin stroke-[3]" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Get Started Now</span>
                      <ArrowRight className="size-4 stroke-[3] group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </motion.button>
              </motion.div>
            </form>

            {/* Footer Links */}
            <motion.div variants={itemVariants} className="text-center mt-5 pt-3.5 border-t border-[var(--line)]/20">
              <p className="text-[var(--secondary-text)] text-xs sm:text-sm font-semibold">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-[var(--primary-text)] font-black underline underline-offset-4 decoration-2 decoration-[var(--accent)] hover:text-[var(--accent)] transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </motion.div>
          </div>

          {/* Quick Features Badge */}
          <motion.div
            variants={itemVariants}
            className="mt-5 flex items-center justify-center gap-2 text-xs font-bold text-[var(--secondary-text)]"
          >
            <ShieldCheck className="size-3.5 text-emerald-500" />
            <span>Zero Tracking &bull; Free Forever &bull; Instant Setup</span>
          </motion.div>
        </motion.div>
      </div>

      {/* Right Feature Showcase Pattern on Desktop */}
      <AuthShowcasePattern
        title="Arcade, Voice & Seamless Mesh"
        subtitle="Chat with friends, spin up spatial audio rooms, challenge each other in mini games, and beam files directly."
        mode="signup"
      />
    </div>
  );
};

export default SignUpPage;
