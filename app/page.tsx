"use client";
import { useState } from "react";

interface Message {
  role: "user" | "ai";
  text: string;
}

interface VersionHistory {
  id: string;
  number: number;
  timestamp: string;
  promptUsed: string;
}

export default function Home() {
  // إدارة الأقسام الرئيسية في القائمة الجانبية
  const [currentSection, setCurrentSection] = useState("builder"); // builder, versions, settings
  
  // إدارة تبويبات المطور العلوية
  const [activeTab, setActiveTab] = useState("preview"); 
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  
  const [draftCode, setDraftCode] = useState("");
  const [liveCode, setLiveCode] = useState("");
  const [specs, setSpecs] = useState("في انتظار وصف تطبيقك لتوليد المعمارية الهندسية...");

  // سجل الإصدارات التكرارية الافتراضي (سيتم ربطه ديناميكياً بقاعدة البيانات لاحقاً)
  const [versions, setVersions] = useState<VersionHistory[]>([
    { id: "v1", number: 1, timestamp: "الآن", promptUsed: "التهيئة المبدئية للنظام" }
  ]);

  // محاكي الآلة الحاسبة
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
        setDraftCode(data.codes.backend); // كود الـ Motoko المولد من الوكيل المتخصص
        setSpecs(JSON.stringify(data.specs, null, 2)); // المواصفات الـ JSON المنظمة
        setMessages((prev) => [...prev, { role: "ai", text: "🚀 تم معالجة طلبك عبر الوكلاء المتخصصين وتوليد الأكواد بنجاح!" }]);
        setActiveTab("preview");
        
        // إضافة إصدار جديد تلقائياً في السجل عند كل تعديل تكراري
        setVersions((prev) => [
          { id: Math.random().toString(), number: prev.length + 1, timestamp: "منذ قليل", promptUsed: userMessage },
          ...prev
        ]);
      } else {
        setMessages((prev) => [...prev, { role: "ai", text: "حدث خطأ أثناء معالجة الوكلاء للأكواد." }]);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { role: "ai", text: "خطأ في الاتصال بالخادم." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeployLive = () => {
    setPublishing(true);
    setTimeout(() => {
      setLiveCode(draftCode);
      setPublishing(false);
      alert("🎉 تفعيل البث الحي! تم نقل كود الإصدار التكراري إلى بيئة الـ Live بنجاح.");
    }, 1500);
  };

  // دالة تحميل ملف الكود المولد
  const handleDownloadCode = () => {
    if (!draftCode) return;
    const element = document.createElement("a");
    const file = new Blob([draftCode], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "Main.mo"; // ملف Motoko رسمي
    document.body.appendChild(element);
    element.click();
  };

  return (
    <main className="flex h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans select-none">
      
      {/* 1️⃣ القائمة الجانبية الأيقونية الفخمة (Main Left Sidebar) */}
      <nav className="w-16 border-r border-slate-900 bg-slate-950 flex flex-col items-center py-6 justify-between">
        <div className="flex flex-col items-center space-y-6 w-full">
          {/* الشعار */}
          <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-xs text-white shadow-lg shadow-blue-500/20 mb-4">C</div>
          
          {/* أزرار الأقسام */}
          {[
            { id: "builder", icon: "🛠️", label: "المطور" },
            { id: "versions", icon: "📜", label: "الإصدارات" },
            { id: "settings", icon: "⚙️", label: "الإعدادات" }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentSection(item.id)}
              title={item.label}
              className={`h-10 w-10 rounded-xl flex items-center justify-center text-sm transition relative ${
                currentSection === item.id 
                  ? "bg-slate-900 text-blue-400 border border-slate-800" 
                  : "text-slate-500 hover:text-slate-300 hover:bg-slate-900/40"
              }`}
            >
              {item.icon}
              {currentSection === item.id && <div className="absolute right-0 top-3 h-4 w-1 bg-blue-500 rounded-l-md" />}
            </button>
          ))}
        </div>
        <div className="text-slate-600 text-[10px] font-mono">v1.0</div>
      </nav>

      {/* 2️⃣ لوحة التحكم الفرعية المتغيرة بناءً على خيار القائمة الجانبية */}
      <section className="w-80 border-r border-slate-900 bg-slate-900/20 backdrop-blur-md flex flex-col justify-between p-6">
        {currentSection === "builder" && (
          <div className="flex flex-col h-full justify-between">
            <div className="border-b border-slate-900 pb-3 mb-2 text-right">
              <h2 className="text-sm font-bold text-slate-200">مساعد المطور الذكي</h2>
              <p className="text-[10px] text-slate-500 mt-1">توجيه الوكلاء لبناء التطبيقات اللامركزية</p>
            </div>

            {/* صندوق الدردشة المحاكي لـ Caffeine */}
            <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-1 text-right" dir="rtl">
              {messages.length === 0 && (
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-900 text-center mt-6">
                  <p className="text-slate-400 text-xs leading-relaxed">اكتب فكرتك البرمجية ليتولى وكلاء الذكاء الاصطناعي معالجتها وفصل الأكواد بدقة هندسية عالية.</p>
                </div>
              )}
              {messages.map((msg, index) => (
                <div 
                  key={index} 
                  className={`p-3 rounded-xl text-xs leading-relaxed max-w-[90%] ${
                    msg.role === "user" 
                      ? "bg-blue-600 text-white ml-auto text-right" 
                      : "bg-slate-900 text-slate-300 mr-auto text-right border border-slate-800"
                  }`}
                >
                  {msg.text}
                </div>
              ))}
              {loading && (
                <div className="bg-slate-900/40 border border-slate-900 text-slate-500 p-3 rounded-xl text-xs mr-auto text-right animate-pulse">
                  ⚙️ جاري تحليل هندسة الـ JSON وتدقيق أكواد الواجهات...
                </div>
              )}
            </div>

            {/* مربع المدخلات السفلي */}
            <div className="flex gap-2">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="انشئ تطبيق الة حاسبة متكامل..." 
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-blue-500 text-right text-slate-100 transition placeholder-slate-600"
              />
              <button 
                onClick={handleSendMessage}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition"
              >
                بناء
              </button>
            </div>
          </div>
        )}

        {currentSection === "versions" && (
          <div className="h-full text-right" dir="rtl">
            <div className="border-b border-slate-900 pb-3 mb-4">
              <h2 className="text-sm font-bold text-slate-200">سجل الإصدارات التكرارية</h2>
              <p className="text-[10px] text-slate-500 mt-1">تاريخ عمليات النشر والتطوير (Deployment History)</p>
            </div>
            <div className="space-y-2">
              {versions.map((v) => (
                <div key={v.id} className="bg-slate-900/60 border border-slate-900 p-3 rounded-xl hover:border-slate-800 transition cursor-pointer">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-blue-400">إصدار #{v.number}</span>
                    <span className="text-[10px] text-slate-500">{v.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">{v.promptUsed}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentSection === "settings" && (
          <div className="h-full text-right" dir="rtl">
            <div className="border-b border-slate-900 pb-3 mb-4">
              <h2 className="text-sm font-bold text-slate-200">إعدادات الحاوية (Canister Settings)</h2>
              <p className="text-[10px] text-slate-500 mt-1">تخصيص خصائص البنية التحتية لشبكة ICP</p>
            </div>
            <div className="space-y-4 text-xs text-slate-400">
              <div>
                <label className="block text-slate-500 mb-1">اسم الحاوية الافتراضي:</label>
                <input type="text" readOnly value="Caffeine_Canister_Core" className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-300 focus:outline-none" />
              </div>
              <div>
                <label className="block text-slate-500 mb-1">بيئة التشغيل المخصصة:</label>
                <select className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-300 focus:outline-none">
                  <option>ICP Local Replica Emulator (مجاني)</option>
                  <option disabled>ICP Mainnet Network (يتطلب منحة)</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 3️⃣ مساحة العمل البرمجية الكبرى والشاشة المقسمة (Studio Editor & Workspace) */}
      <section className="flex-1 flex flex-col bg-slate-950">
        
        {/* شريط الإجراءات والتبويبات العلوي المتطابق مع شاشة Caffeine */}
        <div className="flex justify-between items-center border-b border-slate-900 bg-slate-950 px-6 py-2">
          <div className="flex space-x-1">
            {[
              { id: "preview", name: "🖥️ المعاينة الحية (Preview)" },
              { id: "specs", name: "📋 المعمارية (JSON Specs)" },
              { id: "code", name: "💻 كود الحاوية (Motoko Backend)" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 text-[11px] font-bold border-b-2 transition ${
                  activeTab === tab.id 
                    ? "border-blue-500 text-blue-400 bg-slate-900/30" 
                    : "border-transparent text-slate-500 hover:text-slate-300"
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>

          {/* الأزرار العلوية للنشر وتحميل الملفات */}
          {draftCode && (
            <div className="flex items-center space-x-2">
              <button 
                onClick={handleDownloadCode}
                className="bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-[11px] font-bold px-3 py-1.5 rounded-lg transition"
              >
                📥 تحميل ملف الكود (.mo)
              </button>
              <button 
                onClick={handleDeployLive}
                disabled={publishing}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition disabled:bg-slate-800 shadow-md"
              >
                {publishing ? "جاري النشر للـ Live..." : "🚀 Go Live (نشر وتفعيل)"}
              </button>
            </div>
          )}
        </div>

        {/* عرض المحتوى البرمجي والأحداث التفاعلية */}
        <div className="flex-1 p-8 overflow-auto">
          {activeTab === "specs" && (
            <div className="max-w-xl ml-auto text-right" dir="rtl">
              <h3 className="text-xs font-bold text-blue-400 mb-3">ملف معمارية النظام ومواصفات الـ JSON المعتمدة:</h3>
              <pre className="text-amber-500 text-xs font-mono bg-slate-900/60 border border-slate-900 p-5 rounded-xl text-left overflow-x-auto leading-relaxed" dir="ltr">
                {specs}
              </pre>
            </div>
          )}
          
          {activeTab === "code" && (
            <pre className="text-blue-400 text-xs font-mono bg-slate-900 p-5 rounded-xl border border-slate-900 overflow-x-auto text-left leading-relaxed" dir="ltr">
              {draftCode || "// كود لغة Motoko النهائي للحاوية اللامركزية سيظهر هنا فور معالجة المحرك..."}
            </pre>
          )}

          {activeTab === "preview" && (
            <div className="flex flex-col items-center justify-center h-full max-w-sm mx-auto text-center">
              {!draftCode ? (
                <div className="text-slate-600 text-xs">
                  <p className="text-sm font-bold text-slate-400 mb-1">بيئة المعاينة السحابية التفاعلية</p>
                  <p>اكتب فكرتك في قسم المطور الأيسر ليقوم النظام ببناء وتشغيل لوحة التحكم ديناميكياً هنا.</p>
                </div>
              ) : (
                <div className="w-full bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl text-right" dir="rtl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                    <span className="bg-emerald-500/10 text-emerald-400 text-[9px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/20">ICP Local Replica Running</span>
                    <h3 className="text-xs font-bold text-slate-200">الآلة الحاسبة المولدة (Interactive Application)</h3>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] text-slate-500 mb-1">القيمة الحسابية X:</label>
                      <input type="number" value={calcNum1} onChange={(e) => setCalcNum1(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none text-left" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 mb-1">القيمة الحسابية Y:</label>
                      <input type="number" value={calcNum2} onChange={(e) => setCalcNum2(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none text-left" />
                    </div>

                    <div className="grid grid-cols-4 gap-1.5 pt-1">
                      <button onClick={() => setCalcResult(calcNum1 + calcNum2)} className="bg-slate-800 hover:bg-blue-600 text-slate-200 text-xs font-bold py-2 rounded-lg transition">+</button>
                      <button onClick={() => setCalcResult(calcNum1 - calcNum2)} className="bg-slate-800 hover:bg-blue-600 text-slate-200 text-xs font-bold py-2 rounded-lg transition">-</button>
                      <button onClick={() => setCalcResult(calcNum1 * calcNum2)} className="bg-slate-800 hover:bg-blue-600 text-slate-200 text-xs font-bold py-2 rounded-lg transition">×</button>
                      <button onClick={() => setCalcResult(calcNum2 !== 0 ? calcNum1 / calcNum2 : 0)} className="bg-slate-800 hover:bg-blue-600 text-slate-200 text-xs font-bold py-2 rounded-lg transition">÷</button>
                    </div>

                    <div className="border-t border-slate-800 pt-3 mt-1">
                      <label className="block text-[10px] text-slate-500 mb-1">الذاكرة الراجعة من بلوكشين المحاكاة:</label>
                      <div className="bg-slate-950 rounded-lg p-3 text-center text-md font-mono font-bold text-emerald-400 border border-slate-800/40">
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
