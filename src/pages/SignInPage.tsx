import { useSearchParams } from "react-router-dom";
import { AuthShell } from "@/components/auth/AuthShell";
import { parseRole } from "@/components/auth/auth-config";
import { SignInForm } from "@/components/auth/SignInForm";

export default function SignInPage() {
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role") || undefined;
  return (
    <AuthShell mode="signin">
      <SignInForm initialRole={parseRole(role)} />
    </AuthShell>
  );
}
