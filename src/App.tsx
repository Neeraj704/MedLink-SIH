import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";

import DoctorLayout from "./layouts/DoctorLayout";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import DoctorPatients from "./pages/doctor/DoctorPatients";
import ConsultationDesk from "./pages/doctor/ConsultationDesk";
import CodeTranslation from "./pages/doctor/CodeTranslation";
import DoctorAppointments from "./pages/doctor/DoctorAppointments";
import FhirRecords from "./pages/doctor/FhirRecords";
import ClinicSettings from "./pages/doctor/ClinicSettings";
import DoctorProfile from "./pages/doctor/DoctorProfile";

import PatientLayout from "./layouts/PatientLayout";
import PatientDashboard from "./pages/patient/PatientDashboard";
import PatientRecords from "./pages/patient/PatientRecords";
import PatientPrescriptions from "./pages/patient/PatientPrescriptions";
import FindDoctors from "./pages/patient/FindDoctors";
import PatientAppointments from "./pages/patient/PatientAppointments";
import PatientDocuments from "./pages/patient/PatientDocuments";
import PatientProfile from "./pages/patient/PatientProfile";

const queryClient = new QueryClient();

function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode; requiredRole: 'doctor' | 'patient' }) {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  if (role !== requiredRole) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />

      <Route path="/doctor" element={<ProtectedRoute requiredRole="doctor"><DoctorLayout /></ProtectedRoute>}>
        <Route index element={<DoctorDashboard />} />
        <Route path="patients" element={<DoctorPatients />} />
        <Route path="consultation" element={<ConsultationDesk />} />
        <Route path="code-translation" element={<CodeTranslation />} />
        <Route path="appointments" element={<DoctorAppointments />} />
        <Route path="fhir" element={<FhirRecords />} />
        <Route path="clinic-settings" element={<ClinicSettings />} />
        <Route path="profile" element={<DoctorProfile />} />
      </Route>

      <Route path="/patient" element={<ProtectedRoute requiredRole="patient"><PatientLayout /></ProtectedRoute>}>
        <Route index element={<PatientDashboard />} />
        <Route path="records" element={<PatientRecords />} />
        <Route path="prescriptions" element={<PatientPrescriptions />} />
        <Route path="doctors" element={<FindDoctors />} />
        <Route path="appointments" element={<PatientAppointments />} />
        <Route path="documents" element={<PatientDocuments />} />
        <Route path="profile" element={<PatientProfile />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
