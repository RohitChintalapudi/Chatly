import { useState } from "react";
import { Link } from "react-router-dom";
import {
  MessageSquare,
  Zap,
  Shield,
  Users,
  Sparkles,
  ArrowRight,
  Heart,
  Send,
  Star,
  Quote,
  Globe,
  Smartphone,
  Loader2,
  Share2,
} from "lucide-react";
import SectionDivider from "../components/SectionDivider";
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

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Product Designer",
    text: "Chatly completely changed how our team communicates. The real-time experience is buttery smooth!",
    rating: 5,
  },
  {
    name: "Arjun Mehta",
    role: "Full Stack Developer",
    text: "I love the clean UI and the speed. It feels like chatting in the future. Great experience overall.",
    rating: 4,
  },
  {
    name: "Sneha Patel",
    role: "Marketing Lead",
    text: "We switched from Slack to Chatly and never looked back. The animations are so satisfying.",
    rating: 5,
  },
  {
    name: "Rahul Verma",
    role: "Startup Founder",
    text: "Built my entire company communication around Chatly. Fast, secure, and beautiful.",
    rating: 3,
  },
  {
    name: "Ananya Reddy",
    role: "UX Researcher",
    text: "The attention to detail in every interaction is remarkable. Best chat app I have ever used.",
    rating: 4,
  },
  {
    name: "Vikram Singh",
    role: "DevOps Engineer",
    text: "Socket.io integration is flawless. Real-time notifications never miss a beat. Impressed!",
    rating: 5,
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
                Chat beautifully with anyone
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
                Chatly is not just a chatting application. It is a complete real-time collaboration hub featuring direct peer-to-peer file sharing, instant audio rooms, and beautiful connections that feel alive.
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
                    <div className="w-10 h-10 rounded-xl bg-[var(--accent)] border-2 border-[var(--line)] flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-[var(--primary-text)]" strokeWidth={2.5} />
                    </div>
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
                    <ChatBubblePreview text="Amazing! Just built something cool" delay="0.6s" align="right" />
                    <ChatBubblePreview text="That sounds awesome! Tell me more" delay="0.9s" align="left" />
                    <ChatBubblePreview text="It's a real-time chat app with smooth animations!" delay="1.2s" align="right" />
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
      <section id="features" className="relative z-10 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-[var(--primary-text)] mb-4">
              Core{" "}
              <span className="relative inline-block">
                <span className="relative z-10">Features</span>
                <span className="absolute bottom-1 left-0 w-full h-3 bg-[var(--accent)] -z-0 rounded-sm" />
              </span>{" "}
              of the App
            </h2>
            <p className="text-[var(--secondary-text)] text-lg max-w-2xl mx-auto font-medium">
              Everything you need for seamless, secure, and modern real-time communication.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={Zap}
              title="Lightning Fast"
              description="Messages delivered in real-time with WebSocket technology. No refreshing, no delays."
              delay="0.2s"
            />
            <FeatureCard
              icon={Shield}
              title="Private & Secure"
              description="Your conversations stay yours. End-to-end privacy with secure authentication."
              delay="0.4s"
            />
            <FeatureCard
              icon={Users}
              title="Stay Connected"
              description="See who's online, share moments, and never miss a beat with live status."
              delay="0.6s"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-6">
            <FeatureCard
              icon={Globe}
              title="Works Everywhere"
              description="Access Chatly from any device. Desktop, tablet, or phone - it just works."
              delay="0.3s"
            />
            <FeatureCard
              icon={Smartphone}
              title="Mobile Friendly"
              description="Fully responsive design that feels native on every screen size and orientation."
              delay="0.5s"
            />
            <FeatureCard
              icon={Share2}
              title="P2P File Transfer"
              description="Transfer any file format up to 1GB directly browser-to-browser via WebRTC. Speed limits are set only by your network."
              delay="0.7s"
            />
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* People's Feedback Carousel */}
      <section id="feedback" className="relative z-10 py-20 overflow-hidden">
        <div className="text-center mb-14 px-6">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-[var(--primary-text)] mb-4">
            What people{" "}
            <span className="relative inline-block">
              <span className="relative z-10">say</span>
              <span className="absolute bottom-1 left-0 w-full h-3 bg-[var(--accent)] -z-0 rounded-sm" />
            </span>
          </h2>
          <p className="text-[var(--secondary-text)] text-lg max-w-2xl mx-auto font-medium">
            Loved by thousands of happy users worldwide
          </p>
        </div>

        {/* Carousel with glow */}
        <div className="relative carousel-glow">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[var(--surface)] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[var(--surface)] to-transparent z-10 pointer-events-none" />

          <div className="carousel-track py-4">
            {/* First set */}
            {testimonials.map((t, i) => (
              <TestimonialCard key={`a-${i}`} {...t} />
            ))}
            {/* Duplicate set for seamless loop */}
            {testimonials.map((t, i) => (
              <TestimonialCard key={`b-${i}`} {...t} />
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* Contact Us Section */}
      <section id="contact" className="relative z-10 py-20 px-6">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[250px] bg-[var(--accent)] rounded-full filter blur-[100px] opacity-10 pointer-events-none" />
        <div className="max-w-4xl mx-auto relative">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-[var(--primary-text)] mb-4">
              Get in{" "}
              <span className="relative inline-block">
                <span className="relative z-10">touch</span>
                <span className="absolute bottom-1 left-0 w-full h-3 bg-[var(--accent)] -z-0 rounded-sm" />
              </span>
            </h2>
            <p className="text-[var(--secondary-text)] text-lg max-w-2xl mx-auto font-medium">
              Have questions, feedback, or just want to say hello? We&apos;d love to hear from you.
            </p>
          </div>

          <div className="form-glow bg-[var(--surface)] rounded-3xl border-2 border-[var(--line)] p-8 md:p-12 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-shadow duration-300">
            <form className="space-y-6" onSubmit={handleContactSubmit}>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-extrabold text-[var(--primary-text)]">Your Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="w-full px-5 py-3.5 rounded-xl border-2 border-[var(--line)] bg-[var(--surface)] text-[var(--primary-text)] font-medium placeholder:text-[var(--secondary-text)] focus:outline-none focus:ring-0 focus:border-[var(--accent)] transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-extrabold text-[var(--primary-text)]">Your Email</label>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="w-full px-5 py-3.5 rounded-xl border-2 border-[var(--line)] bg-[var(--surface)] text-[var(--primary-text)] font-medium placeholder:text-[var(--secondary-text)] focus:outline-none focus:ring-0 focus:border-[var(--accent)] transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-extrabold text-[var(--primary-text)]">Subject</label>
                <input
                  type="text"
                  placeholder="How can we help?"
                  value={contactForm.subject}
                  onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                  className="w-full px-5 py-3.5 rounded-xl border-2 border-[var(--line)] bg-[var(--surface)] text-[var(--primary-text)] font-medium placeholder:text-[var(--secondary-text)] focus:outline-none focus:ring-0 focus:border-[var(--accent)] transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-extrabold text-[var(--primary-text)]">Message</label>
                <textarea
                  rows={4}
                  placeholder="Tell us what's on your mind..."
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  className="w-full px-5 py-3.5 rounded-xl border-2 border-[var(--line)] bg-[var(--surface)] text-[var(--primary-text)] font-medium placeholder:text-[var(--secondary-text)] focus:outline-none focus:ring-0 focus:border-[var(--accent)] transition-colors resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-extrabold text-[var(--primary-text)]">Feedback</label>
                <textarea
                  rows={3}
                  placeholder="How would you rate your experience? Any suggestions?"
                  value={contactForm.feedback}
                  onChange={(e) => setContactForm({ ...contactForm, feedback: e.target.value })}
                  className="w-full px-5 py-3.5 rounded-xl border-2 border-[var(--line)] bg-[var(--surface)] text-[var(--primary-text)] font-medium placeholder:text-[var(--secondary-text)] focus:outline-none focus:ring-0 focus:border-[var(--accent)] transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="group inline-flex items-center gap-2 bg-[var(--accent)] text-[var(--primary-text)] px-8 py-4 rounded-2xl font-extrabold text-lg border-2 border-[var(--line)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:bg-[var(--accent-hover)] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Message
                  </>
                )}
              </button>
            </form>
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
            {/* Brand */}
            <div className="md:col-span-1">
              <Link to="/" className="flex items-center gap-2.5 mb-5">
                <div className="size-10 rounded-xl bg-[var(--accent)] border-2 border-white/20 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-[var(--primary-text)]" strokeWidth={2.5} />
                </div>
                <h1 className="text-xl font-extrabold text-white">Chatly</h1>
              </Link>
              <p className="text-[var(--secondary-text)] text-sm font-medium leading-relaxed mb-6">
                The modern way to connect with your team and friends. Fast, secure, and beautifully simple.
              </p>
              <div className="flex gap-3">
                {["X", "GH", "IG", "YT"].map((label) => (
                  <a
                    key={label}
                    href="#"
                    className="w-9 h-9 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-xs font-bold text-white hover:bg-[var(--accent)] hover:text-[var(--primary-text)] hover:border-[var(--accent)] transition-all duration-300"
                  >
                    {label}
                  </a>
                ))}
              </div>
            </div>

            {/* Product */}
            <div>
              <h3 className="font-extrabold text-white text-sm uppercase tracking-wider mb-5">Product</h3>
              <ul className="space-y-3">
                {["Features", "Pricing", "Integrations", "Changelog", "API Docs"].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-[var(--secondary-text)] text-sm font-medium hover:text-[var(--accent)] transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="font-extrabold text-white text-sm uppercase tracking-wider mb-5">Company</h3>
              <ul className="space-y-3">
                {["About Us", "Careers", "Blog", "Press Kit", "Partners"].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-[var(--secondary-text)] text-sm font-medium hover:text-[var(--accent)] transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h3 className="font-extrabold text-white text-sm uppercase tracking-wider mb-5">Stay Updated</h3>
              <p className="text-[var(--secondary-text)] text-sm font-medium mb-4">
                Get the latest updates and news straight to your inbox.
              </p>
              <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
                <input
                  type="email"
                  placeholder="you@email.com"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/10 border-2 border-white/20 text-white text-sm font-medium placeholder:text-gray-500 focus:outline-none focus:border-[var(--accent)] transition-colors"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-[var(--accent)] border-2 border-[var(--accent)] text-[var(--primary-text)] text-sm font-extrabold hover:bg-[var(--accent-hover)] hover:border-[var(--accent-hover)] transition-all cursor-pointer"
                >
                  Join
                </button>
              </form>
            </div>
          </div>

          {/* Bottom divider */}
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[var(--secondary-text)] text-xs font-semibold">
              &copy; {new Date().getFullYear()} Chatly. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="text-[var(--secondary-text)] text-xs font-semibold hover:text-[var(--accent)] transition-colors"
                >
                  {item}
                </a>
              ))}
            </div>
            <p className="text-[var(--secondary-text)] text-xs font-semibold flex items-center gap-1.5">
              Built with <Heart className="w-3 h-3 text-[var(--accent)] fill-[var(--accent)]" /> Team Chatly
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
