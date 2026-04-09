import { motion } from 'framer-motion';
import { User, Mail, Phone, Shield, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function DoctorProfile() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your professional information</p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardContent className="p-6 text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold mx-auto mb-4">
              {user?.name?.charAt(0) || 'D'}
            </div>
            <h3 className="font-semibold text-lg">{user?.name || 'Dr. Sharma'}</h3>
            <p className="text-sm text-muted-foreground">General Medicine</p>
            <div className="flex justify-center gap-2 mt-3">
              <Badge>HPR Verified</Badge>
              <Badge variant="outline">Active</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Personal Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Full Name</label>
                <Input defaultValue={user?.name || 'Dr. Sharma'} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Email</label>
                <Input defaultValue="dr.sharma@medlink.in" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Phone</label>
                <Input defaultValue="+91 98765 43210" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">HPR ID</label>
                <Input defaultValue="HPR-2026-001234" disabled />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Registration Number</label>
                <Input defaultValue="MCI-12345" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Experience</label>
                <Input defaultValue="12 years" />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => toast.success('Profile updated')}><Save className="w-4 h-4 mr-2" /> Save Changes</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
