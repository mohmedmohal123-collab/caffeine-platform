import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// التهيئة باستخدام الاسم الصحيح للكلاس الرسمي من قوقل
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    
    // استخدام النموذج الأساسي المستقر
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // --- 1. توليد المواصفات الفنية ---
    const specsPrompt = `
      أنت مهندس معمارية برمجيات. حلل طلب المستخدم واستخرج منه المواصفات الفنية المطلوبة لبناء حاوية ذكية على شبكة ICP.
      طلب المستخدم: "\${prompt}"
      أخرج النتيجة على شكل نقاط واضحة باللغة العربية تشمل (الهدف، أنواع البيانات، الدوال المطلوبة).
    `;
    const specsResult = await model.generateContent(specsPrompt);
    const generatedSpecs = specsResult.response.text();

    // --- 2. توليد الكود المبدئي ---
    const codeSystemInstruction = `
      أنت مبرمج محترف متخصص في لغة Motoko وشبكة ICP.
      مهمتك هي تحويل المواصفات المرفقة إلى كود Motoko نظيف ومكتمل تماماً داخل (actor).
      شروط صارمة: أخرج كود Motoko الخام فقط بدون أي علامات مثل \`\`\`motoko أو شرح نصي إطلاقاً.
    `;

    const codeModel = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: codeSystemInstruction 
    });

    const codePrompt = `قم بكتابة كود لغة Motoko الكامل والمتوافق مع هذه المواصفات الفنية بالضبط:\n${generatedSpecs}`;
    let codeResult = await codeModel.generateContent(codePrompt);
    let generatedCode = codeResult.response.text();

    // --- 3. نظام التدقيق الذاتي والفحص ---
    let isCodeValid = false;
    let attempts = 0;
    const maxAttempts = 2;

    while (!isCodeValid && attempts < maxAttempts) {
      attempts++;
      if (generatedCode.includes("actor") && !generatedCode.includes("```")) {
        isCodeValid = true;
      } else {
        const healingPrompt = `
          الكود الذي قمت بكتابته يحتوي على أخطاء تنسيق أو يفتقد لهيكل الـ actor الأساسي في لغة Motoko. 
          الكود الحالي المعطوب هو:
          ${generatedCode}
          الرجاء إعادة صياغة الكود فوراً وإصلاحه، وتأكد من إخراج الكود البرمجي الخام فقط بدون أي نصوص تفسيرية.
        `;
        codeResult = await codeModel.generateContent(healingPrompt);
        generatedCode = codeResult.response.text();
      }
    }

    return NextResponse.json({ 
      specs: generatedSpecs, 
      code: generatedCode 
    });

  } catch (error) {
    console.error("AI Error:", error);
    return NextResponse.json({ error: "حدث خطأ أثناء معالجة الطلب" }, { status: 500 });
  }
}
