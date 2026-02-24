import { Loader2 } from "lucide-react";
import { motion } from "motion/react";

const Button = ({
  children,
  type = "button",
  variant = "primary",
  size = "medium",
  fullWidth = false,
  isLoading = false,
  disabled = false,
  onClick,
  className = "",
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variants = {
    primary:
      "bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:from-blue-700 hover:to-indigo-800 focus:ring-blue-500 shadow-lg shadow-blue-500/20",
    secondary:
      "bg-slate-100 text-slate-700 hover:bg-slate-200 focus:ring-slate-500",
    outline:
      "border border-slate-300 text-slate-700 hover:bg-slate-50 focus:ring-blue-500",
    ghost: "text-slate-700 hover:bg-slate-100 focus:ring-slate-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
  };

  const sizes = {
    small: "px-3 py-2 text-sm",
    medium: "px-4 py-2 text-sm",
    large: "px-6 py-2 text-base",
  };

  const widthClass = fullWidth ? "w-full" : "";
  const disabledClass =
    disabled || isLoading ? "opacity-70 cursor-not-allowed" : "";

  return (
    <motion.button
      whileHover={!disabled && !isLoading ? { scale: 1.02, translateY: -1 } : {}}
      whileTap={!disabled && !isLoading ? { scale: 0.98 } : {}}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      type={type}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${widthClass}
        ${disabledClass}
        ${className}
      `}
      disabled={disabled || isLoading}
      onClick={onClick}
      {...props}
    >
      {isLoading && <Loader2 className="animate-spin h-5 w-5 mr-2" />}
      {children}
    </motion.button>
  );
};

export default Button;
