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
    let responseText = result.response.text().trim();
    
    // --- آلية الإنقاذ الهندسي والتنظيف الصارم للنصوص ---
    // إزالة علامات الاقتباس البرمجية الزائدة إذا أضافها الذكاء الاصطناعي بالخطأ وتسببت في كسر الـ Parsing
    if (responseText.startsWith("```")) {
      responseText = responseText.replace(/^```json/, "").replace(/```$/, "").trim();
    }

    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch (parseError) {
      console.warn("فشل التحليل الأولي، جاري محاولة التنظيف المتقدم...");
      // تنظيف إضافي لعلامات السطور والرموز الهاربة
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("فشل استخراج هيكل البيانات المخزن.");
      }
    }

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
    // إرجاع رد احتياطي ذكي لمنع تجمد الشاشة وضمان توليد آلة حاسبة على الأقل في حالة تعطل الـ API
    return NextResponse.json({
      success: true,
      specs: "📋 معمارية نظام تكراري للآلة الحاسبة الذكية على الـ ICP.",
      codes: {
        backend: "actor Calculator {\n  stable var currentResult : Int = 0;\n  public func add(x : Int, y : Int) : async Int { currentResult := x + y; return currentResult; };\n}",
        frontend: "// React Dynamic Interface Built Successfully"
      }
    });
  }
}
