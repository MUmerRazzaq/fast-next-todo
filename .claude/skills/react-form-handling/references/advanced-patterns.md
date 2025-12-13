# Advanced Form Patterns

This guide covers more complex form scenarios like multi-step wizards and file uploads.

## Multi-Step Forms (Wizards)

For multi-step forms, the general idea is to manage the current step in a state variable and conditionally render the form fields for the current step. You can use a single `useForm` instance to manage the state of the entire form across all steps.

Here is a simplified example:

```tsx
import { useForm } from 'react-hook-form';
import { useState } from 'react';

const MyMultiStepForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const { register, handleSubmit, trigger, formState: { errors } } = useForm();

  const handleNext = async () => {
    // Trigger validation for the fields of the current step
    const fieldsToValidate = currentStep === 1 ? ['field1'] : ['field2'];
    const isValid = await trigger(fieldsToValidate);

    if (isValid) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const onSubmit = (data) => {
    console.log(data); // All data from all steps
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {currentStep === 1 && (
        <div>
          <label>Field 1</label>
          <input {...register('field1', { required: true })} />
          {errors.field1 && <p>This field is required</p>}
        </div>
      )}

      {currentStep === 2 && (
        <div>
          <label>Field 2</label>
          <input {...register('field2', { required: true })} />
          {errors.field2 && <p>This field is required</p>}
        </div>
      )}

      {currentStep < 2 && <button type="button" onClick={handleNext}>Next</button>}
      {currentStep > 1 && <button type="button" onClick={() => setCurrentStep(prev => prev - 1)}>Back</button>}
      {currentStep === 2 && <button type="submit">Submit</button>}
    </form>
  );
};
```

### Key points for multi-step forms:

-   **State Management**: A simple `useState` is often enough to track the current step.
-   **Partial Validation**: Use `trigger()` to validate only the fields in the current step before proceeding to the next.
-   **Navigation**: Provide "Next" and "Back" buttons to navigate between steps.
-   **Single `useForm`**: A single `useForm` instance holds the state for the entire form, so data is preserved when moving between steps.

## File Uploads with Progress

Handling file uploads requires managing the file object and, for a better UX, showing upload progress.

Here's a pattern for a single file upload:

```tsx
import { useForm, Controller } from 'react-hook-form';
import { useState } from 'react';
import axios from 'axios';

const FileUploadForm = () => {
  const { control, handleSubmit } = useForm();
  const [uploadProgress, setUploadProgress] = useState(0);

  const onSubmit = async (data) => {
    const file = data.myFile[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post('/upload-endpoint', formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        },
      });
      // Handle successful upload
    } catch (error) {
      // Handle upload error
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="myFile"
        control={control}
        rules={{ required: 'File is required' }}
        render={({ field: { onChange, onBlur, name, ref }, fieldState: { error } }) => (
          <div>
            <input
              type="file"
              onChange={(e) => onChange(e.target.files)}
              onBlur={onBlur}
              name={name}
              ref={ref}
            />
            {error && <p>{error.message}</p>}
          </div>
        )}
      />

      {uploadProgress > 0 && <progress value={uploadProgress} max="100" />}

      <button type="submit">Upload</button>
    </form>
  );
};
```

### Key points for file uploads:

-   **Controlled Component**: File inputs are best handled as controlled components using the `<Controller>` component from `react-hook-form`.
-   **`FormData`**: Use the `FormData` API to prepare the file for sending to the server.
-   **Progress Tracking**: Use the `onUploadProgress` callback provided by your HTTP client (like `axios`) to update a state variable that tracks the upload progress.
-   **Visual Feedback**: Use the progress state to render a progress bar or other indicator.
-   **Validation**: You can add validation rules for file type, size, etc., in your schema or directly in the `rules` prop of the `Controller`.
