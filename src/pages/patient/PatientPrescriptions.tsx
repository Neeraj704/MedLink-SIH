import { useState } from 'react';
import { motion } from 'framer-motion';
import { Pill, Languages, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const prescriptions = [
  { drug: 'Omeprazole 20mg', dosage: '1 tablet', frequency: 'Once daily before breakfast', duration: '7 days', instructions: 'Take on empty stomach' },
  { drug: 'ORS Sachets', dosage: '1 sachet in 200ml water', frequency: 'After each loose motion', duration: '5 days', instructions: 'Sip slowly' },
  { drug: 'Paracetamol 500mg', dosage: '1 tablet', frequency: 'Twice daily', duration: '3 days', instructions: 'Take after meals if fever' },
];

const translations: Record<string, Record<string, { drug: string; instructions: string }>> = {
  hindi: {
    'Omeprazole 20mg': { drug: 'ओमेप्राज़ोल 20mg', instructions: 'खाली पेट लें' },
    'ORS Sachets': { drug: 'ओआरएस सैशे', instructions: 'धीरे-धीरे पिएं' },
    'Paracetamol 500mg': { drug: 'पैरासिटामोल 500mg', instructions: 'बुखार होने पर खाने के बाद लें' },
  },
  tamil: {
    'Omeprazole 20mg': { drug: 'ஓமெப்ராசோல் 20mg', instructions: 'வெறும் வயிற்றில் எடுக்கவும்' },
    'ORS Sachets': { drug: 'ORS பொட்டலங்கள்', instructions: 'மெதுவாக குடிக்கவும்' },
    'Paracetamol 500mg': { drug: 'பாராசிட்டமால் 500mg', instructions: 'காய்ச்சல் இருந்தால் உணவுக்குப் பிறகு எடுக்கவும்' },
  },
  gujarati: {
    'Omeprazole 20mg': { drug: 'ઓમેપ્રાઝોલ 20mg', instructions: 'ખાલી પેટે લો' },
    'ORS Sachets': { drug: 'ORS પેકેટ', instructions: 'ધીમે ધીમે પીવો' },
    'Paracetamol 500mg': { drug: 'પેરાસિટામોલ 500mg', instructions: 'તાવ હોય તો જમ્યા પછી લો' },
  },
};

export default function PatientPrescriptions() {
  const [lang, setLang] = useState('english');

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">Prescriptions</h1>
        <p className="text-muted-foreground text-sm mt-1">View and translate your current prescriptions</p>
      </motion.div>

      {/* Language selector */}
      <Card className="bg-accent/30">
        <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Languages className="w-5 h-5 text-primary" />
            <span className="font-medium text-sm">Prescription Language</span>
          </div>
          <Select value={lang} onValueChange={setLang}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="english">English</SelectItem>
              <SelectItem value="hindi">हिंदी (Hindi)</SelectItem>
              <SelectItem value="tamil">தமிழ் (Tamil)</SelectItem>
              <SelectItem value="gujarati">ગુજરાતી (Gujarati)</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Prescriptions */}
      <div className="space-y-4">
        {prescriptions.map((p, i) => {
          const translated = lang !== 'english' ? translations[lang]?.[p.drug] : null;
          return (
            <Card key={i} className="card-hover">
              <CardContent className="p-4">
                <div className={lang !== 'english' ? 'grid md:grid-cols-2 gap-4' : ''}>
                  {/* English */}
                  <div>
                    {lang !== 'english' && <Badge variant="outline" className="text-xs mb-2">English</Badge>}
                    <div className="flex items-center gap-2 mb-2">
                      <Pill className="w-4 h-4 text-primary" />
                      <span className="font-semibold">{p.drug}</span>
                    </div>
                    <div className="text-sm space-y-1 text-muted-foreground">
                      <div>Dosage: {p.dosage}</div>
                      <div>Frequency: {p.frequency}</div>
                      <div>Duration: {p.duration}</div>
                      <div>Note: {p.instructions}</div>
                    </div>
                  </div>

                  {/* Translated */}
                  {translated && (
                    <div className="border-l-2 border-primary/20 pl-4">
                      <Badge className="text-xs mb-2">{lang.charAt(0).toUpperCase() + lang.slice(1)}</Badge>
                      <div className="flex items-center gap-2 mb-2">
                        <Pill className="w-4 h-4 text-primary" />
                        <span className="font-semibold">{translated.drug}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <div>Note: {translated.instructions}</div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex gap-3">
        <Button onClick={() => toast.success('PDF download started')}>
          <Download className="w-4 h-4 mr-2" /> Download PDF
        </Button>
        <Button variant="outline" onClick={() => toast.success('FHIR JSON downloaded')}>
          <Download className="w-4 h-4 mr-2" /> Download FHIR JSON
        </Button>
      </div>
    </div>
  );
}
