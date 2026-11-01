import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Search,
  Sliders,
  Star,
  Calendar,
  Clock,
  Loader2,
  Navigation,
  Check,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNearbyDoctors } from "@/hooks/data/useNearbyDoctors";
import { useBookAppointment, useSlots } from "@/hooks/data/useAppointments";
import { getUserLocation } from "@/lib/geo";
import { toast } from "sonner";

const SPECIALTIES = [
  "All",
  "General Medicine",
  "Ayurveda",
  "Siddha",
  "Unani",
  "Cardiology",
  "Pediatrics",
  "Dermatology",
];

export default function FindDoctors() {
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: 28.6139,
    lng: 77.209, // New Delhi default
  });
  const [locationGranted, setLocationGranted] = useState(false);
  const [locating, setLocating] = useState(false);
  const [search, setSearch] = useState("");
  const [radius, setRadius] = useState<number[]>([25]);
  const [specFilter, setSpecFilter] = useState("All");

  // Booking modal state
  const [selectedDoctor, setSelectedDoctor] = useState<{
    id: string;
    name: string;
    clinic: string;
  } | null>(null);
  const [bookingDate, setBookingDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split("T")[0]
  );
  const [selectedSlot, setSelectedSlot] = useState("");
  const [appointmentType, setAppointmentType] = useState("New Consultation");
  const [notes, setNotes] = useState("");

  const { data: nearbyDocs = [], isLoading: docsLoading } = useNearbyDoctors(
    coords.lat,
    coords.lng,
    radius[0],
    specFilter === "All" ? undefined : specFilter
  );

  const { data: availableSlots = [], isLoading: slotsLoading } = useSlots(
    selectedDoctor?.id,
    bookingDate
  );

  const bookMutation = useBookAppointment();

  const handleRequestLocation = async () => {
    setLocating(true);
    try {
      const loc = await getUserLocation();
      setCoords({ lat: loc.lat, lng: loc.lng });
      setLocationGranted(true);
      toast.success("Location acquired successfully");
    } catch {
      toast.info("Using Delhi NCR regional coordinates");
      setLocationGranted(true);
    } finally {
      setLocating(false);
    }
  };

  const handleConfirmBooking = async () => {
    if (!selectedDoctor || !selectedSlot) {
      toast.error("Please pick an available time slot");
      return;
    }

    try {
      await bookMutation.mutateAsync({
        doctor_id: selectedDoctor.id,
        starts_at: selectedSlot,
        duration_min: 30,
        type: appointmentType,
        notes: notes.trim() || undefined,
      });

      setSelectedDoctor(null);
      setSelectedSlot("");
      setNotes("");
    } catch {
      // Toast surfaced by mutation
    }
  };

  const filtered = nearbyDocs.filter((d) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = d.full_name.toLowerCase().includes(q);
      const matchClinic = d.clinic_name?.toLowerCase().includes(q);
      const matchSpec = d.specializations?.some((s) =>
        s.toLowerCase().includes(q)
      );
      if (!matchName && !matchClinic && !matchSpec) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">Find Verified AYUSH & Allopathic Doctors</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Locate HPR-registered practitioners near you with verified open slots
        </p>
      </motion.div>

      {/* Geolocation Banner */}
      {!locationGranted && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <MapPin className="size-5" />
              </div>
              <div>
                <div className="font-semibold text-sm">Enable Exact Geolocation</div>
                <div className="text-xs text-muted-foreground">
                  Sort verified clinics and AYUSH hospitals by real-time travel distance
                </div>
              </div>
            </div>
            <Button
              size="sm"
              onClick={handleRequestLocation}
              disabled={locating}
              className="gap-1.5 shrink-0"
            >
              {locating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Navigation className="w-3.5 h-3.5" />
              )}
              Allow Location
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Search & Distance Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by doctor name, hospital, or specialty..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 text-xs"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto bg-card border rounded-lg px-3 py-2">
          <Sliders className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="text-xs text-muted-foreground whitespace-nowrap">Radius:</span>
          <Slider
            value={radius}
            onValueChange={setRadius}
            min={1}
            max={50}
            step={1}
            className="w-32"
          />
          <span className="text-xs font-semibold text-foreground whitespace-nowrap">
            {radius[0]} km
          </span>
        </div>
      </div>

      {/* Specialty Filter Tags */}
      <div className="flex flex-wrap gap-1.5">
        {SPECIALTIES.map((s) => (
          <Badge
            key={s}
            variant={specFilter === s ? "default" : "outline"}
            className="cursor-pointer text-xs py-1"
            onClick={() => setSpecFilter(s)}
          >
            {s}
          </Badge>
        ))}
      </div>

      {/* Doctors Results */}
      <div className="grid gap-3">
        {docsLoading ? (
          <div className="py-16 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-primary" /> Searching nearby clinics...
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground space-y-2">
              <MapPin className="w-8 h-8 mx-auto text-muted-foreground/60" />
              <div className="text-sm font-semibold">No doctors found within {radius[0]} km</div>
              <p className="text-xs">
                Try increasing the search radius slider or clearing the specialty filter.
              </p>
            </CardContent>
          </Card>
        ) : (
          filtered.map((d) => (
            <Card key={d.user_id} className="card-hover border-border transition-colors">
              <CardContent className="p-4 flex flex-col sm:flex-row items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0 border border-primary/20">
                    {d.full_name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground text-sm flex items-center gap-2">
                      <span>{d.full_name}</span>
                      <Badge variant="outline" className="text-[10px] h-4">
                        {d.specializations?.join(", ") || "General Medicine"}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {d.clinic_name} &bull; {d.address}
                    </div>
                    <div className="flex flex-wrap items-center gap-3.5 mt-2 text-xs">
                      <span className="flex items-center gap-1 font-medium text-foreground">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />{" "}
                        {d.rating || 4.8}
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5" /> {d.distance_km.toFixed(1)} km
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" /> Next slot:{" "}
                        {d.next_slot
                          ? new Date(d.next_slot).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Today"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
                  <Button
                    size="sm"
                    className="h-8 text-xs gap-1.5"
                    onClick={() => {
                      setSelectedDoctor({
                        id: d.user_id,
                        name: d.full_name,
                        clinic: d.clinic_name || "Clinic",
                      });
                    }}
                  >
                    <Calendar className="w-3.5 h-3.5" /> Book Appointment
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Booking Dialog */}
      <Dialog
        open={!!selectedDoctor}
        onOpenChange={(open) => {
          if (!open) setSelectedDoctor(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Calendar className="w-4 h-4 text-primary" /> Book with {selectedDoctor?.name}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {selectedDoctor?.clinic} &bull; Automatic ABDM appointment registration
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 pt-2 text-xs">
            <div>
              <label className="font-medium text-foreground block mb-1">
                Consultation Date
              </label>
              <Input
                type="date"
                min={new Date().toISOString().split("T")[0]}
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className="text-xs"
              />
            </div>

            <div>
              <label className="font-medium text-foreground block mb-1">
                Available Time Slots
              </label>
              {slotsLoading ? (
                <div className="py-4 text-center text-muted-foreground flex items-center justify-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading doctor slots...
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="p-3 rounded-lg border text-center text-muted-foreground">
                  No slots available for this date. Please pick another date.
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto p-1">
                  {availableSlots.map((slot) => {
                    const isSelected = selectedSlot === slot;
                    const timeLabel = new Date(slot).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`p-2 rounded border text-xs text-center transition-colors ${
                          isSelected
                            ? "bg-primary text-primary-foreground font-semibold"
                            : "bg-card hover:bg-muted/60 text-foreground"
                        }`}
                      >
                        {timeLabel}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <label className="font-medium text-foreground block mb-1">
                Consultation Type
              </label>
              <Select value={appointmentType} onValueChange={setAppointmentType}>
                <SelectTrigger className="text-xs h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="New Consultation">New Consultation</SelectItem>
                  <SelectItem value="Follow-up">Follow-up</SelectItem>
                  <SelectItem value="Lab Review">Lab Review</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="font-medium text-foreground block mb-1">
                Clinical Reason / Notes (Optional)
              </label>
              <Input
                placeholder="e.g. Fever for 2 days, headache"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="text-xs"
              />
            </div>

            <Button
              className="w-full mt-2"
              onClick={handleConfirmBooking}
              disabled={bookMutation.isPending || !selectedSlot}
            >
              {bookMutation.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> Booking...
                </>
              ) : (
                "Confirm Appointment"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
