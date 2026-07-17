import { Users } from "lucide-react";

const SidebarSkeleton = () => {
  const skeletonContacts = Array(8).fill(null);

  return (
    <aside className="h-full w-20 lg:w-72 border-r-2 border-[var(--line)] bg-[var(--surface)] flex flex-col transition-all duration-200">
      <div className="border-b-2 border-[var(--line)] w-full p-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent)] border-2 border-[var(--line)] flex items-center justify-center">
            <Users className="w-4 h-4 text-[var(--primary-text)]" strokeWidth={2.5} />
          </div>
          <span className="font-extrabold hidden lg:block text-[var(--primary-text)]">Contacts</span>
        </div>
      </div>
      <div className="overflow-y-auto w-full py-3">
        {skeletonContacts.map((_, idx) => (
          <div key={idx} className="w-full p-3 flex items-center gap-3">
            <div className="relative mx-auto lg:mx-0">
              <div className="size-12 rounded-full bg-[var(--surface-muted)] border-2 border-[var(--line)] animate-pulse" />
            </div>
            <div className="hidden lg:block text-left min-w-0 flex-1">
              <div className="h-4 w-32 mb-2 bg-[var(--surface-muted)] rounded-lg border border-[var(--line)] animate-pulse" />
              <div className="h-3 w-16 bg-[var(--surface-muted)] rounded-lg border border-[var(--line)] animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default SidebarSkeleton;
