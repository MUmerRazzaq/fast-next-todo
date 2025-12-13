import React from 'react';
import { UseFormRegister, FieldError } from 'react-hook-form';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  name: string;
  label: string;
  register: UseFormRegister<any>;
  error?: FieldError;
  options: { value: string | number; label: string }[];
}

const Select: React.FC<SelectProps> = ({
  name,
  label,
  register,
  error,
  options,
  ...rest
}) => {
  const isInvalid = !!error;

  return (
    <div className="form-group">
      <label htmlFor={name}>{label}</label>
      <select
        id={name}
        {...register(name)}
        aria-invalid={isInvalid}
        aria-describedby={`${name}-error`}
        {...rest}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={`${name}-error`} role="alert" className="error-message">
          {error.message}
        </p>
      )}
    </div>
  );
};

export default Select;
