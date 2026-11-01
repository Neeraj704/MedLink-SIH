import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  MapPin,
  Clock,
  Save,
  Loader2,
  Navigation,
  Check,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProfile, useUpdateProfile } from "@/hooks/data/useProfile";
import { getUserLocation } from "@/lib/geo";
import { toast } from "sonner";

const SPECIALIZATIONS_LIST = [
  "General Medicine",
  "Ayurveda",
  "Siddha",
  "Unani",
  "Cardiology",
  "Dermatology",
  "Pediatrics",
  "Orthopedics",
  "Pulmonology",
  "Neurology",
  "Gastroenterology",
  "Homeopathy",
];

const DEFAULT_DAYS = [
  { day: "mon", label: "Monday", from: "09:00", to: "17:00", active: true },
  { day: "tue", label: "Tuesday", from: "09:00", to: "17:00", active: true },
  { day: "wed", label: "Wednesday", from: "09:00", to: "17:00", active: true },
  { day: "thu", label: "Thursday", from: "09:00", to: "17:00", active: true },
  { day: "fri", label: "Friday", from: "09:00", to: "17:00", active: true },
  { day: "sat", label: "Saturday", from: "10:00", to: "14:00", active: true },
  { day: "sun", label: "Sunday", from: "10:00", to: "14:00", active: false },
];

