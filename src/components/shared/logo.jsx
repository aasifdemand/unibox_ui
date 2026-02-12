const Logo = () => {
  return (
    <div className="mb-12 flex flex-col items-center">
      {/* Logo icon with gradient background */}
      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-blue-600 to-indigo-700 mb-4 shadow-lg shadow-blue-500/20">
        {/* Email/Envelope icon */}
        <svg
          className="w-8 h-8 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      </div>

      {/* Brand name */}
      <h1 className="text-3xl font-bold bg-linear-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
        Unibox
      </h1>

      {/* Tagline */}
      <p className="text-gray-600 mt-2 font-medium">Email Campaign Tool</p>
    </div>
  );
};

export default Logo;
