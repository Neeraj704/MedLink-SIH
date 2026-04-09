import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Activity, Shield, Globe, Stethoscope, Users, FileText, 
  ArrowRight, CheckCircle2, Zap, Database, Heart, Leaf,
  Sun, Moon, Menu, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { useState } from 'react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6 } }),
};

export default function LandingPage() {
  const { isDark, toggle } = useTheme();
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-50 glass-strong">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Activity className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">MedLink</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#doctors" className="hover:text-foreground transition-colors">For Doctors</a>
            <a href="#patients" className="hover:text-foreground transition-colors">For Patients</a>
            <a href="#technology" className="hover:text-foreground transition-colors">Technology</a>
          </nav>

          <div className="flex items-center gap-3">
            <button onClick={toggle} className="p-2 rounded-lg hover:bg-muted transition-colors">
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <Link to="/auth">
              <Button size="sm" className="hidden md:inline-flex">
                Welcome Back
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <button className="md:hidden p-2" onClick={() => setMobileMenu(!mobileMenu)}>
              {mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileMenu && (
          <div className="md:hidden border-t bg-background p-4 space-y-3">
            <a href="#features" className="block py-2 text-sm" onClick={() => setMobileMenu(false)}>Features</a>
            <a href="#doctors" className="block py-2 text-sm" onClick={() => setMobileMenu(false)}>For Doctors</a>
            <a href="#patients" className="block py-2 text-sm" onClick={() => setMobileMenu(false)}>For Patients</a>
            <a href="#technology" className="block py-2 text-sm" onClick={() => setMobileMenu(false)}>Technology</a>
            <Link to="/auth" onClick={() => setMobileMenu(false)}>
              <Button size="sm" className="w-full mt-2">Welcome Back</Button>
            </Link>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/50 via-transparent to-transparent" />
        <div className="container mx-auto px-4 py-24 md:py-32 relative">
          <motion.div 
            className="max-w-3xl mx-auto text-center"
            initial="hidden" animate="visible"
          >
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border bg-card text-xs font-medium mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              FHIR & AYUSH Integrated Platform
            </motion.div>
            <motion.h1 variants={fadeUp} custom={1} className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
              The Future of
              <span className="text-primary"> Healthcare</span>
              <br />Management
            </motion.h1>
            <motion.p variants={fadeUp} custom={2} className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Bridging modern medicine with India's traditional Ayush systems through 
              HL7 FHIR-compliant, ICD-11 encoded patient records.
            </motion.p>
            <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button size="lg" className="text-base px-8">
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="text-base px-8">
                Request a Demo
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y bg-muted/30">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '<50ms', label: 'Query Latency' },
              { value: '100%', label: 'FHIR Compliant' },
              { value: '50K+', label: 'Active Records' },
              { value: '99.9%', label: 'Uptime SLA' },
            ].map((stat, i) => (
              <motion.div key={i} className="text-center" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: i * 0.1 }}>
                <div className="text-2xl md:text-3xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* For Doctors */}
      <section id="doctors" className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-primary text-sm font-medium mb-4">
              <Stethoscope className="w-4 h-4" /> FOR DOCTORS
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Streamline Your Practice</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              From consultation to FHIR encoding — manage patients, translate disease codes across Ayush systems, and generate compliant records.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Database, title: 'Disease Code Translation', desc: 'ICD-11 to Ayurveda, Siddha & Unani instant mapping with AI precision scoring.' },
              { icon: FileText, title: 'FHIR Encoding', desc: 'Generate HL7 FHIR-compliant Observation, Condition & Bundle resources in one click.' },
              { icon: Shield, title: 'Secure Patient Linking', desc: 'Link consultations via ABHA, Aadhaar, HPR ID or Gmail with OTP verification.' },
            ].map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }}
                className="p-6 rounded-xl border bg-card card-hover">
                <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-accent-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* For Patients */}
      <section id="patients" className="py-20 md:py-28 bg-muted/20">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-primary text-sm font-medium mb-4">
              <Heart className="w-4 h-4" /> FOR PATIENTS
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Your Health, Your Control</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Access records, download prescriptions in your language, find nearby doctors, and manage appointments seamlessly.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Globe, title: 'Multilingual Prescriptions', desc: 'Translate prescriptions to Hindi, Tamil, Gujarati and more regional languages.' },
              { icon: Users, title: 'Doctors Near Me', desc: 'Geolocation-based doctor search with specialty filters and appointment booking.' },
              { icon: FileText, title: 'Download Center', desc: 'Export your medical history as FHIR JSON or download prescriptions as PDF.' },
            ].map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }}
                className="p-6 rounded-xl border bg-card card-hover">
                <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-accent-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology */}
      <section id="technology" className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-primary text-sm font-medium mb-4">
              <Leaf className="w-4 h-4" /> ADVANCED TECHNOLOGY
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">FHIR & Ayush Integration</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              First-of-its-kind platform combining WHO ICD-11 standards with India's traditional medicine coding systems.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              { title: 'HL7 FHIR R4', items: ['Observation Resources', 'Condition Bundles', 'Patient Demographics', 'Interoperable JSON'] },
              { title: 'AYUSH Mapping', items: ['Ayurveda (NAMC)', 'Siddha (NAMC)', 'Unani (NUMC)', 'ICD-11 Bridge Codes'] },
            ].map((col, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: i === 0 ? -20 : 20 }} whileInView={{ opacity: 1, x: 0 }}
                className="p-6 rounded-xl border bg-card">
                <h3 className="font-semibold text-lg mb-4">{col.title}</h3>
                <ul className="space-y-3">
                  {col.items.map((item, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <Zap className="w-8 h-8 mx-auto mb-6 opacity-80" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Healthcare?</h2>
          <p className="text-primary-foreground/70 max-w-xl mx-auto mb-8">
            Join thousands of healthcare professionals using MedLink to bridge modern and traditional medicine.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" variant="secondary" className="text-base px-8">
                Sign Up Free
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-base px-8 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
              Download Whitepaper
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
                  <Activity className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="font-bold">MedLink</span>
              </div>
              <p className="text-sm text-muted-foreground">Bridging healthcare systems for a healthier India.</p>
            </div>
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'Documentation', 'API'] },
              { title: 'Company', links: ['About', 'Careers', 'Contact', 'Blog'] },
              { title: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'HIPAA', 'DISHA Compliance'] },
            ].map((col, i) => (
              <div key={i}>
                <h4 className="font-medium text-sm mb-3">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link, j) => (
                    <li key={j}>
                      <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t mt-8 pt-8 text-center text-xs text-muted-foreground">
            © 2026 MedLink. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
