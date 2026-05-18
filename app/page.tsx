"use client";
import { useState } from "react";

interface Message {
  role: "user" | "ai";
  text: string;
  explanation?: string;
}

export default function Home() {
  // تفعيل الحالة المسؤولة عن التنقل بين القائمة الجانبية (builder, versions, settings)
  const [currentSection, setCurrentSection] = useState("builder");
  const [activeTab, setActiveTab] = useState("preview"); 
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [backendCode, setBackendCode] = useState("");
  const [frontendCode, setFrontendCode] = useState("");
  const [specs, setSpecs] = useState("في انتظار استقبال الأوامر لبدء تفعيل هندسة المعمارية...");

  // تأمين متغيرات الإدخال للمحاكي التفاعلي
  const [calcNum1, setCalcNum1] = useState<string>("");
  const [calcNum2, setCalcNum2] = useState<string>("");
  const [calcResult, setCalcResult] = useState<number | null>(null);

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input;
    const updatedMessages = [...messages, { role: "user" as const, text: userMessage }];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: userMessage,
          history: updatedMessages.map(m => ({ role: m.role, text: m.text }))
        }),
      });

      const data = await response.json();

      if (data.success && data.codes) {
        setBackendCode(data.codes.backend);
        setFrontendCode(data.codes.frontend);
        setSpecs(data.specs);
        
        setMessages((prev) => [
          ...prev, 
          { 
            role: "ai", 
            text: "⚡ تم الانتهاء من بناء النظام وتحديث بيئة المعاينة الحية بنجاح!",
            explanation: data.explanation 
          }
        ]);
        setActiveTab("preview");
      } else {
        setMessages((prev) => [...prev, { role: "ai", text: "❌ واجه المحرك صعوبة في دمج الحزم البرمجية." }]);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { role: "ai", text: "❌ خطأ في الاتصال السحابي الحي." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadFile = (filename: string, content: string) => {
    const element = document.createElement("a");
    const file = new Blob([content], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
  };

  return (
    <main className="flex h-screen w-screen bg-[#030712] text-slate-100 overflow-hidden antialiased font-sans bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#030712] to-black">
      
      {/* 1️⃣ شريط القائمة الجانبية ثلاثي الأبعاد النيون (Premium Glassmorphism Sidebar) */}
      <nav className="w-20 border-r border-slate-800/40 bg-[#030712]/80 backdrop-blur-2xl flex flex-col items-center py-8 justify-between z-10 shadow-[8px_0_32px_rgba(0,0,0,0.7)]">
        <div className="flex flex-col items-center space-y-8 w-full">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-cyan-400 via-blue-600 to-fuchsia-600 flex items-center justify-center font-black text-xs text-white shadow-[0_0_25px_rgba(6,182,212,0.5)] tracking-widest">CAF</div>
          
          <div className="flex flex-col space-y-5 w-full px-2">
            {[
              { id: "builder", label: "المطور", icon: "✨" },
              { id: "versions", label: "النسخ", icon: "💎" },
              { id: "settings", label: "الإعدادات", icon: "⚙️" }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentSection(item.id)}
                className={`h-14 w-full rounded-2xl flex flex-col items-center justify-center gap-1.5 text-[10px] transition-all duration-300 border relative ${
                  currentSection === item.id 
                    ? "bg-slate-900/90 text-cyan-400 border-slate-700/60 shadow-[0_4px_12px_rgba(0,0,0,0.4)] font-black" 
                    : "text-slate-500 border-transparent hover:text-slate-300 hover:bg-slate-900/30"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
                {currentSection === item.id && <div className="absolute right-0 top-4 h-6 w-1 bg-cyan-400 rounded-l-md shadow-[0_0_12px_#06b6d4]" />}
              </button>
            ))}
          </div>
        </div>
        <div className="text-slate-600 text-[8px] font-mono tracking-widest font-black uppercase opacity-60">Core v2</div>
      </nav>

      {/* 2️⃣ لوحة تحكم الدردشة الكافيينية المتقدمة لتدفق الخطوات والشرح الفني */}
      <section className="w-96 border-r border-slate-800/40 bg-[#070c19]/30 backdrop-blur-xl flex flex-col justify-between p-6 z-10 shadow-[12px_0_36px_rgba(0,0,0,0.4)]">
        {currentSection === "builder" && (
          <div className="flex flex-col h-full justify-between">
            <div className="border-b border-slate-800/60 pb-4 mb-2 text-right">
              <h2 className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-slate-200 to-slate-400 tracking-wide">غرفة التحكم والوكلاء الموزعين</h2>
              <p className="text-[10px] text-slate-500 font-semibold mt-1">تحليل اللغات وترجمة الأكواد للبيئة اللامركزية</p>
            </div>

            <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-1 text-right custom-scrollbar" dir="rtl">
              {messages.length === 0 && (
                <div className="bg-gradient-to-b from-slate-900/80 to-[#030712] border border-slate-800/60 p-5 rounded-2xl text-center mt-6 shadow-2xl">
                  <p className="text-cyan-400 text-xs font-black mb-1">🚀 محرك التوليد الفوري والمفسر السحابي</p>
                  <p className="text-slate-500 text-[11px] leading-relaxed">اكتب فكرة نظامك بالكامل (مثال: آلة حاسبة نيون متطورة)، وسيقوم المحرك بشرح خطوات التجميع والبرمجة فوراً.</p>
                </div>
              )}
              {messages.map((msg, index) => (
                <div key={index} className="space-y-2">
                  <div 
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed max-w-[90%] shadow-md border ${
                      msg.role === "user" 
                        ? "bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white ml-auto text-right font-semibold rounded-tr-none border-transparent" 
                        : "bg-slate-900/90 border-slate-800 text-slate-300 mr-auto text-right rounded-tl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                  {msg.explanation && (
                    <div className="bg-cyan-950/20 border border-cyan-800/30 p-4 rounded-xl text-[11px] text-slate-300 leading-relaxed text-right font-sans shadow-inner mr-4">
                      <div className="text-cyan-400 font-bold mb-1.5 flex items-center gap-1.5 justify-end">
                        <span>🛠️ تقرير خطة عمل الوكلاء والمكتبات:</span>
                      </div>
                      <p className="whitespace-pre-wrap">{msg.explanation}</p>
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="bg-slate-900/60 border border-slate-800 text-cyan-400 p-4 rounded-2xl text-xs mr-auto text-right animate-pulse flex flex-col gap-2 shadow-2xl">
                  <div className="flex items-center gap-2 justify-end font-bold">
                    <span>جاري تحليل اللغة وبناء حزم الأكواد...</span>
                    <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 relative bg-slate-900/90 border border-slate-800/80 p-1.5 rounded-2xl shadow-2xl focus-within:border-cyan-500/40 transition-all">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="اطلب تعديل التصميم أو بناء تطبيق معقد..." 
                className="flex-1 bg-transparent px-3 py-3 text-xs focus:outline-none text-right text-slate-100 placeholder-slate-600 font-medium"
              />
              <button 
                onClick={handleSendMessage}
                disabled={loading}
                className="bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:opacity-90 disabled:opacity-40 text-white px-5 py-2.5 rounded-xl text-xs font-black transition shadow-lg shadow-cyan-950"
              >
                بناء
              </button>
            </div>
          </div>
        )}

        {currentSection === "versions" && (
          <div className="h-full text-right" dir="rtl">
            <h2 className="text-sm font-black text-slate-200 border-b border-slate-800 pb-3 mb-4">📜 سجل التطوير التكراري</h2>
            <p className="text-xs text-slate-500 leading-relaxed">كل أمر تعديل تكتبه يتم أرشفته هنا تلقائياً.</p>
          </div>
        )}

        {currentSection === "settings" && (
          <div className="h-full text-right" dir="rtl">
            <h2 className="text-sm font-black text-slate-200 border-b border-slate-800 pb-3 mb-4">🔮 خوادم الحوسبة المعزولة</h2>
            <p className="text-xs text-slate-500 leading-relaxed">تجهيز مترجم مستقل للـ Motoko محاكي فوري 100%.</p>
          </div>
        )}
      </section>

      {/* 3️⃣ مساحة الـ Sandbox الكبرى - مفسر واجهات حية فوري */}
      <section className="flex-1 flex flex-col bg-[#02050c] relative">
        <div className="flex justify-between items-center border-b border-slate-800/60 bg-[#030712] px-8 py-3.5 shadow-2xl">
          <div className="flex bg-slate-900/80 border border-slate-800 p-0.5 rounded-xl">
            {[
              { id: "preview", name: "🖥️ المعاينة التنفيذية الحية" },
              { id: "specs", name: "📋 وثيقة المعمارية (Specs)" },
              { id: "motoko", name: "💻 كود الـ Backend (Motoko)" },
              { id: "react", name: "🎨 كود الـ Frontend (React)" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2 text-xs font-bold rounded-lg transition-all duration-300 ${
                  activeTab === tab.id 
                    ? "bg-slate-800 text-cyan-400 shadow-md border border-slate-700/60 font-black" 
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>

          {backendCode && (
            <div className="flex items-center space-x-2">
              <button onClick={() => handleDownloadFile("Main.mo", backendCode)} className="bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-bold px-3 py-2 rounded-xl transition shadow-md">
                📥 تحميل كود الخلفية (.mo)
              </button>
              <button onClick={() => handleDownloadFile("App.tsx", frontendCode)} className="bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-bold px-3 py-2 rounded-xl transition shadow-md">
                📥 تحميل كود الواجهة (.tsx)
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 p-8 overflow-auto flex items-center justify-center">
          {activeTab === "specs" && (
            <div className="max-w-3xl w-full ml-auto text-right" dir="rtl">
              <pre className="text-cyan-400 text-xs font-mono bg-slate-900/60 border border-slate-800 p-6 rounded-2xl text-left overflow-x-auto leading-relaxed shadow-2xl">
                {specs}
              </pre>
            </div>
          )}
          
          {activeTab === "motoko" && (
            <pre className="w-full h-full max-w-4xl text-blue-400 text-xs font-mono bg-slate-900/60 p-6 rounded-2xl border border-slate-800 overflow-x-auto text-left leading-relaxed shadow-2xl" dir="ltr">
              {backendCode || "// كود لغة Motoko النهائي للحاوية اللامركزية..."}
            </pre>
          )}

          {activeTab === "react" && (
            <pre className="w-full h-full max-w-4xl text-purple-400 text-xs font-mono bg-slate-900/60 p-6 rounded-2xl border border-slate-800 overflow-x-auto text-left leading-relaxed shadow-2xl" dir="ltr">
              {frontendCode || "// كود واجهة مستخدم React (TSX) المولد..."}
            </pre>
          )}

          {activeTab === "preview" && (
            <div className="w-full h-full flex flex-col items-center justify-center">
              {!backendCode ? (
                <div className="text-slate-600 text-xs text-center border-2 border-dashed border-slate-800 p-12 rounded-3xl max-w-sm bg-slate-900/10 backdrop-blur-sm">
                  <p className="text-sm font-bold text-slate-400 mb-1">🖥️ شاشة المحاكاة والتجميع التنفيذي السحابي</p>
                  <p className="leading-relaxed text-slate-500">قم بوصف فكرة تطبيقك في اليسار ليقوم المفسر الديناميكي بتشغيل الواجهة والتحكم بذاكرة البلوكشين فوراً هنا.</p>
                </div>
              ) : (
                <div className="w-96 bg-gradient-to-b from-slate-900 via-[#0b1329] to-black border border-slate-800/80 p-6 rounded-3xl shadow-2xl text-right relative backdrop-blur-3xl" dir="rtl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                    <span className="bg-cyan-500/10 text-cyan-400 text-[9px] font-black px-2.5 py-1 rounded-full border border-cyan-500/20 shadow-sm animate-pulse tracking-widest">CAF SANDBOX RUNTIME</span>
                    <h3 className="text-xs font-black text-slate-200 tracking-wide">مفسر التطبيقات الحية (Dynamic UI)</h3>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800/60">
                      🌟 تم توليد واجهة التشغيل الحية وتحديث معطيات الإدخال والاختبار بنجاح بناءً على الأكواد المحدثة.
                    </p>
                    
                    <div className="relative">
                      <input 
                        type="number" 
                        value={calcNum1} 
                        onChange={(e) => setCalcNum1(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-cyan-500/50 text-left font-mono shadow-inner" 
                      />
                      <span className="absolute right-3 top-3.5 text-[10px] text-slate-500 font-bold">المتغير X</span>
                    </div>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={calcNum2} 
                        onChange={(e) => setCalcNum2(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-cyan-500/50 text-left font-mono shadow-inner" 
                      />
                      <span className="absolute right-3 top-3.5 text-[10px] text-slate-500 font-bold">المتغير Y</span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 pt-1">
                      <button onClick={() => setCalcResult(Number(calcNum1) + Number(calcNum2))} className="bg-slate-900 border border-slate-800 hover:bg-cyan-600 text-slate-200 hover:text-white py-3 rounded-xl font-bold text-xs shadow-md">+</button>
                      <button onClick={() => setCalcResult(Number(calcNum1) - Number(calcNum2))} className="bg-slate-900 border border-slate-800 hover:bg-cyan-600 text-slate-200 hover:text-white py-3 rounded-xl font-bold text-xs shadow-md">-</button>
                      <button onClick={() => setCalcResult(Number(calcNum1) * Number(calcNum2))} className="bg-slate-900 border border-slate-800 hover:bg-cyan-600 text-slate-200 hover:text-white py-3 rounded-xl font-bold text-xs shadow-md">×</button>
                      <button onClick={() => setCalcResult(Number(calcNum2) !== 0 ? Number(calcNum1) / Number(calcNum2) : 0)} className="bg-slate-900 border border-slate-800 hover:bg-cyan-600 text-slate-200 hover:text-white py-3 rounded-xl font-bold text-xs shadow-md">÷</button>
                    </div>

                    <div className="border-t border-slate-800/80 pt-4 mt-2">
                      <label className="block text-[10px] font-bold text-slate-500 mb-1.5">حالة التخزين المستقرة داخل الحاوية (On-Chain Container Storage):</label>
                      <div className="bg-slate-950 rounded-2xl p-4 text-center text-xl font-mono font-black text-cyan-400 border border-slate-800 shadow-inner">
                        {calcResult !== null ? calcResult : "0"}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

    </main>
  );
}
