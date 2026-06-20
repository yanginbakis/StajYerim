import { db, collection, getDocs, addDoc, doc, setDoc } from "../lib/firebase";
import { type Listing } from "../types";

export const STARTER_LISTINGS: Listing[] = [
  {
    id: "seed-tech-1",
    title: "Genç Yazılımcı - 1 Haftalık Web Developer Deneyimi",
    companyName: "TechPion Teknolojileri",
    category: "Teknoloji",
    locationType: "Hibrit",
    locationCity: "İstanbul",
    description: "Lise öğrencilerinin yazılım dünyasındaki ilk adımlarını atması için özel planlanmış 1 haftalık bir program. Bu programda, gerçek bir yazılım ekibinin günlük rutinine (Daily Standup) katılacak, HTML/CSS ile kendi ilk web sayfanızı tasarlayacak ve kıdemli mühendislerimizle birebir mentorluk seansları yapacaksınız.",
    weeksPlan: [
      "Gün 1: Hoş Geldiniz & Ekiple Tanışma. Yazılım dünyası ve rol analizleri.",
      "Gün 2: Ekip Gözlemi (Shadowing) - Canlı kodlama ve Scrum seanslarını izleme.",
      "Gün 3: HTML & CSS ile İlk Web Sayfanı Oluşturmaca.",
      "Gün 4: Tasarladığın Sayfayı Web'de Yayınlama & Takım Liderinden Değerlendirme.",
      "Gün 5: Dijital Başarı Sertifikası Töreni & Birebir Kariyer Planlama Sohbeti."
    ],
    quizQuestions: [
      "Teknolojiye veya yazılıma olan ilgini ilk ne zaman fark ettin ve seni bu meslekte en çok ne heyecanlandırıyor?",
      "Öğrenmekte zorlandığın bir konuyu (örn: okulda zor bir ders veya yeni bir beceri) anlamak için nasıl bir yöntem izledin?",
      "Sence bilgisayarlar gelecekte günlük hayatı daha başka nasıl kolaylaştırabilir? Kendi yaratıcı fikrini paylaşır mısın?"
    ],
    createdAt: Date.now() - 3600000 * 24
  },
  {
    id: "seed-design-1",
    title: "Yaratıcı Zihinler - Dijital Grafik Tasarım Gözlemcisi",
    companyName: "Atölye Piksel Ajansı",
    category: "Tasarım",
    locationType: "Uzaktan",
    locationCity: "Tüm Türkiye",
    description: "Afişler, logolar ve sosyal medya tasarımları nasıl hayat buluyor? Atölye Piksel, tasarımı ve çizimi seven lise öğrencilerine kapılarını açıyor! Çizim yapmayı, renkleri ve dijital görsel dünyayı merak ediyorsan, profesyonel tasarımcıların çalışma prensiplerini kısa yoldan öğreneceğin bir deneme stajı.",
    weeksPlan: [
      "Gün 1: Tasarım Düşüncesi, Renk Teorisi ve Markalaşma Eğitimi.",
      "Gün 2: Grafik ve Arayüz Araçları (Figma / Canva) Tanıtımı.",
      "Gün 3: Örnek Bir Marka İçin Afiş/Arayüz Tasarımı Eskiz Çalışması.",
      "Gün 4: Tasarımları Dijital Ortama Aktarma & Sanat Yönetmeni Gözetimi.",
      "Gün 5: Portfolyo Tasarımı Tavsiyeleri, Proje Sunumu & Sertifika Dağıtımı."
    ],
    quizQuestions: [
      "Sosyal medyada, dükkanlarda veya web sitelerinde gördüğün ve tasarımını en çok beğendiğin şey nedir? Nedenini kısaca açıklar mısın?",
      "Kendi hayal gücünü başkalarına anlatmak için genellikle hangi yolları tercih edersin (çizim, sunum, yazı, mimari lego vb.)?",
      "1 haftalık bu tasarım stajında özellikle tasarım ekibimizden en çok hangi araçları veya yetenekleri öğrenmek istersin?"
    ],
    createdAt: Date.now() - 3600000 * 48
  },
  {
    id: "seed-health-1",
    title: "Yarının Hekimleri - Hastane İşleyişi & Tıp Gözlemcisi",
    companyName: "Metropol Sağlık Grubu",
    category: "Sağlık",
    locationType: "Yerinde",
    locationCity: "Ankara",
    description: "Tıp fakültesi okumayı veya sağlık sektöründe hayat kurtaran roller üstlenmeyi mi hayal ediyorsun? Hastane ortamını, doktorların, radyologların ve klinik yöneticilerinin günlük tempoda nasıl çalıştıklarını yakından gözlemleme zamanı. (Not: Bu program hiçbir cerrahi/tıbbi müdahale içermez, tamamen bilgilendirme ve mesleki gözetim amaçlıdır.)",
    weeksPlan: [
      "Gün 1: Hastane Tanıtımı, Sağlık Etiği, İş Sağlığı ve Hijyen Kuralları Eğitimi.",
      "Gün 2: Genel Poliklinik ve Doktor Çalışma Düzenini İzleme (Shadowing).",
      "Gün 3: Laboratuvar ve Tıbbi Görüntüleme (MR, Röntgen vb.) Cihazlarının Çalışma Prensibi.",
      "Gün 4: Acil Servis ve Triaj Yönetim Senaryolarını İnceleme.",
      "Gün 5: Farklı Uzmanlıklardaki Hekimlerle Soru-Cevap Panel Sohbeti & Gözlem Katılım Belgesi."
    ],
    quizQuestions: [
      "Sağlık alanına ve tıp dünyasına ilgi duymana sebep olan olay ya da hayat tecrübesi nedir?",
      "İdealist bir doktor ya da sağlık profesyoneli sence hangi kişisel özelliklere sahip olmalıdır?",
      "Hastanede çalışmak yüksek sorumluluk gerektirir. Okul hayatında büyük sorumluluk aldığın bir durumu bizimle paylaşır mısın?"
    ],
    createdAt: Date.now() - 3600000 * 72
  },
  {
    id: "seed-finance-1",
    title: "Genç Girişimci - Temel Finans ve Yatırım Okuryazarlığı",
    companyName: "Alfa Finans / Portföy Yönetimi",
    category: "Finans",
    locationType: "Hibrit",
    locationCity: "İstanbul",
    description: "Para hareketleri, borsalar, yatırım planlaması ve bütçe yönetimi nasıl yapılır? Alfa Finans ekibi olarak lise öğrencilerine temel finansal okuryazarlığı ve pazar analizlerini eğlenceli uygulamalarla öğretiyoruz. Geleceğin ekonomisti olmak isteyenler için harika bir deneme haftası.",
    weeksPlan: [
      "Gün 1: Finansal Piyasalar ve Para Kavramının Gelişimi Sunumu.",
      "Gün 2: Borsa Nasıl Çalışır? Örnek Şirket ve Hisse Senedi Analizleri.",
      "Gün 3: Bireysel Finans, Tasarruf ve Bütçe Yönetimi Oyunu.",
      "Gün 4: Geleceğin Teknolojileri: Dijital Bankacılık ve Kripto Varlıklara Genel Bakış.",
      "Gün 5: Sanal Portföy Yarışması Kazananı Seçimi, Katılım Teşekkür Plaketi."
    ],
    quizQuestions: [
      "Kendi bütçeni ya da harçlığını yönetirken en çok nelere dikkat edersin? Hiç tasarruf hedefin oldu mu?",
      "Son zamanlarda haberlerde veya çevrende duyduğun hangi finansal terim veya teknoloji (örn: yapay zeka yatırımları, borsa, blockchain, enflasyon vb.) ilgini çekti?",
      "Finansal okuryazarlığın, kendi geleceğin ve hedeflerin için ne kadar önemli olduğunu düşünüyorsun?"
    ],
    createdAt: Date.now() - 3600000 * 96
  }
];

