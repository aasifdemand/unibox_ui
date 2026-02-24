import React from 'react';
import { Calendar } from 'lucide-react';

const DatePicker = ({
  label,
  value,
  onChange,
  name,
  error,
  helperText,
  required = false,
  disabled = false,
  minDate,
  maxDate,
  showTime = true,
  className = '',
  ...props
}) => {
  const inputId = name || label?.toLowerCase().replace(/\s+/g, '-');

  const formatDateTimeLocal = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const pad = (num) => num.toString().padStart(2, '0');

    return showTime
      ? `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
      : `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  const handleChange = (e) => {
    if (onChange) {
      const value = e.target.value;
      onChange(value ? new Date(value).toISOString() : '');
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Calendar className="h-5 w-5 text-gray-400" />
        </div>
        <input
          id={inputId}
          type={showTime ? 'datetime-local' : 'date'}
          value={formatDateTimeLocal(value)}
          onChange={handleChange}
          name={name}
          disabled={disabled}
          min={minDate ? formatDateTimeLocal(minDate) : undefined}
          max={maxDate ? formatDateTimeLocal(maxDate) : undefined}
          className={`
            pl-10 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:outline-none transition
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
      </div>

      {(helperText || error) && (
        <p className={`text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
};

export default DatePicker;
