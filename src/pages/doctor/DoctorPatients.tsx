import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const patients = [
  {
    name: "Rahul Sharma",
    id: "ABHA-1234-5678",
    lastVisit: "2026-04-09",
    diagnoses: ["Gastroenteritis"],
    status: "Active",
  },
  {
    name: "Priya Singh",
    id: "ABHA-2345-6789",
    lastVisit: "2026-04-08",
    diagnoses: ["Hypertension", "Diabetes"],
    status: "Active",
  },
  {
    name: "Amit Verma",
    id: "ABHA-3456-7890",
    lastVisit: "2026-04-07",
    diagnoses: ["Migraine"],
    status: "Inactive",
  },
  {
    name: "Sneha Patel",
    id: "ABHA-4567-8901",
    lastVisit: "2026-04-06",
    diagnoses: ["Asthma"],
    status: "Active",
  },
  {
    name: "Vikram Das",
    id: "ABHA-5678-9012",
    lastVisit: "2026-04-05",
    diagnoses: ["Tuberculosis"],
    status: "Active",
  },
];

export default function DoctorPatients() {
  const [search, setSearch] = useState("");
  const filtered = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.id.includes(search),
  );

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold">Patients</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your linked patients
        </p>
      </motion.div>

      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name or ABHA ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="grid gap-4">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No patients found
          </div>
        )}
        {filtered.map((p, i) => (
          <Card key={i} className="card-hover cursor-pointer">
            <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                  {p.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-muted-foreground font-mono">
                    {p.id}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  {p.diagnoses.map((d) => (
                    <Badge key={d} variant="outline" className="text-xs">
                      {d}
                    </Badge>
                  ))}
                </div>
                <Badge
                  variant={p.status === "Active" ? "default" : "secondary"}
                  className="text-xs"
                >
                  {p.status}
                </Badge>
                <span className="text-xs text-muted-foreground hidden sm:block">
                  {p.lastVisit}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
