import React, { useId } from 'react';
import { Check } from 'lucide-react';

const Checkbox = ({
  label,
  checked,
  onChange,
  onBlur, // ✅ allow blur for zod usage
  name,
  id,
  disabled = false,
  required = false,
  error,
  helperText,
  className = '',
  labelClassName = '',
  ...props
}) => {
  const generatedId = useId();
  const checkboxId = id || name || generatedId;
  const helperId = `${checkboxId}-help`;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <div className="relative flex items-center justify-center h-5">
            <input
              id={checkboxId}
              name={name}
              type="checkbox"
              checked={checked}
              onChange={onChange}
              onBlur={onBlur} // ✅ Zod-friendly
              disabled={disabled}
              required={required}
              aria-invalid={!!error} // ✅ accessibility
              aria-describedby={helperText || error ? helperId : undefined}
              className={`
                h-5 w-5 appearance-none rounded border transition
                ${
                  error
                    ? 'border-red-300 checked:border-red-600 checked:bg-red-600'
                    : 'border-gray-300 checked:border-blue-600 checked:bg-blue-600'
                }
                ${
                  disabled
                    ? 'cursor-not-allowed opacity-50'
                    : 'cursor-pointer hover:border-blue-400 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                }
                focus:outline-none
              `}
              {...props}
            />
            {checked && (
              <Check
                className="
                  absolute ltr:left-1/2 ltr:right-1/2 rtl:left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                  h-3.5 w-3.5 text-white pointer-events-none
                "
              />
            )}
          </div>
        </div>

        {label && (
          <div className="ltr:ml-3 ltr:mr-3 rtl:ml-3">
            <label
              htmlFor={checkboxId}
              className={`
                text-sm font-medium select-none flex items-start min-h-5
                ${error ? 'text-red-700' : 'text-gray-700'}
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                ${labelClassName}
              `}
            >
              <span className="-mt-px">{label}</span>
              {required && <span className="text-red-500 ltr:ml-1 ltr:mr-1 rtl:ml-1">*</span>}
            </label>

            {helperText && !error && (
              <p id={helperId} className="text-sm text-gray-500 mt-1">
                {helperText}
              </p>
            )}
          </div>
        )}
      </div>

      {error && (
        <p id={helperId} className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};

// Compound Component for Checkbox Group
const CheckboxGroup = ({ children, label, error, helperText, className = '' }) => (
  <div className={`space-y-3 ${className}`}>
    {label && <legend className="text-sm font-medium text-gray-700 mb-2">{label}</legend>}

    <div className="space-y-2">{children}</div>

    {helperText && !error && <p className="text-sm text-gray-500">{helperText}</p>}

    {error && <p className="text-sm text-red-600">{error}</p>}
  </div>
);

CheckboxGroup.displayName = 'CheckboxGroup';
Checkbox.Group = CheckboxGroup;

export default Checkbox;
