import React from 'react';

const Input = React.forwardRef(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full space-y-1">
        {label && (
          <label className="block text-xs font-semibold text-slate-600 tracking-wide">
            {label}
          </label>
        )}

        <input
          ref={ref}
          className={`
            w-full rounded-xl border bg-white
            px-3.5 py-2.5 text-sm text-slate-800
            placeholder:text-slate-400
            shadow-sm
            transition-all duration-200 ease-out
            focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100
            hover:border-slate-400
            disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed
            ${error ? 'border-red-500 focus:ring-red-100' : 'border-slate-300'}
            ${className}
          `}
          {...props}
        />

        {error && (
          <p className="text-xs text-red-600 font-medium">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
