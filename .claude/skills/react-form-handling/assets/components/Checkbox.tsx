import React from 'react';
import { UseFormRegister, FieldError } from 'react-hook-form';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label: string;
  register: UseFormRegister<any>;
  error?: FieldError;
}

const Checkbox: React.FC<CheckboxProps> = ({
  name,
  label,
  register,
  error,
  ...rest
}) => {
  const isInvalid = !!error;

  return (
    <div className="form-group">
      <label htmlFor={name}>
        <input
          id={name}
          type="checkbox"
          {...register(name)}
          aria-invalid={isInvalid}
          aria-describedby={`${name}-error`}
          {...rest}
        />
        {label}
      </label>
      {error && (
        <p id={`${name}-error`} role="alert" className="error-message">
          {error.message}
        </p>
      )}
    </div>
  );
};

export default Checkbox;
