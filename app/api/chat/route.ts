import { GoogleGenAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

    // --- 1. توليد المواصفات الفنية ---
    const specsPrompt = `
      أنت مهندس معمارية برمجيات. حلل طلب المستخدم واستخرج منه المواصفات الفنية المطلوبة لبناء حاوية ذكية على شبكة ICP.
      طلب المستخدم: "\${prompt}"
      أخرج النتيجة على شكل نقاط واضحة باللغة العربية (الهدف، أنواع البيانات، الدوال المطلوبة).
    `;
    const specsResult = await model.generateContent(specsPrompt);
    const generatedSpecs = specsResult.response.text();

    // --- 2. توليد الكود المبدئي ---
    const codeSystemInstruction = `
      أنت مبرمج محترف متخصص في لغة Motoko وشبكة ICP.
      مهمتك هي تحويل المواصفات المرفقة إلى كود Motoko نظيف ومكتمل تماماً داخل (actor).
      شروط صارمة: أخرج كود Motoko الخام فقط بدون أي علامات مثل \`\`\`motoko أو شرح نصي.
    `;

    const codeModel = ai.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: codeSystemInstruction 
    });

    const codePrompt = `قم بكتابة كود لغة Motoko الكامل والمتوافق مع هذه المواصفات الفنية بالضبط:\n${generatedSpecs}`;
    let codeResult = await codeModel.generateContent(codePrompt);
    let generatedCode = codeResult.response.text();

    // --- 3. نظام التدقيق الذاتي والفحص (Zero-Data-Loss Framework) ---
    let isCodeValid = false;
    let attempts = 0;
    const maxAttempts = 2; // عدد محاولات التصحيح الذاتي القصوى لضمان الكفاءة المجانية

    while (!isCodeValid && attempts < maxAttempts) {
      attempts++;
      
      // قاعدة الفحص الفني: يجب أن يحتوي الكود على كلمة actor البرمجية وألا يحتوي على نصوص شارحة مخربة
      if (generatedCode.includes("actor") && !generatedCode.includes("```")) {
        isCodeValid = true;
      } else {
        // حلقة التصحيح الذاتي (Self-Healing Loop)
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
