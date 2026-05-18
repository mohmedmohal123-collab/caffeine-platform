import { GoogleGenAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// تهيئة محرك الذكاء الاصطناعي باستخدام المفتاح السري المخرن في جهازك وفي Vercel
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    // الأمر الحاكم (System Prompt) الذي يجبر جيمناي على التصرف كمبرمج بلغة Motoko لشبكة ICP
    const systemInstruction = `
      أنت مبرمج محترف وخبير خوارزميات متخصص في شبكة Internet Computer Protocol (ICP) ولغة البرمجة Motoko.
      مهمتك هي أخذ فكرة المستخدم من النص المرسل، وبناء حاوية برمجية كاملة (actor) بلغة Motoko.
      شروط صارمة:
      1. أخرج كود Motoko نظيف ومكتمل وقابل للعمل فوراً.
      2. لا تكتب أي نصوص تفسيرية، ولا ترحيب، ولا شرح للكود.
      3. لا تضع علامات الأكواد مثل \`\`\`motoko قبل أو بعد الكود. أريد النص البرمجي الخام فقط ليقرأه النظام تلقائياً.
    `;

    const model = ai.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: systemInstruction 
    });

    const result = await model.generateContent(prompt);
    const generatedCode = result.response.text();

    return NextResponse.json({ code: generatedCode });
  } catch (error) {
    console.error("AI Error:", error);
    return NextResponse.json({ error: "حدث خطأ أثناء الاتصال بالذكاء الاصطناعي" }, { status: 500 });
  }
}
