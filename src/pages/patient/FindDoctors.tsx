import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Search, Sliders, Star, Calendar, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const doctors = [
  { name: 'Dr. Sharma', specialty: 'General Medicine', clinic: 'MedLink Clinic', address: 'Sector 15, Noida', distance: 2.3, rating: 4.8, available: true, nextSlot: '10:00 AM', lat: 28.5855, lng: 77.3100 },
  { name: 'Dr. Patel', specialty: 'Cardiology', clinic: 'Heart Care Center', address: 'Connaught Place, Delhi', distance: 8.1, rating: 4.9, available: true, nextSlot: '2:00 PM', lat: 28.6315, lng: 77.2167 },
  { name: 'Dr. Gupta', specialty: 'Ayurveda', clinic: 'Ayush Wellness', address: 'Sector 62, Noida', distance: 4.5, rating: 4.7, available: false, nextSlot: 'Tomorrow', lat: 28.6275, lng: 77.3650 },
  { name: 'Dr. Singh', specialty: 'Pediatrics', clinic: 'Kids Care Hospital', address: 'Greater Noida', distance: 12.0, rating: 4.6, available: true, nextSlot: '11:30 AM', lat: 28.4744, lng: 77.5040 },
  { name: 'Dr. Reddy', specialty: 'Dermatology', clinic: 'Skin & Glow Clinic', address: 'Mayur Vihar, Delhi', distance: 6.7, rating: 4.5, available: true, nextSlot: '4:00 PM', lat: 28.5924, lng: 77.2939 },
  { name: 'Dr. Iyer', specialty: 'Siddha', clinic: 'Traditional Medicine Hub', address: 'Lajpat Nagar, Delhi', distance: 9.2, rating: 4.4, available: true, nextSlot: '3:00 PM', lat: 28.5700, lng: 77.2400 },
];

const specialties = ['All', 'General Medicine', 'Cardiology', 'Ayurveda', 'Pediatrics', 'Dermatology', 'Siddha', 'Unani'];

export default function FindDoctors() {
  const [search, setSearch] = useState('');
  const [radius, setRadius] = useState([10]);
  const [specFilter, setSpecFilter] = useState('All');
  const [locationGranted, setLocationGranted] = useState(false);
  const [bookingDoctor, setBookingDoctor] = useState<string | null>(null);

  const requestLocation = () => {
    setLocationGranted(true);
    toast.success('Location access granted');
  };

  const filtered = doctors.filter(d => {
    if (specFilter !== 'All' && d.specialty !== specFilter) return false;
    if (d.distance > radius[0]) return false;
    if (search && !d.name.toLowerCase().includes(search.toLowerCase()) && !d.specialty.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">Find Doctors Near Me</h1>
        <p className="text-muted-foreground text-sm mt-1">Search by specialty, name, or location</p>
      </motion.div>

      {/* Location prompt */}
      {!locationGranted && (
        <Card className="bg-accent/30 border-primary/20">
          <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-primary" />
              <div>
                <div className="font-medium text-sm">Enable Location</div>
                <div className="text-xs text-muted-foreground">Allow location access to find nearby doctors</div>
              </div>
            </div>
            <Button size="sm" onClick={requestLocation}>Allow Location</Button>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by doctor name or specialty..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-3 items-center">
          <div className="flex items-center gap-2 min-w-[200px]">
            <Sliders className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <Slider value={radius} onValueChange={setRadius} min={1} max={20} step={1} />
            <span className="text-sm text-muted-foreground whitespace-nowrap">{radius[0]}km</span>
          </div>
        </div>
      </div>

      {/* Specialty tags */}
      <div className="flex flex-wrap gap-2">
        {specialties.map(s => (
          <Badge key={s} variant={specFilter === s ? 'default' : 'outline'}
            className="cursor-pointer" onClick={() => setSpecFilter(s)}>
            {s}
          </Badge>
        ))}
      </div>

      {/* Results */}
      <div className="grid gap-4">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <MapPin className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p>No doctors found matching your criteria</p>
          </div>
        )}
        {filtered.map((d, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="card-hover">
              <CardContent className="p-4 flex flex-col sm:flex-row items-start justify-between gap-4">
                <div className="flex gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold flex-shrink-0">
                    {d.name.split(' ')[1]?.[0] || 'D'}
                  </div>
                  <div>
                    <div className="font-semibold">{d.name}</div>
                    <div className="text-sm text-muted-foreground">{d.specialty}</div>
                    <div className="text-xs text-muted-foreground mt-1">{d.clinic} • {d.address}</div>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="flex items-center gap-1 text-xs">
                        <Star className="w-3 h-3 text-warning fill-warning" /> {d.rating}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" /> {d.distance}km
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" /> Next: {d.nextSlot}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={d.available ? 'default' : 'secondary'}>{d.available ? 'Available' : 'Unavailable'}</Badge>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" disabled={!d.available}>
                        <Calendar className="w-3 h-3 mr-1" /> Book
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Book Appointment with {d.name}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-2">
                        <div>
                          <label className="text-sm font-medium mb-1 block">Date</label>
                          <Input type="date" />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">Time Slot</label>
                          <Select>
                            <SelectTrigger><SelectValue placeholder="Select time" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="09:00">09:00 AM</SelectItem>
                              <SelectItem value="10:00">10:00 AM</SelectItem>
                              <SelectItem value="11:00">11:00 AM</SelectItem>
                              <SelectItem value="14:00">02:00 PM</SelectItem>
                              <SelectItem value="15:00">03:00 PM</SelectItem>
                              <SelectItem value="16:00">04:00 PM</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button className="w-full" onClick={() => toast.success('Appointment booked!')}>
                          Confirm Booking
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
