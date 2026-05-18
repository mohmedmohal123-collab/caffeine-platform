"use client";
import { useState } from "react";

// تعريف بنية الرسالة في الشات
interface Message {
  role: "user" | "ai";
  text: string;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState("specs");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [specs, setSpecs] = useState("في انتظار وصف التطبيق لتوليد المواصفات الفنية...");

  // دالة إرسال الطلب إلى الـ API الخلفي
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
        setGeneratedCode(data.code);
        setSpecs(data.specs); // عرض المواصفات الفنية الحقيقية من الذكاء الاصطناعي
        setMessages((prev) => [...prev, { role: "ai", text: "تم تحليل النظام وتوليد المواصفات والأكواد بدقة الفحص الفني!" }]);
        setActiveTab("specs"); // نفتح تبويب المواصفات أولاً ليقرأها المستخدم (Specification First)
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
              جاري التفكير وكتابة الكود...
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
            placeholder="اكتب وصفاً لتطبيقك (مثال: موقع إدارة مهام)..." 
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
        {/* شريط التبويبات العلوي */}
        <div className="flex border-b border-slate-800 bg-slate-900/30 px-4">
          {["specs", "code", "preview"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition capitalize ${
                activeTab === tab 
                  ? "border-blue-500 text-blue-400" 
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab === "specs" ? "المواصفات الفنية" : tab === "code" ? "الأكواد" : "المعاينة الحية"}
            </button>
          ))}
        </div>

        {/* محتوى التبويبات النشطة */}
        <div className="flex-1 p-6 overflow-auto">
          {activeTab === "specs" && (
            <pre className="text-slate-300 text-sm whitespace-pre-wrap font-sans text-right" dir="rtl">{specs}</pre>
          )}
          {activeTab === "code" && (
            <pre className="text-emerald-400 text-sm font-mono bg-slate-900 p-4 rounded-lg border border-slate-800 overflow-x-auto text-left" dir="ltr">
              {generatedCode || "// كود لغة Motoko سيظهر هنا بمجرد كتابة طلبك..."}
            </pre>
          )}
          {activeTab === "preview" && (
            <div className="text-slate-400 text-sm text-center mt-10">
              <p>شاشة محاكاة المعاينة الحية (Draft Environment)</p>
              <p className="text-xs text-slate-500 mt-2">سيتم تفعيل ربط المحاكي في الخطوات القادمة.</p>
            </div>
          )}
        </div>
      </section>

    </main>
  );
}
