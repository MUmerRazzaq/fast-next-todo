import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md rounded-lg border bg-card p-8 shadow-lg">
        <div className="mb-8 text-center">
          {/* You can place a logo here */}
          <h1 className="text-2xl font-bold">Welcome</h1>
          <p className="text-muted-foreground">Please sign in to continue</p>
        </div>
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
