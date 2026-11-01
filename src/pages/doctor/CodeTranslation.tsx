import { useState } from "react";
import { motion } from "framer-motion";
import { Search, X, Sparkles, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import MedLinkChatbot from "@/components/doctor/MedLinkChatbot";
import { useDiseaseSearch, type DiseaseMapping } from "@/hooks/data/useDiseaseSearch";

export default function CodeTranslation() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<DiseaseMapping[]>([]);
  const { data: searchResults = [], isLoading } = useDiseaseSearch(query, 8);

  const formatConfidence = (sim: number | null | undefined) => {
    if (!sim) return "0%";
    return `${Math.round(sim * 100)}%`;
  };

  const addDiagnosis = (item: DiseaseMapping) => {
    if (selected.find((s) => s.icd11_code === item.icd11_code)) return;
    setSelected([...selected, item]);
    setQuery("");
  };

  const removeDiagnosis = (code: string | null) =>
    setSelected(selected.filter((s) => s.icd11_code !== code));

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl font-bold">Disease Code Translation</h1>
          <Badge className="bg-primary/10 text-primary border-0">
            <Sparkles className="w-3 h-3 mr-1" /> Grounded RAG
          </Badge>
        </div>
        <p className="text-muted-foreground text-sm">
          Map ICD-11 codes to Ayurveda, Siddha & Unani terminology &bull; 36,757 national database entries
        </p>
      </motion.div>

      <div className="space-y-6">
        {/* Search Input */}
        <Card className="doctor-blue-glow border-primary/20">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search disease by name or ICD-11 code (e.g. Cholera, 1A00, Migraine, Asthma)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-12 pr-10 h-14 text-base border-primary/30 focus:border-primary bg-background/50"
              />
              {isLoading && (
                <Loader2 className="w-4 h-4 absolute right-10 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground" />
              )}
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 hover:bg-muted rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {searchResults.length > 0 && query.trim().length >= 2 && (
              <div className="mt-3 border rounded-lg divide-y max-h-[400px] overflow-y-auto bg-popover shadow-xl border-border animate-in fade-in slide-in-from-top-2 duration-200">
                {searchResults.map((row) => (
                  <button
                    key={row.id}
                    type="button"
                    onClick={() => addDiagnosis(row)}
                    className="w-full text-left p-4 hover:bg-accent/50 transition-colors flex flex-col gap-1 border-b last:border-b-0"
                  >
                    <div className="font-semibold text-primary text-lg">
                      {row.icd11_title}
                    </div>
                    <div className="text-sm text-muted-foreground font-medium mb-1">
                      ICD-11: <span className="font-mono">{row.icd11_code || "N/A"}</span>
                    </div>
                    <div className="space-y-0.5 text-[13px] text-foreground/90">
                      <div>
                        <span className="font-bold">Ayurveda:</span>{" "}
                        {row.ayurveda_term || "None"}{" "}
                        {row.ayurveda_code ? `(${row.ayurveda_code})` : ""}{" "}
                        <span className="text-muted-foreground ml-2">
                          Confidence: {formatConfidence(row.ayurveda_sim)}
                        </span>
                      </div>
                      <div>
                        <span className="font-bold">Siddha:</span>{" "}
                        {row.siddha_term || "None"}{" "}
                        {row.siddha_code ? `(${row.siddha_code})` : ""}{" "}
                        <span className="text-muted-foreground ml-2">
                          Confidence: {formatConfidence(row.siddha_sim)}
                        </span>
                      </div>
                      <div>
                        <span className="font-bold">Unani:</span>{" "}
                        {row.unani_term || "None"}{" "}
                        {row.unani_code ? `(${row.unani_code})` : ""}{" "}
                        <span className="text-muted-foreground ml-2">
                          Confidence: {formatConfidence(row.unani_sim)}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {query.trim().length >= 2 && searchResults.length === 0 && !isLoading && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No matching diseases found for &ldquo;{query}&rdquo;
              </div>
            )}
          </CardContent>
        </Card>

        {/* Selected Diagnoses */}
        {selected.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                Selected Diagnoses
                <Badge
                  variant="secondary"
                  className="rounded-full h-5 px-2 font-bold text-[10px]"
                >
                  {selected.length}
                </Badge>
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelected([])}
                className="text-xs text-muted-foreground hover:text-destructive h-8 px-3"
              >
                Clear All
              </Button>
            </div>
            {selected.map((row, i) => (
              <motion.div
                key={row.icd11_code || i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow border-primary/10">
                  <CardHeader className="pb-3 px-4 sm:px-6 bg-muted/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge className="bg-primary text-primary-foreground font-mono px-2 py-0.5">
                          {row.icd11_code || "ICD-11"}
                        </Badge>
                        <CardTitle className="text-lg font-bold">
                          {row.icd11_title}
                        </CardTitle>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeDiagnosis(row.icd11_code)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 sm:px-6 py-4">
                    <div className="grid md:grid-cols-3 gap-3">
                      {[
                        {
                          label: "Ayurveda (NAMC)",
                          value: row.ayurveda_term,
                          confidence: row.ayurveda_sim,
                          color:
                            "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
                        },
                        {
                          label: "Siddha (NAMC)",
                          value: row.siddha_term,
                          confidence: row.siddha_sim,
                          color:
                            "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
                        },
                        {
                          label: "Unani (NUMC)",
                          value: row.unani_term,
                          confidence: row.unani_sim,
                          color:
                            "bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/20",
                        },
                      ].map((system, j) => (
                        <Tooltip key={j}>
                          <TooltipTrigger asChild>
                            <div
                              className={`p-3 rounded-xl border ${system.color} cursor-help transition-all hover:bg-opacity-20`}
                            >
                              <div className="flex justify-between items-start mb-1">
                                <div className="text-[10px] uppercase font-bold opacity-70">
                                  {system.label}
                                </div>
                                <div className="text-[10px] font-bold opacity-60">
                                  {formatConfidence(system.confidence)}
                                </div>
                              </div>
                              <div className="font-bold text-sm leading-tight">
                                {system.value || "N/A"}
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">
                              {system.label} equivalent for {row.icd11_title} (
                              {formatConfidence(system.confidence)} confidence)
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* AI Chatbot Embedded */}
        <MedLinkChatbot />
      </div>
    </div>
  );
}
