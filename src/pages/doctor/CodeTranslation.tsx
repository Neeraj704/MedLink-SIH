import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import Papa from "papaparse";
import { Search, X, Sparkles, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip, TooltipContent, TooltipTrigger,
} from "@/components/ui/tooltip";
import MedLinkChatbot from "@/components/doctor/MedLinkChatbot";

interface DiseaseRow {
  ICD11_Title: string;
  ICD11_Code: string;
  Ayurveda_NAMC_term: string;
  Ayurveda_NAMC_CODE?: string;
  Siddha_NAMC_TERM: string;
  Siddha_NAMC_CODE?: string;
  Unani_NUMC_TERM: string;
  Unani_NUMC_CODE?: string;
  Ayurveda_Similarity: string;
  Siddha_Similarity: string;
  Unani_Similarity: string;
}

export default function CodeTranslation() {
  const [data, setData] = useState<DiseaseRow[]>([]);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selected, setSelected] = useState<DiseaseRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Papa.parse("/conciseFinalData.csv", {
      download: true, header: true, skipEmptyLines: true,
      complete: (results) => { setData(results.data as DiseaseRow[]); setLoading(false); },
      error: () => setLoading(false),
    });
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 250);
    return () => clearTimeout(t);
  }, [query]);

  const results = useMemo(() => {
    if (!debouncedQuery.trim()) return [];
    const q = debouncedQuery.toLowerCase();
    return data.filter(row =>
      row.ICD11_Title?.toLowerCase().includes(q) || row.ICD11_Code?.toLowerCase().includes(q)
    ).slice(0, 5);
  }, [debouncedQuery, data]);

  const formatConfidence = (sim: any) => {
    if (!sim) return "0%";
    return `${(parseFloat(sim) * 100).toFixed(1)}%`;
  };

  const addDiagnosis = (row: DiseaseRow) => {
    if (selected.find(s => s.ICD11_Code === row.ICD11_Code)) return;
    setSelected([...selected, row]);
    setQuery("");
  };

  const removeDiagnosis = (code: string) => setSelected(selected.filter(s => s.ICD11_Code !== code));

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl font-bold">Disease Code Translation</h1>
          <Badge className="bg-primary/10 text-primary border-0">
            <Sparkles className="w-3 h-3 mr-1" /> AI-Powered
          </Badge>
        </div>
        <p className="text-muted-foreground text-sm">
          Map ICD-11 codes to Ayurveda, Siddha & Unani terminology • {data.length} entries loaded
        </p>
      </motion.div>

      <div className="space-y-6">
        {/* Search - Always Visible */}
        <Card className="doctor-blue-glow border-primary/20">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search disease by name or ICD-11 code..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-12 h-14 text-base border-primary/30 focus:border-primary bg-background/50"
              />
              {query && (
                <button 
                  onClick={() => setQuery("")} 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 hover:bg-muted rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {results.length > 0 && (
              <div className="mt-3 border rounded-lg divide-y max-h-[400px] overflow-y-auto bg-popover shadow-xl border-border animate-in fade-in slide-in-from-top-2 duration-200">
                {results.map((row, i) => (
                  <button 
                    key={i} 
                    onClick={() => addDiagnosis(row)} 
                    className="w-full text-left p-4 hover:bg-accent/50 transition-colors flex flex-col gap-1 border-b last:border-b-0"
                  >
                    <div className="font-semibold text-primary text-lg">{row.ICD11_Title}</div>
                    <div className="text-sm text-muted-foreground font-medium mb-1">ICD Code: {row.ICD11_Code}</div>
                    <div className="space-y-0.5 text-[13px] text-foreground/90">
                      <div><span className="font-bold">Ayurveda:</span> {row.Ayurveda_NAMC_term} {row.Ayurveda_NAMC_CODE ? `(${row.Ayurveda_NAMC_CODE})` : ""} <span className="text-muted-foreground ml-2">Confidence: {formatConfidence(row.Ayurveda_Similarity)}</span></div>
                      <div><span className="font-bold">Siddha:</span> {row.Siddha_NAMC_TERM} {row.Siddha_NAMC_CODE ? `(${row.Siddha_NAMC_CODE})` : ""} <span className="text-muted-foreground ml-2">Confidence: {formatConfidence(row.Siddha_Similarity)}</span></div>
                      <div><span className="font-bold">Unani:</span> {row.Unani_NUMC_TERM} {row.Unani_NUMC_CODE ? `(${row.Unani_NUMC_CODE})` : ""} <span className="text-muted-foreground ml-2">Confidence: {formatConfidence(row.Unani_Similarity)}</span></div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {debouncedQuery && results.length === 0 && !loading && (
              <div className="text-center py-8 text-muted-foreground text-sm">No matching diseases found for "{debouncedQuery}"</div>
            )}
          </CardContent>
        </Card>

        {/* Selected diagnoses */}
        {selected.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                Selected Diagnoses 
                <Badge variant="secondary" className="rounded-full h-5 px-2 font-bold text-[10px]">{selected.length}</Badge>
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setSelected([])} className="text-xs text-muted-foreground hover:text-destructive h-8 px-3">
                Clear All
              </Button>
            </div>
            {selected.map((row, i) => (
              <motion.div key={row.ICD11_Code} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow border-primary/10">
                  <CardHeader className="pb-3 px-4 sm:px-6 bg-muted/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge className="bg-primary text-primary-foreground font-mono px-2 py-0.5">{row.ICD11_Code}</Badge>
                        <CardTitle className="text-lg font-bold">{row.ICD11_Title}</CardTitle>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removeDiagnosis(row.ICD11_Code)} className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 sm:px-6 py-4">
                    <div className="grid md:grid-cols-3 gap-3">
                      {[
                        { 
                          label: "Ayurveda (NAMC)", 
                          value: row.Ayurveda_NAMC_term, 
                          confidence: row.Ayurveda_Similarity,
                          color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20" 
                        },
                        { 
                          label: "Siddha (NAMC)", 
                          value: row.Siddha_NAMC_TERM, 
                          confidence: row.Siddha_Similarity,
                          color: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20" 
                        },
                        { 
                          label: "Unani (NUMC)", 
                          value: row.Unani_NUMC_TERM, 
                          confidence: row.Unani_Similarity,
                          color: "bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/20" 
                        },
                      ].map((system, j) => (
                        <Tooltip key={j}>
                          <TooltipTrigger asChild>
                            <div className={`p-3 rounded-xl border ${system.color} cursor-help transition-all hover:bg-opacity-20`}>
                              <div className="flex justify-between items-start mb-1">
                                <div className="text-[10px] uppercase font-bold opacity-70">{system.label}</div>
                                <div className="text-[10px] font-bold opacity-60">{formatConfidence(system.confidence)}</div>
                              </div>
                              <div className="font-bold text-sm leading-tight">{system.value || "N/A"}</div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent><p className="text-xs">{system.label} equivalent for {row.ICD11_Title} ({formatConfidence(system.confidence)} confidence)</p></TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* AI Chatbot - Always Visible */}
        <MedLinkChatbot csvData={data} />
      </div>
    </div>
  );
}
