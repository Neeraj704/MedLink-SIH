import { useState, useEffect, useRef, useCallback } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Papa from "papaparse";
import {
  MessageSquare,
  Send,
  Plus,
  Trash2,
  X,
  Bot,
  User,
  Clock,
  Sparkles,
  MoreHorizontal,
  ChevronLeft,
  Loader2,
  Zap,
  ChevronDown,
  Gauge,
  FileText,
  List,
  BookOpen,
  ScrollText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface Chat {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  isTemp?: boolean;
}

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

type ResponseMode =
  | "code-only"
  | "concise"
  | "default"
  | "detailed"
  | "full-detail";

const RESPONSE_MODES: {
  value: ResponseMode;
  label: string;
  icon: any;
  description: string;
}[] = [
  {
    value: "code-only",
    label: "Code Only",
    icon: List,
    description: "Table of codes only",
  },
  {
    value: "concise",
    label: "Concise",
    icon: Gauge,
    description: "Brief with key info",
  },
  {
    value: "default",
    label: "Default",
    icon: FileText,
    description: "Balanced response",
  },
  {
    value: "detailed",
    label: "Detailed",
    icon: BookOpen,
    description: "Thorough explanation",
  },
  {
    value: "full-detail",
    label: "Full Detail",
    icon: ScrollText,
    description: "Complete analysis",
  },
];

const MODE_INSTRUCTIONS: Record<ResponseMode, string> = {
  "code-only": `\n\n## RESPONSE MODE: CODE ONLY\nYou MUST respond with ONLY a markdown table of code mappings. No explanations, no headers, no extra text, no emojis. Just the table:\n| System | Term | Code | Confidence |\n|--------|------|------|------------|\nNothing else. If the query is not about a disease/code, respond with a single line: "❌ Not a medical coding query."`,
  concise: `\n\n## RESPONSE MODE: CONCISE\nKeep your response to 2-3 sentences max plus the code mapping table if applicable. No emojis, no workflow tips, no clinical interpretations. Be extremely brief.`,
  default: `\n\n## RESPONSE MODE: DEFAULT\nProvide a balanced response. Include the code mapping table, a 1-2 sentence explanation, and one brief clinical note if relevant. Keep total response under 150 words.`,
  detailed: `\n\n## RESPONSE MODE: DETAILED\nProvide a thorough response with the code mapping table, clinical interpretation, and relevant context. Include cross-system comparisons and workflow tips.`,
  "full-detail": `\n\n## RESPONSE MODE: FULL DETAIL\nProvide a comprehensive analysis. Include all code mappings, detailed clinical interpretation, historical context of traditional medicine terms, cross-system comparisons, confidence score analysis, and MedLink workflow guidance.`,
};

const STORAGE_KEY = "medlink-chats";
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");

function loadChats(): Chat[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveChats(chats: Chat[]) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(chats.filter((c) => !c.isTemp)),
  );
}

function searchDiseaseData(data: DiseaseRow[], query: string): DiseaseRow[] {
  const q = query.toLowerCase();
  
  return data
    .filter(
      (r) =>
        r.ICD11_Title?.toLowerCase().includes(q) ||
        r.ICD11_Code?.toLowerCase().includes(q) ||
        r.Ayurveda_NAMC_term?.toLowerCase().includes(q) ||
        r.Siddha_NAMC_TERM?.toLowerCase().includes(q) ||
        r.Unani_NUMC_TERM?.toLowerCase().includes(q),
    )
    .sort((a, b) => {
      // Prioritize exact title matches
      const aTitle = a.ICD11_Title?.toLowerCase() || "";
      const bTitle = b.ICD11_Title?.toLowerCase() || "";
      const aExact = aTitle === q;
      const bExact = bTitle === q;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;

      // Sort by best average similarity
      const getAvgSim = (r: DiseaseRow) => {
        const sims = [
          parseFloat(r.Ayurveda_Similarity || "0"),
          parseFloat(r.Siddha_Similarity || "0"),
          parseFloat(r.Unani_Similarity || "0"),
        ];
        return sims.reduce((sum, s) => sum + s, 0) / 3;
      };
      return getAvgSim(b) - getAvgSim(a);
    })
    .slice(0, 20);
}

