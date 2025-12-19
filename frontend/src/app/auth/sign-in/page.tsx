import { AuthView } from "@daveyplate/better-auth-ui";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <AuthView
        localization={{
          INVALID_USERNAME_OR_PASSWORD:
            "Invalid credentials. Please try again.",
        }}
      />
    </div>
  );
}
