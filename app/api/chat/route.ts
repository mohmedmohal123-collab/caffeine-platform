import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt, step, currentSpecs } = await req.json();
    
    // الربط مع OpenRouter لاستدعاء نموذج الذكاء الاصطناعي الخارق DeepSeek-V3
    const response = await fetch("https://openrouter.ai", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat", // يمكنك تغييره إلى anthropic/claude-3.5-sonnet
        messages: [
          {
            role: "system",
            content: `أنت النواة البرمجية لمنصة Caffeine.ai. أنت خبير في معمارية لغة Motoko وReact وTailwindCSS. 
            يجب أن تلتزم التزاماً صارماً بنوع المخرج المطلوب لكل خطوة وبدون أي نصوص شارحة أو علامات أكواد تنسيقية مثل \`\`\`.`
          },
          {
            role: "user",
            content: step === "specs" 
              ? `حلل طلب المستخدم التالي: "${prompt}". وأخرج كائن JSON نظيفاً ومطابقاً للشروط التالية فقط:
                 { "projectName": "اسم المشروع", "description": "شرح وتحليل تفصيلي ومبهر باللغة العربية للخطوات والمكتبات وتجهيز المترجم", "methods": ["الدوال المطلوبة للعمليات والتخزين"] }`
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
    console.error("Pipeline Engine Crash:", error);
    return NextResponse.json({ success: false, error: "فشل نظام معالجة التدفق البرمجي" }, { status: 500 });
  }
}