function extractSearchTerms(text: string): string[] {
  const keywords = text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);
  const stopWords = new Set([
    "the",
    "and",
    "for",
    "are",
    "but",
    "not",
    "you",
    "all",
    "can",
    "had",
    "her",
    "was",
    "one",
    "our",
    "out",
    "has",
    "what",
    "how",
    "about",
    "which",
    "when",
    "make",
    "like",
    "this",
    "that",
    "with",
    "have",
    "from",
    "will",
    "been",
    "would",
    "could",
    "should",
    "into",
    "just",
    "than",
    "then",
    "them",
    "some",
    "also",
    "after",
    "more",
    "other",
    "these",
    "their",
    "there",
    "only",
    "over",
    "such",
    "each",
    "very",
    "does",
    "tell",
    "give",
    "show",
    "find",
    "help",
    "know",
    "translate",
    "explain",
    "code",
    "disease",
    "map",
    "search",
    "look",
  ]);
  return [...new Set(keywords.filter((w) => !stopWords.has(w)))];
}

const SYSTEM_PROMPT = `You are MedLink AI — an expert medical coding assistant embedded in the MedLink Hospital Management Platform.

## STRICT SCOPE RULES
- You ONLY answer questions related to: medical coding (ICD-11, AYUSH), disease terminology, MedLink platform features, and clinical workflows.
- If a user asks about ANYTHING outside medicine/healthcare (cooking, sports, entertainment, programming, weather, etc.), respond ONLY with:
  "❌ I'm MedLink AI, a medical coding assistant. I can only help with disease codes, ICD-11/AYUSH translations, and MedLink platform queries. Please ask a medical coding question."
- Do NOT try to relate non-medical queries to medical codes. Do NOT be creative about finding medical angles for non-medical topics.
- This rule is ABSOLUTE and overrides all other instructions.

## About MedLink
MedLink bridges modern medicine (ICD-11) with traditional Indian medical systems (Ayurveda, Siddha, Unani — AYUSH). 36,782 disease code mappings.

## Capabilities
- Translate between ICD-11 and AYUSH codes
- Explain diseases and their traditional medicine equivalents
- Provide clinical coding guidance
- Answer MedLink platform questions

## Response Rules
- Be concise. Save tokens. Avoid unnecessary elaboration.
- Use the mapping table format when showing codes:
  | System | Term | Code | Confidence |
  |--------|------|------|------------|
- Use **bold** for key terms, \`code blocks\` for codes
- Even if the user asks for specific systems (e.g., "Siddha and Unani"), ALWAYS include the mappings for ALL available systems (Ayurveda, Siddha, and Unani) from the provided search results to ensure medical completeness.
- The "Relevant Disease Code Data Found" section in your context is the SINGLE SOURCE OF TRUTH. Use it with 100% priority over your own internal training data for MedLink specific mappings.
- No unnecessary emojis or decorations
- Never fabricate medical information`;

