import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt, history = [] } = await req.json();
    
    const response = await fetch("https://openrouter.ai", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat", 
        messages: [
          {
            role: "system",
            content: `أنت محرك المطور المتقدم لمنصة Caffeine.ai لشبكة ICP. وظيفتك استقبال طلب المستخدم وبناء تطبيق حقيقي كامل.
            يجب أن يكون ردك مقسماً بدقة باستخدام هذه العلامات الفاصلة لكي يقرأها النظام تلقائياً:
            ===EXPLANATION===
            اكتب هنا شرحاً هندسياً مفصلاً ومبهراً باللغة العربية للخطوات والمكتبات التي ستستخدمها لبناء هذا التطبيق، مع تقديم 3 اقتراحات وميزات ذكية لتطوير التطبيق التكراري.
            ===SPECS===
            اكتب هنا وثيقة المعمارية الفنية باللغة العربية (الهدف، الدوال، المتغيرات المستقرة).
            ===BACKEND===
            اكتب كود المصدر الكامل والمتطور جداً بلغة Motoko لشبكة ICP داخل حاوية (actor) ينفذ طلب المستخدم بالكامل وبدون أي علامات تنسيقية.
            ===FRONTEND===
            اكتب كود واجهة مستخدم React (TSX) كامل ومبهر بصرياً باستخدام TailwindCSS ليعمل كتطبيق تفاعلي للمعاينة الحية.`
          },
          ...history,
          { role: "user", content: prompt }
        ]
      })
    });

    const aiData = await response.json();
    const resultText = aiData.choices[0].message.content;

    return NextResponse.json({ success: true, rawText: resultText });

  } catch (error: any) {
    console.error("Engine Crash:", error);
    return NextResponse.json({ success: false, error: "فشل نظام الـ Pipeline" }, { status: 500 });
  }
}
