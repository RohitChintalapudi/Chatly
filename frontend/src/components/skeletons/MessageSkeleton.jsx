const MessageSkeleton = () => {
  const skeletonMessages = Array(6).fill(null);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {skeletonMessages.map((_, idx) => (
        <div key={idx} className={`flex ${idx % 2 === 0 ? "justify-start" : "justify-end"}`}>
          <div className="flex gap-2 max-w-[75%]">
            <div className="size-8 rounded-full bg-[var(--surface-muted)] border-2 border-[var(--line)] animate-pulse flex-shrink-0 mt-1" />
            <div>
              <div className="h-3 w-16 bg-[var(--surface-muted)] rounded mb-1 border border-[var(--line)] animate-pulse" />
              <div className="bg-[var(--surface-muted)] border-2 border-[var(--line)] rounded-2xl px-4 py-3 animate-pulse">
                <div className="h-4 w-[180px] bg-[var(--line)]/10 rounded" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageSkeleton;
