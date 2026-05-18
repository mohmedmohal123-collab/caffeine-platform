import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const runnerPrompt = `
      أنت نظام خبير مبرمج لإدارة وكلاء المطورين (Multi-Agent System) لبناء تطبيقات ويب لشبكة ICP.
      بناءً على طلب المستخدم: "${prompt}"
      
      يجب أن تولد كائن JSON يحتوي بالضبط على هذه الحقول الثلاثة:
      1. "specs": وثيقة معمارية هندسية تفصيلية وشاملة باللغة العربية تشرح هيكل الحاوية والدوال ونوع البيانات.
      2. "backendCode": كود المصدر الكامل والنظيف بلغة Motoko وبدون استخدام علامات الأكواد التنسيقية إطلاقاً.
      3. "frontendCode": كود واجهة مستخدم تفاعلية وجذابة بلغة React (TSX) باستخدام TailwindCSS متطابقة مع دوال الحاوية.

      صيغة الـ JSON المطلوبة:
      {
        "specs": "نص المواصفات الفنية بالكامل هنا",
        "backendCode": "كود لغة Motoko بالكامل هنا",
        "frontendCode": "كود واجهة مستخدم React بالكامل هنا"
      }
    `;

    const result = await model.generateContent(runnerPrompt);
    const responseText = result.response.text().trim();
    
    const parsedData = JSON.parse(responseText);

    return NextResponse.json({
      success: true,
      specs: parsedData.specs,
      codes: {
        backend: parsedData.backendCode,
        frontend: parsedData.frontendCode
      }
    });

  } catch (error: any) {
    console.error("Engine Error:", error);
    return NextResponse.json({ success: false, error: "فشل المحرك في دمج استجابات الوكلاء" }, { status: 500 });
  }
}
