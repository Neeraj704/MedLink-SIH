import { useState } from "react";
import { User, Search, UserPlus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLinkedPatients, type LinkedPatient } from "@/hooks/data/usePatients";

interface PatientPickerProps {
  selectedPatientId?: string;
  onSelect: (patient: LinkedPatient) => void;
  onOpenWalkinDialog?: () => void;
}

export function PatientPicker({
  selectedPatientId,
  onSelect,
  onOpenWalkinDialog,
}: PatientPickerProps) {
  const { data: patients = [], isLoading } = useLinkedPatients();
  const [search, setSearch] = useState("");

  const filtered = patients.filter((p) => {
    const s = search.toLowerCase();
    return (
      p.full_name.toLowerCase().includes(s) ||
      (p.mobile && p.mobile.includes(s)) ||
      (p.abha_number && p.abha_number.includes(s))
    );
  });

  return (
    <div className="flex items-center gap-2 w-full">
      <Select
        value={selectedPatientId || ""}
        onValueChange={(id) => {
          const found = patients.find((p) => p.id === id);
          if (found) onSelect(found);
        }}
        disabled={isLoading}
      >
        <SelectTrigger className="flex-1">
          <div className="flex items-center gap-2 truncate">
            <User className="w-4 h-4 text-muted-foreground shrink-0" />
            <SelectValue placeholder={isLoading ? "Loading patients..." : "Select linked patient..."} />
          </div>
        </SelectTrigger>
        <SelectContent>
          <div className="p-2 border-b">
            <div className="flex items-center px-2 py-1 bg-muted/50 rounded-md">
              <Search className="w-3.5 h-3.5 text-muted-foreground mr-1.5" />
              <Input
                placeholder="Filter patients..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-6 text-xs border-0 bg-transparent focus-visible:ring-0 p-0"
              />
            </div>
          </div>
          {filtered.length === 0 ? (
            <div className="p-3 text-center text-xs text-muted-foreground">
              No matching linked patients
            </div>
          ) : (
            filtered.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                <div className="flex items-center justify-between w-full gap-4">
                  <span className="font-medium">{p.full_name}</span>
                  <span className="text-xs text-muted-foreground">
                    {p.abha_number || p.mobile || "ID: " + p.id.slice(0, 6)}
                  </span>
                </div>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>

      {onOpenWalkinDialog && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onOpenWalkinDialog}
          className="shrink-0 gap-1.5"
        >
          <UserPlus className="w-4 h-4" /> Walk-in
        </Button>
      )}
    </div>
  );
}
