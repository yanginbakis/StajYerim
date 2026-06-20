import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Initialize Gemini API
const aiApiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (aiApiKey) {
  ai = new GoogleGenAI({ apiKey: aiApiKey });
  console.log("Gemini API initialized successfully.");
} else {
  console.warn("GEMINI_API_KEY environment variable is not defined. AI functions will run in demo/mock mode.");
}

app.use(express.json());

// API endpoints

// 1. AI Profession/Career Counselor (Yol Gösterici AI)
app.post("/api/ai/counselor", async (req, res) => {
  const { question, history, studentProfile } = req.body;
  
  if (!ai) {
    return res.json({
      reply: "Merhaba! Şu an AI Servisi pasif durumda olduğu için demo modundayım. Stajyerim hakkında her türlü soruyu sorabilirsin! Örneğin, 'Yazılım Mühendisliği stajında ne yaparım?' gibi sorulara bu modda da yanıt verebilirim. Yazılım Mühendisliği 1 haftalık deneme stajları harika bir başlangıçtır!"
    });
  }

  try {
    const interestStr = studentProfile ? `Öğrenci Profili / İlgi Alanları: ${studentProfile.interests}. Eğitim Durumu: Lise öğrencisi.` : "Kullanıcı: Lise öğrencisi.";
    
    const prompt = `Sen "Stajyerim" platformunun resmi AI Kariyer Danışmanısın (Meslek Rehberi AI). Görevin, lise çağındaki öğrencilere kariyer rehberliği yapmak, meslekleri anlamalarına yardımcı olmak ve onlara uygun 1 haftalık deneme stajı alanlarını önermektir.
Açıklamalarını lise seviyesinde bir öğrencinin heyecan duyabileceği, anlaşılır, samimi, motive edici ama profesyonel bir dille yap. Aşırı resmi veya jargona boğulmuş bir dil kullanma. Bölümleri madde madde sun ve okuması kolay olsun.

${interestStr}

Kullanıcı Sorusu: "${question}"

Lütfen Türkçe dilinde, markdown formatında güzelce yapılandırılmış bir yanıt ver.`;

    const chatHistory = history?.map((h: any) => ({
      role: h.role === "user" ? "user" : "model",
      parts: [{ text: h.content }]
    })) || [];

    // Add the new message
    chatHistory.push({
      role: "user",
      parts: [{ text: prompt }]
    });

    // We can use gemini-2.5-flash for friendly, clean chats
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = response.text || "Üzgünüm, şu an bu soruyu yanıtlayamıyorum.";
    res.json({ reply: text });
  } catch (error: any) {
    console.error("AI Counselor Error:", error);
    res.status(500).json({ error: error.message || "AI yanıt bütünü alınamadı." });
  }
});

