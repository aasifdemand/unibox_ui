import React from 'react';

const Textarea = ({
  label,
  placeholder,
  value,
  onChange,
  name,
  error,
  helperText,
  required = false,
  disabled = false,
  rows = 4,
  className = '',
  ...props
}) => {
  const textareaId = name || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={textareaId} className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ltr:ml-1 ltr:mr-1 rtl:ml-1">*</span>}
        </label>
      )}

      <textarea
        id={textareaId}
        value={value}
        onChange={onChange}
        name={name}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        className={`
          w-full px-4 py-3 border rounded-lg focus:ring-2 focus:outline-none transition
          ${
            error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
          }
          ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-70' : 'bg-white'}
          ${className}
        `}
        {...props}
      />

      {(helperText || error) && (
        <p className={`text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
};

export default Textarea;
