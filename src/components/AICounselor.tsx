import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Send, BrainCircuit, User, ArrowRight, BookOpen, HeartHandshake } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import { type Message, type StudentProfile } from "../types";

interface AICounselorProps {
  studentProfile: StudentProfile;
  setStudentProfile: (p: StudentProfile) => void;
}

const SUGGESTED_QUESTIONS = [
  {
    title: "Yazılımcı Günlüğü",
    text: "Yazılım mühendisleri gün içinde tam olarak ne yapar? 1 haftada ne öğrenebilirim?",
    icon: "💻"
  },
  {
    title: "Tasarımcı Yol Haritası",
    text: "Dijital grafiker olmak istiyorum, kendimi lisede nasıl geliştirebilirim?",
    icon: "🎨"
  },
  {
    title: "İlgi Alnıma Göre Tercih",
    text: "Tıp ve Moleküler Biyoloji/Kimya ile ilgileniyorum. Hangi meslekler bana hitap eder?",
    icon: "🔬"
  },
  {
    title: "Staj Tavsiyeleri",
    text: "İlk mülakatıma gireceğim, şirketlerin sorduğu motivasyon sorularına nasıl cevap vermeliyim?",
    icon: "🌟"
  }
];

export default function AICounselor({ studentProfile, setStudentProfile }: AICounselorProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial-msg",
      sender: "ai",
      text: `Merhaba **${studentProfile.name || "Geleceğin Yıldızı"}**! 🌟\n\nBen senin Dijital Kariyer Danışmanım. Lisedeyken hangi mesleğin sana en uygun olduğunu anlamak bazen zor olabilir. Bu yüzden **"Stajyerim"** platformunda 1 haftalık deneme stajları (tryout) yaparak meslekleri bizzat mutfağında tecrübe etmeni istiyoruz!\n\nKafandaki soruları bana sorabilirsin. Örneğin:\n- *Hangi meslek dallarında ne işler yapılır?*\n- *İlgi alanlarına en uygun 1 haftalık staj hangisi olabilir?*\n- *Deneme stajı mülakatına nasıl hazırlanmalısın?*\n\nSana özel tavsiyeler vermem için aşağıdaki ilgi alanı detaylarını doldurabilirsin ya da direkt sohbete başlayabiliriz!`,
      timestamp: Date.now()
    }
  ]);
  const [inputVal, setInputVal] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: Math.random().toString(),
      sender: "user",
      text: textToSend,
      timestamp: Date.now()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal("");
    setLoading(true);

    try {
      // Gather context
      const chatHistory = messages.slice(1).map(m => ({
        role: m.sender === "user" ? "user" : "ai",
        content: m.text
      }));

      const response = await fetch("/api/ai/counselor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: textToSend,
          history: chatHistory,
          studentProfile: studentProfile
        })
      });

      if (!response.ok) {
        throw new Error("Sunucudan yanıt alınamadı.");
      }

      const data = await response.json();
      
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: "ai",
          text: data.reply,
          timestamp: Date.now()
        }
      ]);
    } catch (error) {
      console.error("AI chat error:", error);
      // Fallback message
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: "ai",
          text: "Bağlantıda küçük bir mola verdim. Ancak sormak istediğin soru stajlar hakkındaysa, **Tasarım**, **Teknoloji**, **Sağlık** ve **Finans** alanındaki 1 haftalık deneme programlarını inceleyebilir ve hedefin olan her şirketin mülakat quiz'ini çözerek hemen başvurabilirsin! Her zaman yanındayım.",
          timestamp: Date.now()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputVal);
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      {/* Profile and context card */}
      <div className="lg:col-span-1 space-y-6">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <BrainCircuit className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900" id="counselor-profile-title">Kişisel Profil Detayları</h3>
              <p className="text-xs text-gray-500">Kariyer danışmanın sana özel yanıt versin</p>
            </div>
          </div>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                Adın / Soyadın
              </label>
              <input
                type="text"
                id="student-profile-name-input"
                value={studentProfile.name}
                onChange={(e) => setStudentProfile({ ...studentProfile, name: e.target.value })}
                placeholder="Örn: Ayşe Yılmaz"
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                Lise Sınıfın
              </label>
              <select
                id="student-profile-grade-select"
                value={studentProfile.grade}
                onChange={(e) => setStudentProfile({ ...studentProfile, grade: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none bg-white transition duration-200 focus:border-indigo-500"
              >
                <option value="9. Sınıf (Hazırlık/Lise 1)">9. Sınıf (Lise 1)</option>
                <option value="10. Sınıf (Lise 2)">10. Sınıf (Lise 2)</option>
                <option value="11. Sınıf (Lise 3)">11. Sınıf (Lise 3)</option>
                <option value="12. Sınıf (Lise 4/Son Sınıf)">12. Sınıf (Lise 4)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                Hangi Alanlar İlgini Çekiyor?
              </label>
              <textarea
                id="student-profile-interests-input"
                value={studentProfile.interests}
                onChange={(e) => setStudentProfile({ ...studentProfile, interests: e.target.value })}
                placeholder="Örn: Bilgisayar oyunları kodlama, resim çizme, biyoloji dersleri, sosyal etkinlikler..."
                rows={3}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none resize-none transition duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </form>

          <div className="mt-5 rounded-xl bg-orange-50/50 p-4 border border-orange-100 flex gap-2.5">
            <Sparkles className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed text-orange-850">
              <strong>İpucu:</strong> İlgilendiğin hobileri ne kadar net girersen, AI Danışmanın sana o kadar spesifik 1 haftalık deneme stajı seansları önerecektir.
            </p>
          </div>
        </div>

        {/* Resources card */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h4 className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3" id="quick-tips-header">
            <BookOpen className="h-4 w-4 text-indigo-600" />
            1 Haftalık Deneme Stajı Nedir?
          </h4>
          <p className="text-xs text-gray-650 leading-relaxed space-y-2">
            Meslekleri uzaktan veya yerinde 5 gün boyunca profesyonel ekiplerle beraber gözlemleme tekniğidir. Gerçek görevleri izler, minyatür projeler geliştirir, sormak istediğiniz her şeyi uzmanlara sorar ve sonunda o mesleğin size uygun olup olmadığını anlarsınız!
          </p>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="lg:col-span-2 flex flex-col h-[650px] border border-gray-100 rounded-2xl bg-white shadow-sm overflow-hidden">
        {/* Chat Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-150 bg-indigo-50/30">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 text-white shadow-sm">
              <Sparkles className="h-5 w-5" />
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500"></span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900" id="ai-active-status-header">Meslek Danışmanı AI</h3>
              <p className="text-xs text-green-600 font-medium">Uzman & Çevrim içi</p>
            </div>
          </div>
          <p className="text-xs text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full font-semibold">
            Rehberlik Odası
          </p>
        </div>

        {/* Channels/Bubble list */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 scrollbar-thin">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={`flex gap-3.5 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender !== "user" && (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs shadow-sm">
                    AI
                  </div>
                )}
                
                <div
                  className={`max-w-[82%] rounded-2xl p-4 text-sm leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-indigo-600 text-white rounded-tr-none shadow-sm"
                      : "bg-gray-50 text-gray-800 rounded-tl-none border border-gray-100 markdown-body"
                  }`}
                >
                  {msg.sender === "user" ? (
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  ) : (
                    <div className="prose prose-indigo prose-sm max-w-none text-gray-800">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  )}
                  <span
                    className={`block text-[10px] mt-2 ${
                      msg.sender === "user" ? "text-indigo-200 text-right" : "text-gray-400"
                    }`}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>

                {msg.sender === "user" && (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700 font-bold text-xs shadow-sm">
                    {studentProfile.name ? studentProfile.name[0].toUpperCase() : "U"}
                  </div>
                )}
              </motion.div>
            ))}

            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3.5 justify-start"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs animate-pulse">
                  AI
                </div>
                <div className="rounded-2xl p-4 bg-gray-50 border border-gray-100 flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                  <span className="text-xs text-gray-5s00 font-medium">Danışman yazıyor...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion list on first use or empty states */}
        {messages.length === 1 && (
          <div className="px-6 py-3 bg-gray-50/50 border-t border-gray-100 overflow-x-auto">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Popüler Sorular</p>
            <div className="flex gap-3 pb-1">
              {SUGGESTED_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  id={`suggested-question-btn-${idx}`}
                  onClick={() => handleSendMessage(q.text)}
                  className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-left text-xs text-gray-700 hover:border-indigo-400 hover:bg-indigo-50/30 hover:text-indigo-805 transition duration-150 shadow-2xs shrink-0"
                >
                  <span className="text-base">{q.icon}</span>
                  <div>
                    <p className="font-semibold text-gray-900">{q.title}</p>
                    <p className="text-[10px] text-gray-400 line-clamp-1">{q.text}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Submit Form */}
        <form onSubmit={onFormSubmit} className="p-4 border-t border-gray-150 flex gap-2 bg-white">
          <input
            type="text"
            id="ai-counselor-input-field"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            disabled={loading}
            placeholder={studentProfile.name ? `Soru sor, ${studentProfile.name}...` : "Mesleki hayallerini anlat veya bir meslek sor..."}
            className="flex-1 rounded-xl border border-gray-250 px-4 py-3 text-sm outline-none transition duration-150 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
          <button
            type="submit"
            id="send-chat-btn"
            disabled={loading || !inputVal.trim()}
            className="rounded-xl bg-indigo-600 px-5 text-white font-medium hover:bg-indigo-700 active:scale-95 transition flex items-center gap-1.5 disabled:opacity-50 disabled:pointer-events-none shadow-sm shadow-indigo-100"
          >
            Gönder
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
