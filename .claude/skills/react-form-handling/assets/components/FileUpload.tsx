import React from 'react';
import { Control, Controller, FieldError } from 'react-hook-form';

interface FileUploadProps {
  name: string;
  label: string;
  control: Control<any>;
  error?: FieldError;
}

const FileUpload: React.FC<FileUploadProps> = ({
  name,
  label,
  control,
  error,
}) => {
  const isInvalid = !!error;

  return (
    <div className="form-group">
      <label htmlFor={name}>{label}</label>
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, onBlur, name, ref } }) => (
          <input
            id={name}
            type="file"
            onChange={(e) => onChange(e.target.files)}
            onBlur={onBlur}
            name={name}
            ref={ref}
            aria-invalid={isInvalid}
            aria-describedby={`${name}-error`}
          />
        )}
      />
      {error && (
        <p id={`${name}-error`} role="alert" className="error-message">
          {error.message}
        </p>
      )}
    </div>
  );
};

export default FileUpload;
