import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// 1. تعريف واجهة نظام الأحداث ومواصفات الـ JSON الهيكلية (Engine Types)
interface ProjectSpecification {
  projectName: string;
  architecture: {
    frontend: { framework: string; components: string[] };
    backend: { language: string; canisters: string[]; methods: { name: string; type: "query" | "update"; params: string[] }[] };
  };
  databaseSchema: string[];
}

export async function POST(req: Request) {
  try {
    const { prompt, currentIteration = 0, previousSpecs = null } = await req.json();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // -------------------------------------------------------------
    // [الوكيل الأول: وكيل تحليل الأعمال وهندسة المواصفات - Business Analyst Agent]
    // -------------------------------------------------------------
    const analystPrompt = `
      أنت وكيل ذكاء اصطناعي متخصص في تحليل الأنظمة (Business Analyst Agent).
      مهمتك هي أخذ طلب المستخدم وإنتاج مواصفات تقنية صارمة بصيغة JSON فقط.
      طلب المستخدم: "${prompt}"
      الحالة الحالية للمشروع (التطوير التكراري): ${previousSpecs ? JSON.stringify(previousSpecs) : "مشروع جديد"}
      
      يجب أن يتطابق المخرج تماماً مع هيكل الـ JSON التالي بدون أي نصوص إضافية أو علامات \`\`\`:
      {
        "projectName": "اسم المشروع بالإنجليزي",
        "architecture": {
          "frontend": { "framework": "Next.js/Tailwind", "components": ["قائمة المكونات المطلوبة للواجهة"] },
          "backend": { "language": "Motoko", "canisters": ["اسم الحاوية الذكية"], "methods": [{"name": "اسم الدالة", "type": "query أو update", "params": ["المتغيرات"]}] }
        },
        "databaseSchema": ["حقول تخزين البيانات المستقرة في لغة Motoko"]
      }
    `;

    const analystResult = await model.generateContent(analystPrompt);
    const specsRaw = analystResult.response.text().trim().replace(/```json/g, "").replace(/```/g, "");
    
    let verifiedSpecs: ProjectSpecification;
    try {
      verifiedSpecs = JSON.parse(specsRaw);
    } catch (e) {
      // نظام الحماية التلقائي في حالة فشل صياغة الـ JSON
      throw new Error("فشل الوكيل الأول في صياغة مواصفات JSON متوافقة.");
    }

    // -------------------------------------------------------------
    // [الوكيل الثاني: وكيل برمجة الواجهة الخلفية - Backend Motoko Agent]
    // -------------------------------------------------------------
    const backendPrompt = `
      أنت وكيل برمجة الخلفية (Backend Developer Agent) لشبكة ICP.
      بناءً على مواصفات الـ JSON التالية، اكتب كود لغة Motoko الكامل والآمن داخل حاوية (actor):
      ${JSON.stringify(verifiedSpecs)}
      
      شروط صارمة: أخرج كود Motoko الخام فقط. ممنوع الشرح، وممنوع استخدام علامات الأكواد \`\`\`.
    `;
    const backendResult = await model.generateContent(backendPrompt);
    const backendCode = backendResult.response.text().trim().replace(/```motoko/g, "").replace(/```/g, "");

    // -------------------------------------------------------------
    // [الوكيل الثالث: وكيل برمجة الواجهة الأمامية - Frontend Tailwind Agent]
    // -------------------------------------------------------------
    const frontendPrompt = `
      أنت وكيل برمجة الواجهة الأمامية (Frontend Developer Agent).
      بناءً على مواصفات الـ JSON التالية، اكتب كود واجهة مستخدم تفاعلية كاملة باستخدام React و TailwindCSS ليتوافق مع دوال الخلفية:
      ${JSON.stringify(verifiedSpecs)}
      
      شروط صارمة: أخرج كود React (TSX) الخام فقط، متضمناً أزرار وحقول لتجربة الدوال المذكورة في الـ JSON. ممنوع الشرح وعلامات \`\`\`.
    `;
    const frontendResult = await model.generateContent(frontendPrompt);
    const frontendCode = frontendResult.response.text().trim().replace(/```tsx/g, "").replace(/```/g, "");

    // -------------------------------------------------------------
    // [معالجة الأحداث وحفظ الحالة - Event Handler & State Management]
    // -------------------------------------------------------------
    // هنا يتم إرسال النتيجة الكاملة المنفصلة للواجهة ليتم حفظها في التبويبات والإصدارات
    return NextResponse.json({
      success: true,
      iteration: currentIteration + 1,
      specs: verifiedSpecs,
      codes: {
        backend: backendCode,
        frontend: frontendCode
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error("Engine Crash:", error);
    return NextResponse.json({ success: false, error: error.message || "حدث خطأ في محرك المعالجة الرئيسي" }, { status: 500 });
  }
}
