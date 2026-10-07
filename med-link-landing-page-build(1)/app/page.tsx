import { AiSection } from "@/components/landing/AiSection";
import { Architecture } from "@/components/landing/Architecture";
import { BuiltForBharat } from "@/components/landing/BuiltForBharat";
import { DoctorPortal } from "@/components/landing/DoctorPortal";
import { Faq } from "@/components/landing/Faq";
import { Feasibility } from "@/components/landing/Feasibility";
import { FhirSection } from "@/components/landing/FhirSection";
import { FinalCta } from "@/components/landing/FinalCta";
import { Footer } from "@/components/landing/Footer";
import { Hero } from "@/components/landing/Hero";
import { Impact } from "@/components/landing/Impact";
import { LandingShell } from "@/components/landing/LandingShell";
import { Metrics } from "@/components/landing/Metrics";
import { Nav } from "@/components/landing/Nav";
import { NationalStack } from "@/components/landing/NationalStack";
import { PatientPortal } from "@/components/landing/PatientPortal";
import { Pipeline } from "@/components/landing/Pipeline";
import { Problem } from "@/components/landing/Problem";
import { ResearchTeam } from "@/components/landing/ResearchTeam";
import { RosettaDemo } from "@/components/landing/RosettaDemo";
import { SetuEngine } from "@/components/landing/SetuEngine";
import { StandardsMarquee } from "@/components/landing/StandardsMarquee";
import { TrustSafety } from "@/components/landing/TrustSafety";

export default function Page() {
  return (
    <LandingShell>
      <Nav />
      <main id="main">
        <Hero />
        <StandardsMarquee />
        <Problem />
        <RosettaDemo />
        <Pipeline />
        <SetuEngine />
        <FhirSection />
        <AiSection />
        <DoctorPortal />
        <PatientPortal />
        <TrustSafety />
        <BuiltForBharat />
        <NationalStack />
        <Architecture />
        <Impact />
        <Metrics />
        <Feasibility />
        <ResearchTeam />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </LandingShell>
  );
}
