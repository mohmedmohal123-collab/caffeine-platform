import { GoogleGenAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    // تهيئة النموذج
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

    // --- المرحلة 1: توليد المواصفات الفنية (Specifications) ---
    const specsPrompt = `
      أنت مهندس معمارية برمجيات (Software Architect). 
      حلل طلب المستخدم التالي واستخرج منه المواصفات الفنية المطلوبة لبناء حاوية ذكية (Canister) على شبكة ICP.
      طلب المستخدم: "${prompt}"
      أخرج النتيجة على شكل نقاط واضحة باللغة العربية تشمل:
      1. الهدف العام من التطبيق.
      2. نوع البيانات التي سيتم تخزينها (Data Types).
      3. الدوال الأساسية المطلوبة (Functions) ونوعها (Query أو Update).
    `;
    
    const specsResult = await model.generateContent(specsPrompt);
    const generatedSpecs = specsResult.response.text();

    // --- المرحلة 2: توليد كود Motoko بناءً على المواصفات المخرجة ---
    const codeSystemInstruction = `
      أنت مبرمج محترف متخصص في لغة Motoko وشبكة ICP.
      مهمتك هي أخذ المواصفات الفنية المرفقة وتحويلها إلى كود Motoko نظيف ومكتمل داخل (actor).
      شروط صارمة:
      1. أخرج كود Motoko الخام فقط.
      2. ممنوع وضع علامات الأكواد مثل \`\`\`motoko أو أي شرح نصي إطلاقاً.
    `;

    const codeModel = ai.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: codeSystemInstruction 
    });

    const codePrompt = `قم بكتابة كود لغة Motoko الكامل والمتوافق مع هذه المواصفات الفنية بالضبط:\n${generatedSpecs}`;
    const codeResult = await codeModel.generateContent(codePrompt);
    const generatedCode = codeResult.response.text();

    // إرجاع النتيجتين معاً للواجهة الأمامية
    return NextResponse.json({ 
      specs: generatedSpecs, 
      code: generatedCode 
    });

  } catch (error) {
    console.error("AI Error:", error);
    return NextResponse.json({ error: "حدث خطأ أثناء معالجة الطلب" }, { status: 500 });
  }
}
