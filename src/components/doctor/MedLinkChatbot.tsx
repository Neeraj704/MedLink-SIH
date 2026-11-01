import { useState, useEffect, useRef, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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
  ChevronLeft,
  Loader2,
  ChevronDown,
  Gauge,
  FileText,
  List,
  BookOpen,
  ScrollText,
  Square,
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
import { supabase } from "@/integrations/supabase/client";

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

export interface DiseaseRow {
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
  icon: typeof FileText;
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

const STORAGE_KEY = "medlink-chats";

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
    JSON.stringify(chats.filter((c) => !c.isTemp))
  );
}

export default function MedLinkChatbot({
  csvData: _csvData,
}: {
  csvData?: DiseaseRow[];
}) {
  const [chats, setChats] = useState<Chat[]>(loadChats);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [responseMode, setResponseMode] = useState<ResponseMode>("default");
  const [showModeMenu, setShowModeMenu] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
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
      title: isTemp ? "Temporary Consultation" : "New Chat",
      messages: [],
      createdAt: Date.now(),
      isTemp,
    };
    setChats((prev) => [chat, ...prev]);
    setActiveChatId(chat.id);
    return chat.id;
  }, []);

  const deleteChat = useCallback(
    (id: string) => {
      setChats((prev) => prev.filter((c) => c.id !== id));
      if (activeChatId === id) setActiveChatId(null);
      toast.success("Chat deleted");
    },
    [activeChatId]
  );

  const stopGenerating = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
      toast.info("Generation stopped");
    }
  }, []);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;
    const currentInput = input.trim();
    const userMsg: ChatMessage = {
      role: "user",
      content: currentInput,
      timestamp: Date.now(),
    };
    setInput("");

    let chatId = activeChatId;
    if (!chatId) {
      chatId = createChat(false);
    }

    setChats((prev) =>
      prev.map((c) =>
        c.id === chatId ? { ...c, messages: [...c.messages, userMsg] } : c
      )
    );
    setIsLoading(true);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    // Placeholder for streaming assistant reply
    const assistantMsg: ChatMessage = {
      role: "assistant",
      content: "",
      timestamp: Date.now(),
    };

    setChats((prev) =>
      prev.map((c) =>
        c.id === chatId
          ? { ...c, messages: [...c.messages, assistantMsg] }
          : c
      )
    );

    try {
      const session = (await supabase.auth.getSession()).data.session;
      const baseUrl =
        import.meta.env.VITE_SUPABASE_URL || "http://127.0.0.1:54321";
      const anonKey =
        import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
        import.meta.env.VITE_SUPABASE_ANON_KEY ||
        "";

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        apikey: anonKey,
        Authorization: `Bearer ${session?.access_token || anonKey}`,
      };

      const res = await fetch(`${baseUrl}/functions/v1/ai-chat`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          session_id: chatId,
          message: currentInput,
          mode: responseMode,
          temp: activeChat?.isTemp || false,
        }),
        signal: abortController.signal,
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || `Server responded with ${res.status}`);
      }

      if (!res.body) {
        throw new Error("No response body received");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let fullText = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";

        for (const part of parts) {
          const trimmed = part.trim();
          if (!trimmed.startsWith("data: ")) continue;
          const dataContent = trimmed.slice(6).trim();
          if (dataContent === "[DONE]") break;

          try {
            const parsed = JSON.parse(dataContent);
            if (parsed.delta) {
              fullText += parsed.delta;
              setChats((prev) =>
                prev.map((c) => {
                  if (c.id !== chatId) return c;
                  const msgs = [...c.messages];
                  msgs[msgs.length - 1] = {
                    ...msgs[msgs.length - 1],
                    content: fullText,
                  };
                  return { ...c, messages: msgs };
                })
              );
            }
          } catch {
            // Raw text chunk if not json
            fullText += dataContent;
            setChats((prev) =>
              prev.map((c) => {
                if (c.id !== chatId) return c;
                const msgs = [...c.messages];
                msgs[msgs.length - 1] = {
                  ...msgs[msgs.length - 1],
                  content: fullText,
                };
                return { ...c, messages: msgs };
              })
            );
          }
        }
      }

      // Update title from first message
      setChats((prev) =>
        prev.map((c) => {
          if (c.id !== chatId) return c;
          if (c.title === "New Chat" && c.messages.length >= 2) {
            const title =
              currentInput.slice(0, 36) + (currentInput.length > 36 ? "..." : "");
            return { ...c, title };
          }
          return c;
        })
      );
    } catch (err: unknown) {
      if ((err as Error)?.name === "AbortError") {
        return;
      }
      const errMsg = (err as Error)?.message || "Failed to get AI response";
      setChats((prev) =>
        prev.map((c) => {
          if (c.id !== chatId) return c;
          const msgs = [...c.messages];
          msgs[msgs.length - 1] = {
            ...msgs[msgs.length - 1],
            content: `⚠️ **Error**: ${errMsg}. Grounded database response was unavailable.`,
          };
          return { ...c, messages: msgs };
        })
      );
      toast.error("Failed to get AI response");
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [input, isLoading, activeChatId, createChat, responseMode, activeChat]);

  const currentModeInfo =
    RESPONSE_MODES.find((m) => m.value === responseMode) || RESPONSE_MODES[2];
  const ModeIcon = currentModeInfo.icon;

  return (
    <div className="flex h-[740px] rounded-xl border border-border bg-card overflow-hidden shadow-sm">
      {/* Sidebar */}
      <AnimatePresence initial={false}>
        {showSidebar && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="border-r border-border bg-muted/20 flex flex-col h-full shrink-0 overflow-hidden"
          >
            <div className="p-3 border-b border-border space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start gap-2 h-9 text-xs font-medium"
                onClick={() => createChat(false)}
              >
                <Plus className="size-4" /> New Chat
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 h-8 text-[11px] text-muted-foreground hover:text-foreground"
                onClick={() => createChat(true)}
              >
                <Clock className="size-3.5" /> Temporary Chat
              </Button>
            </div>

            <ScrollArea className="flex-1 p-2">
              <div className="space-y-1">
                {chats.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-8">
                    No conversations yet
                  </p>
                ) : (
                  chats.map((c) => (
                    <div
                      key={c.id}
                      className={`group flex items-center justify-between rounded-lg px-2.5 py-2 text-xs transition-colors cursor-pointer ${
                        c.id === activeChatId
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                      onClick={() => setActiveChatId(c.id)}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <MessageSquare className="size-3.5 shrink-0" />
                        <span className="truncate">{c.title}</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteChat(c.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
        {/* Header */}
        <div className="h-12 border-b border-border flex items-center justify-between px-3 shrink-0">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => setShowSidebar((s) => !s)}
            >
              <ChevronLeft
                className={`size-4 transition-transform ${
                  !showSidebar ? "rotate-180" : ""
                }`}
              />
            </Button>
            <div className="flex items-center gap-1.5">
              <Sparkles className="size-4 text-primary" />
              <span className="text-sm font-semibold">MedLink AI Assistant</span>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                ICD-11 &bull; AYUSH RAG
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Mode selector */}
            <DropdownMenu open={showModeMenu} onOpenChange={setShowModeMenu}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5">
                  <ModeIcon className="size-3.5" />
                  <span>{currentModeInfo.label}</span>
                  <ChevronDown className="size-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {RESPONSE_MODES.map((m) => {
                  const Icon = m.icon;
                  return (
                    <DropdownMenuItem
                      key={m.value}
                      className="flex items-start gap-2 py-2 cursor-pointer"
                      onClick={() => setResponseMode(m.value)}
                    >
                      <Icon className="size-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <div className="text-xs font-medium">{m.label}</div>
                        <div className="text-[11px] text-muted-foreground">
                          {m.description}
                        </div>
                      </div>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {activeChat?.isTemp && (
              <Badge variant="secondary" className="text-[10px]">
                Temporary
              </Badge>
            )}
          </div>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!activeChat || activeChat.messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto text-muted-foreground space-y-3">
              <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Bot className="size-6" />
              </div>
              <h3 className="font-semibold text-foreground text-base">
                Ask MedLink Clinical Intelligence
              </h3>
              <p className="text-xs leading-relaxed">
                Query 36,782 NAMASTE, NUMC, and ICD-11 mappings. Grounded in
                verified AYUSH terminology, cross-system confidence scores, and
                FHIR R4 Bundle requirements.
              </p>
              <div className="grid grid-cols-2 gap-2 w-full pt-2">
                {[
                  "Cholera 1A00 AYUSH translation",
                  "Migraine in Ayurveda & Unani",
                  "Amatisara ICD-11 equivalent",
                  "Hypertension BA00 cross-mapping",
                ].map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => {
                      setInput(prompt);
                      inputRef.current?.focus();
                    }}
                    className="text-left p-2.5 rounded-lg border border-border bg-card hover:bg-muted/50 text-[11px] text-foreground transition-colors"
                  >
                    &ldquo;{prompt}&rdquo;
                  </button>
                ))}
              </div>
            </div>
          ) : (
            activeChat.messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${
                  m.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {m.role === "assistant" && (
                  <div className="size-7 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                    <Bot className="size-4" />
                  </div>
                )}
                <div
                  className={`max-w-[82%] rounded-xl px-4 py-3 text-xs leading-relaxed ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground font-medium"
                      : "bg-muted/40 border border-border text-foreground"
                  }`}
                >
                  {m.role === "assistant" ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none text-xs">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {m.content || "Thinking..."}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <span>{m.content}</span>
                  )}
                </div>
                {m.role === "user" && (
                  <div className="size-7 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground shrink-0 mt-0.5">
                    <User className="size-4" />
                  </div>
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-border bg-background shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex items-end gap-2"
          >
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Ask about ICD-11, AYUSH equivalents, symptoms..."
                rows={1}
                disabled={isLoading}
                className="w-full resize-none rounded-lg border border-input bg-card px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring min-h-[38px] max-h-32"
              />
            </div>
            {isLoading ? (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={stopGenerating}
                className="h-[38px] px-3 gap-1.5 text-xs"
              >
                <Square className="size-3.5 fill-current" /> Stop
              </Button>
            ) : (
              <Button
                type="submit"
                size="sm"
                disabled={!input.trim()}
                className="h-[38px] px-3 gap-1.5 text-xs"
              >
                <Send className="size-3.5" /> Send
              </Button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
