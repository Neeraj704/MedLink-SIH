import { useState } from 'react';
import { motion } from 'framer-motion';
import { Code2, Copy, Check, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

const sampleFhir = {
  resourceType: "Bundle",
  type: "collection",
  timestamp: new Date().toISOString(),
  entry: [
    {
      resource: {
        resourceType: "Patient",
        id: "pat-001",
        name: [{ use: "official", family: "Kumar", given: ["Rahul"] }],
        identifier: [{ system: "https://abha.abdm.gov.in", value: "ABHA-1234-5678" }],
        gender: "male",
        birthDate: "1990-05-15"
      }
    },
    {
      resource: {
        resourceType: "Condition",
        id: "cond-001",
        code: {
          coding: [
            { system: "http://id.who.int/icd/release/11", code: "1A3Z", display: "Gastroenteritis" },
            { system: "https://ayush.gov.in/namc/ayurveda", display: "Grahani" },
            { system: "https://ayush.gov.in/namc/siddha", display: "Kirani" },
            { system: "https://ayush.gov.in/numc/unani", display: "Ishaal" }
          ]
        },
        subject: { reference: "Patient/pat-001" },
        recordedDate: new Date().toISOString().split('T')[0]
      }
    },
    {
      resource: {
        resourceType: "Observation",
        id: "obs-bp",
        code: { coding: [{ system: "http://loinc.org", code: "85354-9", display: "Blood pressure" }] },
        component: [
          { code: { coding: [{ system: "http://loinc.org", code: "8480-6", display: "Systolic" }] }, valueQuantity: { value: 120, unit: "mmHg" } },
          { code: { coding: [{ system: "http://loinc.org", code: "8462-4", display: "Diastolic" }] }, valueQuantity: { value: 80, unit: "mmHg" } }
        ],
        subject: { reference: "Patient/pat-001" },
        effectiveDateTime: new Date().toISOString()
      }
    }
  ]
};

export default function FhirRecords() {
  const [copied, setCopied] = useState(false);
  const [published, setPublished] = useState(false);

  const fhirJson = JSON.stringify(sampleFhir, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(fhirJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('FHIR JSON copied to clipboard');
  };

  const handlePublish = () => {
    setPublished(true);
    toast.success('FHIR record published to patient portal');
  };

  const records = [
    { id: 'REC-001', patient: 'Rahul Kumar', date: '2026-04-09', type: 'Condition', status: 'Published' },
    { id: 'REC-002', patient: 'Priya Singh', date: '2026-04-08', type: 'Observation', status: 'Draft' },
    { id: 'REC-003', patient: 'Amit Verma', date: '2026-04-07', type: 'Bundle', status: 'Published' },
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">FHIR Records</h1>
        <p className="text-muted-foreground text-sm mt-1">Generate, preview, and publish HL7 FHIR-compliant records</p>
      </motion.div>

      {/* Generate action */}
      <Card className="doctor-blue-glow border-primary/20">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-lg">Generate FHIR Resource</h3>
              <p className="text-sm text-muted-foreground mt-1">Create an HL7 FHIR R4 Bundle from the current consultation data</p>
            </div>
            <div className="flex gap-3">
              <Dialog>
                <DialogTrigger asChild>
                  <Button><Code2 className="w-4 h-4 mr-2" /> Preview FHIR JSON</Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Code2 className="w-5 h-5 text-primary" />
                      FHIR Bundle Preview
                      <Badge variant="secondary" className="text-xs">R4</Badge>
                    </DialogTitle>
                  </DialogHeader>
                  <div className="relative flex-1 overflow-hidden">
                    <Button variant="ghost" size="sm" onClick={handleCopy} className="absolute top-2 right-2 z-10">
                      {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                    </Button>
                    <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-[55vh] text-xs font-mono leading-relaxed">
                      <code>{fhirJson}</code>
                    </pre>
                  </div>
                  <div className="flex gap-3 justify-end pt-2">
                    <Button variant="outline" onClick={handleCopy}>
                      {copied ? <><Check className="w-4 h-4 mr-2" /> Copied</> : <><Copy className="w-4 h-4 mr-2" /> Copy JSON</>}
                    </Button>
                    <Button onClick={handlePublish} disabled={published}>
                      <Send className="w-4 h-4 mr-2" /> {published ? 'Published' : 'Publish to Portal'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Records table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Record History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left py-3 font-medium">Record ID</th>
                  <th className="text-left py-3 font-medium">Patient</th>
                  <th className="text-left py-3 font-medium hidden sm:table-cell">Date</th>
                  <th className="text-left py-3 font-medium hidden sm:table-cell">Type</th>
                  <th className="text-left py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="py-3 font-mono text-xs">{r.id}</td>
                    <td className="py-3 font-medium">{r.patient}</td>
                    <td className="py-3 text-muted-foreground hidden sm:table-cell">{r.date}</td>
                    <td className="py-3 hidden sm:table-cell"><Badge variant="outline">{r.type}</Badge></td>
                    <td className="py-3">
                      <Badge variant={r.status === 'Published' ? 'default' : 'secondary'}>{r.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
