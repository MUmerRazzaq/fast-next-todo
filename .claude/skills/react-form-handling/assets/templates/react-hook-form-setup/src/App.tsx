import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import './index.css';

const schema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

function App() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(data);
    alert('Form submitted successfully!');
  };

  return (
    <div className="container">
      <h1>React Hook Form Template</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" {...register('email')} />
          {errors.email && <p className="error-message">{errors.email.message}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" {...register('password')} />
          {errors.password && <p className="error-message">{errors.password.message}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input id="confirmPassword" type="password" {...register('confirmPassword')} />
          {errors.confirmPassword && <p className="error-message">{errors.confirmPassword.message}</p>}
        </div>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  );
}

export default App;
