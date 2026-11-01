import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Code2,
  Copy,
  Check,
  Send,
  Loader2,
  Eye,
  Download,
  ShieldCheck,
  FileCheck2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useFhirBundles,
  useTogglePublishBundle,
  type StoredFhirBundle,
} from "@/hooks/data/useFhirBundles";
import { FhirViewer } from "@/components/common/FhirViewer";
import { toast } from "sonner";

export default function FhirRecords() {
  const { data: bundles = [], isLoading } = useFhirBundles();
  const togglePublish = useTogglePublishBundle();

  const [selectedBundle, setSelectedBundle] = useState<StoredFhirBundle | null>(
    null
  );
  const [viewerOpen, setViewerOpen] = useState(false);

  const handleOpenViewer = (b: StoredFhirBundle) => {
    setSelectedBundle(b);
    setViewerOpen(true);
  };

  const handleToggle = async (b: StoredFhirBundle) => {
    try {
      await togglePublish.mutateAsync({
        id: b.id,
        published: !b.published,
      });
    } catch {
      // Toast surfaced by mutation
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">HL7 FHIR R4 Records Registry</h1>
          <Badge className="bg-primary/10 text-primary border-0 text-xs">
            ABDM Milestone 2 Compliant
          </Badge>
        </div>
        <p className="text-muted-foreground text-sm mt-1">
          Inspect, validate, and publish HL7 FHIR R4 Bundles containing dual-coded
          AYUSH and ICD-11 conditions
        </p>
      </motion.div>

      {/* Top Info Banner */}
      <Card className="doctor-blue-glow border-primary/20">
        <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-base">Standardized FHIR R4 Engine</h3>
            </div>
            <p className="text-xs text-muted-foreground mt-1 max-w-xl">
              Every published consultation compiles into a valid FHIR R4 Bundle
              including Practitioner, Patient, Encounter, Observation, dual-coded
              Condition, and MedicationRequest resources.
            </p>
          </div>
          <Button asChild size="sm" className="gap-2 shrink-0">
            <Link to="/doctor/consultation">
              <Code2 className="w-4 h-4" /> Start New Consultation
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Stored Bundles List */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-primary" />
              Published & Draft Bundles
              <Badge variant="outline" className="text-xs ml-1">
                {bundles.length} bundles
              </Badge>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-12 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" /> Loading FHIR bundles...
            </div>
          ) : bundles.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground space-y-2">
              <Code2 className="w-8 h-8 mx-auto text-muted-foreground/60" />
              <div className="font-semibold">No FHIR Bundles recorded yet</div>
              <p className="text-xs">
                Publish a consultation from the Consultation Desk to generate an official HL7 FHIR R4 Bundle.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground text-xs font-semibold">
                    <th className="text-left py-3">Bundle ID</th>
                    <th className="text-left py-3">Patient</th>
                    <th className="text-left py-3 hidden sm:table-cell">ABHA</th>
                    <th className="text-left py-3 hidden md:table-cell">Created</th>
                    <th className="text-left py-3">Status</th>
                    <th className="text-right py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bundles.map((b) => (
                    <tr
                      key={b.id}
                      className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                    >
                      <td className="py-3 font-mono text-xs text-foreground">
                        {b.id.slice(0, 8)}...
                      </td>
                      <td className="py-3 font-medium text-xs">
                        {b.consultation?.patient?.full_name || "Patient"}
                      </td>
                      <td className="py-3 text-xs font-mono text-muted-foreground hidden sm:table-cell">
                        {b.consultation?.patient?.abha_number || "Consented"}
                      </td>
                      <td className="py-3 text-xs text-muted-foreground hidden md:table-cell">
                        {new Date(b.created_at).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3">
                        <Badge
                          variant={b.published ? "default" : "secondary"}
                          className="text-[10px]"
                        >
                          {b.published ? "PUBLISHED" : "DRAFT"}
                        </Badge>
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs gap-1"
                            onClick={() => handleOpenViewer(b)}
                          >
                            <Eye className="w-3.5 h-3.5" /> View JSON
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`h-7 text-xs ${
                              b.published
                                ? "text-muted-foreground hover:text-destructive"
                                : "text-primary hover:text-primary"
                            }`}
                            onClick={() => handleToggle(b)}
                            disabled={togglePublish.isPending}
                          >
                            {b.published ? "Unpublish" : "Publish"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Viewer Dialog */}
      {selectedBundle && (
        <FhirViewer
          open={viewerOpen}
          onOpenChange={setViewerOpen}
          bundle={selectedBundle.bundle}
          validation={selectedBundle.validation}
          title={`HL7 FHIR R4 Bundle • ${selectedBundle.id.slice(0, 8)}`}
        />
      )}
    </div>
  );
}