export default function ClinicSettings() {
  const { data: profile, isLoading } = useProfile();
  const updateMutation = useUpdateProfile();

  const [clinicName, setClinicName] = useState("MedLink Integrated Clinic");
  const [address, setAddress] = useState(
    "Apollo Cradle, Sector 14, Gurugram, Haryana 122001"
  );
  const [lat, setLat] = useState<number>(28.4735);
  const [lng, setLng] = useState<number>(77.0543);
  const [slotMinutes, setSlotMinutes] = useState<number>(30);
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([
    "General Medicine",
    "Ayurveda",
  ]);
  const [days, setDays] = useState(DEFAULT_DAYS);
  const [detectingLocation, setDetectingLocation] = useState(false);

  useEffect(() => {
    if (profile) {
      const doc = profile.doctor_details;
      if (doc?.clinic_name) setClinicName(doc.clinic_name);
      if (doc?.address) setAddress(doc.address);
      if (doc?.lat) setLat(doc.lat);
      if (doc?.lng) setLng(doc.lng);
      if (doc?.slot_minutes) setSlotMinutes(doc.slot_minutes);
      if (doc?.specializations && doc.specializations.length > 0) {
        setSelectedSpecs(doc.specializations);
      }
      if (doc?.working_hours && typeof doc.working_hours === "object") {
        const wh = doc.working_hours as Record<
          string,
          { open: boolean; from: string; to: string }
        >;
        setDays((prev) =>
          prev.map((d) => {
            const entry = wh[d.day];
            if (entry) {
              return {
                ...d,
                active: entry.open,
                from: entry.from || d.from,
                to: entry.to || d.to,
              };
            }
            return d;
          })
        );
      }
    }
  }, [profile]);

  const toggleSpec = (spec: string) => {
    setSelectedSpecs((prev) =>
      prev.includes(spec) ? prev.filter((s) => s !== spec) : [...prev, spec]
    );
  };

  const toggleDay = (index: number) => {
    setDays((prev) =>
      prev.map((d, i) => (i === index ? { ...d, active: !d.active } : d))
    );
  };

  const handleDetectLocation = async () => {
    setDetectingLocation(true);
    try {
      const loc = await getUserLocation();
      setLat(loc.lat);
      setLng(loc.lng);
      toast.success(
        `Location updated: ${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`
      );
    } catch {
      toast.info("Using default Gurugram clinic coordinates");
    } finally {
      setDetectingLocation(false);
    }
  };

  const handleSave = async () => {
    const workingHoursObj: Record<string, { open: boolean; from: string; to: string }> =
      {};
    for (const d of days) {
      workingHoursObj[d.day] = {
        open: d.active,
        from: d.from,
        to: d.to,
      };
    }

    try {
      await updateMutation.mutateAsync({
        clinic_name: clinicName,
        address,
        lat,
        lng,
        slot_minutes: slotMinutes,
        specializations: selectedSpecs,
        working_hours: workingHoursObj,
      });
    } catch {
      // Toast surfaced by mutation
    }
  };

  if (isLoading) {
    return (
      <div className="py-16 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-primary" /> Loading clinic settings...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">Clinic & Geolocation Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Configure clinic coordinates, ABDM discovery, appointment slot durations, and working hours
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Clinic Details */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" /> Clinic Details & Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div>
              <label className="font-medium text-foreground block mb-1">
                Clinic / Practice Name *
              </label>
              <Input
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                className="text-xs"
              />
            </div>

            <div>
              <label className="font-medium text-foreground block mb-1">
                Street Address *
              </label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted-foreground" />
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="pl-8 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-medium text-foreground block mb-1">
                  Latitude
                </label>
                <Input
                  type="number"
                  step="any"
                  value={lat}
                  onChange={(e) => setLat(parseFloat(e.target.value) || 0)}
                  className="text-xs font-mono"
                />
              </div>
              <div>
                <label className="font-medium text-foreground block mb-1">
                  Longitude
                </label>
                <Input
                  type="number"
                  step="any"
                  value={lng}
                  onChange={(e) => setLng(parseFloat(e.target.value) || 0)}
                  className="text-xs font-mono"
                />
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDetectLocation}
              disabled={detectingLocation}
              className="text-xs h-8 gap-1.5 w-full"
            >
              {detectingLocation ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Navigation className="w-3.5 h-3.5" />
              )}
              Update to Current Geolocation
            </Button>

            <div className="pt-2">
              <label className="font-medium text-foreground block mb-1.5">
                Slot Duration (Minutes)
              </label>
              <div className="flex gap-2">
                {[15, 20, 30, 45, 60].map((mins) => (
                  <Button
                    key={mins}
                    type="button"
                    variant={slotMinutes === mins ? "default" : "outline"}
                    size="sm"
                    className="h-7 text-xs flex-1"
                    onClick={() => setSlotMinutes(mins)}
                  >
                    {mins}m
                  </Button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <label className="font-medium text-foreground block mb-2">
                Clinical Specializations
              </label>
              <div className="flex flex-wrap gap-1.5">
                {SPECIALIZATIONS_LIST.map((spec) => {
                  const isSelected = selectedSpecs.includes(spec);
                  return (
                    <Badge
                      key={spec}
                      variant={isSelected ? "default" : "outline"}
                      className="cursor-pointer text-[11px] py-1"
                      onClick={() => toggleSpec(spec)}
                    >
                      {isSelected && <Check className="w-3 h-3 mr-1" />}
                      {spec}
                    </Badge>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Working Hours */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" /> Weekly Schedule & Slots
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5 text-xs">
            {days.map((d, i) => (
              <div
                key={d.day}
                className="flex items-center justify-between p-2 rounded-lg border bg-card"
              >
                <button
                  type="button"
                  onClick={() => toggleDay(i)}
                  className={`w-24 text-left font-semibold text-xs ${
                    d.active ? "text-foreground" : "text-muted-foreground line-through"
                  }`}
                >
                  {d.label}
                </button>

                {d.active ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={d.from}
                      onChange={(e) => {
                        const next = [...days];
                        next[i] = { ...next[i], from: e.target.value };
                        setDays(next);
                      }}
                      className="w-24 h-7 text-xs"
                    />
                    <span className="text-muted-foreground">to</span>
                    <Input
                      type="time"
                      value={d.to}
                      onChange={(e) => {
                        const next = [...days];
                        next[i] = { ...next[i], to: e.target.value };
                        setDays(next);
                      }}
                      className="w-24 h-7 text-xs"
                    />
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground italic">Closed</span>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end pt-2">
        <Button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="gap-2"
        >
          {updateMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Clinic Settings
        </Button>
      </div>
    </div>
  );
}
