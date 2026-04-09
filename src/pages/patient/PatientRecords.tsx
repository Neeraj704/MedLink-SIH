import { motion } from 'framer-motion';
import { FileText, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { toast } from 'sonner';

const records = [
  {
    id: 1, date: '2026-04-09', doctor: 'Dr. Sharma', clinic: 'MedLink Clinic, Noida',
    diagnosis: 'Gastroenteritis (ICD-11: 1A3Z)',
    ayush: { ayurveda: 'Grahani', siddha: 'Kirani', unani: 'Ishaal' },
    vitals: { bp: '120/80', hr: '72', spo2: '98%', temp: '98.6°F' },
    complaint: 'Abdominal pain, loose motions for 3 days',
    prescription: [
      { drug: 'ORS Sachets', dosage: '1 sachet', frequency: 'After each episode', duration: '5 days' },
      { drug: 'Omeprazole 20mg', dosage: '1 tab', frequency: 'Once daily', duration: '7 days' },
    ],
    fhirAvailable: true
  },
  {
    id: 2, date: '2026-04-02', doctor: 'Dr. Patel', clinic: 'City Hospital, Delhi',
    diagnosis: 'Routine Checkup',
    ayush: null,
    vitals: { bp: '118/76', hr: '68', spo2: '99%', temp: '98.2°F' },
    complaint: 'Annual health checkup',
    prescription: [],
    fhirAvailable: true
  },
  {
    id: 3, date: '2026-03-20', doctor: 'Dr. Singh', clinic: 'Wellness Centre, Gurugram',
    diagnosis: 'Migraine (ICD-11: 8A80)',
    ayush: { ayurveda: 'Ardhavabhedaka', siddha: 'Otrai Pakkathalaivali', unani: 'Shaqeeqa' },
    vitals: { bp: '130/85', hr: '78', spo2: '97%', temp: '99.1°F' },
    complaint: 'Severe headache on left side, nausea',
    prescription: [
      { drug: 'Sumatriptan 50mg', dosage: '1 tab', frequency: 'As needed', duration: 'SOS' },
      { drug: 'Paracetamol 500mg', dosage: '1 tab', frequency: 'Twice daily', duration: '3 days' },
    ],
    fhirAvailable: true
  },
];

export default function PatientRecords() {
  const [expanded, setExpanded] = useState<number | null>(null);

  const downloadFhir = (id: number) => {
    const record = records.find(r => r.id === id);
    if (!record) return;
    const fhir = {
      resourceType: "Bundle", type: "collection",
      entry: [{
        resource: {
          resourceType: "Condition",
          code: { text: record.diagnosis },
          subject: { display: "Patient" },
          recordedDate: record.date,
        }
      }]
    };
    const blob = new Blob([JSON.stringify(fhir, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `fhir_record_${record.date}.json`;
    a.click();
    toast.success('FHIR JSON downloaded');
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">My Records</h1>
        <p className="text-muted-foreground text-sm mt-1">View your complete medical history timeline</p>
      </motion.div>

      {/* Timeline */}
      <div className="relative space-y-4">
        <div className="absolute left-5 top-0 bottom-0 w-px bg-border hidden md:block" />
        {records.map((r) => (
          <motion.div key={r.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
            <Card className={`md:ml-12 relative ${expanded === r.id ? 'ring-1 ring-primary/30' : ''}`}>
              <div className="absolute -left-[2.1rem] top-4 w-3 h-3 rounded-full bg-primary border-2 border-background hidden md:block" />
              <CardHeader className="pb-2 cursor-pointer" onClick={() => setExpanded(expanded === r.id ? null : r.id)}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">{r.date}</div>
                    <CardTitle className="text-base">{r.diagnosis}</CardTitle>
                    <div className="text-sm text-muted-foreground mt-1">{r.doctor} • {r.clinic}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {r.fhirAvailable && <Badge variant="outline" className="text-xs">FHIR</Badge>}
                    {expanded === r.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </CardHeader>

              {expanded === r.id && (
                <CardContent className="pt-0 space-y-4">
                  {/* Vitals */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {Object.entries(r.vitals).map(([k, v]) => (
                      <div key={k} className="p-2 rounded-lg bg-muted/50 text-center">
                        <div className="text-xs text-muted-foreground capitalize">{k === 'bp' ? 'Blood Pressure' : k === 'hr' ? 'Heart Rate' : k === 'spo2' ? 'SpO₂' : 'Temperature'}</div>
                        <div className="font-semibold text-sm mt-1">{v}</div>
                      </div>
                    ))}
                  </div>

                  {/* Complaint */}
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Chief Complaint</div>
                    <p className="text-sm">{r.complaint}</p>
                  </div>

                  {/* Ayush mapping */}
                  {r.ayush && (
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                        <div className="text-xs text-muted-foreground">Ayurveda</div>
                        <div className="font-medium text-sm mt-1">{r.ayush.ayurveda}</div>
                      </div>
                      <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                        <div className="text-xs text-muted-foreground">Siddha</div>
                        <div className="font-medium text-sm mt-1">{r.ayush.siddha}</div>
                      </div>
                      <div className="p-3 rounded-lg bg-violet-500/5 border border-violet-500/20">
                        <div className="text-xs text-muted-foreground">Unani</div>
                        <div className="font-medium text-sm mt-1">{r.ayush.unani}</div>
                      </div>
                    </div>
                  )}

                  {/* Prescription */}
                  {r.prescription.length > 0 && (
                    <div>
                      <div className="text-xs text-muted-foreground mb-2">Prescription</div>
                      <div className="space-y-2">
                        {r.prescription.map((p, i) => (
                          <div key={i} className="flex items-center justify-between p-2 rounded border text-sm">
                            <span className="font-medium">{p.drug}</span>
                            <span className="text-muted-foreground text-xs">{p.frequency} • {p.duration}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => downloadFhir(r.id)}>
                      <Download className="w-3 h-3 mr-1" /> FHIR JSON
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => toast.success('PDF download started')}>
                      <Download className="w-3 h-3 mr-1" /> Prescription PDF
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
