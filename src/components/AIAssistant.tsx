import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Sparkles, User, Shield, Compass, Mic, MicOff, AlertCircle } from "lucide-react";
import { ChatMessage } from "../types";

export const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Xin chào! Tôi là **COPPY** - Hệ Thống Trợ Lý Luật Giao Thông AI. Tôi đang giám sát hành trình cùng bạn. Bạn cần tư vấn về luật đường bộ, mức phạt vi phạm, hay ý nghĩa các biển báo?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Browser Speech Recognition state
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [speechError, setSpeechError] = useState("");
  const recognitionRef = useRef<any>(null);

  const quickQuestions = [
    "Trạm xăng gần nhất ở đâu?",
    "Báo cáo sự cố tai nạn giao thông",
    "Phạt quá tốc độ ô tô 10km/h thế nào?",
    "Biển P.102 cấm những xe nào?"
  ];

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "vi-VN"; // Vietnamese works brilliantly for traffic context, falls back nicely

    rec.onstart = () => {
      setIsListening(true);
      setSpeechError("");
    };

    rec.onend = () => {
      setIsListening(false);
    };

    rec.onerror = (e: any) => {
      console.warn("Speech recognition error:", e.error);
      if (e.error === "not-allowed") {
        setSpeechError("Microphone blocked. Please grant access.");
      } else {
        setSpeechError(`Error: ${e.error}`);
      }
      setIsListening(false);
    };

    rec.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript && transcript.trim()) {
        setInput(transcript);
        handleSend(transcript);
      }
    };

    recognitionRef.current = rec;
  }, []);

  const toggleListening = () => {
    if (!speechSupported) {
      alert("Browser does not support Speech Recognition. Use Chrome or Safari.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setSpeechError("");
      try {
        recognitionRef.current?.start();
      } catch (err) {
        console.error("Speech recognition start failed:", err);
      }
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      role: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    // Fire custom voice commands HUD events in real-time
    const lowerText = textToSend.toLowerCase();
    
    // Nearest gas station check
    if (
      lowerText.includes("gas") || 
      lowerText.includes("station") || 
      lowerText.includes("xăng") || 
      lowerText.includes("nhiên liệu") || 
      lowerText.includes("petrol")
    ) {
      const ev = new CustomEvent("hud-voice-command", {
        detail: { command: "gas_station", text: textToSend }
      });
      window.dispatchEvent(ev);
    } 
    // Report traffic incident check
    else if (
      lowerText.includes("report") || 
      lowerText.includes("incident") || 
      lowerText.includes("sự cố") || 
      lowerText.includes("tai nạn") || 
      lowerText.includes("va chạm") || 
      lowerText.includes("kẹt xe") || 
      lowerText.includes("traffic")
    ) {
      const ev = new CustomEvent("hud-voice-command", {
        detail: { command: "report_incident", text: textToSend }
      });
      window.dispatchEvent(ev);
    }

    try {
      // Gather conversation history
      const history = messages.map(m => ({
        role: m.role,
        text: m.text
      }));

      const response = await fetch("/api/gemini/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend, history })
      });

      const data = await response.json();
      
      const assistantMsg: ChatMessage = {
        id: Math.random().toString(),
        role: "assistant",
        text: data.text || "Xin lỗi, máy chủ AI đang bận xử lý, xin vui lòng thử lại.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: Math.random().toString(),
        role: "assistant",
        text: "❌ **Kết nối gián đoạn**. Không thể liên kết dữ liệu với Tổng Cục Đường Bộ. Hãy thử lại sau giây lát.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  // Simple formatter helper to parse bold text **like this**
  const renderMessageText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={index} className="text-hud-cyan font-semibold">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div id="ai-assistant-panel" className="bg-slate-900/80 backdrop-blur-md rounded-xl border border-slate-700/60 p-4 h-[520px] flex flex-col justify-between neon-border-cyan">
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-slate-700/50 pb-3 mb-2">
        <div className="flex items-center gap-2">
          <div className="relative">
            <span className="absolute top-0 right-0 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-hud-cyan opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-hud-cyan"></span>
            </span>
            <div className="p-1.5 bg-slate-800 rounded-lg text-hud-cyan border border-hud-cyan/30">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h4 className="font-sans font-bold text-slate-100 text-sm tracking-wide uppercase flex items-center gap-1.5">
              COPPY AI ASSISTANT
            </h4>
            <p className="font-mono text-[10px] text-hud-cyan/80">COMMUNICATION UNIT ACTIVE</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-hud-cyan/10 border border-hud-cyan/30 rounded text-[10px] text-hud-cyan font-mono">
          <Shield className="w-3.5 h-3.5" />
          VIETNAM ROAD LAW
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-3 pr-1 mb-3 scrollbar"
      >
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role !== "user" && (
              <div className="w-7 h-7 rounded-lg bg-slate-800 border border-hud-cyan/30 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-hud-cyan" />
              </div>
            )}
            <div className={`max-w-[85%] rounded-xl p-3 text-sm leading-relaxed ${
              msg.role === "user" 
                ? "bg-hud-cyan/10 border border-hud-cyan/40 text-slate-100 rounded-tr-none" 
                : "bg-slate-800/80 border border-slate-700/50 text-slate-200 rounded-tl-none"
            }`}>
              <div className="whitespace-pre-wrap">{renderMessageText(msg.text)}</div>
              <span className="block font-mono text-[9px] text-slate-500 mt-1.5 text-right">{msg.timestamp}</span>
            </div>
            {msg.role === "user" && (
              <div className="w-7 h-7 rounded-lg bg-hud-cyan/20 border border-hud-cyan/40 flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-hud-cyan" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-2.5 justify-start">
            <div className="w-7 h-7 rounded-lg bg-slate-800 border border-hud-cyan/30 flex items-center justify-center shrink-0 animate-spin">
              <Compass className="w-4 h-4 text-hud-cyan" />
            </div>
            <div className="bg-slate-800/80 border border-slate-700/50 rounded-xl rounded-tl-none p-3 max-w-[80%]">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-hud-cyan rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-hud-cyan rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-hud-cyan rounded-full animate-bounce" style={{ animationDelay: "300ms text-hud-cyan" }} />
              </div>
              <span className="block font-mono text-[9px] text-slate-500 mt-1">Đang truy vấn luật...</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggestions */}
      <div className="mb-2">
        <label className="font-mono text-[9px] text-slate-400 block mb-1">GỢI Ý LỆNH GIỌNG NÓI & TRA CỨU:</label>
        <div className="flex flex-wrap gap-1.5">
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="text-[11px] text-left bg-slate-800/90 hover:bg-slate-800 border border-slate-700/60 hover:border-hud-cyan/60 transition-all text-slate-300 hover:text-hud-cyan px-2 py-1 rounded flex items-center gap-1 cursor-pointer"
            >
              <span className="text-[10px] opacity-70">💬</span>
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Speech Active Waves Visual Indicator */}
      {isListening && (
        <div className="relative bg-amber-500/10 border border-amber-500/30 rounded-lg p-2.5 flex items-center justify-between gap-3 animate-pulse mb-1">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span className="font-mono text-[10.5px] text-amber-400 font-bold uppercase tracking-wider">
              Hệ thống đang lắng nghe bạn nói...
            </span>
          </div>
          {/* Audio frequency wave simulation bars */}
          <div className="flex items-end gap-[2px] h-3">
            <div className="w-[2.5px] bg-amber-400 rounded-sm animate-bounce" style={{ height: "40%", animationDuration: "0.6s" }}></div>
            <div className="w-[2.5px] bg-amber-400 rounded-sm animate-bounce" style={{ height: "100%", animationDuration: "0.4s" }}></div>
            <div className="w-[2.5px] bg-amber-400 rounded-sm animate-bounce" style={{ height: "60%", animationDuration: "0.5s" }}></div>
            <div className="w-[2.5px] bg-amber-400 rounded-sm animate-bounce" style={{ height: "80%", animationDuration: "0.7s" }}></div>
          </div>
        </div>
      )}

      {/* Speech Error & Not Supported Indicator */}
      {speechError && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-2 rounded-lg text-[10.5px] font-mono flex items-center gap-1.5 mb-1 transition-all">
          <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
          <span>{speechError} (Hãy nói lại rõ hơn hoặc mở quyền mic)</span>
        </div>
      )}

      {!speechSupported && (
        <div className="bg-slate-950 p-1.5 rounded border border-slate-800 text-[10px] text-slate-500 font-mono text-center mb-1">
          ⚠️ Mic không khả dụng trực tiếp trong trình duyệt này. Gõ văn bản để gửi lệnh!
        </div>
      )}

      {/* Input Form with integrated Mic button */}
      <form 
        onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
        className="flex gap-2 pt-2 border-t border-slate-800/80"
      >
        <button
          type="button"
          onClick={toggleListening}
          className={`px-3 py-2 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
            isListening 
              ? "bg-amber-600/20 border-amber-500 text-amber-400 animate-pulse ring-2 ring-amber-500/30" 
              : "bg-slate-950/80 hover:bg-slate-900 border-slate-700/80 text-slate-400 hover:text-hud-cyan hover:border-hud-cyan/80"
          }`}
          title={isListening ? "Nhấp để dừng nghe" : "Nhấp và nói bằng giọng nói"}
        >
          {isListening ? (
            <MicOff className="w-4 h-4 text-amber-500 animate-bounce" />
          ) : (
            <Mic className="w-4 h-4 text-hud-cyan" />
          )}
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isListening ? "Đang thu âm..." : "Hỏi trạm xăng, báo cáo tai nạn hoặc gõ luật..."}
          className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-hud-cyan font-sans"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="bg-hud-cyan text-slate-950 font-bold px-3 py-2 rounded-lg hover:bg-cyan-400 active:bg-cyan-500 transition-colors disabled:opacity-40 flex items-center justify-center cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
