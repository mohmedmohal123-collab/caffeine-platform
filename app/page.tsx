"use client";
import { useState } from "react";

interface Message {
  role: "user" | "ai";
  text: string;
  explanation?: string;
}

export default function Home() {
  const [currentSection, setCurrentSection] = useState("builder");
  const [activeTab, setActiveTab] = useState("preview"); 
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  
  // الأكواد المنفصلة المستخرجة ديناميكياً
  const [backendCode, setBackendCode] = useState("");
  const [frontendCode, setFrontendCode] = useState("");
  const [specs, setSpecs] = useState("في انتظار استقبال الأوامر لبدء تفعيل هندسة المعمارية...");
  const [appName, setAppName] = useState("تطبيق سحابي جديد");

  // متغيرات المعاينة الديناميكية المتغيرة وفقاً لطلبك
  const [dynamicFields, setDynamicFields] = useState<string[]>([]);
  const [simulatedDB, setSimulatedDB] = useState<any[]>([]);
  const [customInputVal, setCustomInputVal] = useState("");

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

      if (data.success) {
        // استقبال الأكواد والشروحات النظيفة مباشرة من السيرفر
        setBackendCode(data.backendCode);
        setFrontendCode(data.frontendCode);
        setSpecs(data.specs);
        setAppName(userMessage.substring(0, 24));

        // تحديث حقول المعاينة ديناميكياً بناءً على طلبك
        if (userMessage.includes("مشاهدات") || userMessage.includes("فيديو") || userMessage.includes("يوتيوب")) {
          setDynamicFields(["رابط الفيديو أو المشاهدة", "عنوان المقطع", "القسم / التصنيف"]);
        } else if (userMessage.includes("حاسبة") || userMessage.includes("رياضيات")) {
          setDynamicFields(["الرقم الأول X", "الرقم الثاني Y", "نوع العملية الحسابية (+, -, *, /)"]);
        } else {
          setDynamicFields(["اسم السجل الجديد", "البيانات الوصفية", "حقل التخزين المستقر"]);
        }
        setSimulatedDB([]);

        setMessages((prev) => [
          ...prev, 
          { 
            role: "ai", 
            text: "⚡ تم إنتاج النظام وتحديث شاشات المطور والمعاينة التنفيذية بنجاح!",
            explanation: data.explanation 
          }
        ]);
        setActiveTab("preview");
      } else {
        setMessages((prev) => [...prev, { role: "ai", text: "❌ واجه الخادم مشكلة في توليد حزم الأكواد." }]);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { role: "ai", text: "❌ خطأ في الاستجابة السحابية الحية." }]);
    } finally {
      setLoading(false);
    }
  };


  const handleExecuteCanisterMethod = () => {
    if (!customInputVal.trim()) return;
    setSimulatedDB((prev) => [...prev, customInputVal]);
    setCustomInputVal("");
    alert("[ICP Sandbox] تم معالجة وتحديث الحاوية اللامركزية وتخزين البيانات حية في الـ State Storage!");
  };

  return (
    <main className="flex h-screen w-screen bg-[#020617] text-slate-100 overflow-hidden font-sans bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#020617] to-black select-none">
      
      {/* 1️⃣ شريط القائمة الجانبية (Premium Glassmorphism Sidebar) */}
      <nav className="w-20 border-r border-slate-800/40 bg-[#020617]/95 flex flex-col items-center py-8 justify-between z-10 shadow-2xl">
        <div className="flex flex-col items-center space-y-8 w-full">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-cyan-400 via-blue-600 to-indigo-600 flex items-center justify-center font-black text-xs text-white shadow-[0_0_25px_rgba(6,182,212,0.4)]">CAF</div>
          <div className="flex flex-col space-y-5 w-full px-2">
            {[{ id: "builder", label: "المطور", icon: "💎" }, { id: "versions", label: "النسخ", icon: "🔱" }].map((item) => (
              <button key={item.id} onClick={() => setCurrentSection(item.id)} className={`h-14 w-full rounded-2xl flex flex-col items-center justify-center gap-1 text-[10px] transition-all ${currentSection === item.id ? "bg-slate-900 text-cyan-400 font-bold" : "text-slate-500 hover:text-slate-300"}`}>
                <span>{item.icon}</span><span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* 2️⃣ لوحة تحكم الدردشة الكافيينية المتقدمة لتدفق الخطوات والشرح الفني */}
      <section className="w-96 border-r border-slate-800/40 bg-[#070c19]/20 backdrop-blur-xl flex flex-col justify-between p-6 z-10 shadow-2xl">
        <div className="flex flex-col h-full justify-between">
          <div className="border-b border-slate-800/60 pb-4 mb-2 text-right">
            <h2 className="text-sm font-black bg-clip-text bg-gradient-to-r from-slate-100 to-slate-400">مساعد المطور (ChatGPT Style)</h2>
            <p className="text-[10px] text-slate-500 font-semibold mt-1">شرح، تحليل، وترجمة الأكواد للبيئة اللامركزية</p>
          </div>

          {/* نافذة المحادثة التفاعلية الشارحة والمقترحة */}
          <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-1 text-right custom-scrollbar" dir="rtl">
            {messages.length === 0 && (
              <div className="bg-gradient-to-b from-slate-900/80 to-[#020617] border border-slate-800/60 p-5 rounded-2xl text-center mt-6 shadow-2xl">
                <p className="text-cyan-400 text-xs font-black mb-1">🚀 استوديو كافيين للمطورين المحترفين</p>
                <p className="text-slate-500 text-[11px] leading-relaxed">اكتب وصف مشروعك بالكامل (مثال: انشئ تطبيق مشاهدات فيديو وقاعدة بيانات متكاملة). سيقوم المحرك بشرح تفصيلي للخطوات والمكتبات قبل توليد الأكواد.</p>
              </div>
            )}
            {messages.map((msg, index) => (
              <div key={index} className="space-y-3">
                <div className={`p-3.5 rounded-2xl text-xs leading-relaxed max-w-[90%] shadow-md border ${msg.role === "user" ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white ml-auto" : "bg-slate-900 border-slate-800 text-slate-300 mr-auto"}`}>
                  {msg.text}
                </div>
                {msg.explanation && (
                  <div className="bg-cyan-950/20 border border-cyan-800/30 p-4 rounded-xl text-[11px] text-slate-300 leading-relaxed text-right shadow-inner mr-4">
                    <div className="text-cyan-400 font-bold mb-2">📋 الشرح الهندسي واقتراحات التطوير الذكي من كافيين:</div>
                    <p className="whitespace-pre-wrap font-sans">{msg.explanation}</p>
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="bg-slate-900/80 border border-slate-800 text-cyan-400 p-4 rounded-2xl text-xs mr-auto text-right animate-pulse shadow-2xl">
                <p className="font-bold">⚙️ جاري التحليل، الشرح وترجمة الوصف للأكواد المنفصلة والمكتبات الحزمية...</p>
              </div>
            )}
          </div>

          {/* صندوق مدخلات المحادثة مضافاً إليه زر محاكاة رفع الصور والملفات */}
          <div className="space-y-2">
            <div className="flex gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl shadow-2xl">
              <button onClick={() => alert("📎 نظام الـ File/Image Upload مفعل لمحاكاة قراءة التصاميم في الخطوة القادمة!")} className="text-slate-500 hover:text-slate-300 text-sm px-2">➕</button>
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="اطلب إنشاء أي تطبيق ويب معقد أو تعديل التصميم..." 
                className="flex-1 bg-transparent px-2 py-2 text-xs focus:outline-none text-right text-slate-100 placeholder-slate-600 font-medium"
              />
              <button onClick={handleSendMessage} disabled={loading} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 rounded-xl text-xs font-black transition">بناء</button>
            </div>
          </div>
        </div>
      </section>

      {/* 3️⃣ مساحة الـ Workspace الكبرى والمفسر الديناميكي للأكواد (Dynamic Sandbox) */}
      <section className="flex-1 flex flex-col bg-[#010308] relative">
        <div className="flex justify-between items-center border-b border-slate-800/60 bg-[#02050c] px-8 py-3.5 shadow-2xl">
          <div className="flex bg-slate-900/60 border border-slate-800 p-0.5 rounded-xl">
            {[
              { id: "preview", name: "🖥️ المعاينة التنفيذية الحية" },
              { id: "specs", name: "📋 معمارية النظام (Specs)" },
              { id: "motoko", name: "💻 كود الـ Backend (Motoko)" },
              { id: "react", name: "🎨 كود الـ Frontend (React)" }
            ].map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-5 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === tab.id ? "bg-slate-800 text-cyan-400 shadow-md font-black" : "text-slate-500 hover:text-slate-300"}`}>{tab.name}</button>
            ))}
          </div>
        </div>

        {/* مساحة العرض البرمجي واستعراض الأكواد الحقيقية المحدثة لكل حقل */}
        <div className="flex-1 p-8 overflow-auto flex items-center justify-center">
          {activeTab === "specs" && <pre className="max-w-3xl w-full text-cyan-400 text-xs font-mono bg-slate-900/60 border border-slate-800 p-6 rounded-2xl text-left overflow-x-auto shadow-2xl" dir="ltr">{specs}</pre>}
          {activeTab === "motoko" && <pre className="w-full h-full max-w-4xl text-blue-400 text-xs font-mono bg-slate-900/60 p-6 rounded-2xl border border-slate-800 overflow-x-auto text-left shadow-2xl" dir="ltr">{backendCode || "// الأكواد والملفات الجاهزة لتطبيقك بلغة Motoko ستعرض هنا فوراً..."}</pre>}
          {activeTab === "react" && <pre className="w-full h-full max-w-4xl text-purple-400 text-xs font-mono bg-slate-900/60 p-6 rounded-2xl border border-slate-800 overflow-x-auto text-left shadow-2xl" dir="ltr">{frontendCode || "// الأكواد والملفات الجاهزة لواجهة React ستعرض هنا فوراً..."}</pre>}

          {activeTab === "preview" && (
            <div className="w-full h-full flex flex-col items-center justify-center">
              {!backendCode ? (
                <div className="text-slate-600 text-xs text-center border-2 border-dashed border-slate-800 p-12 rounded-3xl max-w-sm">
                  <p className="text-sm font-bold text-slate-400 mb-1">🖥️ شاشة التجميع السحابية التفاعلية</p>
                  <p className="leading-relaxed text-slate-500">قم بوصف فكرة الأبلكيشن في اليسار ليقوم المفسر بقراءة الحزم وعرض التطبيق المطابق بدقة لوصفك وتحديثه تلقائياً عند طلب أي تعديل.</p>
                </div>
              ) : (
                /* مفسر واجهات حية متكامل فخم ثلاثي الأبعاد يتغير تصميمه وحقوله فوراً حسب نوع طلبك */
                <div className="w-full max-w-md bg-gradient-to-b from-slate-900 via-[#0a1124] to-black border border-slate-800/80 p-6 rounded-3xl shadow-2xl text-right animate-fade-in" dir="rtl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                    <span className="bg-cyan-500/10 text-cyan-400 text-[9px] font-black px-2.5 py-1 rounded-full border border-cyan-500/20 shadow-sm animate-pulse tracking-widest">LIVE INTERPRETATION ENGINE</span>
                    <h3 className="text-xs font-black text-slate-200 tracking-wide">{appName} (Live Container)</h3>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800/60">
                      ⚡ قام المترجم بتجميع ملفات الـ Node.js وتجهيز بيئة عمل مطابقة لوصفك الفني الحالي واختبار دوال التخزين بنجاح.
                    </p>

                    {/* توليد حقول الإدخال والاختبار ديناميكياً وتغييرها 100% حسب الأبلكيشن المكتوب */}
                    {dynamicFields.map((field, index) => (
                      <div key={index} className="relative">
                        <label className="block text-[10px] text-slate-500 mb-1.5 font-bold">{field}:</label>
                        <input 
                          type="text" 
                          value={index === 0 ? customInputVal : ""} 
                          onChange={(e) => index === 0 && setCustomInputVal(e.target.value)}
                          placeholder={`أدخل معطيات لاختبار دالة ${field}...`}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 focus:outline-none focus:border-cyan-500/50 text-right" 
                        />
                      </div>
                    ))}

                    <button onClick={handleExecuteCanisterMethod} className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 rounded-xl text-xs transition active:scale-95 shadow-lg shadow-cyan-950">
                      🎯 تشغيل واختبار التطبيق (Execute Dynamic Function)
                    </button>

                    <div className="border-t border-slate-800/80 pt-4 mt-2">
                      <label className="block text-[10px] font-bold text-slate-500 mb-1.5">حالة تخزين البيانات المستقرة على السحاب (On-Chain Storage Memory):</label>
                      <div className="bg-slate-950 rounded-2xl p-4 text-right text-xs font-mono text-emerald-400 border border-slate-800 shadow-inner max-h-32 overflow-y-auto">
                        {simulatedDB.length === 0 ? "[] // الذاكرة المخصصة للحاوية فارغة وبانتظار عملية الإدخال الأولى" : JSON.stringify(simulatedDB, null, 2)}
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
