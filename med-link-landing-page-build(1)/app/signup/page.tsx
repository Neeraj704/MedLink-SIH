import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { parseRole } from "@/components/auth/auth-config";
import { SignUpForm } from "@/components/auth/SignUpForm";

export const metadata: Metadata = {
  title: "Create your account — MedLink",
  description: "Create a MedLink account as a patient or doctor and verify your mobile with a one-time code.",
};

export default async function SignUpPage({ searchParams }: { searchParams: Promise<{ role?: string | string[] }> }) {
  const { role } = await searchParams;
  return (
    <AuthShell mode="signup">
      <SignUpForm initialRole={parseRole(role)} />
    </AuthShell>
  );
}
