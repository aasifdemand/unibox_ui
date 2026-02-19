const Logo = () => {
  return (
    <div className="flex items-center gap-3">
      {/* Logo icon */}
      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-linear-to-br from-blue-600 to-indigo-700 shadow-lg shadow-blue-500/20">
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      </div>

      {/* Brand name and tagline */}
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold bg-linear-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
          Unibox
        </h1>
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.2em]">
          Campaign Platform
        </p>
      </div>
    </div>
  );
};

export default Logo;
