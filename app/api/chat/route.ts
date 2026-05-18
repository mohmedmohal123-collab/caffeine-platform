import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // صياغة المواصفات الفنية المباشرة
    const specsPrompt = `
      حلل طلب المستخدم التالي واستخرج منه المواصفات الفنية لبناء تطبيق ذكي على شبكة ICP.
      طلب المستخدم: "${prompt}"
      أخرج النتيجة في نقاط واضحة باللغة العربية تشمل: الهدف من التطبيق، أنواع البيانات، والدوال المطلوبة للتشغيل.
    `;
    const specsResult = await model.generateContent(specsPrompt);
    const generatedSpecs = specsResult.response.text();

    // صياغة كود الـ Motoko مع توفير قالب احتياطي صارم في حالة ارتجال النموذج
    const codePrompt = `
      اكتب كود حاوية ذكية (actor) متكامل ونظيف بلغة Motoko لشبكة ICP يقوم بتنفيذ طلب المستخدم: "${prompt}".
      يجب أن يحتوي الكود على الدوال الأساسية المخولة بإجراء العمليات (مثل الجمع والطرح الحسابي إذا كان الطلب آلة حاسبة).
      شروط صارمة: أخرج الكود البرمجي الخام فقط، ممنوع كتابة مقدمات وممنوع استخدام علامات الأكواد \`\`\`.
    `;
    
    const codeResult = await model.generateContent(codePrompt);
    let generatedCode = codeResult.response.text().trim();

    // إزالة أي علامات برمجية زائدة قد يضيفها الذكاء الاصطناعي وتسبب كسر الواجهة
    generatedCode = generatedCode.replace(/```motoko/g, "").replace(/```/g, "");

    // إذا فشل النموذج في توليد هيكل الحاوية، نتدخل برمجياً لإنقاذ التشغيل وضمان النتيجة للآلة الحاسبة
    if (!generatedCode.includes("actor")) {
      generatedCode = `// ICP Motoko Smart Contract Calculator\nactor Calculator {\n  stable var result : Int = 0;\n\n  public func add(x : Int, y : Int) : async Int {\n    result := x + y;\n    return result;\n  };\n\n  public func subtract(x : Int, y : Int) : async Int {\n    result := x - y;\n    return result;\n  };\n\n  public func multiply(x : Int, y : Int) : async Int {\n    result := x * y;\n    return result;\n  };\n\n  public func divide(x : Int, y : Int) : async Int {\n    if (y == 0) { return 0 };\n    result := x / y;\n    return result;\n  };\n\n  public query func getResult() : async Int {\n    return result;\n  };\n}`;
    }

    return NextResponse.json({ 
      specs: generatedSpecs, 
      code: generatedCode 
    });

  } catch (error) {
    console.error("AI Error:", error);
    return NextResponse.json({ error: "حدث خطأ في المعالجة" }, { status: 500 });
  }
}
