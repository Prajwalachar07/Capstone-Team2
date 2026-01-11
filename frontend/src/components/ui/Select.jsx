import React from 'react';

const Select = React.forwardRef(
  ({ label, error, options = [], placeholder, className = '', ...props }, ref) => {
    return (
      <div className="w-full space-y-1">
        {label && (
          <label className="block text-xs font-semibold text-slate-600 tracking-wide">
            {label}
          </label>
        )}

        <select
          ref={ref}
          className={`
            w-full rounded-xl border bg-white
            px-3.5 py-2.5 text-sm text-slate-800
            shadow-sm
            transition-all duration-200 ease-out
            focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100
            hover:border-slate-400
            disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed
            ${error ? 'border-red-500 focus:ring-red-100' : 'border-slate-300'}
            ${className}
          `}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {error && (
          <p className="text-xs text-red-600 font-medium">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