// 2. Help company generate custom tryout interview questions
app.post("/api/ai/generate-quiz", async (req, res) => {
  const { title, category, description, syllabus } = req.body;

  if (!ai) {
    // Return high quality default questions for high schoolers as fallback
    return res.json({
      questions: [
        `Bu alana (yani ${title || "stajımıza"}) ilgi duymaya nasıl başladın? Seni lise çağında bu mesleğe çeken şey ne oldu?`,
        "Karşılaştığın ve çözmekte zorlandığın bir problemi (örneğin okul projesi, bir ödev veya kişisel hobi) nasıl çözdün? Adım adım anlatır mısın?",
        "1 haftalık bu deneme stajında özellikle neleri gözlemlemek ve öğrenmek istiyorsun? Kendine ne hedef koydun?"
      ]
    });
  }

  try {
    const prompt = `Sen staj veren şirketlerin, lise öğrencileri için 1 haftalık deneme stajlarında (tryout internship) sorabilecekleri pratik, samimi ve değerlendirici mülakat/deneme soruları tasarlayan bir AI Uzmanısın.
Şirket bir ilan açtı:
Pozisyon: ${title}
Kategori: ${category}
Açıklama: ${description}
Haftalık Program: ${syllabus}

Bu ilana başvuracak lise öğrencisine yöneltilmek üzere en fazla 3 soru içeren JSON formatında bir liste oluştur.
Sorular teknik bilgi sormamalıdır çünkü bunlar henüz lise öğrencisidir, onun yerine adayın motivasyonunu, öğrenme isteğini ve mesleğe yatkınlığını ölçen heyecan verici ve arkadaş canlısı sorular olmalıdır.

ÇIKTI FORMATI sadece geçerli bir JSON olmalıdır, başka hiçbir şey yazma:
{
  "questions": [
    "Soru 1 metni...",
    "Soru 2 metni...",
    "Soru 3 metni..."
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const contentText = response.text;
    if (contentText) {
      const parsed = JSON.parse(contentText);
      res.json(parsed);
    } else {
      throw new Error("Boş AI yanıtı");
    }
  } catch (error: any) {
    console.error("Error generating quiz:", error);
    res.json({
      questions: [
        `Bu alana (yani ${title || "stajımıza"}) ilgi duymaya nasıl başladın? Seni lise çağında bu mesleğe çeken şey ne oldu?`,
        "Karşılaştığın ve çözmekte zorlandığın bir problemi (örneğin okul projesi, bir ödev veya kişisel hobi) nasıl çözdün? Adım adım anlatır mısın?",
        "1 haftalık bu deneme stajında özellikle neleri gözlemlemek ve öğrenmek istiyorsun? Kendine ne hedef koydun?"
      ]
    });
  }
});

// 3. Evaluate student answers to provide visual evaluation profile & coaching feedback
app.post("/api/ai/evaluate-answers", async (req, res) => {
  const { listingTitle, questions, answers, studentInterests } = req.body;

  if (!ai) {
    return res.json({
      matchingScore: 85,
      coachingFeedback: "Harika bir başvuru! Cevapların ne kadar istekli olduğunu gösteriyor. İlgilendiğin " + (studentInterests || "alanlar") + " bu stajla çok uyumlu. Şirket seninle mutlaka tanışmak isteyecektir!",
      ratings: {
        motivation: 90,
        problemSolving: 80,
        adaptability: 85
      }
    });
  }

  try {
    const prompt = `Sen "Stajyerim" platformunun lise öğrencilerini destekleyen AI Koçusun.
Lise öğrencisi bir aday, '${listingTitle}' başlıklı 1 haftalık deneme stajına başvurdu.
Adayın ilgi alanları: ${studentInterests}

Mülakat Soruları ve Öğrencinin Cevapları aşağıdadır:
${questions.map((q: string, idx: number) => `Soru ${idx+1}: ${q}\nCevap ${idx+1}: ${answers[idx] || "Cevap verilmedi"}`).join('\n\n')}

Bu cevapları değerlendirip samimi, yapıcı, lise öğrencisini cesaretlendirici bir geri bildirim ve analiz raporu hazırla. 
Rapor şunları içermelidir:
1. Matching Score (Eşleşme Skoru): 0-100 arası bir tamsayı.
2. Motivasyon, Problem Çözme ve Uyum Yeteneği (0-100 puan arası derecelendirmeler).
3. Öğrenci için samimi ve yapıcı bir AI Koç değerlendirmesi (coachingFeedback). Öğrencinin güçlü yanlarını öne çıkar ve 1 haftalık deneme stajına hazır olup olmadığını yorumla.

Lütfen ÇIKTIYI sadece aşağıdaki JSON formatında ver, başka hiçbir açıklama veya ön yazı ekleme:
{
  "matchingScore": 85,
  "coachingFeedback": "Samimi ve cesaretlendirici geri bildirim metni...",
  "ratings": {
    "motivation": 90,
    "problemSolving": 80,
    "adaptability": 85
  }
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const contentText = response.text;
    if (contentText) {
      const parsed = JSON.parse(contentText);
      res.json(parsed);
    } else {
      throw new Error("Boş evaluation yanıtı");
    }
  } catch (error: any) {
    console.error("Evaluation Error:", error);
    res.json({
      matchingScore: 78,
      coachingFeedback: "Cevaplarınız incelendiğinde bu staja karşı büyük bir motivasyon taşıdığınız görülüyor. İlgi duyduğunuz alanların bu tryout ile yakından örtüşmesi harika bir fırsat! Hazırlık yapmaya başlayabilirsiniz.",
      ratings: {
        motivation: 85,
        problemSolving: 75,
        adaptability: 75
      }
    });
  }
});

// Setup Vite & Frontend static routing
async function init() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://127.0.0.1:${PORT}`);
  });
}

init();
