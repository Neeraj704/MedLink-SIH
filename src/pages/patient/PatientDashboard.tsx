import { motion } from 'framer-motion';
import { Heart, Pill, Calendar, Activity, FileText, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

const stats = [
  { label: 'Total Visits', value: '8', icon: Calendar },
  { label: 'Active Meds', value: '3', icon: Pill },
  { label: 'Last Visit', value: 'Apr 9', icon: Activity },
  { label: 'Health Score', value: '92%', icon: Heart },
];

const recentVisits = [
  { date: '2026-04-09', doctor: 'Dr. Sharma', diagnosis: 'Gastroenteritis', status: 'FHIR Published' },
  { date: '2026-04-02', doctor: 'Dr. Patel', diagnosis: 'Routine Checkup', status: 'Completed' },
  { date: '2026-03-20', doctor: 'Dr. Singh', diagnosis: 'Migraine', status: 'FHIR Published' },
];

const activeMeds = [
  { drug: 'Paracetamol 500mg', frequency: 'Twice Daily', remaining: '3 days' },
  { drug: 'Omeprazole 20mg', frequency: 'Once Daily', remaining: '7 days' },
  { drug: 'ORS Sachets', frequency: 'As Needed', remaining: 'Ongoing' },
];

export default function PatientDashboard() {
  const { user } = useAuth();
  const now = new Date();

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">Good {now.getHours() < 12 ? 'Morning' : now.getHours() < 17 ? 'Afternoon' : 'Evening'}, {user?.name || 'Patient'}</h1>
        <p className="text-muted-foreground text-sm mt-1">Your health at a glance</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="card-hover">
              <CardContent className="p-4">
                <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center mb-3">
                  <s.icon className="w-4 h-4 text-accent-foreground" />
                </div>
                <div className="text-2xl font-bold">{s.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent visits */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Recent Visits</CardTitle>
              <Link to="/patient/records"><Button variant="ghost" size="sm" className="text-xs">View All</Button></Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentVisits.map((v, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <div>
                  <div className="font-medium text-sm">{v.diagnosis}</div>
                  <div className="text-xs text-muted-foreground">{v.doctor} • {v.date}</div>
                </div>
                <Badge variant="outline" className="text-xs">{v.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Active medications */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Active Medications</CardTitle>
              <Link to="/patient/prescriptions"><Button variant="ghost" size="sm" className="text-xs">View All</Button></Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeMeds.map((m, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <div className="font-medium text-sm">{m.drug}</div>
                  <div className="text-xs text-muted-foreground">{m.frequency}</div>
                </div>
                <Badge variant="secondary" className="text-xs">{m.remaining}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Vitals chart placeholder */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" /> Vitals Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center border rounded-lg bg-muted/20 text-muted-foreground text-sm">
            <div className="text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>Blood Pressure & Heart Rate trends</p>
              <p className="text-xs mt-1">Data visualization from your visit history</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
