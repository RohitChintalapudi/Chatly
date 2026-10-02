import React, { memo, useState } from "react";
import { Link } from "react-router-dom";
import {
  MessageSquare,
  Zap,
  Shield,
  Users,
  Sparkles,
  ArrowRight,
  Send,
  Mail,
  Star,
  Quote,
  Globe,
  Smartphone,
  Loader2,
  Share2,
  Gamepad2,
  Radio,
  Trophy,
  Flame,
  Github,
  Twitter,
  Instagram,
  Youtube,
  Linkedin,
} from "lucide-react";
import SectionDivider from "../components/SectionDivider";
import CylinderCarousel from "../components/CylinderCarousel";
import ProjectFolder from "../components/ProjectFolder";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const FloatingBubble = ({ size, left, top, delay, duration }) => (
  <div
    className="absolute rounded-full animate-float"
    style={{
      width: size,
      height: size,
      left: left,
      top: top,
      background: "var(--accent)",
      opacity: 0.08,
      border: "2px solid var(--line)",
      animationDelay: delay,
      animationDuration: duration,
    }}
  />
);

const CORE_FEATURES = [
  {
    icon: Gamepad2,
    badgeColor: "bg-purple-500/15 text-purple-500 border-purple-500/30",
    iconBg: "bg-purple-500",
    tag: "ARCADE+",
    title: "Mini Games Arcade",
    description: "Play retro favorites like Flappy Bird and Snake directly inside your chat. Compete on leaderboards with 8-bit retro sound effects!",
    highlights: ["🕹️ Flappy & Snake", "🏆 High Scores", "⚔️ 1v1 Challenges"],
    metric: "Instant Play in Chat",
  },
  {
    icon: Share2,
    badgeColor: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
    iconBg: "bg-emerald-500",
    tag: "P2P DIRECT",
    title: "P2P File Transfer",
    description: "Transfer any file format up to 1GB directly browser-to-browser via WebRTC with zero server storage limits.",
    highlights: ["⚡ WebRTC Direct", "📦 Up to 1GB", "🔒 End-to-End Private"],
    metric: "0 Cloud Upload Delay",
  },
  {
    icon: Radio,
    badgeColor: "bg-pink-500/15 text-pink-500 border-pink-500/30",
    iconBg: "bg-pink-500",
    tag: "SPATIAL AUDIO",
    title: "Live Audio Lounges",
    description: "Drop in and talk with low-latency spatial audio rooms for teams, friends, gaming squads, and chillouts.",
    highlights: ["🎙️ Multi-User Voice", "👑 Host Controls", "🔊 Spatial Sound"],
    metric: "Live Room Mesh",
  },
  {
    icon: Zap,
    badgeColor: "bg-amber-500/15 text-amber-500 border-amber-500/30",
    iconBg: "bg-amber-500",
    tag: "WEBSOCKETS",
    title: "Lightning Fast Chat",
    description: "Messages delivered in real-time with WebSocket technology. Instant updates, typing indicators, and zero delays.",
    highlights: ["⚡ <10ms Latency", "✍️ Live Typing", "🟢 Online Status"],
    metric: "Bi-directional Stream",
  },
  {
    icon: Shield,
    badgeColor: "bg-cyan-500/15 text-cyan-500 border-cyan-500/30",
    iconBg: "bg-cyan-500",
    tag: "E2E ENCRYPTED",
    title: "Private & Secure",
    description: "Your conversations stay protected. 6-digit connect codes, JWT authentication, and private 1-on-1 direct messaging.",
    highlights: ["🔐 6-Digit Codes", "🛡️ JWT Auth", "🚫 Zero Stranger Spam"],
    metric: "Protected Direct Mesh",
  },
  {
    icon: Globe,
    badgeColor: "bg-blue-500/15 text-blue-500 border-blue-500/30",
    iconBg: "bg-blue-500",
    tag: "CROSS-PLATFORM",
    title: "Works Everywhere",
    description: "Access Chatly from any device. Responsive design that feels fast and native on desktop, tablet, or phone.",
    highlights: ["📱 Mobile Ready", "💻 Desktop Power", "🎨 8 Dynamic Themes"],
    metric: "Zero Install Needed",
  },
];

