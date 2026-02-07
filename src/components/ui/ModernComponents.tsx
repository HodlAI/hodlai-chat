// Custom Gradient & Glass Components
export const GlassPanel = ({ 
  children, 
  className = "", 
  fullScreen = false
}: { 
  children: React.ReactNode, 
  className?: string,
  fullScreen?: boolean 
}) => (
  <div className={`
    ${fullScreen ? 'fixed inset-0 z-50' : 'relative rounded-2xl'}
    bg-white/80 dark:bg-[#0a0a0a]/80 
    backdrop-blur-xl 
    border border-white/20 dark:border-white/5 
    shadow-lg dark:shadow-2xl 
    ${className}
  `}>
    {children}
  </div>
);

export const GradientText = ({ children, className = "" }: any) => (
  <span className={`bg-clip-text text-transparent bg-gradient-to-r from-violet-500 via-purple-500 to-cyan-500 font-bold ${className}`}>
    {children}
  </span>
);

export const ButtonModern = ({ 
  children, 
  onClick, 
  className = "", 
  variant = 'primary',
  disabled = false
}: any) => {
  const base = "px-4 py-2 rounded-lg font-medium transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/20 border border-transparent",
    secondary: "bg-white/5 hover:bg-white/10 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 backdrop-blur-sm",
    ghost: "bg-transparent hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
  };

  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`${base} ${variants[variant as keyof typeof variants]} ${className}`}
    >
      {children}
    </button>
  );
};
