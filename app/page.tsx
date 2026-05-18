"use client";
import { useState } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("specs");

  return (
    <main className="flex h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      
      {/* اللوحة اليسرى: صندوق المحادثة والدردشة */}
      <section className="w-1/3 border-r border-slate-800 flex flex-col justify-between p-4 bg-slate-900/50">
        <div className="flex-1 overflow-y-auto mb-4">
          <p className="text-slate-400 text-sm text-center mt-4">ابدأ بوصف تطبيقك هنا ليتولى الذكاء الاصطناعي بناءه...</p>
        </div>
        
        {/* مربع إدخال النص */}
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="اكتب وصفاً لتطبيقك (مثال: موقع إدارة مهام)..." 
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500 text-right"
          />
          <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
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
            <div className="text-slate-400 text-sm">هنا ستظهر وثيقة المواصفات الفنية (Specification First)...</div>
          )}
          {activeTab === "code" && (
            <div className="text-slate-400 text-sm font-mono">هنا سيتم استعراض كود لغة Motoko المولد...</div>
          )}
          {activeTab === "preview" && (
            <div className="text-slate-400 text-sm">هنا ستظهر النسخة التجريبية الحية للتطبيق المعاين...</div>
          )}
        </div>
      </section>

    </main>
  );
}
