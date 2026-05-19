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
        response_format: { type: "json_object" }, // إجبار النموذج على إخراج كائن JSON حصراً
        messages: [
          {
            role: "system",
            content: `أنت المحرك البرمجي المتقدم لمنصة Caffeine.ai لشبكة ICP. 
            يجب أن تكون إجابتك بصيغة كائن JSON يحتوي بدقة على المفاتيح التالية:
            - "explanation": اكتب هنا شرحاً فذاً باللغة العربية للخطوات والمكتبات التي ستستخدمها لبناء هذا التطبيق بأسلوب تفاعلي ومقترح للميزات.
            - "specs": وثيقة المعمارية الهندسية ونوع البيانات المستقرة باللغة العربية.
            - "backendCode": كود المصدر الكامل والمتطور بلغة Motoko لشبكة ICP داخل حاوية (actor).
            - "frontendCode": كود واجهة مستخدم React (TSX) فخم جداً ومكتمل باستخدام TailwindCSS.`
          },
          ...history,
          { role: "user", content: prompt }
        ]
      })
    });

    const aiData = await response.json();
    const resultText = aiData.choices[0].message.content.trim();
    
    // إرجاع البيانات المفككة تلقائياً للواجهة
    const parsedData = JSON.parse(resultText);

    return NextResponse.json({ 
      success: true, 
      explanation: parsedData.explanation,
      specs: parsedData.specs,
      backendCode: parsedData.backendCode,
      frontendCode: parsedData.frontendCode
    });

  } catch (error: any) {
    console.error("Engine Crash:", error);
    return NextResponse.json({ success: false, error: "فشل نظام الـ Pipeline السحابي" }, { status: 500 });
  }
}