export async function seedListingsIfEmpty(): Promise<Listing[]> {
  try {
    const querySnapshot = await getDocs(collection(db, "listings"));
    if (querySnapshot.empty) {
      console.log("No listings found in Firestore. Seeding starter data...");
      const seededList: Listing[] = [];
      
      for (const item of STARTER_LISTINGS) {
        const { id, ...itemWithoutId } = item;
        // Seed to firestore
        const docRef = await addDoc(collection(db, "listings"), {
          ...itemWithoutId,
          createdAt: Date.now()
        });
        seededList.push({
          ...itemWithoutId,
          id: docRef.id
        });
      }
      return seededList;
    } else {
      const dbListings: Listing[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        dbListings.push({
          id: doc.id,
          title: data.title || "",
          companyName: data.companyName || "",
          category: data.category || "Teknoloji",
          description: data.description || "",
          weeksPlan: data.weeksPlan || [],
          locationType: data.locationType || "Hibrit",
          locationCity: data.locationCity || "",
          quizQuestions: data.quizQuestions || [],
          createdAt: data.createdAt || Date.now()
        });
      });
      return dbListings.sort((a, b) => b.createdAt - a.createdAt);
    }
  } catch (error) {
    console.error("Firebase seeding or loading failed, using static list as layout fallback:", error);
    return STARTER_LISTINGS;
  }
}
