import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  formatPhone,
  formatAadhaar,
  formatAbhaHpr,
  unformat,
} from "@/lib/formatters";
import {
  Activity,
  Mail,
  Shield,
  CreditCard,
  Fingerprint,
  ArrowRight,
  Eye,
  EyeOff,
  Clock,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useAuth,
  type UserRole,
  type AuthMethod,
} from "@/contexts/AuthContext";
import { toast } from "sonner";

type AuthStep = "role" | "login" | "otp";

export default function AuthPage() {
  const navigate = useNavigate();
  const { login, verifyOtp } = useAuth();
  const [step, setStep] = useState<AuthStep>("role");
  const [role, setRole] = useState<UserRole>(null);
  const [method, setMethod] = useState<AuthMethod>(null);
  const [identifier, setIdentifier] = useState("");
  const [showId, setShowId] = useState(true);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [resendTimer, setResendTimer] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendTimer]);

  const handleRoleSelect = (r: UserRole) => {
    setRole(r);
    setStep("login");
  };

  const handleRequestOtp = () => {
    if (!identifier.trim()) {
      toast.error("Please enter your ID");
      return;
    }
    login(role, method, unformat(identifier));
    setStep("otp");
    setResendTimer(45);
    setTimeout(() => otpRefs.current[0]?.focus(), 100);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value[value.length - 1];
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
    if (newOtp.every((d) => d !== "")) {
      const code = newOtp.join("");
      setTimeout(() => {
        const success = verifyOtp(code);
        if (success) {
          toast.success("Verified successfully!");
          navigate(role === "doctor" ? "/doctor" : "/patient");
        } else {
          toast.error("Invalid OTP. Use 587315");
          setOtp(["", "", "", "", "", ""]);
          otpRefs.current[0]?.focus();
        }
      }, 300);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    setResendTimer(45);
    toast.info("OTP resent");
  };

  const doctorMethods: {
    method: AuthMethod;
    icon: typeof Mail;
    label: string;
    placeholder: string;
  }[] = [
    {
      method: "gmail",
      icon: Mail,
      label: "Continue with Gmail",
      placeholder: "Enter your Gmail address",
    },
    {
      method: "hpr",
      icon: Shield,
      label: "Continue with HPR ID",
      placeholder: "Enter your HPR ID",
    },
  ];

  const patientMethods: {
    method: AuthMethod;
    icon: typeof CreditCard;
    label: string;
    placeholder: string;
  }[] = [
    {
      method: "abha",
      icon: CreditCard,
      label: "Continue with ABHA ID",
      placeholder: "Enter your 14-digit ABHA ID",
    },
    {
      method: "aadhaar",
      icon: Fingerprint,
      label: "Continue with Aadhaar",
      placeholder: "Enter your 12-digit Aadhaar",
    },
  ];

  const methods = role === "doctor" ? doctorMethods : patientMethods;

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative items-center justify-center p-12">
        <div className="text-primary-foreground max-w-md">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
              <Activity className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold">MedLink</span>
          </div>
          <h2 className="text-3xl font-bold mb-4">
            {step === "role"
              ? "Welcome to the future of healthcare."
              : role === "doctor"
                ? "Empowering healthcare professionals."
                : "Your health records, simplified."}
          </h2>
          <p className="text-primary-foreground/70 text-lg">
            {step === "role"
              ? "FHIR-compliant records, Ayush integration, and seamless patient care."
              : role === "doctor"
                ? "Manage patients, encode FHIR records, and translate disease codes across Ayush systems."
                : "Access prescriptions in your language, find doctors nearby, and download records instantly."}
          </p>
          <div className="mt-12 space-y-3">
            {[
              "HL7 FHIR R4 Compliant",
              "ICD-11 & Ayush Mapping",
              "End-to-end Encrypted",
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 text-primary-foreground/80 text-sm"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground/60" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right auth panel */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          {step !== "role" && (
            <button
              onClick={() => {
                setStep(step === "otp" ? "login" : "role");
                setOtp(["", "", "", "", "", ""]);
                setMethod(null);
              }}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          )}

          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Activity className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">MedLink</span>
          </div>

          <AnimatePresence mode="wait">
            {step === "role" && (
              <motion.div
                key="role"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h1 className="text-2xl font-bold mb-2">Welcome Back</h1>
                <p className="text-muted-foreground mb-8">
                  Select your role to continue
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    {
                      r: "doctor" as UserRole,
                      label: "Doctor",
                      desc: "Manage patients & records",
                      icon: "🩺",
                    },
                    {
                      r: "patient" as UserRole,
                      label: "Patient",
                      desc: "View records & prescriptions",
                      icon: "🏥",
                    },
                  ].map(({ r, label, desc, icon }) => (
                    <button
                      key={r}
                      onClick={() => handleRoleSelect(r)}
                      className="p-6 rounded-xl border-2 border-border hover:border-primary text-left transition-all card-hover group"
                    >
                      <span className="text-3xl mb-3 block">{icon}</span>
                      <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                        {label}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {desc}
                      </p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === "login" && (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h1 className="text-2xl font-bold mb-2">
                  Sign in as {role === "doctor" ? "Doctor" : "Patient"}
                </h1>
                <p className="text-muted-foreground mb-8">
                  Choose your authentication method
                </p>

                {!method ? (
                  <div className="space-y-3">
                    {methods.map((m) => (
                      <button
                        key={m.method}
                        onClick={() => setMethod(m.method)}
                        className="w-full flex items-center gap-3 p-4 rounded-xl border hover:border-primary hover:bg-accent/50 transition-all text-left"
                      >
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                          <m.icon className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <span className="font-medium">{m.label}</span>
                        <ArrowRight className="w-4 h-4 ml-auto text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative">
                      <Input
                        type={showId ? "text" : "password"}
                        placeholder={
                          methods.find((m) => m.method === method)?.placeholder
                        }
                        value={identifier}
                        onChange={(e) => {
                          let val = e.target.value;
                          if (method === "aadhaar") val = formatAadhaar(val);
                          else if (method === "abha" || method === "hpr")
                            val = formatAbhaHpr(val);
                          setIdentifier(val);
                        }}
                        className="pr-10 h-12"
                      />
                      <button
                        onClick={() => setShowId(!showId)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showId ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <Button onClick={handleRequestOtp} className="w-full h-12">
                      Request OTP <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    <button className="text-xs text-primary hover:underline">
                      Forgot your ID?
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {step === "otp" && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h1 className="text-2xl font-bold mb-2">Verify OTP</h1>
                <p className="text-muted-foreground mb-8">
                  Enter the 6-digit code sent to your registered{" "}
                  {method === "gmail" ? "email" : "mobile"}
                </p>
                <div className="flex gap-3 justify-center mb-8">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => {
                        otpRefs.current[i] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className="w-12 h-14 text-center text-xl font-semibold border-2 rounded-xl bg-background focus:border-primary focus:ring-2 focus:ring-ring outline-none transition-all"
                    />
                  ))}
                </div>
                <div className="text-center">
                  {resendTimer > 0 ? (
                    <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Resend in {resendTimer}s
                    </p>
                  ) : (
                    <button
                      onClick={handleResend}
                      className="text-sm text-primary font-medium hover:underline"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground text-center mt-6">
                  Hint: Use{" "}
                  <span className="font-mono font-semibold text-foreground">
                    587315
                  </span>{" "}
                  to verify
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
