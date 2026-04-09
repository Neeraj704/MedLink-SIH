import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, FileText, Clock, Activity, TrendingUp, 
  Plus, Search, ArrowUpRight 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const stats = [
  { label: 'Patients Today', value: '12', icon: Users, trend: '+3' },
  { label: 'Pending FHIR', value: '4', icon: FileText, trend: '-1' },
  { label: 'Avg. Consult Time', value: '18m', icon: Clock, trend: '-2m' },
  { label: 'Compliance Rate', value: '96%', icon: TrendingUp, trend: '+1%' },
];

const recentPatients = [
  { name: 'Rahul Kumar', id: 'ABHA-1234-5678', time: '10:30 AM', status: 'Completed' },
  { name: 'Priya Singh', id: 'ABHA-2345-6789', time: '11:15 AM', status: 'In Progress' },
  { name: 'Amit Verma', id: 'ABHA-3456-7890', time: '12:00 PM', status: 'Pending' },
  { name: 'Sneha Patel', id: 'ABHA-4567-8901', time: '2:30 PM', status: 'Scheduled' },
];

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [linkMethod, setLinkMethod] = useState('');
  const [linkId, setLinkId] = useState('');
  const now = new Date();

  const handleLinkPatient = () => {
    if (!linkId.trim()) { toast.error('Enter patient identifier'); return; }
    toast.success(`Patient linked via ${linkMethod}: ${linkId}`);
    setLinkId('');
  };

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">Good {now.getHours() < 12 ? 'Morning' : now.getHours() < 17 ? 'Afternoon' : 'Evening'}, {user?.name || 'Doctor'}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {now.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} • {now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="card-hover">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
                    <stat.icon className="w-4 h-4 text-accent-foreground" />
                  </div>
                  <Badge variant="secondary" className="text-xs">{stat.trend}</Badge>
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Actions row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Dialog>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Link New Patient</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Link Patient</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <Select value={linkMethod} onValueChange={setLinkMethod}>
                <SelectTrigger><SelectValue placeholder="Select identifier type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="abha">ABHA ID</SelectItem>
                  <SelectItem value="aadhaar">Aadhaar</SelectItem>
                  <SelectItem value="gmail">Gmail</SelectItem>
                  <SelectItem value="phone">Phone Number</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="Enter patient identifier" value={linkId} onChange={e => setLinkId(e.target.value)} />
              <Button onClick={handleLinkPatient} className="w-full">Link Patient</Button>
            </div>
          </DialogContent>
        </Dialog>
        <Button variant="outline" asChild>
          <a href="/doctor/consultation"><FileText className="w-4 h-4 mr-2" /> New Consultation</a>
        </Button>
      </div>

      {/* Recent Patients */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Recent Patients</CardTitle>
            <Button variant="ghost" size="sm" className="text-xs">View All <ArrowUpRight className="w-3 h-3 ml-1" /></Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left py-3 font-medium">Patient</th>
                  <th className="text-left py-3 font-medium hidden sm:table-cell">ID</th>
                  <th className="text-left py-3 font-medium">Time</th>
                  <th className="text-left py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentPatients.map((p, i) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="py-3 font-medium">{p.name}</td>
                    <td className="py-3 text-muted-foreground hidden sm:table-cell font-mono text-xs">{p.id}</td>
                    <td className="py-3 text-muted-foreground">{p.time}</td>
                    <td className="py-3">
                      <Badge variant={p.status === 'Completed' ? 'default' : p.status === 'In Progress' ? 'secondary' : 'outline'} className="text-xs">
                        {p.status}
                      </Badge>
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
