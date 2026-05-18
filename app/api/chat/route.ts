import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { prompt, history = [] } = await req.json();
    
    // استخدام نموذج gemini-1.5-pro إذا كنت تريد منطقاً برمجياً أعلى، أو سنبقى على flash مع تهيئة مكثفة
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const runnerPrompt = `
      أنت مبرمج محرك منصة Caffeine.ai المتقدمة. وظيفتك هي استقبال طلب المستخدم لبناء تطبيق ويب لامركزي (On-Chain).
      يجب أن تقوم بالخطوات التالية بدقة:
      1. تحليل الفكرة وشرح الخطوات والمكتبات الفنية المستخدمة باللغة العربية بأسلوب هندسي مبهر.
      2. ترجمة الوصف إلى معمارية هندسية (Specs).
      3. بناء كود الواجهة الخلفية (Backend) بلغة Motoko بشكل احترافي جداً ومتقدم (يشمل الذاكرة المستقرة stable variables والدوال كاملة).
      4. بناء كود الواجهة الأمامية (Frontend) بلغة React (TSX) باستخدام TailwindCSS ويكون متطوراً جداً وبصرياً مبهراً ثلاثي الأبعاد ويقوم بربط حقوله مع دوال الـ Backend بشكل ديناميكي كامل.

      طلب المستخدم الحالي: "${prompt}"
      سجل المحادثة للتطوير التكراري المستمر: ${JSON.stringify(history)}

      يجب أن يكون المخرج كائن JSON حصري بالهيكل التالي:
      {
        "explanation": "اكتب هنا الشرح التفصيلي للخطوات والمكتبات الفنية باللغة العربية وما الذي ستقوم ببنائه الآن بالتفصيل المبرمج",
        "specs": "وثيقة المعمارية الهندسية ونوع البيانات المستقرة هنا",
        "backendCode": "كود لغة Motoko الاحترافي والكامل هنا بدون أي علامات أكتاد تنسيقية إطلاقاً",
        "frontendCode": "كود واجهة مستخدم React (TSX) مع TailwindCSS كامل ومبهر جداً بصرياً ليعمل داخل مفسر الواجهة الحية فوراً"
      }
    `;

    const result = await model.generateContent(runnerPrompt);
    let responseText = result.response.text().trim();
    
    if (responseText.startsWith("```")) {
      responseText = responseText.replace(/^```json/, "").replace(/```$/, "").trim();
    }

    const parsedData = JSON.parse(responseText);

    return NextResponse.json({
      success: true,
      explanation: parsedData.explanation,
      specs: parsedData.specs,
      codes: {
        backend: parsedData.backendCode,
        frontend: parsedData.frontendCode
      }
    });

  } catch (error: any) {
    console.error("Engine Crash:", error);
    return NextResponse.json({ success: false, error: "حدث خطأ في معالجة وكلاء النظام" }, { status: 500 });
  }
}
