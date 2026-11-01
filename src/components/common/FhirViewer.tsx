import { useState } from "react";
import { Check, Copy, Download, Code2, ShieldCheck, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface FhirViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bundle: Record<string, unknown> | null;
  validation?: { ok: boolean; errors?: string[] };
  title?: string;
}

export function FhirViewer({
  open,
  onOpenChange,
  bundle,
  validation,
  title = "HL7 FHIR R4 Bundle",
}: FhirViewerProps) {
  const [copied, setCopied] = useState(false);
  const jsonString = JSON.stringify(bundle, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    toast.success("FHIR JSON copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `FHIR_Bundle_${bundle?.id || Date.now()}.json`;
    link.click();
    toast.success("FHIR bundle downloaded");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between pr-6">
            <div className="flex items-center gap-2">
              <Code2 className="w-5 h-5 text-primary" />
              <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
            </div>
            {validation && (
              <Badge
                variant={validation.ok ? "default" : "destructive"}
                className="gap-1 text-xs"
              >
                {validation.ok ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5" /> FHIR R4 Validated
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3.5 h-3.5" /> Validation Warnings
                  </>
                )}
              </Badge>
            )}
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Standard-compliant ABDM & HL7 FHIR R4 Transaction Bundle with dual-coded ICD-11 & AYUSH terminologies.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto bg-muted/40 rounded-lg p-3 font-mono text-xs border border-border/60">
          <pre className="text-foreground whitespace-pre-wrap select-all">
            {jsonString}
          </pre>
        </div>

        <div className="flex items-center justify-between pt-3 border-t">
          <div className="text-xs text-muted-foreground">
            {bundle?.entry?.length || 0} FHIR Resources included
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5">
              {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied" : "Copy JSON"}
            </Button>
            <Button size="sm" onClick={handleDownload} className="gap-1.5">
              <Download className="w-4 h-4" /> Download .json
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
