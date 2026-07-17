import { Diamond } from "lucide-react";

const SectionDivider = () => {
  return (
    <div className="relative z-10 flex items-center justify-center py-6 px-6">
      {/* Left line */}
      <div className="flex-1 h-[2px] bg-gradient-to-r from-transparent via-[var(--accent)] to-[var(--accent)] opacity-40" />
      {/* Center symbol */}
      <div className="mx-5 flex-shrink-0">
        <div className="relative">
          <Diamond
            className="w-8 h-8 text-[var(--accent)] fill-[var(--accent)]/30"
            strokeWidth={2.5}
          />
          <div className="absolute inset-0 blur-md bg-[var(--accent)] opacity-40 rounded-full" />
        </div>
      </div>
      {/* Right line */}
      <div className="flex-1 h-[2px] bg-gradient-to-l from-transparent via-[var(--accent)] to-[var(--accent)] opacity-40" />
    </div>
  );
};

export default SectionDivider;