const CylinderFeatureCard = React.memo(({
  icon: Icon,
  tag,
  title,
  description,
  badgeColor = "bg-[var(--accent)]/15 text-[var(--primary-text)] border-[var(--line)]",
  iconBg = "bg-[var(--accent)]",
  highlights = [],
  metric = "Live Feature",
}) => (
  <div className="w-full h-full bg-[var(--surface)] rounded-3xl p-6 border-2 border-[var(--line)] shadow-[6px_6px_0px_0px_var(--line)] flex flex-col justify-between select-none relative overflow-hidden group hover:border-[var(--accent)] transition-[border-color,box-shadow] duration-150">
    {/* Top Header */}
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className={`size-12 rounded-2xl ${iconBg} border-2 border-[var(--line)] flex items-center justify-center shadow-[3px_3px_0px_0px_var(--line)]`}>
          <Icon className="size-6 text-white stroke-[2.5]" />
        </div>
        {tag && (
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-black uppercase tracking-wider border ${badgeColor} shadow-sm`}>
            {tag}
          </span>
        )}
      </div>

      <h3 className="text-xl font-black text-[var(--primary-text)] mb-2 font-mono tracking-tight group-hover:text-[var(--accent)] transition-colors">
        {title}
      </h3>

      <p className="text-xs text-[var(--secondary-text)] leading-relaxed font-medium line-clamp-3 mb-4">
        {description}
      </p>

      {/* Feature Highlights Pills */}
      {highlights.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {highlights.map((h, i) => (
            <span
              key={i}
              className="px-2 py-0.5 rounded-lg bg-[var(--surface-muted)] border border-[var(--line)]/30 text-[10px] font-mono font-bold text-[var(--primary-text)] shadow-xs"
            >
              {h}
            </span>
          ))}
        </div>
      )}
    </div>

    {/* Bottom Status Footer */}
    <div className="pt-3 mt-3 border-t-2 border-dashed border-[var(--line)]/20 flex items-center justify-between text-[11px] font-mono font-bold">
      <span className="text-[var(--secondary-text)] truncate text-[10px]">{metric}</span>
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-green-500/10 text-green-500 border border-green-500/30 text-[10px] font-black uppercase shrink-0">
        <span className="size-1.5 rounded-full bg-green-500 animate-pulse" />
        ACTIVE
      </span>
    </div>
  </div>
));

const FeatureCard = ({ icon: Icon, title, description, delay }) => (
  <div
    className="animate-fade-in-up opacity-0 bg-[var(--surface)] rounded-3xl p-8 border-2 border-[var(--line)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] cursor-default"
    style={{ animationDelay: delay, animationFillMode: "forwards" }}
  >
    <div className="w-14 h-14 rounded-2xl bg-[var(--accent)] border-2 border-[var(--line)] flex items-center justify-center mb-5">
      <Icon className="w-7 h-7 text-[var(--primary-text)]" strokeWidth={2.5} />
    </div>
    <h3 className="text-xl font-extrabold text-[var(--primary-text)] mb-3">{title}</h3>
    <p className="text-[var(--secondary-text)] leading-relaxed font-medium">{description}</p>
  </div>
);

const ChatBubblePreview = ({ text, delay, align }) => (
  <div
    className={`animate-fade-in-up opacity-0 flex ${align === "right" ? "justify-end" : "justify-start"}`}
    style={{ animationDelay: delay, animationFillMode: "forwards" }}
  >
    <div
      className={`px-5 py-3 rounded-2xl max-w-[240px] text-sm font-semibold border-2 border-[var(--line)] ${
        align === "right"
          ? "bg-[var(--accent)] text-[var(--primary-text)] rounded-br-md"
          : "bg-[var(--surface)] text-[var(--primary-text)] rounded-bl-md"
      }`}
    >
      {text}
    </div>
  </div>
);

const TESTIMONIAL_FOLDERS = [
  {
    id: "folder-design-ux",
    title: "Design & UX Stories",
    description: "Designers & Founders",
    previews: [
      {
        id: "priya-sharma",
        content: (
          <div className="flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-4 fill-[var(--accent)] text-[var(--primary-text)]" />
                ))}
              </div>
              <Quote className="size-6 text-[var(--accent)] mb-2" />
              <p className="text-xs sm:text-sm font-medium text-[var(--secondary-text)] leading-relaxed">
                "Chatly completely changed how our team communicates. The real-time experience is buttery smooth!"
              </p>
            </div>
            <div className="flex items-center gap-3 pt-3 mt-3 border-t-2 border-[var(--line)]/10">
              <div className="size-8 rounded-full bg-[var(--accent)] border-2 border-[var(--line)] flex items-center justify-center font-black text-xs">
                P
              </div>
              <div>
                <p className="font-extrabold text-xs text-[var(--primary-text)]">Priya Sharma</p>
                <p className="text-[10px] text-[var(--secondary-text)] font-semibold">Product Designer</p>
              </div>
            </div>
          </div>
        ),
        previewSnippet: (
          <div className="p-1 flex flex-col justify-between h-full text-left">
            <div className="flex gap-0.5 text-[8px] text-[var(--accent)]">★★★★★</div>
            <p className="line-clamp-3 text-[9px] font-semibold text-[var(--secondary-text)]">
              "Buttery smooth real-time communication!"
            </p>
            <span className="font-extrabold text-[9px] text-[var(--primary-text)]">Priya S.</span>
          </div>
        ),
      },
      {
        id: "ananya-reddy",
        content: (
          <div className="flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-4 fill-[var(--accent)] text-[var(--primary-text)]" />
                ))}
              </div>
              <Quote className="size-6 text-[var(--accent)] mb-2" />
              <p className="text-xs sm:text-sm font-medium text-[var(--secondary-text)] leading-relaxed">
                "The attention to detail in every interaction is remarkable. Best chat app I have ever used."
              </p>
            </div>
            <div className="flex items-center gap-3 pt-3 mt-3 border-t-2 border-[var(--line)]/10">
              <div className="size-8 rounded-full bg-[var(--accent)] border-2 border-[var(--line)] flex items-center justify-center font-black text-xs">
                A
              </div>
              <div>
                <p className="font-extrabold text-xs text-[var(--primary-text)]">Ananya Reddy</p>
                <p className="text-[10px] text-[var(--secondary-text)] font-semibold">UX Researcher</p>
              </div>
            </div>
          </div>
        ),
        previewSnippet: (
          <div className="p-1 flex flex-col justify-between h-full text-left">
            <div className="flex gap-0.5 text-[8px] text-[var(--accent)]">★★★★★</div>
            <p className="line-clamp-3 text-[9px] font-semibold text-[var(--secondary-text)]">
              "Attention to detail in every single interaction."
            </p>
            <span className="font-extrabold text-[9px] text-[var(--primary-text)]">Ananya R.</span>
          </div>
        ),
      },
      {
        id: "rahul-verma",
        content: (
          <div className="flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-4 fill-[var(--accent)] text-[var(--primary-text)]" />
                ))}
              </div>
              <Quote className="size-6 text-[var(--accent)] mb-2" />
              <p className="text-xs sm:text-sm font-medium text-[var(--secondary-text)] leading-relaxed">
                "Built my entire company communication around Chatly. Fast, secure, and beautiful."
              </p>
            </div>
            <div className="flex items-center gap-3 pt-3 mt-3 border-t-2 border-[var(--line)]/10">
              <div className="size-8 rounded-full bg-[var(--accent)] border-2 border-[var(--line)] flex items-center justify-center font-black text-xs">
                R
              </div>
              <div>
                <p className="font-extrabold text-xs text-[var(--primary-text)]">Rahul Verma</p>
                <p className="text-[10px] text-[var(--secondary-text)] font-semibold">Startup Founder</p>
              </div>
            </div>
          </div>
        ),
        previewSnippet: (
          <div className="p-1 flex flex-col justify-between h-full text-left">
            <div className="flex gap-0.5 text-[8px] text-[var(--accent)]">★★★★★</div>
            <p className="line-clamp-3 text-[9px] font-semibold text-[var(--secondary-text)]">
              "Fast, secure, and beautiful for startups."
            </p>
            <span className="font-extrabold text-[9px] text-[var(--primary-text)]">Rahul V.</span>
          </div>
        ),
      },
    ],
  },
  {
    id: "folder-eng-performance",
    title: "Engineering & Speed",
    description: "Developers & DevOps",
    previews: [
      {
        id: "arjun-mehta",
        content: (
          <div className="flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-4 fill-[var(--accent)] text-[var(--primary-text)]" />
                ))}
              </div>
              <Quote className="size-6 text-[var(--accent)] mb-2" />
              <p className="text-xs sm:text-sm font-medium text-[var(--secondary-text)] leading-relaxed">
                "I love the clean UI and the speed. It feels like chatting in the future. Great experience overall."
              </p>
            </div>
            <div className="flex items-center gap-3 pt-3 mt-3 border-t-2 border-[var(--line)]/10">
              <div className="size-8 rounded-full bg-[var(--accent)] border-2 border-[var(--line)] flex items-center justify-center font-black text-xs">
                A
              </div>
              <div>
                <p className="font-extrabold text-xs text-[var(--primary-text)]">Arjun Mehta</p>
                <p className="text-[10px] text-[var(--secondary-text)] font-semibold">Full Stack Developer</p>
              </div>
            </div>
          </div>
        ),
        previewSnippet: (
          <div className="p-1 flex flex-col justify-between h-full text-left">
            <div className="flex gap-0.5 text-[8px] text-[var(--accent)]">★★★★★</div>
            <p className="line-clamp-3 text-[9px] font-semibold text-[var(--secondary-text)]">
              "Feels like chatting in the future!"
            </p>
            <span className="font-extrabold text-[9px] text-[var(--primary-text)]">Arjun M.</span>
          </div>
        ),
      },
      {
        id: "vikram-singh",
        content: (
          <div className="flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-4 fill-[var(--accent)] text-[var(--primary-text)]" />
                ))}
              </div>
              <Quote className="size-6 text-[var(--accent)] mb-2" />
              <p className="text-xs sm:text-sm font-medium text-[var(--secondary-text)] leading-relaxed">
                "Socket.io integration is flawless. Real-time notifications never miss a beat. Impressed!"
              </p>
            </div>
            <div className="flex items-center gap-3 pt-3 mt-3 border-t-2 border-[var(--line)]/10">
              <div className="size-8 rounded-full bg-[var(--accent)] border-2 border-[var(--line)] flex items-center justify-center font-black text-xs">
                V
              </div>
              <div>
                <p className="font-extrabold text-xs text-[var(--primary-text)]">Vikram Singh</p>
                <p className="text-[10px] text-[var(--secondary-text)] font-semibold">DevOps Engineer</p>
              </div>
            </div>
          </div>
        ),
        previewSnippet: (
          <div className="p-1 flex flex-col justify-between h-full text-left">
            <div className="flex gap-0.5 text-[8px] text-[var(--accent)]">★★★★★</div>
            <p className="line-clamp-3 text-[9px] font-semibold text-[var(--secondary-text)]">
              "Real-time notifications never miss a beat."
            </p>
            <span className="font-extrabold text-[9px] text-[var(--primary-text)]">Vikram S.</span>
          </div>
        ),
      },
      {
        id: "sneha-patel",
        content: (
          <div className="flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-4 fill-[var(--accent)] text-[var(--primary-text)]" />
                ))}
              </div>
              <Quote className="size-6 text-[var(--accent)] mb-2" />
              <p className="text-xs sm:text-sm font-medium text-[var(--secondary-text)] leading-relaxed">
                "We switched from Slack to Chatly and never looked back. The animations are so satisfying."
              </p>
            </div>
            <div className="flex items-center gap-3 pt-3 mt-3 border-t-2 border-[var(--line)]/10">
              <div className="size-8 rounded-full bg-[var(--accent)] border-2 border-[var(--line)] flex items-center justify-center font-black text-xs">
                S
              </div>
              <div>
                <p className="font-extrabold text-xs text-[var(--primary-text)]">Sneha Patel</p>
                <p className="text-[10px] text-[var(--secondary-text)] font-semibold">Marketing Lead</p>
              </div>
            </div>
          </div>
        ),
        previewSnippet: (
          <div className="p-1 flex flex-col justify-between h-full text-left">
            <div className="flex gap-0.5 text-[8px] text-[var(--accent)]">★★★★★</div>
            <p className="line-clamp-3 text-[9px] font-semibold text-[var(--secondary-text)]">
              "Switched from Slack and never looked back."
            </p>
            <span className="font-extrabold text-[9px] text-[var(--primary-text)]">Sneha P.</span>
          </div>
        ),
      },
    ],
  },
];

const TestimonialCard = ({ name, role, text, rating }) => (
  <div className="flex-shrink-0 w-[340px] bg-[var(--surface)] rounded-3xl p-7 border-2 border-[var(--line)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 hover:-translate-y-1 mx-3">
    <div className="flex items-center gap-1 mb-4">
      {Array.from({ length: rating }).map((_, i) => (
        <Star key={i} className="w-4 h-4 fill-[var(--accent)] text-[var(--primary-text)]" strokeWidth={2} />
      ))}
    </div>
    <Quote className="w-8 h-8 text-[var(--accent)] mb-3" strokeWidth={2.5} />
    <p className="text-[var(--secondary-text)] font-medium leading-relaxed mb-5">{text}</p>
    <div className="flex items-center gap-3 pt-4 border-t-2 border-[var(--line)]/10">
      <div className="w-10 h-10 rounded-full bg-[var(--accent)] border-2 border-[var(--line)] flex items-center justify-center font-extrabold text-sm">
        {name.charAt(0)}
      </div>
      <div>
        <p className="font-extrabold text-[var(--primary-text)] text-sm">{name}</p>
        <p className="text-[var(--secondary-text)] text-xs font-semibold">{role}</p>
      </div>
    </div>
  </div>
);

const LandingPage = () => {
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    feedback: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactForm.name.trim() || !contactForm.email.trim() || !contactForm.message.trim()) {
      return toast.error("Name, email and message are required");
    }
    setIsSubmitting(true);
    try {
      await axiosInstance.post("/contact", contactForm);
      toast.success("Message sent successfully!");
      setContactForm({ name: "", email: "", subject: "", message: "", feedback: "" });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--surface)] overflow-hidden relative">
      {/* Floating Background Bubbles */}
      <FloatingBubble size="120px" left="3%" top="8%" delay="0s" duration="6s" />
      <FloatingBubble size="80px" left="88%" top="12%" delay="1s" duration="8s" />
      <FloatingBubble size="60px" left="12%" top="55%" delay="2s" duration="7s" />
      <FloatingBubble size="100px" left="78%" top="50%" delay="0.5s" duration="9s" />
      <FloatingBubble size="50px" left="42%" top="82%" delay="3s" duration="6s" />
      <FloatingBubble size="70px" left="92%" top="70%" delay="1.5s" duration="8s" />
      <FloatingBubble size="40px" left="28%" top="3%" delay="2.5s" duration="7s" />
      <FloatingBubble size="90px" left="55%" top="35%" delay="0s" duration="10s" />

      {/* Hero Section */}
      <section id="home" className="relative z-10 pt-36 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left - Text */}
            <div className="space-y-8 animate-slide-in-left">
              <div className="inline-flex items-center gap-2 bg-[var(--accent)]/15 text-[var(--primary-text)] px-5 py-2.5 rounded-full text-sm font-bold border-2 border-[var(--line)]">
                <Sparkles className="w-4 h-4" />
                More than a chatting app
              </div>

              <h1 className="text-5xl lg:text-7xl font-extrabold text-[var(--primary-text)] leading-[1.1]">
                Conversations
                <br />
                that{" "}
                <span className="relative inline-block">
                  <span className="relative z-10">feel alive</span>
                  <span className="absolute bottom-1 left-0 w-full h-4 bg-[var(--accent)] -z-0 rounded-sm" />
                </span>
              </h1>

              <p className="text-lg text-[var(--secondary-text)] max-w-lg leading-relaxed font-medium">
                Chatly is more than a chatting app — it is a complete real-time collaboration and entertainment hub featuring instant messaging, retro arcade mini games, live audio lounges, and direct P2P file sharing.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  to="/signup"
                  className="group inline-flex items-center gap-2 bg-[var(--accent)] text-[var(--primary-text)] px-8 py-4 rounded-2xl font-extrabold text-lg border-2 border-[var(--line)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:bg-[var(--accent-hover)]"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 bg-[var(--surface)] text-[var(--primary-text)] px-8 py-4 rounded-2xl font-extrabold text-lg border-2 border-[var(--line)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_var(--accent)] hover:bg-[var(--accent)]/10"
                >
                  Sign In
                </Link>
              </div>
            </div>

            {/* Right - Chat Preview Card */}
            <div className="animate-slide-in-right">
              <div className="relative">
                <div className="relative bg-[var(--surface)] rounded-3xl border-2 border-[var(--line)] p-8 animate-float-slow hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-shadow duration-300">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-[var(--line)]/10">
                    <img
                      src="/chatly-logo.png"
                      alt="Chatly"
                      className="size-10 rounded-xl object-contain shadow-sm"
                    />
                    <div>
                      <p className="font-extrabold text-[var(--primary-text)] text-sm">Chatly</p>
                      <p className="text-xs text-green-600 font-bold flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full inline-block border border-[var(--line)]" />
                        Online
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <ChatBubblePreview text="Hey! How's it going?" delay="0.3s" align="left" />
                    <ChatBubblePreview text="Amazing! Just scored 45 in Flappy Bird! 🐦" delay="0.6s" align="right" />
                    <ChatBubblePreview text="No way! Send me the challenge link 🔥" delay="0.9s" align="left" />
                    <ChatBubblePreview text="🎮 Chatly Arcade: Beat my score if you can!" delay="1.2s" align="right" />
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-[var(--secondary-text)] text-xs font-medium">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-[var(--accent)] rounded-full border border-[var(--line)] animate-bounce" style={{ animationDelay: "0s" }} />
                      <span className="w-2 h-2 bg-[var(--accent)] rounded-full border border-[var(--line)] animate-bounce" style={{ animationDelay: "0.15s" }} />
                      <span className="w-2 h-2 bg-[var(--accent)] rounded-full border border-[var(--line)] animate-bounce" style={{ animationDelay: "0.3s" }} />
                    </div>
                    Someone is typing...
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* Features Section */}
      <section id="features" className="relative z-10 py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 animate-fade-in-up">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-[var(--primary-text)] mb-4">
              Core{" "}
              <span className="relative inline-block">
                <span className="relative z-10">Features</span>
                <span className="absolute bottom-1 left-0 w-full h-3 bg-[var(--accent)] -z-0 rounded-sm" />
              </span>{" "}
              of the App
            </h2>
            <p className="text-[var(--secondary-text)] text-base sm:text-lg max-w-2xl mx-auto font-medium">
              Explore everything Chatly has to offer with our interactive 3D feature showcase.
            </p>
          </div>

          {/* 3D Cylindrical Carousel Feature Showcase */}
          <div className="w-full">
            <CylinderCarousel
              itemWidth={330}
              itemHeight={380}
              visibleItems={5}
              variant="convex"
              minScale={0.8}
              dragSpeed={1.3}
              autoRotate={true}
              autoRotateSpeed={0.2}
              height={440}
            >
              {CORE_FEATURES.map((feat) => (
                <CylinderFeatureCard
                  key={feat.title}
                  {...feat}
                />
              ))}
            </CylinderCarousel>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* Mini Games Arcade Showcase Section */}
      <section id="arcade" className="relative z-10 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-[var(--surface)] rounded-3xl border-2 border-[var(--line)] p-8 sm:p-12 shadow-[8px_8px_0px_0px_var(--line)] relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--accent)] rounded-full filter blur-[120px] opacity-15 pointer-events-none" />

            <div className="grid lg:grid-cols-12 gap-8 items-center relative z-10">
              {/* Left Column - Intro & Info */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 bg-[var(--accent)]/15 text-[var(--primary-text)] px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border-2 border-[var(--line)]">
                  <Gamepad2 className="w-4 h-4" />
                  Chatly Mini Games Arcade
                </div>

                <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--primary-text)] leading-tight">
                  Play Retro Games <br className="hidden sm:inline" />{" "}
                  <span className="underline decoration-[var(--accent)] decoration-4 sm:decoration-[6px] underline-offset-4 sm:underline-offset-8 [text-decoration-skip-ink:none]">
                    Right Inside Your Chat
                  </span>
                </h2>

                <p className="text-[var(--secondary-text)] font-medium text-base leading-relaxed">
                  Never get bored waiting for a reply! Enjoy classic arcade favorites like Flappy Bird and Snake with real synthesized 8-bit sound effects, high score leaderboards, and instant challenge invites to your friends.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3.5 rounded-2xl bg-[var(--surface-muted)] border-2 border-[var(--line)] shadow-[2px_2px_0px_0px_var(--line)]">
                    <div className="text-2xl mb-1">🐦</div>
                    <p className="font-extrabold text-xs text-[var(--primary-text)]">Flappy Bird</p>
                    <p className="text-[10px] text-[var(--secondary-text)] font-medium">Physics & Pipes</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[var(--surface-muted)] border-2 border-[var(--line)] shadow-[2px_2px_0px_0px_var(--line)]">
                    <div className="text-2xl mb-1">🐍</div>
                    <p className="font-extrabold text-xs text-[var(--primary-text)]">Retro Snake</p>
                    <p className="text-[10px] text-[var(--secondary-text)] font-medium">Classic Grid Eater</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[var(--surface-muted)] border-2 border-[var(--line)] shadow-[2px_2px_0px_0px_var(--line)] col-span-2 sm:col-span-1">
                    <div className="text-2xl mb-1">🏆</div>
                    <p className="font-extrabold text-xs text-[var(--primary-text)]">Arcade Challenges</p>
                    <p className="text-[10px] text-[var(--secondary-text)] font-medium">1-Click Share</p>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    to="/signup"
                    className="inline-flex items-center gap-2 bg-[var(--accent)] text-[var(--primary-text)] px-6 py-3 rounded-xl font-extrabold text-sm border-2 border-[var(--line)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:bg-[var(--accent-hover)] transition-all duration-200"
                  >
                    <Gamepad2 className="w-4 h-4" />
                    Join & Play Now
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Right Column - Arcade Visual Card */}
              <div className="lg:col-span-5">
                <div className="bg-[var(--surface-muted)] border-2 border-[var(--line)] rounded-2xl p-5 shadow-[4px_4px_0px_0px_var(--line)] space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b-2 border-[var(--line)]/20">
                    <div className="flex items-center gap-2">
                      <div className="size-3 rounded-full bg-red-500 border border-[var(--line)]" />
                      <div className="size-3 rounded-full bg-yellow-500 border border-[var(--line)]" />
                      <div className="size-3 rounded-full bg-green-500 border border-[var(--line)]" />
                    </div>
                    <span className="text-[10px] font-mono font-black uppercase text-[var(--secondary-text)] tracking-wider">
                      RETRO ENGINE V2.0
                    </span>
                  </div>

                  <div className="bg-black/90 rounded-xl p-4 border border-[var(--line)] font-mono text-xs text-green-400 space-y-2">
                    <div className="flex items-center justify-between text-yellow-400 font-bold border-b border-white/10 pb-1.5">
                      <span>HIGH SCORE BOARD</span>
                      <span>RANK #1</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span>1. Flappy Master</span>
                      <span className="text-white font-bold">42 pts 🐦</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span>2. Snake Charmer</span>
                      <span className="text-white font-bold">180 pts 🐍</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-zinc-500">
                      <span>3. Speed Runner</span>
                      <span>95 pts ⚡</span>
                    </div>
                  </div>

                  <div className="p-3 bg-[var(--surface)] rounded-xl border border-[var(--line)] flex items-center gap-3">
                    <div className="size-9 rounded-lg bg-[var(--accent)] border border-[var(--line)] flex items-center justify-center font-bold text-sm">
                      🎮
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-black text-[var(--primary-text)] truncate">
                        Challenge Friends in Chat
                      </p>
                      <p className="text-[10px] text-[var(--secondary-text)] font-semibold truncate">
                        Share high scores with one tap
                      </p>
                    </div>
                    <Flame className="w-4 h-4 text-orange-500 shrink-0" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* People's Feedback Section with ProjectFolder Animation */}
      <section id="feedback" className="relative z-10 py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-[var(--surface-muted)] text-[var(--secondary-text)] px-3.5 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider border border-[var(--line)] mb-3 shadow-[2px_2px_0px_0px_var(--line)]">
              <Sparkles className="size-3.5 text-[var(--accent)]" />
              <span>Interactive User Stories</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-[var(--primary-text)] mb-4">
              What people{" "}
              <span className="relative inline-block">
                <span className="relative z-10">say</span>
                <span className="absolute bottom-1 left-0 w-full h-3 bg-[var(--accent)] -z-0 rounded-sm" />
              </span>
            </h2>
            <p className="text-[var(--secondary-text)] text-base sm:text-lg max-w-2xl mx-auto font-medium">
              Hover over the folders to preview live reviews, or click to expand the full user gallery.
            </p>
          </div>

          {/* Project Folders Showcase */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 lg:gap-12 py-6">
            {TESTIMONIAL_FOLDERS.map((folder) => (
              <ProjectFolder
                key={folder.id}
                title={folder.title}
                description={folder.description}
                previews={folder.previews}
                itemLabel="review"
              />
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* Contact Us Section - Redesigned & Compact */}
      <section id="contact" className="relative z-10 py-12 sm:py-16 px-4 sm:px-6">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[200px] bg-[var(--accent)] rounded-full filter blur-[90px] opacity-10 pointer-events-none" />
        
        <div className="max-w-4xl mx-auto relative">
          {/* Section Heading */}
          <div className="text-center mb-8 sm:mb-10 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent)]/15 border border-[var(--line)]/20 text-xs font-mono font-bold text-[var(--primary-text)] shadow-sm">
              <Mail className="size-3.5 text-[var(--accent)]" />
              <span>Direct Support & Community</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[var(--primary-text)]">
              Get in{" "}
              <span className="relative inline-block">
                <span className="relative z-10">touch</span>
                <span className="absolute bottom-1 left-0 w-full h-3 bg-[var(--accent)] -z-0 rounded-sm" />
              </span>
            </h2>
            <p className="text-[var(--secondary-text)] text-xs sm:text-sm max-w-lg mx-auto font-medium">
              Have questions, feedback, or ideas? Send us a quick note and our team will get right back to you.
            </p>
          </div>

          {/* Main Card: Compact Split Design */}
          <div className="bg-[var(--surface)] rounded-3xl border-2 border-[var(--line)] shadow-[6px_6px_0px_0px_var(--line)] overflow-hidden transition-all duration-300">
            <div className="grid grid-cols-1 md:grid-cols-5">
              
              {/* Left Column: Direct Info & Response Time (2 cols) */}
              <div className="md:col-span-2 p-6 sm:p-7 bg-[var(--surface-muted)] border-b-2 md:border-b-0 md:border-r-2 border-[var(--line)] flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5">
                    <img src="/chatly-logo.png" alt="Chatly" className="size-8 object-contain" />
                    <span className="font-mono font-black text-base text-[var(--primary-text)]">Chatly Support</span>
                  </div>

                  <p className="text-xs text-[var(--secondary-text)] font-medium leading-relaxed">
                    We&apos;re building Chatly openly with the community. Every bug report, feature request, and feedback directly shapes the roadmap.
                  </p>

                  <div className="space-y-2.5 pt-1">
                    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[var(--surface)] border border-[var(--line)]/20 shadow-sm">
                      <div className="size-8 rounded-lg bg-[var(--accent)] border border-[var(--line)] flex items-center justify-center shrink-0 shadow-[1px_1px_0px_0px_var(--line)]">
                        <Mail className="size-4 text-[var(--primary-text)]" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] uppercase font-bold text-[var(--secondary-text)]">Email Us</div>
                        <div className="text-xs font-bold text-[var(--primary-text)] truncate font-mono">support@chatly.app</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[var(--surface)] border border-[var(--line)]/20 shadow-sm">
                      <div className="size-8 rounded-lg bg-[var(--accent)] border border-[var(--line)] flex items-center justify-center shrink-0 shadow-[1px_1px_0px_0px_var(--line)]">
                        <Zap className="size-4 text-[var(--primary-text)]" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] uppercase font-bold text-[var(--secondary-text)]">Avg. Response</div>
                        <div className="text-xs font-bold text-[var(--primary-text)]">Under 2 hours</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 text-[11px] font-mono text-[var(--secondary-text)] flex items-center gap-1.5 border-t border-dashed border-[var(--line)]/20">
                  <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Dev & support team active</span>
                </div>
              </div>

              {/* Right Column: Clean & Compact Form (3 cols) */}
              <div className="md:col-span-3 p-6 sm:p-7 flex flex-col justify-center">
                <form className="space-y-3" onSubmit={handleContactSubmit}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[var(--primary-text)]">Your Name</label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border-2 border-[var(--line)] bg-[var(--surface)] text-[var(--primary-text)] text-xs font-medium placeholder:text-[var(--secondary-text)]/50 focus:outline-none focus:border-[var(--accent)] transition-colors"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[var(--primary-text)]">Your Email</label>
                      <input
                        type="email"
                        placeholder="john@example.com"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border-2 border-[var(--line)] bg-[var(--surface)] text-[var(--primary-text)] text-xs font-medium placeholder:text-[var(--secondary-text)]/50 focus:outline-none focus:border-[var(--accent)] transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[var(--primary-text)]">Subject</label>
                    <input
                      type="text"
                      placeholder="How can we help? (e.g. Feedback, Question)"
                      value={contactForm.subject}
                      onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border-2 border-[var(--line)] bg-[var(--surface)] text-[var(--primary-text)] text-xs font-medium placeholder:text-[var(--secondary-text)]/50 focus:outline-none focus:border-[var(--accent)] transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[var(--primary-text)]">Message / Feedback</label>
                    <textarea
                      rows={3}
                      placeholder="Tell us what's on your mind or share your suggestions..."
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border-2 border-[var(--line)] bg-[var(--surface)] text-[var(--primary-text)] text-xs font-medium placeholder:text-[var(--secondary-text)]/50 focus:outline-none focus:border-[var(--accent)] transition-colors resize-none"
                    />
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center justify-center gap-2 bg-[var(--accent)] text-[var(--primary-text)] px-5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm border-2 border-[var(--line)] shadow-[3px_3px_0px_0px_var(--line)] hover:shadow-[1px_1px_0px_0px_var(--line)] hover:translate-x-[1px] hover:translate-y-[1px] active:shadow-none transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <Send className="size-4" />
                          <span>Send Message</span>
                        </>
                      )}
                    </button>
                    <span className="text-[10px] text-[var(--secondary-text)] font-medium text-center sm:text-right">
                      🔒 Encrypted & confidential
                    </span>
                  </div>
                </form>
              </div>

            </div>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* CTA Section */}
      <section className="relative z-10 py-24 px-6 overflow-hidden">
        {/* Background bubbles for CTA */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-40 h-40 rounded-full bg-[var(--accent)] opacity-[0.04] border border-[var(--line)]/20 top-4 left-[8%] animate-float" />
          <div className="absolute w-24 h-24 rounded-full bg-[var(--accent)] opacity-[0.03] border border-[var(--line)]/20 bottom-6 right-[10%] animate-float-slow" />
          <div className="absolute w-16 h-16 rounded-full bg-[var(--accent)] opacity-[0.03] border border-[var(--line)]/15 top-12 right-[25%] animate-float" style={{ animationDelay: "2s" }} />
          <div className="absolute w-20 h-20 rounded-full bg-[var(--accent)] opacity-[0.04] border border-[var(--line)]/20 bottom-10 left-[22%] animate-float" style={{ animationDelay: "1s" }} />
          <div className="absolute w-12 h-12 rounded-full bg-[var(--accent)] opacity-[0.02] border border-[var(--line)]/15 top-20 left-[45%] animate-float-slow" style={{ animationDelay: "3s" }} />
          <div className="absolute w-28 h-28 rounded-full bg-[var(--accent)] opacity-[0.03] border border-[var(--line)]/20 bottom-4 left-[55%] animate-float" style={{ animationDelay: "1.5s" }} />
        </div>

        {/* Big glow behind card */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[300px] bg-[var(--accent)] opacity-20 blur-[100px] rounded-full" />
        </div>

        <div className="max-w-3xl mx-auto text-center relative">
          <div className="relative bg-[var(--accent)] rounded-3xl p-14 md:p-16 border-2 border-[var(--line)] shadow-[0_0_60px_color-mix(in_srgb,var(--accent)_40%,transparent),0_0_120px_color-mix(in_srgb,var(--accent)_20%,transparent)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1),0_0_60px_color-mix(in_srgb,var(--accent)_50%,transparent)] transition-shadow duration-500 animate-fade-in-scale">
            <div className="absolute -top-4 -right-4 w-10 h-10 rounded-full bg-[var(--surface)] border-2 border-[var(--line)] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[var(--accent)]" />
            </div>
            <h2 className="text-3xl lg:text-5xl font-extrabold text-black mb-5 leading-tight">
              Ready to start{" "}
              <span className="relative inline-block">
                <span className="relative z-10">chatting?</span>
                <span className="absolute bottom-1 left-0 w-full h-3 bg-white/40 -z-0 rounded-sm" />
              </span>
            </h2>
            <p className="text-black/70 text-lg mb-10 font-semibold max-w-lg mx-auto">
              Join thousands of happy users and experience conversations like never before.
            </p>
            <Link
              to="/signup"
              className="group inline-flex items-center gap-3 bg-white text-black px-12 py-5 rounded-2xl font-extrabold text-xl border-2 border-[var(--line)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
            >
              Create Your Account
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-black text-white border-t-2 border-[var(--line)]">
        {/* Top wave divider */}
        <div className="bg-[var(--accent)] h-1.5" />

        <div className="max-w-6xl mx-auto px-6 pt-16 pb-8">
          <div className="grid md:grid-cols-4 gap-10 mb-14">
            {/* Brand & Socials */}
            <div className="md:col-span-1 space-y-4">
              <Link to="/" className="flex items-center gap-2.5 hover:opacity-85 transition-opacity">
                <img
                  src="/chatly-logo.png"
                  alt="Chatly Logo"
                  className="size-10 rounded-xl object-contain shadow-sm"
                />
                <h1 className="text-xl font-extrabold text-white">Chatly</h1>
              </Link>
              <p className="text-[var(--secondary-text)] text-sm font-medium leading-relaxed">
                Chatly — More than a chatting app. Connect with friends, play retro games, join live audio lounges, and share files directly.
              </p>
              <div className="flex flex-wrap gap-2.5 pt-1">
                {[
                  { name: "Twitter / X", icon: Twitter, href: "https://twitter.com" },
                  { name: "GitHub", icon: Github, href: "https://github.com" },
                  { name: "Instagram", icon: Instagram, href: "https://instagram.com" },
                  { name: "YouTube", icon: Youtube, href: "https://youtube.com" },
                  { name: "LinkedIn", icon: Linkedin, href: "https://linkedin.com" },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.name}
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={item.name}
                      title={item.name}
                      className="size-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-[var(--accent)] hover:text-[var(--primary-text)] hover:border-[var(--accent)] hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_var(--accent)] transition-all duration-200 cursor-pointer"
                    >
                      <Icon className="w-4.5 h-4.5" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Explore Features */}
            <div>
              <h3 className="font-extrabold text-white text-sm uppercase tracking-wider mb-5">Features</h3>
              <ul className="space-y-3">
                {[
                  { label: "Home", href: "#home" },
                  { label: "Core Features", href: "#features" },
                  { label: "Mini Games Arcade", href: "#arcade" },
                  { label: "Live Audio Lounges", href: "#features" },
                  { label: "P2P File Sharing", href: "#features" },
                ].map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      className="text-[var(--secondary-text)] text-sm font-medium hover:text-[var(--accent)] transition-colors"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Navigation & App Access */}
            <div>
              <h3 className="font-extrabold text-white text-sm uppercase tracking-wider mb-5">Get Started</h3>
              <ul className="space-y-3">
                {[
                  { label: "Create Account", href: "/signup", isRoute: true },
                  { label: "Sign In", href: "/login", isRoute: true },
                  { label: "Community Feedback", href: "#feedback", isRoute: false },
                  { label: "Get in Touch", href: "#contact", isRoute: false },
                ].map((item) => (
                  <li key={item.label}>
                    {item.isRoute ? (
                      <Link
                        to={item.href}
                        className="text-[var(--secondary-text)] text-sm font-medium hover:text-[var(--accent)] transition-colors"
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <a
                        href={item.href}
                        className="text-[var(--secondary-text)] text-sm font-medium hover:text-[var(--accent)] transition-colors"
                      >
                        {item.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact & Support CTA */}
            <div>
              <h3 className="font-extrabold text-white text-sm uppercase tracking-wider mb-5">Support & Help</h3>
              <p className="text-[var(--secondary-text)] text-sm font-medium mb-4 leading-relaxed">
                Have questions or suggestions? We&apos;d love to hear your thoughts and feedback.
              </p>
              <a
                href="#contact"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--accent)] text-[var(--primary-text)] text-sm font-extrabold hover:bg-[var(--accent-hover)] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_white] transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                Get in Touch
              </a>
            </div>
          </div>

          {/* Bottom divider */}
          <div className="border-t border-white/10 pt-8 flex items-center justify-center">
            <p className="text-[var(--secondary-text)] text-xs font-semibold text-center">
              &copy; {new Date().getFullYear()} Chatly. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