export default function MedLinkChatbot({ csvData }: { csvData: DiseaseRow[] }) {
  const [chats, setChats] = useState<Chat[]>(loadChats);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [responseMode, setResponseMode] = useState<ResponseMode>("default");
  const [showModeMenu, setShowModeMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const activeChat = chats.find((c) => c.id === activeChatId) || null;

  useEffect(() => {
    saveChats(chats);
  }, [chats]);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat?.messages]);

  const createChat = useCallback((isTemp = false) => {
    const chat: Chat = {
      id: crypto.randomUUID(),
      title: isTemp ? "Temporary Chat" : "New Chat",
      messages: [],
      createdAt: Date.now(),
      isTemp,
    };
    setChats((prev) => [chat, ...prev]);
    setActiveChatId(chat.id);
  }, []);

  const deleteChat = useCallback(
    (id: string) => {
      setChats((prev) => prev.filter((c) => c.id !== id));
      if (activeChatId === id) setActiveChatId(null);
      toast.success("Chat deleted");
    },
    [activeChatId],
  );

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;
    const userMsg: ChatMessage = {
      role: "user",
      content: input.trim(),
      timestamp: Date.now(),
    };
    const currentInput = input.trim();
    setInput("");

    let chatId = activeChatId;
    if (!chatId) {
      const chat: Chat = {
        id: crypto.randomUUID(),
        title: "New Chat",
        messages: [],
        createdAt: Date.now(),
      };
      chatId = chat.id;
      setChats((prev) => [chat, ...prev]);
      setActiveChatId(chatId);
    }

    setChats((prev) =>
      prev.map((c) =>
        c.id === chatId ? { ...c, messages: [...c.messages, userMsg] } : c,
      ),
    );
    setIsLoading(true);

    try {
      // Search CSV for relevant disease data
      const searchTerms = extractSearchTerms(currentInput);
      let contextData = "";
      if (searchTerms.length > 0 && csvData.length > 0) {
        const allResults: DiseaseRow[] = [];
        for (const term of searchTerms) {
          const results = searchDiseaseData(csvData, term);
          results.forEach((r) => {
            if (!allResults.find((x) => x.ICD11_Code === r.ICD11_Code))
              allResults.push(r);
          });
        }
        if (allResults.length > 0) {
          contextData = `\n\n## Relevant Disease Code Data Found (from MedLink database of 36,782 entries):\n${allResults
            .slice(0, 15)
            .map(
              (r) =>
                `- **${r.ICD11_Title}** (ICD-11: \`${r.ICD11_Code}\`)\n  Ayurveda: ${r.Ayurveda_NAMC_term || "N/A"}${r.Ayurveda_NAMC_CODE ? ` (${r.Ayurveda_NAMC_CODE})` : ""} | Confidence: ${(parseFloat(r.Ayurveda_Similarity || "0") * 100).toFixed(1)}%\n  Siddha: ${r.Siddha_NAMC_TERM || "N/A"}${r.Siddha_NAMC_CODE ? ` (${r.Siddha_NAMC_CODE})` : ""} | Confidence: ${(parseFloat(r.Siddha_Similarity || "0") * 100).toFixed(1)}%\n  Unani: ${r.Unani_NUMC_TERM || "N/A"}${r.Unani_NUMC_CODE ? ` (${r.Unani_NUMC_CODE})` : ""} | Confidence: ${(parseFloat(r.Unani_Similarity || "0") * 100).toFixed(1)}%`,
            )
            .join("\n")}`;
        }
      }

      const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
      const chatHistory = (activeChat?.messages || []).map((m) => ({
        role: m.role === "assistant" ? ("model" as const) : ("user" as const),
        parts: [{ text: m.content }],
      }));

      const modeInstruction = MODE_INSTRUCTIONS[responseMode];
      const chat = model.startChat({
        history: [
          {
            role: "user",
            parts: [
              {
                text: "System instructions: " + SYSTEM_PROMPT + modeInstruction,
              },
            ],
          },
          {
            role: "model",
            parts: [
              {
                text: "Understood. I'm MedLink AI, ready to help with disease code translation, AYUSH mappings, and medical coding queries.",
              },
            ],
          },
          ...chatHistory,
        ],
      });

      const prompt = contextData
        ? `${currentInput}\n\n[CONTEXT: The following disease code data was found in the MedLink database relevant to this query. Use this data to provide accurate responses:]${contextData}`
        : currentInput;

      const result = await chat.sendMessageStream(prompt);

      // Stream response
      let fullText = "";
      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: "",
        timestamp: Date.now(),
      };

      setChats((prev) =>
        prev.map((c) =>
          c.id === chatId
            ? { ...c, messages: [...c.messages, assistantMsg] }
            : c,
        ),
      );

      for await (const chunk of result.stream) {
        const text = chunk.text();
        fullText += text;
        setChats((prev) =>
          prev.map((c) => {
            if (c.id !== chatId) return c;
            const msgs = [...c.messages];
            msgs[msgs.length - 1] = {
              ...msgs[msgs.length - 1],
              content: fullText,
            };
            return { ...c, messages: msgs };
          }),
        );
      }

      // Update title from first message
      setChats((prev) =>
        prev.map((c) => {
          if (c.id !== chatId) return c;
          if (c.title === "New Chat" && c.messages.length >= 2) {
            const title =
              currentInput.slice(0, 40) +
              (currentInput.length > 40 ? "..." : "");
            return { ...c, title };
          }
          return c;
        }),
      );
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        role: "assistant",
        content: `⚠️ **Error**: ${err.message || "Failed to get response"}. Please try again.`,
        timestamp: Date.now(),
      };
      setChats((prev) =>
        prev.map((c) =>
          c.id === chatId ? { ...c, messages: [...c.messages, errorMsg] } : c,
        ),
      );
      toast.error("Failed to get AI response");
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, activeChatId, activeChat, csvData, responseMode]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const recentChats = chats.filter((c) => !c.isTemp);
  const sortedChats = [...recentChats].sort(
    (a, b) => b.createdAt - a.createdAt,
  );

  return (
    <div className="flex h-[600px] rounded-xl border border-border bg-background overflow-hidden shadow-lg">
      {/* Sidebar */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-r border-border bg-muted/30 flex flex-col overflow-hidden shrink-0"
          >
            <div className="px-3 py-[10px] border-b border-border flex items-center justify-between">
              <span className="text-sm font-semibold">Chat History</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setShowSidebar(false)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-2 space-y-1">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2 text-xs"
                onClick={() => createChat()}
              >
                <Plus className="w-3 h-3" /> New Chat
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 text-xs text-muted-foreground"
                onClick={() => createChat(true)}
              >
                <Zap className="w-3 h-3" /> Temp Chat
              </Button>
            </div>
            <ScrollArea className="flex-1 px-2">
              <div className="space-y-0.5 pb-2">
                {sortedChats.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-6">
                    No chats yet
                  </p>
                )}
                {sortedChats.map((chat) => (
                  <div
                    key={chat.id}
                    className={`group flex items-center gap-2 px-2 py-2 rounded-md cursor-pointer text-xs transition-colors ${chat.id === activeChatId ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}
                    onClick={() => {
                      setActiveChatId(chat.id);
                    }}
                  >
                    <MessageSquare className="w-3 h-3 shrink-0" />
                    <span className="truncate flex-1">{chat.title}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChat(chat.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main chat */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="h-12 border-b border-border flex items-center px-3 gap-2 shrink-0">
          {!showSidebar && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setShowSidebar(true)}
            >
              <Clock className="w-4 h-4" />
            </Button>
          )}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Bot className="w-4 h-4 text-primary shrink-0" />
            <span className="text-sm font-medium truncate">
              {activeChat?.title || "MedLink AI Assistant"}
            </span>
            {activeChat?.isTemp && (
              <Badge variant="outline" className="text-[10px] h-4 px-1">
                TEMP
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => createChat()}
            >
              <Plus className="w-4 h-4" />
            </Button>
            {activeChat && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => deleteChat(activeChat.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="w-3 h-3 mr-2" /> Delete Chat
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            {!activeChat || activeChat.messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[420px] text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <Sparkles className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-1">MedLink AI</h3>
                <p className="text-muted-foreground text-sm max-w-sm mb-6">
                  Ask about disease codes, ICD-11 to AYUSH translations, or
                  anything about MedLink.
                </p>
                <div className="grid grid-cols-2 gap-2 max-w-md">
                  {[
                    "Translate Cholera to Ayurveda",
                    "What is ICD-11 code 1A00?",
                    "Compare Ayurveda, Siddha & Unani terms for Migraine",
                    "What is MedLink?",
                  ].map((q) => (
                    <button
                      key={q}
                      onClick={() => {
                        if (!activeChatId) createChat();
                        setInput(q);
                      }}
                      className="text-xs text-left p-2.5 rounded-lg border border-border hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              activeChat.messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-2xl rounded-br-md px-4 py-2.5"
                        : "bg-muted/50 rounded-2xl rounded-bl-md px-4 py-3"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <p className="text-sm whitespace-pre-wrap">
                        {msg.content}
                      </p>
                    ) : (
                      <div
                        className="medlink-chat-prose medlink-chat-scroll prose prose-sm dark:prose-invert max-w-none text-sm
                        prose-headings:text-foreground prose-headings:font-semibold prose-headings:mt-3 prose-headings:mb-1
                        prose-p:my-1.5 prose-p:leading-relaxed
                        prose-ul:my-1.5 prose-ol:my-1.5
                        prose-li:my-0.5
                        prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:font-mono
                        prose-pre:bg-muted prose-pre:rounded-lg prose-pre:p-3
                        prose-strong:text-foreground
                        prose-a:text-primary
                      "
                      >
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="w-7 h-7 rounded-lg bg-foreground/10 flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </motion.div>
              ))
            )}
            {isLoading &&
              activeChat &&
              activeChat.messages.length > 0 &&
              activeChat.messages[activeChat.messages.length - 1].role ===
                "user" && (
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div className="bg-muted/50 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">
                      Thinking...
                    </span>
                  </div>
                </div>
              )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="border-t border-border p-3">
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about disease codes, translations..."
              rows={1}
              className="flex-1 resize-none rounded-xl border border-border bg-muted/30 px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary/50 placeholder:text-muted-foreground min-h-[40px] max-h-[120px]"
              style={{ height: "auto", overflow: "auto" }}
              onInput={(e) => {
                const t = e.target as HTMLTextAreaElement;
                t.style.height = "auto";
                t.style.height = Math.min(t.scrollHeight, 120) + "px";
              }}
            />
            {/* Response Mode Selector */}
            <div className="relative">
              <button
                onClick={() => setShowModeMenu(!showModeMenu)}
                className="h-10 px-2.5 rounded-xl border border-border bg-muted/30 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shrink-0"
                title="Response Type"
              >
                {(() => {
                  const mode = RESPONSE_MODES.find(
                    (m) => m.value === responseMode,
                  );
                  const Icon = mode?.icon || FileText;
                  return <Icon className="w-3.5 h-3.5" />;
                })()}
                <span className="hidden sm:inline max-w-[70px] truncate">
                  {RESPONSE_MODES.find((m) => m.value === responseMode)?.label}
                </span>
                <ChevronDown className="w-3 h-3" />
              </button>
              {showModeMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowModeMenu(false)}
                  />
                  <div className="absolute bottom-12 right-0 z-50 w-52 rounded-xl border border-border bg-background shadow-xl p-1.5 space-y-0.5">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1">
                      Response Type
                    </p>
                    {RESPONSE_MODES.map((mode) => {
                      const Icon = mode.icon;
                      return (
                        <button
                          key={mode.value}
                          onClick={() => {
                            setResponseMode(mode.value);
                            setShowModeMenu(false);
                          }}
                          className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs transition-colors ${
                            responseMode === mode.value
                              ? "bg-primary/10 text-primary font-medium"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5 shrink-0" />
                          <div className="text-left">
                            <div>{mode.label}</div>
                            <div className="text-[10px] opacity-70">
                              {mode.description}
                            </div>
                          </div>
                          {responseMode === mode.value && (
                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
            <Button
              size="icon"
              className="h-10 w-10 rounded-xl shrink-0"
              disabled={!input.trim() || isLoading}
              onClick={sendMessage}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-2">
            MedLink AI • {csvData.length.toLocaleString()} codes •{" "}
            {RESPONSE_MODES.find((m) => m.value === responseMode)?.label} mode
          </p>
        </div>
      </div>
    </div>
  );
}
