import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { parseRole } from "@/components/auth/auth-config";
import { SignInForm } from "@/components/auth/SignInForm";

export const metadata: Metadata = {
  title: "Sign in — MedLink",
  description: "Sign in to MedLink with your ABHA number or HPR ID using a one-time code.",
};

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ role?: string | string[] }> }) {
  const { role } = await searchParams;
  return (
    <AuthShell mode="signin">
      <SignInForm initialRole={parseRole(role)} />
    </AuthShell>
  );
}
