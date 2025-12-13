import React from 'react';
import { UseFormRegister, FieldError } from 'react-hook-form';

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label: string;
  register: UseFormRegister<any>;
  error?: FieldError;
}

const TextInput: React.FC<TextInputProps> = ({
  name,
  label,
  register,
  error,
  ...rest
}) => {
  const isInvalid = !!error;

  return (
    <div className="form-group">
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        {...register(name)}
        aria-invalid={isInvalid}
        aria-describedby={`${name}-error`}
        {...rest}
      />
      {error && (
        <p id={`${name}-error`} role="alert" className="error-message">
          {error.message}
        </p>
      )}
    </div>
  );
};

export default TextInput;
