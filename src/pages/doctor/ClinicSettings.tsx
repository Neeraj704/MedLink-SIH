import { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, MapPin, Clock, Save, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const specializations = [
  'General Medicine', 'Cardiology', 'Dermatology', 'Pediatrics', 'Orthopedics',
  'ENT', 'Ophthalmology', 'Gynecology', 'Neurology', 'Psychiatry',
  'Ayurveda', 'Siddha', 'Unani', 'Homeopathy', 'Yoga & Naturopathy'
];

export default function ClinicSettings() {
  const [clinicName, setClinicName] = useState('MedLink Clinic');
  const [address, setAddress] = useState('123 Health Avenue, Sector 15, Noida');
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>(['General Medicine', 'Ayurveda']);
  const [hours, setHours] = useState([
    { day: 'Monday', from: '09:00', to: '17:00', active: true },
    { day: 'Tuesday', from: '09:00', to: '17:00', active: true },
    { day: 'Wednesday', from: '09:00', to: '17:00', active: true },
    { day: 'Thursday', from: '09:00', to: '17:00', active: true },
    { day: 'Friday', from: '09:00', to: '17:00', active: true },
    { day: 'Saturday', from: '10:00', to: '14:00', active: true },
    { day: 'Sunday', from: '', to: '', active: false },
  ]);

  const toggleSpec = (spec: string) => {
    setSelectedSpecs(prev => prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec]);
  };

  const toggleDay = (i: number) => {
    const updated = [...hours];
    updated[i].active = !updated[i].active;
    setHours(updated);
  };

  const handleSave = () => {
    toast.success('Clinic settings saved successfully');
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">Clinic Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Configure your clinic information for patient discovery</p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" /> Clinic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Clinic / Hospital Name</label>
              <Input value={clinicName} onChange={e => setClinicName(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Address</label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                <Input value={address} onChange={e => setAddress(e.target.value)} className="pl-9" placeholder="Enter clinic address" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Specializations</label>
              <div className="flex flex-wrap gap-2">
                {specializations.map(spec => (
                  <Badge key={spec} variant={selectedSpecs.includes(spec) ? 'default' : 'outline'}
                    className="cursor-pointer" onClick={() => toggleSpec(spec)}>
                    {spec}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" /> Working Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {hours.map((h, i) => (
                <div key={h.day} className="flex items-center gap-3">
                  <button onClick={() => toggleDay(i)}
                    className={`w-20 text-sm font-medium text-left ${h.active ? 'text-foreground' : 'text-muted-foreground line-through'}`}>
                    {h.day.slice(0, 3)}
                  </button>
                  {h.active ? (
                    <>
                      <Input type="time" value={h.from} onChange={e => { const u = [...hours]; u[i].from = e.target.value; setHours(u); }} className="w-28 text-sm" />
                      <span className="text-muted-foreground text-sm">to</span>
                      <Input type="time" value={h.to} onChange={e => { const u = [...hours]; u[i].to = e.target.value; setHours(u); }} className="w-28 text-sm" />
                    </>
                  ) : (
                    <span className="text-sm text-muted-foreground">Closed</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Digital Signature */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Digital Signature</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground hover:border-primary/50 transition-colors cursor-pointer">
            <Plus className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Click to upload your digital signature</p>
            <p className="text-xs mt-1">PNG or SVG, max 2MB</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave}><Save className="w-4 h-4 mr-2" /> Save Settings</Button>
      </div>
    </div>
  );
}
