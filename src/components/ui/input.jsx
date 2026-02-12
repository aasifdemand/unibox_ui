import { useState } from "react";
import { Eye, EyeOff, Search, X } from "lucide-react";

const Input = ({
  type = "text",
  label,
  placeholder,
  value,
  onChange,
  onBlur, // ✅ allow blur for zod field validation
  name,
  error,
  success,
  helperText,
  icon: Icon,
  required = false,
  disabled = false,
  className = "",
  showClearButton = false,
  onClear,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = name || label?.toLowerCase().replace(/\s+/g, "-");
  const helperId = `${inputId}-help`;

  const inputType = type === "password" && showPassword ? "text" : type;

  const baseStyles =
    "w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none transition";
  const stateStyles = error
    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
    : success
      ? "border-green-300 focus:border-green-500 focus:ring-green-500"
      : "border-gray-300 focus:border-blue-500 focus:ring-blue-500";
  const disabledStyles = disabled
    ? "bg-gray-100 cursor-not-allowed opacity-70"
    : "bg-white";

  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {/* Left Icon */}
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}

        {/* Input Field */}
        <input
          id={inputId}
          type={inputType}
          value={value}
          onChange={onChange}
          onBlur={onBlur} // ✅ Zod-friendly
          name={name}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={!!error} // ✅ accessibility
          aria-describedby={helperText || error ? helperId : undefined}
          className={`
            ${baseStyles}
            ${stateStyles}
            ${disabledStyles}
            ${Icon ? "pl-10" : ""}
            ${type === "password" || showClearButton ? "pr-10" : ""}
            ${className}
          `}
          {...props}
        />

        {/* Password Toggle */}
        {type === "password" && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            )}
          </button>
        )}

        {/* Clear Button */}
        {showClearButton && value && !disabled && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={onClear}
            tabIndex={-1}
          >
            <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Helper Text / Error */}
      {(helperText || error) && (
        <p
          id={helperId}
          className={`text-sm ${
            error
              ? "text-red-600"
              : success
                ? "text-green-600"
                : "text-gray-500"
          }`}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
};

// Convenience exports
Input.Password = (props) => <Input type="password" {...props} />;
Input.Email = (props) => <Input type="email" {...props} />;
Input.Search = (props) => (
  <Input type="search" icon={Search} showClearButton {...props} />
);

export default Input;
