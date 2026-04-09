import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, Thermometer, Droplets, Wind, Weight, 
  FileText, Plus, Trash2, Save, Send
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface Medication {
  drug: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export default function ConsultationDesk() {
  const [vitals, setVitals] = useState({ bp: '', heartRate: '', spo2: '', temp: '', weight: '' });
  const [complaint, setComplaint] = useState('');
  const [history, setHistory] = useState('');
  const [medications, setMedications] = useState<Medication[]>([
    { drug: '', dosage: '', frequency: '', duration: '', instructions: '' }
  ]);

  const addMedication = () => {
    setMedications([...medications, { drug: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
  };

  const removeMedication = (i: number) => {
    setMedications(medications.filter((_, idx) => idx !== i));
  };

  const updateMedication = (i: number, field: keyof Medication, value: string) => {
    const updated = [...medications];
    updated[i][field] = value;
    setMedications(updated);
  };

  const handleSave = () => {
    toast.success('Consultation saved as draft');
  };

  const handlePublish = () => {
    toast.success('Consultation published to patient portal');
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">Consultation Desk</h1>
        <p className="text-muted-foreground text-sm mt-1">Record patient vitals, symptoms, and prescriptions</p>
      </motion.div>

      {/* Patient info bar */}
      <Card className="bg-accent/30">
        <CardContent className="p-4 flex flex-wrap items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">RK</div>
          <div>
            <div className="font-medium">Rahul Kumar</div>
            <div className="text-xs text-muted-foreground font-mono">ABHA-1234-5678</div>
          </div>
          <Badge variant="outline" className="ml-auto">Active Session</Badge>
        </CardContent>
      </Card>

      {/* Vitals */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" /> Vitals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { key: 'bp' as const, label: 'Blood Pressure', icon: Droplets, placeholder: '120/80', unit: 'mmHg' },
              { key: 'heartRate' as const, label: 'Heart Rate', icon: Heart, placeholder: '72', unit: 'bpm' },
              { key: 'spo2' as const, label: 'SpO₂', icon: Wind, placeholder: '98', unit: '%' },
              { key: 'temp' as const, label: 'Temperature', icon: Thermometer, placeholder: '98.6', unit: '°F' },
              { key: 'weight' as const, label: 'Weight', icon: Weight, placeholder: '70', unit: 'kg' },
            ].map((v) => (
              <div key={v.key}>
                <label className="text-xs text-muted-foreground mb-1 block">{v.label}</label>
                <div className="relative">
                  <Input
                    placeholder={v.placeholder}
                    value={vitals[v.key]}
                    onChange={e => setVitals({ ...vitals, [v.key]: e.target.value })}
                    className="pr-10"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{v.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chief Complaint & History */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Chief Complaint</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Describe the patient's primary complaint..."
              value={complaint}
              onChange={e => setComplaint(e.target.value)}
              rows={5}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Medical History</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Relevant past medical history, allergies, surgeries..."
              value={history}
              onChange={e => setHistory(e.target.value)}
              rows={5}
            />
          </CardContent>
        </Card>
      </div>

      {/* Prescription */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Prescription</CardTitle>
            <Button variant="outline" size="sm" onClick={addMedication}>
              <Plus className="w-4 h-4 mr-1" /> Add Medication
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {medications.map((med, i) => (
            <div key={i} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="secondary">Medication {i + 1}</Badge>
                {medications.length > 1 && (
                  <Button variant="ghost" size="icon" onClick={() => removeMedication(i)}>
                    <Trash2 className="w-4 h-4 text-muted-foreground" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="col-span-2 md:col-span-1">
                  <label className="text-xs text-muted-foreground mb-1 block">Drug Name</label>
                  <Input placeholder="e.g., Paracetamol" value={med.drug} onChange={e => updateMedication(i, 'drug', e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Dosage</label>
                  <Input placeholder="e.g., 500mg" value={med.dosage} onChange={e => updateMedication(i, 'dosage', e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Frequency</label>
                  <Select value={med.frequency} onValueChange={v => updateMedication(i, 'frequency', v)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="od">Once Daily</SelectItem>
                      <SelectItem value="bd">Twice Daily</SelectItem>
                      <SelectItem value="tds">Thrice Daily</SelectItem>
                      <SelectItem value="sos">As Needed (SOS)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Duration</label>
                  <Input placeholder="e.g., 5 days" value={med.duration} onChange={e => updateMedication(i, 'duration', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Special Instructions</label>
                <Textarea placeholder="e.g., Take after meals" value={med.instructions} onChange={e => updateMedication(i, 'instructions', e.target.value)} rows={2} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-end">
        <Button variant="outline" onClick={handleSave}><Save className="w-4 h-4 mr-2" /> Save Draft</Button>
        <Button onClick={handlePublish}><Send className="w-4 h-4 mr-2" /> Publish to Patient</Button>
      </div>
    </div>
  );
}
