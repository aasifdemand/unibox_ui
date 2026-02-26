import { useState } from 'react';
import { Eye, EyeOff, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const Input = ({
  type = 'text',
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
  className = '',
  showClearButton = false,
  onClear,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputId = name || label?.toLowerCase().replace(/\s+/g, '-');
  const helperId = `${inputId}-help`;

  const inputType = type === 'password' && showPassword ? 'text' : type;

  const baseStyles =
    'w-full px-4 py-2 border rounded-lg focus:outline-none transition-all duration-300';
  const stateStyles = error
    ? 'border-red-300 focus:border-red-500 ring-red-500/10'
    : success
      ? 'border-green-300 focus:border-green-500 ring-green-500/10'
      : 'border-gray-200 focus:border-blue-500 ring-blue-500/5';
  const disabledStyles = disabled
    ? 'bg-gray-50 cursor-not-allowed opacity-70'
    : 'bg-white/50 backdrop-blur-sm';

  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ltr:ml-1 ltr:mr-1 rtl:ml-1"
        >
          {label}
          {required && <span className="text-red-500 ltr:ml-1 ltr:mr-1 rtl:ml-1">*</span>}
        </label>
      )}

      <motion.div
        animate={isFocused ? { scale: 1.01 } : { scale: 1 }}
        transition={{ duration: 0.2 }}
        className="relative"
      >
        {/* Left Icon */}
        {Icon && (
          <div className="absolute inset-y-0 ltr:left-0 ltr:right-0 rtl:left-0 ltr:pl-3 ltr:pr-3 rtl:pl-3 flex items-center pointer-events-none">
            <Icon
              className={`h-5 w-5 transition-colors duration-300 ${isFocused ? 'text-blue-500' : 'text-gray-400'}`}
            />
          </div>
        )}

        {/* Input Field */}
        <input
          id={inputId}
          type={inputType}
          value={value}
          onChange={onChange}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          onFocus={() => setIsFocused(true)}
          name={name}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={!!error} // ✅ accessibility
          aria-describedby={helperText || error ? helperId : undefined}
          className={`
            ${baseStyles}
            ${stateStyles}
            ${disabledStyles}
            ${Icon ? 'ltr:pl-10 ltr:pr-10 rtl:pl-10' : ''}
            ${type === 'password' || showClearButton ? 'ltr:pr-10 rtl:pl-10' : ''}
            ${isFocused ? 'ring-4' : ''}
            ${className}
          `}
          {...props}
        />

        {/* Password Toggle */}
        {type === 'password' && (
          <button
            type="button"
            className="absolute inset-y-0 ltr:right-0 rtl:left-0 ltr:pr-3 rtl:pl-3 flex items-center"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors" />
            ) : (
              <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors" />
            )}
          </button>
        )}

        {/* Clear Button */}
        {showClearButton && value && !disabled && (
          <button
            type="button"
            className="absolute inset-y-0 ltr:right-0 rtl:left-0 ltr:pr-3 rtl:pl-3 flex items-center"
            onClick={onClear}
            tabIndex={-1}
          >
            <X className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors" />
          </button>
        )}
      </motion.div>

      {/* Helper Text / Error */}
      <AnimatePresence mode="wait">
        {(helperText || error) && (
          <motion.p
            key={error ? 'error' : 'helper'}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            id={helperId}
            className={`text-[10px] font-bold uppercase tracking-widest px-1 ${
              error ? 'text-red-500' : success ? 'text-green-500' : 'text-slate-400'
            }`}
          >
            {error || helperText}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

// Convenience exports
const InputPassword = (props) => <Input type="password" {...props} />;
const InputEmail = (props) => <Input type="email" {...props} />;
const InputSearch = (props) => <Input type="search" icon={Search} showClearButton {...props} />;

InputPassword.displayName = 'InputPassword';
InputEmail.displayName = 'InputEmail';
InputSearch.displayName = 'InputSearch';

Input.Password = InputPassword;
Input.Email = InputEmail;
Input.Search = InputSearch;

export default Input;
