import { AuthCard } from "@/components/auth/AuthCard";
import { SignUpForm } from "@/components/auth/SignUpForm";

export default function SignUpPage() {
  return (
    <AuthCard
      title="Create an account"
      description="Enter your details to get started"
    >
      <SignUpForm />
    </AuthCard>
  );
}
