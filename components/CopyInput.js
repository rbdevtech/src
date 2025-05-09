'use client';

import CopyButton from './CopyButton';

export default function CopyInput({
  label,
  name,
  value,
  onChange,
  type = 'text',
  required = false,
  disabled = false,
  className = '',
  inputClassName = '',
  placeholder = '',
  copyable = true
}) {
  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={name}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          className={`border rounded-md px-3 py-2 w-full ${
            disabled ? 'bg-gray-100' : ''
          } ${copyable ? 'pr-10' : ''} ${inputClassName}`}
        />
        {copyable && value && (
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
            <CopyButton text={value} />
          </div>
        )}
      </div>
    </div>
  );
}