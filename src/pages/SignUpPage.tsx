import { useSearchParams } from "react-router-dom";
import { AuthShell } from "@/components/auth/AuthShell";
import { parseRole } from "@/components/auth/auth-config";
import { SignUpForm } from "@/components/auth/SignUpForm";

export default function SignUpPage() {
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role") || undefined;
  return (
    <AuthShell mode="signup">
      <SignUpForm initialRole={parseRole(role)} />
    </AuthShell>
  );
}
