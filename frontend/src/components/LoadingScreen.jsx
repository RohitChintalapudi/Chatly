const LoadingScreen = () => {
  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-[var(--surface)] transition-colors duration-300 select-none">
      <div className="flex flex-col items-center justify-center">
        <img
          src="/chatly-logo.png"
          alt="Chatly"
          className="w-16 h-16 sm:w-20 sm:h-20 object-contain animate-pulse"
        />
      </div>
    </div>
  );
};

export default LoadingScreen;
