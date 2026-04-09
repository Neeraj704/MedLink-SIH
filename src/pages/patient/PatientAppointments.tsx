import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, X, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const upcomingAppts = [
  { id: 1, doctor: 'Dr. Sharma', specialty: 'General Medicine', date: '2026-04-12', time: '10:00 AM', status: 'Confirmed' },
  { id: 2, doctor: 'Dr. Patel', specialty: 'Cardiology', date: '2026-04-15', time: '2:00 PM', status: 'Pending' },
];

const pastAppts = [
  { id: 3, doctor: 'Dr. Singh', specialty: 'Neurology', date: '2026-03-20', time: '11:00 AM', status: 'Completed' },
  { id: 4, doctor: 'Dr. Gupta', specialty: 'Ayurveda', date: '2026-03-10', time: '3:00 PM', status: 'Completed' },
];

export default function PatientAppointments() {
  const [appointments, setAppointments] = useState(upcomingAppts);

  const cancel = (id: number) => {
    setAppointments(prev => prev.filter(a => a.id !== id));
    toast.success('Appointment cancelled');
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">Appointments</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your upcoming and past appointments</p>
      </motion.div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Upcoming</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {appointments.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">No upcoming appointments</div>
          )}
          {appointments.map(a => (
            <div key={a.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg gap-3">
              <div>
                <div className="font-medium">{a.doctor}</div>
                <div className="text-sm text-muted-foreground">{a.specialty}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                  <Calendar className="w-3 h-3" /> {a.date}
                  <Clock className="w-3 h-3 ml-2" /> {a.time}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={a.status === 'Confirmed' ? 'default' : 'secondary'}>{a.status}</Badge>
                <Button size="sm" variant="outline" onClick={() => toast.info('Reschedule feature')}>
                  <RefreshCw className="w-3 h-3 mr-1" /> Reschedule
                </Button>
                <Button size="sm" variant="outline" className="text-destructive" onClick={() => cancel(a.id)}>
                  <X className="w-3 h-3 mr-1" /> Cancel
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Past Appointments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {pastAppts.map(a => (
            <div key={a.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium">{a.doctor}</div>
                <div className="text-xs text-muted-foreground">{a.specialty} • {a.date} at {a.time}</div>
              </div>
              <Badge variant="secondary">{a.status}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
