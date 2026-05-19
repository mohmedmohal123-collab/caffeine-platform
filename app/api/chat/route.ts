import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt, step, currentSpecs } = await req.json();
    
    // إرسال الطلب فوراً لـ OpenRouter من خادم وسيط سريع جداً
    const response = await fetch("https://openrouter.ai", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat", // أو anthropic/claude-3.5-sonnet
        messages: [
          {
            role: "system",
            content: "أنت النواة البرمجية لمنصة Caffeine.ai. تولد كود خام فقط بدون أي شرح أو علامات تنسيقية مثل ```."
          },
          {
            role: "user",
            content: step === "specs" 
              ? `حلل طلب المستخدم التالي: "${prompt}". وأخرج كائن JSON نظيفاً ومطابقاً للشروط التالية فقط: { "projectName": "اسم المشروع", "description": "شرح وتحليل تفصيلي ومبهر باللغة العربية للخطوات والمكتبات وتجهيز المترجم", "methods": ["الدوال المطلوبة"] }`
              : step === "backend"
              ? `بناءً على وثيقة المعمارية الفنية المرفقة: ${JSON.stringify(currentSpecs)}. اكتب كود مصدر كامل، متطور ومتقدم جداً بلغة Motoko داخل حاوية (actor). أخرج كود Motoko الخام فقط.`
              : `بناءً على وثيقة المعمارية الفنية المرفقة: ${JSON.stringify(currentSpecs)}. اكتب كود واجهة مستخدم تفاعلية، ساحرة وبصرية ثلاثية الأبعاد بلغة React (TSX) باستخدام TailwindCSS. أخرج كود React الخام فقط.`
          }
        ]
      })
    });

    const aiData = await response.json();
    const resultText = aiData.choices[0].message.content.trim();

    return NextResponse.json({ success: true, output: resultText });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Timeout out" });
  }
}
