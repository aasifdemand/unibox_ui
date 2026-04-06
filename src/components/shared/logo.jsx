const Logo = ({ isCollapsed = false, showTagline = true, className = "" }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo icon */}
      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white shadow-lg shadow-purple-500/5 border border-purple-100 p-1 overflow-hidden shrink-0">
        <img src="/logo.svg" alt="Unibox Logo" className="w-full h-full object-contain" />
      </div>

      {/* Brand name and tagline - Only show if not collapsed */}
      {!isCollapsed && (
        <div className="flex flex-col -space-y-0.5 min-w-0">
          <h1 className="text-[18px] font-black text-slate-800 tracking-tight leading-none group-hover:text-purple-600 transition-colors">
            Unibox<span className="text-purple-600">.</span>
          </h1>
          {showTagline && (
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">
              AI Outreach
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Logo;
