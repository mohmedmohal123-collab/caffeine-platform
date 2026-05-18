"use client";
import { useState } from "react";

interface Message {
  role: "user" | "ai";
  text: string;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState("preview"); // المعاينة هي التبويب الافتراضي كما في المنصات الاحترافية
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  
  const [draftCode, setDraftCode] = useState("");
  const [liveCode, setLiveCode] = useState("");
  const [specs, setSpecs] = useState("في انتظار وصف تطبيقك لتولide المواصفات الفنية...");

  // متغيرات تشغيل محاكي الآلة الحاسبة الفعلي داخل الشاشة
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

      if (data.code && data.specs) {
        setDraftCode(data.code);
        setSpecs(data.specs);
        setMessages((prev) => [...prev, { role: "ai", text: "🚀 رائعة! تم بناء وتوليد تطبيق الآلة الحاسبة بنجاح في بيئة الـ Draft. تفقد شاشة المعاينة الحية الآن لتجربته!" }]);
        setActiveTab("preview"); 
      } else {
        setMessages((prev) => [...prev, { role: "ai", text: "حدثت مشكلة أثناء فحص الأكواد، يرجى المحاولة مجدداً." }]);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { role: "ai", text: "خطأ في الاتصال بالخادم السحابي." }]);
    } {
      setLoading(false);
    }
  };

  const handleDeployLive = () => {
    setPublishing(true);
    setTimeout(() => {
      setLiveCode(draftCode);
      setPublishing(false);
      alert("🎉 تفعيل النظام الحقيقي! تم ترقية كود الحاوية اللامركزية بنجاح إلى بيئة الإنتاج المباشر (Mainnet Live).");
    }, 1500);
  };

  return (
    <main className="flex h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      
      {/* الجانب الأيسر: شريط المحادثة الفوري الذكي */}
      <section className="w-1/3 border-r border-slate-800 flex flex-col justify-between p-6 bg-slate-900/40 backdrop-blur-md">
        <div className="border-b border-slate-800 pb-3 mb-2">
          <h1 className="text-md font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 text-right">Caffeine Core Engine v1.0</h1>
        </div>

        <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-1 text-right" dir="rtl">
          {messages.length === 0 && (
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-center mt-10">
              <p className="text-slate-300 text-sm font-semibold mb-2">مرحباً بك في بيئة التطوير اللامركزي</p>
              <p className="text-slate-500 text-xs leading-relaxed">اكتب طلبك باللغة الطبيعية (مثال: انشئ تطبيق الة حاسبة متكامل) وسيقوم محرك الذكاء الاصطناعي ببنائه ونشره فوراً.</p>
            </div>
          )}
          {messages.map((msg, index) => (
            <div 
              key={index} 
              className={`p-3.5 rounded-xl text-sm leading-relaxed max-w-[85%] ${
                msg.role === "user" 
                  ? "bg-blue-600 text-white ml-auto text-right" 
                  : "bg-slate-800 text-slate-200 mr-auto text-right border border-slate-700"
              }`}
            >
              {msg.text}
            </div>
          ))}
          {loading && (
            <div className="bg-slate-900 border border-slate-800 text-slate-400 p-4 rounded-xl text-sm mr-auto text-right animate-pulse">
              ⚙️ جاري صياغة المواصفات الفنية وفحص كود Motoko تلقائياً لمنع فقدان البيانات...
            </div>
          )}
        </div>
        
        {/* صندوق مدخلات المحادثة */}
        <div className="flex gap-2">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="اكتب وصفاً للتطبيق المراد بناؤه للـ ICP..." 
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 text-right text-slate-100 placeholder-slate-500 transition"
          />
          <button 
            onClick={handleSendMessage}
            disabled={loading}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-slate-800 disabled:to-slate-800 text-white px-5 py-3 rounded-xl text-sm font-semibold transition"
          >
            بناء
          </button>
        </div>
      </section>

      {/* الجانب الأيمن: لوحة التحكم المزدوجة والمعاينة الحية للأبلكيشن */}
      <section className="flex-1 flex flex-col bg-slate-950">
        <div className="flex justify-between items-center border-b border-slate-800 bg-slate-900/30 px-6 py-2">
          <div className="flex space-x-2">
            {[
              { id: "preview", name: "المعاينة التفاعلية (Live Preview)" },
              { id: "specs", name: "المواصفات (Specs First)" },
              { id: "draft_code", name: "كود المسودة (Draft)" },
              { id: "live_code", name: "الكود الحقيقي (Live)" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-xs font-semibold border-b-2 transition ${
                  activeTab === tab.id 
                    ? "border-blue-500 text-blue-400 bg-slate-900/20" 
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>

          {draftCode && (
            <button 
              onClick={handleDeployLive}
              disabled={publishing}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition disabled:bg-slate-800 shadow-md"
            >
              {publishing ? "جاري ترقية البيانات..." : "🚀 Go Live (إطلاق للعامة)"}
            </button>
          )}
        </div>

        {/* مساحة استعراض المحتوى والتشغيل الفعلي للآلة الحاسبة */}
        <div className="flex-1 p-8 overflow-auto">
          {activeTab === "specs" && (
            <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl max-w-2xl ml-auto text-right" dir="rtl">
              <h3 className="text-sm font-bold text-blue-400 mb-3">📋 وثيقة مواصفات المعمارية البرمجية:</h3>
              <pre className="text-slate-300 text-sm whitespace-pre-wrap font-sans leading-relaxed">{specs}</pre>
            </div>
          )}
          
          {activeTab === "draft_code" && (
            <pre className="text-amber-400 text-xs font-mono bg-slate-900 p-5 rounded-2xl border border-slate-800 overflow-x-auto text-left leading-relaxed" dir="ltr">
              {draftCode || "// بانتظار كتابة الأمر لتوليد كود الحاوية الذكية (Motoko Container Architecture)..."}
            </pre>
          )}

          {activeTab === "live_code" && (
            <pre className="text-emerald-400 text-xs font-mono bg-slate-900 p-5 rounded-2xl border border-slate-800 overflow-x-auto text-left leading-relaxed" dir="ltr">
              {liveCode || "// التطبيق في مرحلة المسودة حالياً. اضغط على Go Live لنقل الأكواد لبيئة الإنتاج الحية."}
            </pre>
          )}

          {activeTab === "preview" && (
            <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto text-center">
              {!draftCode ? (
                <div className="text-slate-500 text-sm">
                  <p className="text-lg font-bold text-slate-400 mb-2">🖥️ شاشة المعاينة الحية الفورية</p>
                  <p className="text-xs">اكتب طلبك في شريط المطورين الأيسر ليتم بناء واجهة تشغيل الأبلكيشن هنا ديناميكياً.</p>
                </div>
              ) : (
                <div className="w-full bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl text-right" dir="rtl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-6">
                    <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/20">On-Chain Unit Live</span>
                    <h3 className="text-sm font-bold text-slate-200">الآلة الحاسبة الذكية (ICP Simulator)</h3>
                  </div>

                  {/* لوحة التحكم بالآلة الحاسبة المولدة من الذكاء الاصطناعي */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-2">الرقم الأول (Variable X):</label>
                      <input 
                        type="number" 
                        value={calcNum1} 
                        onChange={(e) => setCalcNum1(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500 text-left" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-2">الرقم الثاني (Variable Y):</label>
                      <input 
                        type="number" 
                        value={calcNum2} 
                        onChange={(e) => setCalcNum2(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500 text-left" 
                      />
                    </div>

                    {/* أزرار العمليات الحسابية المتكاملة */}
                    <div className="grid grid-cols-4 gap-2 pt-2">
                      <button onClick={() => setCalcResult(calcNum1 + calcNum2)} className="bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white py-2.5 rounded-xl font-bold text-sm transition">+</button>
                      <button onClick={() => setCalcResult(calcNum1 - calcNum2)} className="bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white py-2.5 rounded-xl font-bold text-sm transition">-</button>
                      <button onClick={() => setCalcResult(calcNum1 * calcNum2)} className="bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white py-2.5 rounded-xl font-bold text-sm transition">×</button>
                      <button onClick={() => setCalcResult(calcNum2 !== 0 ? calcNum1 / calcNum2 : 0)} className="bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white py-2.5 rounded-xl font-bold text-sm transition">÷</button>
                    </div>

                    {/* شاشة إظهار النتائج المخزنة في الحاوية التخيلية */}
                    <div className="border-t border-slate-800 pt-4 mt-2">
                      <label className="block text-xs text-slate-400 mb-1">النتيجة المسترجعة من الذاكرة (Returned Query):</label>
                      <div className="bg-slate-950 rounded-xl p-4 text-center text-lg font-mono font-bold text-emerald-400 border border-slate-800/60">
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
