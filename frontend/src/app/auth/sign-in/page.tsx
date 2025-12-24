import { AuthCard } from "@/components/auth/AuthCard";
import { SignInForm } from "@/components/auth/SignInForm";

export default function SignInPage() {
  return (
    <AuthCard
      title="Welcome back"
      description="Enter your credentials to access your account"
    >
      <SignInForm />
    </AuthCard>
  );
}
