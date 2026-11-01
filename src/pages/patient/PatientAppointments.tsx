import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  X,
  RefreshCw,
  Loader2,
  Stethoscope,
  Plus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useAppointments,
  useCancelAppointment,
} from "@/hooks/data/useAppointments";
import { toast } from "sonner";

export default function PatientAppointments() {
  const { data: appointments = [], isLoading } = useAppointments("patient");
  const cancelMutation = useCancelAppointment();

  const upcomingAppts = useMemo(() => {
    const now = new Date();
    return appointments.filter(
      (a) =>
        new Date(a.starts_at) >= now &&
        (a.status === "pending" || a.status === "approved")
    );
  }, [appointments]);

  const pastAppts = useMemo(() => {
    const now = new Date();
    return appointments.filter(
      (a) =>
        new Date(a.starts_at) < now ||
        a.status === "completed" ||
        a.status === "cancelled" ||
        a.status === "rejected"
    );
  }, [appointments]);

  const handleCancel = async (id: string) => {
    try {
      await cancelMutation.mutateAsync(id);
    } catch {
      // Toast surfaced by hook
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold">My Appointments</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Manage upcoming consultation bookings and review visit records
          </p>
        </div>
        <Button asChild size="sm" className="gap-2">
          <Link to="/patient/doctors">
            <Plus className="w-4 h-4" /> Book New Appointment
          </Link>
        </Button>
      </motion.div>

      {/* Upcoming */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" /> Upcoming Bookings
            <Badge variant="outline" className="text-xs ml-1">
              {upcomingAppts.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="py-12 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" /> Loading bookings...
            </div>
          ) : upcomingAppts.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-xs space-y-2">
              <Calendar className="w-7 h-7 mx-auto text-muted-foreground/60" />
              <p>No upcoming appointments</p>
              <Button asChild variant="outline" size="sm" className="h-8 text-xs mt-1">
                <Link to="/patient/doctors">Find a Doctor</Link>
              </Button>
            </div>
          ) : (
            upcomingAppts.map((a) => {
              const starts = new Date(a.starts_at);
              const dateStr = starts.toLocaleDateString([], {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              });
              const timeStr = starts.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={a.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg gap-3 bg-card"
                >
                  <div>
                    <div className="font-semibold text-sm flex items-center gap-2">
                      <span>{a.doctor?.full_name || "Doctor"}</span>
                      <span className="text-xs font-normal text-muted-foreground">
                        &bull; {a.type}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                      <Calendar className="w-3.5 h-3.5" /> {dateStr}
                      <Clock className="w-3.5 h-3.5 ml-1.5" /> {timeStr}
                    </div>
                    {a.notes && (
                      <p className="text-xs text-foreground/80 mt-1 italic">
                        &ldquo;{a.notes}&rdquo;
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge
                      variant={a.status === "approved" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {a.status === "approved" ? "Confirmed" : "Pending Doctor Approval"}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleCancel(a.id)}
                      disabled={cancelMutation.isPending}
                    >
                      <X className="w-3.5 h-3.5 mr-1" /> Cancel
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Past Appointments */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" /> Past & Completed Appointments
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {pastAppts.length === 0 ? (
            <div className="text-center py-6 text-xs text-muted-foreground">
              No past appointments found.
            </div>
          ) : (
            pastAppts.map((a) => {
              const starts = new Date(a.starts_at);
              const dateStr = starts.toLocaleDateString([], {
                month: "short",
                day: "numeric",
                year: "numeric",
              });
              const timeStr = starts.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={a.id}
                  className="flex items-center justify-between p-3.5 border rounded-lg bg-card text-xs"
                >
                  <div>
                    <div className="font-semibold text-foreground">
                      {a.doctor?.full_name || "Doctor"}
                    </div>
                    <div className="text-muted-foreground mt-0.5">
                      {a.type} &bull; {dateStr} at {timeStr}
                    </div>
                  </div>
                  <Badge
                    variant={
                      a.status === "completed"
                        ? "default"
                        : a.status === "rejected" || a.status === "cancelled"
                          ? "destructive"
                          : "secondary"
                    }
                    className="text-[10px]"
                  >
                    {a.status.toUpperCase()}
                  </Badge>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
