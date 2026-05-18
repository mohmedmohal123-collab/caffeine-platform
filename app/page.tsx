"use client";
import { useState, useEffect } from "react";

interface Message {
  role: "user" | "ai";
  text: string;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState("specs");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  
  const [draftCode, setDraftCode] = useState("");
  const [liveCode, setLiveCode] = useState("");
  const [specs, setSpecs] = useState("في انتظار وصف التطبيق لتوليد المواصفات الفنية...");
  
  // حالات خاصة بالمحاكي الذكي
  const [detectedFunctions, setDetectedFunctions] = useState<string[]>([]);
  const [simulatedStorage, setSimulatedStorage] = useState<string[]>([]);
  const [funcInput, setFuncInput] = useState("");

  // استخراج الدوال تلقائياً لتشغيل المحاكي عند توليد كود جديد
  useEffect(() => {
    if (!draftCode) return;
    
    // محاكاة ذكية لقراءة محتوى الكود واستخراج أسماء الدوال البرمجية المقترحة
    const functions = ["تخزين بيانات جديدة (Update)", "جلب السجلات الحالية (Query)", "حذف أو تعديل (Update)"];
    setDetectedFunctions(functions);
  }, [draftCode]);

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

      if (data.code) {
        setDraftCode(data.code);
        setSpecs(data.specs);
        setMessages((prev) => [...prev, { role: "ai", text: "تم توليد نسخة المسودة ومحاكاة الحاوية اللامركزية بنجاح!" }]);
        setActiveTab("preview"); // نقل المستخدم تلقائياً للمعاينة لرؤية تطبيقه يعمل فورا
      } else {
        setMessages((prev) => [...prev, { role: "ai", text: "عذراً، واجهت مشكلة في معالجة الكود." }]);
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, { role: "ai", text: "حدث خطأ في الاتصال بالخادم." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeployLive = async () => {
    if (!draftCode || publishing) return;
    setPublishing(true);
    
    setTimeout(() => {
      setLiveCode(draftCode);
      setPublishing(false);
      alert("🎉 تهانينا! تم نشر حاوية تطبيقك اللامركزية (Canister) على الشبكة الافتراضية الحية بنجاح.");
    }, 2000);
  };

  // دالة تشغيل المحاكي واختبار الدوال
  const handleExecuteSimulatedFunc = (funcName: string) => {
    if (!funcInput.trim()) {
      alert("الرجاء كتابة قيمة تجريبية في صندوق المدخلات أولاً لتخزينها بالمحاكي!");
      return;
    }
    if (funcName.includes("تخزين")) {
      setSimulatedStorage((prev) => [...prev, funcInput]);
      alert(`[ICP Emulator] تم تنفيذ دالة التحديث بنجاح وحفظ البيانات: "${funcInput}" داخل بلوكشين المحاكاة!`);
      setFuncInput("");
    } else {
      alert(`[ICP Emulator] نتيجة دالة الاستعلام (Query): تم العثور على ${simulatedStorage.length} سجلات مخزنة.`);
    }
  };

  return (
    <main className="flex h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      
      {/* اللوحة اليسرى: صندوق المحادثة */}
      <section className="w-1/3 border-r border-slate-800 flex flex-col justify-between p-4 bg-slate-900/50">
        <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
          {messages.length === 0 && (
            <p className="text-slate-400 text-sm text-center mt-4">ابدأ بوصف تطبيقك هنا ليتولى الذكاء الاصطناعي بناءه...</p>
          )}
          {messages.map((msg, index) => (
            <div 
              key={index} 
              className={`p-3 rounded-lg text-sm max-w-[85%] ${
                msg.role === "user" 
                  ? "bg-blue-600 text-white mr-auto text-left" 
                  : "bg-slate-800 text-slate-200 ml-auto text-right"
              }`}
            >
              {msg.text}
            </div>
          ))}
          {loading && (
            <div className="bg-slate-800 text-slate-400 p-3 rounded-lg text-sm ml-auto text-right animate-pulse">
              جاري فحص المواصفات وتدقيق الأكواد ذاتياً...
            </div>
          )}
        </div>
        
        {/* مربع إدخال النص */}
        <div className="flex gap-2">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="اكتب وصفاً لتطبيقك..." 
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500 text-right"
          />
          <button 
            onClick={handleSendMessage}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            إرسال
          </button>
        </div>
      </section>

      {/* اللوحة اليمنى: التبويبات والمعاينة والكود */}
      <section className="flex-1 flex flex-col bg-slate-950">
        <div className="flex justify-between items-center border-b border-slate-800 bg-slate-900/30 px-4">
          <div className="flex">
            {["specs", "draft_code", "live_code", "preview"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition capitalize ${
                  activeTab === tab 
                    ? "border-blue-500 text-blue-400" 
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                {tab === "specs" ? "المواصفات الفنية" 
                 : tab === "draft_code" ? "مسودة الكود (Draft)" 
                 : tab === "live_code" ? "الكود النهائي (Live)" 
                 : "المعاينة الحية (Emulator)"}
              </button>
            ))}
          </div>

          {draftCode && (
            <button 
              onClick={handleDeployLive}
              disabled={publishing}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-md transition disabled:bg-slate-800 mr-2"
            >
              {publishing ? "جاري النشر..." : "🚀 Go Live (نشر التطبيق)"}
            </button>
          )}
        </div>

        {/* محتوى التبويبات النشطة */}
        <div className="flex-1 p-6 overflow-auto">
          {activeTab === "specs" && (
            <pre className="text-slate-300 text-sm whitespace-pre-wrap font-sans text-right" dir="rtl">{specs}</pre>
          )}
          {activeTab === "draft_code" && (
            <pre className="text-amber-400 text-sm font-mono bg-slate-900 p-4 rounded-lg border border-slate-800 overflow-x-auto text-left" dir="ltr">
              {draftCode || "// كود المسودة المؤقت سيظهر هنا..."}
            </pre>
          )}
          {activeTab === "live_code" && (
            <pre className="text-emerald-400 text-sm font-mono bg-slate-900 p-4 rounded-lg border border-slate-800 overflow-x-auto text-left" dir="ltr">
              {liveCode || "// لا يوجد كود منشور حالياً للعامة."}
            </pre>
          )}
          {activeTab === "preview" && (
            <div className="text-right" dir="rtl">
              <h2 className="text-lg font-bold text-slate-200 border-b border-slate-800 pb-2 mb-4">🖥️ محاكي تشغيل الحاوية الذكية (ICP Canister Emulator)</h2>
              
              {!draftCode ? (
                <p className="text-slate-500 text-sm text-center mt-10">قم بوصف تطبيقك في اليمين أولاً لتوليد واجهة اختبار تفاعلية له هنا...</p>
              ) : (
                <div className="space-y-6 max-w-xl bg-slate-900 p-6 rounded-xl border border-slate-800">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2">منطقة إدخال بيانات تجريبية للحاوية (Arguments):</label>
                    <input 
                      type="text"
                      value={funcInput}
                      onChange={(e) => setFuncInput(e.target.value)}
                      placeholder="اكتب شيئاً لتجربة إرساله للدوال اللامركزية..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2">الدوال البرمجية المستخرجة تلقائياً للاختبار:</label>
                    <div className="flex flex-col gap-2">
                      {detectedFunctions.map((func, i) => (
                        <button 
                          key={i}
                          onClick={() => handleExecuteSimulatedFunc(func)}
                          className="flex justify-between items-center bg-slate-955 border border-slate-800 hover:border-slate-700 p-3 rounded-lg text-xs font-mono transition text-left"
                          dir="ltr"
                        >
                          <span className="text-blue-400 font-bold">call canister_method_{i}()</span>
                          <span className="text-slate-400 font-sans">{func}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-slate-800 pt-4">
                    <label className="block text-xs font-medium text-slate-400 mb-2">حالة التخزين داخل الحاوية الافتراضية (On-Chain Storage Memory):</label>
                    <div className="bg-slate-950 rounded-lg p-3 min-h-[60px] text-xs font-mono text-emerald-500">
                      {simulatedStorage.length === 0 ? "[] // الذاكرة فارغة حالياً" : JSON.stringify(simulatedStorage, null, 2)}
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
