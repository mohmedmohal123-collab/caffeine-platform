"use client";
import { useState } from "react";

interface Message {
  role: "user" | "ai";
  text: string;
}

export default function Home() {
  const [currentSection, setCurrentSection] = useState("builder");
  const [activeTab, setActiveTab] = useState("preview"); 
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  
  // حفظ الأكواد المنفصلة القادمة من الوكلاء المتخصصين
  const [backendCode, setBackendCode] = useState("");
  const [frontendCode, setFrontendCode] = useState("");
  const [specs, setSpecs] = useState("في انتظار استقبال الأوامر لبدء تفعيل هندسة المعمارية...");

  const [calcNum1, setCalcNum1] = useState<number>(0);
  const [calcNum2, setCalcNum2] = useState<number>(0);
  const [calcResult, setCalcResult] = useState<number | null>(null);

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input;
    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userMessage }),
      });

      const data = await response.json();

      if (data.success && data.codes) {
        setBackendCode(data.codes.backend);
        setFrontendCode(data.codes.frontend);
        setSpecs(data.specs);
        setMessages((prev) => [...prev, { role: "ai", text: "⚡ تم معالجة طلبك عبر الوكلاء الموزعين وفصل الأكواد بنجاح! تفقد التبويبات بالأعلى لعرض الكود المولد." }]);
        setActiveTab("preview");
      } else {
        setMessages((prev) => [...prev, { role: "ai", text: "❌ فشل المحرك في تنظيم حزم البيانات، الرجاء إعادة المحاولة." }]);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { role: "ai", text: "❌ خطأ في الاستجابة السحابية." }]);
    } finally {
      setLoading(false);
    }
  };

  // دالة تحميل الكود المختار
  const handleDownloadFile = (filename: string, content: string) => {
    const element = document.createElement("a");
    const file = new Blob([content], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
  };

  return (
    <main className="flex h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden antialiased bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
      
      {/* 1️⃣ شريط القائمة الجانبية الفاخر ثلاثي الأبعاد (Glassmorphism Sidebar) */}
      <nav className="w-20 border-r border-slate-900/60 bg-slate-950/80 backdrop-blur-2xl flex flex-col items-center py-8 justify-between z-10 shadow-[4px_0_24px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col items-center space-y-8 w-full">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 flex items-center justify-center font-black text-sm text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] tracking-wider">CAF</div>
          
          <div className="flex flex-col space-y-4 w-full px-2">
            {[
              { id: "builder", icon: "💎", label: "المطور" },
              { id: "versions", icon: "CN", label: "النسخ" },
              { id: "settings", icon: "🔮", label: "الإعدادات" }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentSection(item.id)}
                className={`h-12 w-full rounded-xl flex flex-col items-center justify-center gap-1 text-xs transition-all duration-300 relative group ${
                  currentSection === item.id 
                    ? "bg-slate-900/80 text-cyan-400 border border-slate-800 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] font-bold" 
                    : "text-slate-500 hover:text-slate-300 hover:bg-slate-900/30"
                }`}
              >
                <span className="text-[10px] tracking-tight">{item.label}</span>
                {currentSection === item.id && <div className="absolute right-0 top-3 h-6 w-1 bg-cyan-500 rounded-l-md shadow-[0_0_10px_#06b6d4]" />}
              </button>
            ))}
          </div>
        </div>
        <div className="text-slate-600 text-[9px] font-mono tracking-widest font-bold">V1.0.0</div>
      </nav>

      {/* 2️⃣ لوحة التحكم بالدردشة ونظام الإدارة المعقد للوكلاء */}
      <section className="w-85 border-r border-slate-900/60 bg-slate-950/40 backdrop-blur-md flex flex-col justify-between p-6 z-10 shadow-[10px_0_30px_rgba(0,0,0,0.3)]">
        {currentSection === "builder" && (
          <div className="flex flex-col h-full justify-between">
            <div className="border-b border-slate-900/80 pb-4 mb-2 text-right">
              <h2 className="text-sm font-black text-slate-100 tracking-wide bg-clip-text bg-gradient-to-r from-slate-100 to-slate-400">مساعد الذكاء الاصطناعي التكراري</h2>
              <p className="text-[10px] text-slate-500 font-medium mt-1">توليد وفصل الأكواد ومعاينة البنية التحتية</p>
            </div>

            <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-1 text-right" dir="rtl">
              {messages.length === 0 && (
                <div className="bg-gradient-to-b from-slate-900/60 to-slate-950 border border-slate-800/80 p-5 rounded-2xl text-center mt-6 shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
                  <p className="text-slate-300 text-xs font-bold mb-1.5">⚡ محرك التوليد التكراري جاهز</p>
                  <p className="text-slate-500 text-[11px] leading-relaxed">قم بوصف تطبيق الويب اللامركزي الذي تريده، وسيقوم الوكلاء ببنائه وفصله تلقائياً.</p>
                </div>
              )}
              {messages.map((msg, index) => (
                <div 
                  key={index} 
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed max-w-[88%] shadow-md transition-all ${
                    msg.role === "user" 
                      ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white ml-auto text-right font-medium rounded-tr-none shadow-cyan-900/20" 
                      : "bg-slate-900 border border-slate-800 text-slate-300 mr-auto text-right rounded-tl-none"
                  }`}
                >
                  {msg.text}
                </div>
              ))}
              {loading && (
                <div className="bg-slate-900/50 border border-slate-800/80 text-cyan-500 p-4 rounded-2xl text-xs mr-auto text-right animate-pulse flex items-center gap-2 justify-end shadow-inner">
                  <span>جاري معالجة وفصل الأكواد هندسياً...</span>
                  <span className="h-2 w-2 rounded-full bg-cyan-500 animate-ping" />
                </div>
              )}
            </div>

            <div className="flex gap-2 relative bg-slate-900 border border-slate-800 p-1 rounded-2xl shadow-inner focus-within:border-cyan-500/50 transition-colors">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="اطلب أي تطبيق ويب أو آلة حاسبة..." 
                className="flex-1 bg-transparent px-3 py-3 text-xs focus:outline-none text-right text-slate-100 transition placeholder-slate-600"
              />
              <button 
                onClick={handleSendMessage}
                disabled={loading}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:from-slate-800 disabled:to-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-lg shadow-cyan-900/30"
              >
                بناء
              </button>
            </div>
          </div>
        )}

        {currentSection === "versions" && (
          <div className="h-full text-right" dir="rtl">
            <h2 className="text-sm font-bold text-slate-200 border-b border-slate-900 pb-3 mb-4">📜 سجل النسخ والإصدارات</h2>
            <p className="text-xs text-slate-500">سيتم حفظ الإصدارات التكرارية ديناميكياً هنا بمجرد التوليد الناجح للأكواد.</p>
          </div>
        )}

        {currentSection === "settings" && (
          <div className="h-full text-right" dir="rtl">
            <h2 className="text-sm font-bold text-slate-200 border-b border-slate-900 pb-3 mb-4">🔮 بيئة الحوسبة</h2>
            <p className="text-xs text-slate-500 leading-relaxed">المنصة تعمل حالياً بنظام المحاكاة للبيئات اللامركزية عبر الخوادم لضمان مجانية وسرعة التشغيل التجريبي للتطبيقات.</p>
          </div>
        )}
      </section>

      {/* 3️⃣ لوحة استعراض المحتوى والمطور (The Main Workspace Screen) */}
      <section className="flex-1 flex flex-col bg-slate-950 relative">
        
        {/* شريط الإجراءات العلوي الفاخر جداً ومقسم التبويبات الفنية الأربعة */}
        <div className="flex justify-between items-center border-b border-slate-900/80 bg-slate-950 px-8 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
          <div className="flex bg-slate-900/60 border border-slate-800/80 p-0.5 rounded-xl">
            {[
              { id: "preview", name: "🖥️ المعاينة الحية" },
              { id: "specs", name: "📋 معمارية النظام" },
              { id: "motoko", name: "💻 كود الـ Backend (Motoko)" },
              { id: "react", name: "🎨 كود الـ Frontend (React)" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeTab === tab.id 
                    ? "bg-slate-800 text-cyan-400 shadow-md border border-slate-700/50 font-black" 
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>

          {/* أزرار الإجراءات والتحميل المباشرة التكرارية */}
          {backendCode && (
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => handleDownloadFile("Main.mo", backendCode)}
                className="bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-bold px-3 py-2 rounded-xl transition shadow-md"
              >
                📥 تحميل كود الخلفية (.mo)
              </button>
              <button 
                onClick={() => handleDownloadFile("App.tsx", frontendCode)}
                className="bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-bold px-3 py-2 rounded-xl transition shadow-md"
              >
                📥 تحميل كود الواجهة (.tsx)
              </button>
            </div>
          )}
        </div>

        {/* عرض تفاصيل الأبلكيشن المولد مع المعاينة ثلاثية الأبعاد الراقية للآلة الحاسبة */}
        <div className="flex-1 p-8 overflow-auto flex items-center justify-center">
          {activeTab === "specs" && (
            <div className="max-w-2xl w-full ml-auto text-right" dir="rtl">
              <pre className="text-cyan-400 text-xs font-mono bg-slate-900/80 border border-slate-800 p-6 rounded-2xl text-left overflow-x-auto leading-relaxed shadow-2xl">
                {specs}
              </pre>
            </div>
          )}
          
          {activeTab === "motoko" && (
            <div className="w-full h-full max-w-4xl">
              <pre className="w-full h-full text-blue-400 text-xs font-mono bg-slate-900 p-6 rounded-2xl border border-slate-800 overflow-x-auto text-left leading-relaxed shadow-2xl" dir="ltr">
                {backendCode || "// كود لغة Motoko سيظهر هنا بمجرد التوليد البرمجي..."}
              </pre>
            </div>
          )}

          {activeTab === "react" && (
            <div className="w-full h-full max-w-4xl">
              <pre className="w-full h-full text-purple-400 text-xs font-mono bg-slate-900 p-6 rounded-2xl border border-slate-800 overflow-x-auto text-left leading-relaxed shadow-2xl" dir="ltr">
                {frontendCode || "// كود واجهة مستخدم React سيظهر هنا بمجرد التوليد البرمجي..."}
              </pre>
            </div>
          )}

          {activeTab === "preview" && (
            <div className="w-full h-full flex flex-col items-center justify-center">
              {!backendCode ? (
                <div className="text-slate-600 text-xs text-center border-2 border-dashed border-slate-900 p-12 rounded-3xl max-w-sm">
                  <p className="text-sm font-bold text-slate-400 mb-1">🖥️ شاشة المحاكاة والتشغيل الحية</p>
                  <p className="leading-relaxed text-slate-500">قم بكتابة أمر البناء في اليسار ليتولى المحرك فصل واستعراض الأكواد وتشغيل واجهة التطبيق التفاعلية الكاملة فوراً.</p>
                </div>
              ) : (
                /* آلة حاسبة بتصميم نيومورفيزم ثلاثي الأبعاد فخم ومبهر زجاجي */
                <div className="w-80 bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800 p-6 rounded-3xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] text-right relative backdrop-blur-3xl before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-b before:from-white/5 before:to-transparent before:pointer-events-none" dir="rtl">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-4">
                    <span className="bg-cyan-500/10 text-cyan-400 text-[9px] font-black px-2.5 py-1 rounded-full border border-cyan-500/20 shadow-sm animate-pulse">ICP EMULATOR V1</span>
                    <h3 className="text-xs font-black text-slate-300 tracking-wide">الآلة الحاسبة التفاعلية</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="relative">
                      <input 
                        type="number" 
                        value={calcNum1} 
                        onChange={(e) => setCalcNum1(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800/80 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-cyan-500/50 text-left font-mono shadow-inner transition-colors" 
                      />
                      <span className="absolute right-3 top-3.5 text-[10px] text-slate-500 font-bold">X Val</span>
                    </div>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={calcNum2} 
                        onChange={(e) => setCalcNum2(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800/80 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-cyan-500/50 text-left font-mono shadow-inner transition-colors" 
                      />
                      <span className="absolute right-3 top-3.5 text-[10px] text-slate-500 font-bold">Y Val</span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 pt-2">
                      <button onClick={() => setCalcResult(calcNum1 + calcNum2)} className="bg-slate-900 border border-slate-800 hover:bg-cyan-600 text-slate-200 hover:text-white py-3 rounded-xl font-bold text-xs transition-all active:scale-95 shadow-md">+</button>
                      <button onClick={() => setCalcResult(calcNum1 - calcNum2)} className="bg-slate-900 border border-slate-800 hover:bg-cyan-600 text-slate-200 hover:text-white py-3 rounded-xl font-bold text-xs transition-all active:scale-95 shadow-md">-</button>
                      <button onClick={() => setCalcResult(calcNum1 * calcNum2)} className="bg-slate-900 border border-slate-800 hover:bg-cyan-600 text-slate-200 hover:text-white py-3 rounded-xl font-bold text-xs transition-all active:scale-95 shadow-md">×</button>
                      <button onClick={() => setCalcResult(calcNum2 !== 0 ? calcNum1 / calcNum2 : 0)} className="bg-slate-900 border border-slate-800 hover:bg-cyan-600 text-slate-200 hover:text-white py-3 rounded-xl font-bold text-xs transition-all active:scale-95 shadow-md">÷</button>
                    </div>

                    <div className="border-t border-slate-800/80 pt-4 mt-2">
                      <label className="block text-[10px] font-bold text-slate-500 mb-1.5">الذاكرة الراجعة للمعاينة (Query State):</label>
                      <div className="bg-slate-950 rounded-2xl p-4 text-center text-xl font-mono font-black text-cyan-400 border border-slate-800 shadow-inner tracking-wider">
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
