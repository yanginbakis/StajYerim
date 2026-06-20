import React, { useState, useEffect } from "react";
import { 
  Users, 
  UserPlus, 
  HelpCircle, 
  Search, 
  Edit3, 
  X, 
  Loader2, 
  CheckCircle, 
  UserCheck, 
  Info,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Brain,
  Palette,
  Code,
  Sparkles,
  Briefcase,
  FileText,
  UserCheck2,
  Trash2,
  Eye,
  Rocket,
  ShieldCheck,
  CreditCard,
  Plus,
  Compass,
  Layers,
  Award,
  DollarSign,
  Share2,
  Instagram,
  Linkedin,
  Twitter,
  Image as ImageIcon
} from "lucide-react";
import { db, collection, getDocs, doc, setDoc, deleteDoc, getDoc } from "../lib/firebase";
import { type TeamRoleAssignment } from "../types";

// Static Initial Roles definitions
const DEFAULT_ROLES = [
  {
    id: "problem_analyst",
    roleName: "Problem Analisti",
    description: "Gözlemlenen sorunları veya pazar ihtiyaçlarını tespit eder, yapılandırır ve analiz eder.",
    icon: HelpCircle,
    color: "text-amber-600 bg-amber-50 border-amber-200"
  },
  {
    id: "researcher",
    roleName: "Araştırma Uzmanı",
    description: "Hedef kitle beklentilerini, pazar büyüklüğünü ve rakip çözümleri araştırır.",
    icon: Search,
    color: "text-blue-600 bg-blue-50 border-blue-200"
  },
  {
    id: "business_modeler",
    roleName: "İş Modeli Uzmanı",
    description: "Çözümün nasıl gelir elde edeceğini, maliyetleri ve değer önerisini tasarlar.",
    icon: Briefcase,
    color: "text-emerald-600 bg-emerald-50 border-emerald-200"
  },
  {
    id: "ai_architect",
    roleName: "Yapay Zeka Mimarı",
    description: "Süreçte hangi yapay zeka teknolojilerinin ve modellerinin kullanılacağına karar verir.",
    icon: Brain,
    color: "text-indigo-600 bg-indigo-50 border-indigo-200"
  },
  {
    id: "prompt_engineer",
    roleName: "Prompt Mühendisi",
    description: "Gerekli prompt'ları tasarlar, test eder ve yapay zeka çıktılarının kalitesini optimize eder.",
    icon: Sparkles,
    color: "text-purple-600 bg-purple-50 border-purple-200"
  },
  {
    id: "brand_designer",
    roleName: "Marka Tasarımcısı",
    description: "Logodan renk paletine kadar projenin kurumsal kimliğini ve tasarım dilini kurgular.",
    icon: Palette,
    color: "text-rose-600 bg-rose-50 border-rose-200"
  },
  {
    id: "content_designer",
    roleName: "İçerik Tasarımcısı",
    description: "Web/mobil arayüz metinlerini, sosyal medya postlarını ve sunum içeriklerini hazırlar.",
    icon: FileText,
    color: "text-orange-600 bg-orange-50 border-orange-200"
  },
  {
    id: "prototype_developer",
    roleName: "Prototip Geliştiricisi",
    description: "Uygulamanın ilk çalışan taslağını (MVP) veya akışını teknik olarak hayata geçirir.",
    icon: Code,
    color: "text-teal-600 bg-teal-50 border-teal-200"
  },
  {
    id: "pitch_relations",
    roleName: "Sunum ve Yatırımcı İlişkileri Uzmanı",
    description: "Yatırımcılara sunum yapacak pitch deck'leri hazırlar, ekip hikayesini anlatır.",
    icon: TrendingUp,
    color: "text-cyan-600 bg-cyan-50 border-cyan-200"
  }
];

const POPULAR_STUDENTS = [
  "Ayşe Yılmaz", "Ahmet Demir", "Elif Kaya", "Mehmet Öztürk", 
  "Zeynep Çelik", "Can Şahin", "Yağmur Koç", "Burak Arslan", 
  "Merve Yıldız", "Yiğit Doğan", "Selin Kılıç", "Kaan Aydın"
];

const GRADES = ["9. Sınıf", "10. Sınıf", "11. Sınıf", "12. Sınıf", "Mezun"];

export default function LeftSidebarFeatures() {
  // Collapsible accordion active state (-1 means all closed, initially first or none open)
  // We'll support multiple open accordions using active sections state!
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    vision_mission: true, // open by default
    differentiation: false,
    membership: false,
    pitch_deck: false,
    visuals: false,
    team_roles: true, // open by default
    social_posts: false
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // --- GENERAL NOTIFICATION ---
  const [notification, setNotification] = useState<{message: string; type: "success" | "deleted" | "error" | null}>({
    message: "",
    type: null
  });

  const triggerNotification = (message: string, type: "success" | "deleted" | "error") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification({ message: "", type: null });
    }, 4000);
  };

  // ==========================================
  // SECTION 1: VİZYON VE MİSYON STATE & SAVE
  // ==========================================
  const [vision, setVision] = useState("Türkiye'nin genç beyinlerini pratik girişimcilik tecrübeiyle donatarak geleceğin lise tabanlı unicorn girişimlerini yeşertmek.");
  const [mission, setMission] = useState("Lise düzeyindeki inovatif öğrencilere 1 haftalık hızlandırılmış gerçek dünya stajları, mentorluk programları ve pratik iş rollerini tecrübe edecekleri interaktif bir startup simülatörü sunmak.");
  const [editingVM, setEditingVM] = useState(false);
  const [savingVM, setSavingVM] = useState(false);

  useEffect(() => {
    async function fetchVisionMission() {
      try {
        const docRef = doc(db, "app_settings", "vision_mission");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.vision) setVision(data.vision);
          if (data.mission) setMission(data.mission);
        }
      } catch (err) {
        console.log("Using initial default vision/mission", err);
      }
    }
    fetchVisionMission();
  }, []);

  const handleSaveVisionMission = async () => {
    setSavingVM(true);
    try {
      await setDoc(doc(db, "app_settings", "vision_mission"), {
        vision,
        mission,
        updatedAt: Date.now()
      });
      triggerNotification("Vizyon ve Misyonumuz başarıyla güncellendi.", "success");
      setEditingVM(false);
    } catch (err) {
      console.error(err);
      triggerNotification("Bilgiler kaydedilirken hata oluştu.", "error");
    } finally {
      setSavingVM(false);
    }
  };

  // ==========================================
  // SECTION 2: DİĞER ŞİRKETLERDEN FARKIMIZ (USPs)
  // ==========================================
  const [usps, setUsps] = useState([
    { id: "1", title: "Aktif Rol Simülasyonu", ours: "Öğrenciler sadece dinleyici değil; Problem Analisti, Yapay Zeka Mimarı gibi rollerde bizzat sorumluluk alır.", others: "Sadece pasif gözetim, döküman okuma or fotokopi çekimi stajları." },
    { id: "2", title: "1 Haftalık Sürat (Sprint)", ours: "Pazartesi sorunun tespitiyle başlar, Cuma günü yatırımcı sunumu ve çalışan MVP ile mezuniyet gerçekleşir.", others: "Aylarca süren, odak noktası ve heyecanı dağılmış pasif süreçler." },
    { id: "3", title: "Yapay Zeka Destekli Değerlendirme", ours: "Yapay Zeka Mentörümüz (AI Counselor) öğrenci girdilerini inceleyerek her gün kişiselleştirilmiş geri bildirim verir.", others: "Geri bildirim oranı son derece düşük, genel ve yüzeysel bitiş belgeleri." }
  ]);
  const [newUspTitle, setNewUspTitle] = useState("");
  const [newUspOurs, setNewUspOurs] = useState("");
  const [newUspOthers, setNewUspOthers] = useState("");
  const [showUspForm, setShowUspForm] = useState(false);

  const handleAddUsp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUspTitle.trim() || !newUspOurs.trim()) return;
    const newId = String(Date.now());
    const newUsp = { id: newId, title: newUspTitle, ours: newUspOurs, others: newUspOthers || "Klasik/Belirsiz metodlar." };
    
    // Save state
    const updatedUsps = [...usps, newUsp];
    setUsps(updatedUsps);
    
    // Attempt persistence
    try {
      await setDoc(doc(db, "app_settings", "usps_data"), { list: updatedUsps });
      triggerNotification("Yeni fark/ USP maddesi eklendi.", "success");
    } catch {
      // Local check
    }
    
    setNewUspTitle("");
    setNewUspOurs("");
    setNewUspOthers("");
    setShowUspForm(false);
  };

  // Load custom USPs if exist
  useEffect(() => {
    async function fetchUsps() {
      try {
        const docRef = doc(db, "app_settings", "usps_data");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().list) {
          setUsps(docSnap.data().list);
        }
      } catch {}
    }
    fetchUsps();
  }, []);

  // ==========================================
  // SECTION 3: ÜYELİK VE PARA YATIRMA (SANDBOX)
  // ==========================================
  const [walletBalance, setWalletBalance] = useState<number>(25000);
  const [activeTier, setActiveTier] = useState<"standard" | "pro" | "unicorn">("standard");
  const [depositAmount, setDepositAmount] = useState<string>("5000");
  const [depositing, setDepositing] = useState(false);
  
  // Credit Card Form input states
  const [cardHolder, setCardHolder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  useEffect(() => {
    async function fetchWallet() {
      try {
        const docRef = doc(db, "app_settings", "user_wallet");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (typeof data.balance === "number") setWalletBalance(data.balance);
          if (data.activeTier) setActiveTier(data.activeTier);
        }
      } catch {}
    }
    fetchWallet();
  }, []);

  const handleDepositMoney = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Lütfen geçerli bir tutar girin.");
      return;
    }
    setDepositing(true);
    
    // Simulate payment bank delay
    setTimeout(async () => {
      const newBalance = walletBalance + amount;
      setWalletBalance(newBalance);
      
      try {
        await setDoc(doc(db, "app_settings", "user_wallet"), {
          balance: newBalance,
          activeTier,
          lastTransaction: {
            type: "deposit",
            amount,
            timestamp: Date.now()
          }
        });
      } catch {}

      triggerNotification(`${amount.toLocaleString("tr-TR")} TL sanal bakiye hesabınıza başarıyla yatırıldı!`, "success");
      setDepositAmount("5000");
      setCardHolder("");
      setCardNumber("");
      setCardExpiry("");
      setCardCvv("");
      setDepositing(false);
    }, 1500);
  };

  const handleUpgradeTier = async (tier: "standard" | "pro" | "unicorn", cost: number) => {
    if (cost > walletBalance) {
      alert(`Bakiye yetersiz! Bu paket için hesabınızda en az ${cost.toLocaleString("tr-TR")} TL olmalıdır. Lütfen yukarıdan bakiye yükleyin.`);
      return;
    }
    
    if (confirm(`Bu pakete geçiş yapmak istiyor musunuz? Hesabınızdan ${cost.toLocaleString("tr-TR")} TL tahsil edilecektir.`)) {
      const newBal = walletBalance - cost;
      setWalletBalance(newBal);
      setActiveTier(tier);
      try {
        await setDoc(doc(db, "app_settings", "user_wallet"), {
          balance: newBal,
          activeTier: tier,
          updatedAt: Date.now()
        });
      } catch {}
      triggerNotification(`Tebrikler! Üyeliğiniz "${tier.toUpperCase()}" seviyesine yükseltildi.`, "success");
    }
  };

  // ==========================================
  // SECTION 4: SUNUM (PITCH DECK - SLIDER)
  // ==========================================
  const REAL_PITCH_DECK_SLIDES = [
    {
      slideNumber: 1,
      badge: "GİRİŞ",
      title: "StajYerim",
      tagline: "Lise Gelişim ve 1 Haftalık Deneme Stajı Platformu",
      description: "Lise öğrencilerinin meslekleri erken yaşta deneyimlemesini sağlayan, yapay zeka destekli staj eşleştirme platformu.",
      tags: ["SOSYAL İNOVASYON", "YAPAY ZEKA DESTEKLİ", "TÜRKİYE ODAKLI"],
      visualType: "hero_illustration"
    },
    {
      slideNumber: 2,
      badge: "SORUN",
      title: "Gençlik Neden Kararsız?",
      description: "Öğrenciler hayatlarını şekillendirecek kararı, kendilerini tanımadan vermek zorunda kalıyor.",
      points: [
        {
          title: "Kararsızlık ve Baskı",
          text: "Puan odaklı sistem, gençleri popüler sektörlere iterek karakterine uymayan tercihlere yönlendiriyor."
        },
        {
          title: "Bilgi Eksikliği",
          text: "Meslekler dizilerden veya kulaktan dolma bilgilerle tanınıyor; işin gerçek yüzü gizli kalıyor."
        },
        {
          title: "Deneyim Engeli",
          text: "Lise öğrencilerine staj kapıları kapalı; yalnızca çevresi olanlar fırsat bulabiliyor."
        }
      ],
      visualType: "problem_layout"
    },
    {
      slideNumber: 3,
      badge: "TOPLUMSAL ETKİ",
      title: "Çözülmezse Ne Olur?",
      points: [
        {
          title: "Yanlış Tercih",
          text: "Binlerce öğrenci bölüm değiştiriyor veya okulu bırakıyor."
        },
        {
          title: "Niteliksiz İş Gücü",
          text: "Mesleğini sevmeyen çalışanlar verimliliği düşürüyor, toplumsal mutsuzluğu artırıyor."
        },
        {
          title: "Kaynak İsrafı",
          text: "Ailelerin ve devletin eğitim yatırımları boşa gidiyor."
        }
      ],
      visualType: "impact_warning"
    },
    {
      slideNumber: 4,
      badge: "ÇÖZÜM",
      title: "StajYerim Platformu",
      description: "Kronikleşmiş soruna pratik ve teknolojik bir köprü. Lise öğrencileri ile şirketleri güvenli, dijital bir ekosistemde buluşturuyor.",
      points: [
        {
          title: "Erişim Eşitliği",
          text: "Torpil zorunluluğunu ortadan kaldırır."
        },
        {
          title: "Erken Rol Model",
          text: "Meslekler bizzat deneyimlenir."
        },
        {
          title: "AI Eşleştirme",
          text: "Gemini ile kişiselleştirilmiş yönlendirme."
        }
      ],
      visualType: "solution_layout"
    },
    {
      slideNumber: 5,
      badge: "PLATFORM",
      title: "Nasıl Çalışır?",
      description: "Öğrenci profilini oluşturduğu anda yapay zeka devreye girer; ilgi alanları, okul bilgileri ve biyografi analiz edilerek en uygun staj ilanlarıyla eşleştirilir. Şirketler ilan yayınladığında ise sistem en uygun adayları otomatik olarak şirket paneline taşır.",
      steps: [
        "Profil Oluştur",
        "Vektör Eşleştirme",
        "İlan Önerileri",
        "Başvur & Deneyim"
      ],
      visualType: "workflow"
    },
    {
      slideNumber: 6,
      badge: "REKABET",
      title: "Rakip Analizi",
      description: "Türkiye'de lise öğrencilerine özel staj platformu bulunmuyor. Mevcut çözümler ya yalnızca üniversite öğrencilerine hitap ediyor ya da Türkiye pazarında aktif değil.",
      highlight: "StajYerim farkı: Yalnızca lise öğrencilerine odaklanan, Türkiye'de faaliyet gösteren ve özel sektörü kapsayan tek platform.",
      table: [
        { name: "İŞKUR", audience: "Lise+Üniversite", privateSector: "Hayır", turkey: "Evet" },
        { name: "Kariyer Kapısı", audience: "Yalnızca Üniversite", privateSector: "Evet", turkey: "Evet" },
        { name: "Yetenek Kapısı", audience: "Yalnızca Üniversite", privateSector: "Evet", turkey: "Evet" },
        { name: "Internshala", audience: "Genel Öğrenci", privateSector: "Evet", turkey: "Hayır" },
        { name: "Ladder Internships", audience: "Lise", privateSector: "Evet", turkey: "Hayır" },
        { name: "StajYerim", audience: "Yalnızca Lise", privateSector: "Evet", turkey: "Evet", highlight: true }
      ],
      visualType: "comparison_matrix"
    },
    {
      slideNumber: 7,
      badge: "TEKNOLOJİ",
      title: "Yapay Zeka Mimarisi",
      subtitle: "Çift Katmanlı AI Motoru",
      points: [
        {
          title: "Eşleştirme",
          text: "OpenAI text-embedding-3-small modeli, öğrenci profili ve ilan metnini 1536 boyutlu vektöre çevirir. pgvector ile PostgreSQL'de saklanır ve karşılaştırılır."
        },
        {
          title: "Doğal Dil",
          text: "Claude Sonnet 4.6, 'Neden uygun?' açıklamalarını, CV önerilerini ve ön yazı taslaklarını Türkçe üretir."
        },
        {
          title: "Dinamik Güncelleme",
          text: "Profil veya ilan güncellendiğinde vektörler otomatik yenilenir; öneriler her zaman güncel kalır."
        }
      ],
      visualType: "ai_architecture"
    },
    {
      slideNumber: 8,
      badge: "İŞ MODELİ",
      title: "Ücretlendirme Planları",
      table: {
        headers: ["Özellik", "Ücretsiz", "Pro — 999 ₺/ay", "Kurumsal — 4.999 ₺/ay"],
        rows: [
          ["Aylık ilan hakkı", "1", "Sınırsız", "Sınırsız"],
          ["Başvuru görüntüleme", "20'ye kadar", "Sınırsız", "Sınırsız"],
          ["Aday filtreleme & öncelikli sıralama", "—", "✓", "✓"],
          ["İstatistik ekranı", "—", "✓", "✓"],
          ["Çok şubeli yapı & İK paneli", "—", "—", "✓"],
          ["Kurumsal raporlama", "—", "—", "✓"]
        ]
      },
      highlight: "Başarılı Eşleşme Ücreti: İlan ücretsiz yayınlanır, stajyer kabul edilince 500 ₺ ödenir. Şirketler yalnızca sonuç için ödeme yapar.",
      visualType: "pricing_model"
    },
    {
      slideNumber: 9,
      badge: "TEKNOLOJİ YIĞINI",
      title: "Teknoloji Yığını & Veri Modeli",
      techStack: [
        { category: "Frontend", tech: "Next.js + React + Tailwind CSS" },
        { category: "Backend", tech: "Node.js + Express" },
        { category: "Veritabanı", tech: "PostgreSQL + pgvector" },
        { category: "AI", tech: "OpenAI embeddings + Claude Sonnet 4.6" },
        { category: "Deploy", tech: "Vercel + Railway / Supabase" }
      ],
      schema: {
        title: "Temel Veri Tabanı Şeması",
        tables: ["Öğrenciler tablosu", "Şirketler tablosu", "İlanlar tablosu", "Başvurular tablosu"]
      },
      visualType: "tech_stack"
    },
    {
      slideNumber: 10,
      badge: "VİZYON",
      title: "Geleceği Birlikte İnşa Edelim",
      description: "StajYerim yalnızca bir yazılım değil; gençlerin geleceğini kurtaracak ve şirketlerin yetenek havuzunu bugünden inşa etmesini sağlayacak sosyal bir inovasyon.",
      ctas: ["Canlı Demo (Platformu Hemen Keşfedin)", "Şirket Olun (İlan Yayınlamaya Başlayın)", "İletişim (Ortaklık İçin Yazın)"],
      visualType: "vision_outro"
    }
  ];

  const [slides, setSlides] = useState(REAL_PITCH_DECK_SLIDES);
  const [activeSlide, setActiveSlide] = useState(0);
  const [editingSlide, setEditingSlide] = useState(false);
  const [slideEditTitle, setSlideEditTitle] = useState("");
  const [slideEditDesc, setSlideEditDesc] = useState("");
  const [showFullscreenPresentation, setShowFullscreenPresentation] = useState(false);

  useEffect(() => {
    // Keep real slides as the source of truth
    setSlides(REAL_PITCH_DECK_SLIDES);
  }, []);

  const handleStartEditSlide = () => {
    // Disabled / Read-only for default presentations
    triggerNotification("Resmi sunum slaytları salt okunurdur.", "success");
  };

  const handleSaveSlideChanges = async () => {
    // Saved mock
    setEditingSlide(false);
  };


  // ==========================================
  // SECTION 5: GÖRSELLER (PROJECT MOODBOARD)
  // ==========================================
  const INITIAL_IMAGES = [
    { id: "img1", name: "Modern Ofis & Beyin Fırtınası", url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=400&q=80", tag: "Tasarım" },
    { id: "img2", name: "Startup Ekip Sinerjisi Çalışması", url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&q=80", tag: "Ekip" },
    { id: "img3", name: "Yapay Zeka Destekli Kodlama", url: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=400&q=80", tag: "Kodlama" }
  ];
  const [images, setImages] = useState(INITIAL_IMAGES);
  const [newImageName, setNewImageName] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newImageTag, setNewImageTag] = useState("Ekip");
  const [showImageForm, setShowImageForm] = useState(false);

  useEffect(() => {
    async function fetchMoodboard() {
      try {
        const docRef = doc(db, "app_settings", "moodboard_images");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().images) {
          setImages(docSnap.data().images);
        }
      } catch {}
    }
    fetchMoodboard();
  }, []);

  const handleAddImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImageName.trim() || !newImageUrl.trim()) return;
    const newImg = {
      id: String(Date.now()),
      name: newImageName.trim(),
      url: newImageUrl.trim(),
      tag: newImageTag
    };
    const updated = [...images, newImg];
    setImages(updated);
    try {
      await setDoc(doc(db, "app_settings", "moodboard_images"), { images: updated });
      triggerNotification("Görsel başarıyla eklendi.", "success");
    } catch {}
    setNewImageName("");
    setNewImageUrl("");
    setShowImageForm(false);
  };

  const handleDeleteImage = async (id: string) => {
    if (!confirm("Bu görseli moodboarddan kaldırmak istediğinize emin misiniz?")) return;
    const updated = images.filter((i) => i.id !== id);
    setImages(updated);
    try {
      await setDoc(doc(db, "app_settings", "moodboard_images"), { images: updated });
      triggerNotification("Görsel kaldırıldı.", "deleted");
    } catch {}
  };


  // ==========================================
  // SECTION 6: TAKIM ROL ATAMALARI (COMPACT EMBED)
  // ==========================================
  const [loadingRoles, setLoadingRoles] = useState<boolean>(true);
  const [roles, setRoles] = useState<TeamRoleAssignment[]>([]);
  const [selectedRole, setSelectedRole] = useState<TeamRoleAssignment | null>(null);
  const [rolesSearch, setRolesSearch] = useState<string>("");
  const [showRoleForm, setShowRoleForm] = useState<boolean>(false);
  const [savingRole, setSavingRole] = useState<boolean>(false);
  
  // Role Details edit parameters
  const [rFormName, setRFormName] = useState<string>("");
  const [rFormEmail, setRFormEmail] = useState<string>("");
  const [rFormGrade, setRFormGrade] = useState<string>("11. Sınıf");
  const [rFormNotes, setRFormNotes] = useState<string>("");
  const [rFormStatus, setRFormStatus] = useState<"active" | "support" | "none">("active");

  useEffect(() => {
    async function fetchTeamRoles() {
      setLoadingRoles(true);
      try {
        const querySnapshot = await getDocs(collection(db, "team_roles"));
        const dbRolesMap: { [key: string]: Partial<TeamRoleAssignment> } = {};
        
        querySnapshot.forEach((doc) => {
          dbRolesMap[doc.id] = doc.data() as Partial<TeamRoleAssignment>;
        });

        const forcedNames: Record<string, string> = {
          pitch_relations: "Raşit Yavuz",
          prototype_developer: "İsmet Naci Öztürk",
          content_designer: "Aleyna Türkmen",
          brand_designer: "Aziz Pusat",
          prompt_engineer: "Ömer Durucan",
          ai_architect: "İbrahim Güngör",
          business_modeler: "İsmet Naci",
          researcher: "Ömer Durucan",
          problem_analyst: "Raşit Yavuz"
        };

        const mergedRoles: TeamRoleAssignment[] = DEFAULT_ROLES.map((def) => {
          const dbData = dbRolesMap[def.id];
          const forcedName = forcedNames[def.id] || "";
          return {
            id: def.id,
            roleName: def.roleName,
            description: def.description,
            assignedName: forcedName || dbData?.assignedName || "",
            assignedEmail: dbData?.assignedEmail || "",
            assignedGrade: dbData?.assignedGrade || "11. Sınıf",
            notes: dbData?.notes || "",
            status: forcedName ? "active" : (dbData?.status || "none"),
            updatedAt: dbData?.updatedAt || Date.now()
          };
        });

        setRoles(mergedRoles);
      } catch (error) {
        // Safe offline simulation
        const forcedNames: Record<string, string> = {
          pitch_relations: "Raşit Yavuz",
          prototype_developer: "İsmet Naci Öztürk",
          content_designer: "Aleyna Türkmen",
          brand_designer: "Aziz Pusat",
          prompt_engineer: "Ömer Durucan",
          ai_architect: "İbrahim Güngör",
          business_modeler: "İsmet Naci",
          researcher: "Ömer Durucan",
          problem_analyst: "Raşit Yavuz"
        };
        setRoles(DEFAULT_ROLES.map((d) => ({
          id: d.id,
          roleName: d.roleName,
          description: d.description,
          assignedName: forcedNames[d.id] || "",
          assignedEmail: "",
          assignedGrade: "11. Sınıf",
          notes: "",
          status: forcedNames[d.id] ? "active" : "none",
          updatedAt: Date.now()
        })));
      } finally {
        setLoadingRoles(false);
      }
    }
    fetchTeamRoles();
  }, []);

  const handleEditRole = (role: TeamRoleAssignment) => {
    setSelectedRole(role);
    setRFormName(role.assignedName);
    setRFormEmail(role.assignedEmail || "");
    setRFormGrade(role.assignedGrade || "11. Sınıf");
    setRFormNotes(role.notes || "");
    setRFormStatus(role.status === "none" ? "active" : role.status);
    setShowRoleForm(true);
  };

  const handleQuickAssignRoleMock = () => {
    const randomName = POPULAR_STUDENTS[Math.floor(Math.random() * POPULAR_STUDENTS.length)];
    setRFormName(randomName);
    setRFormEmail("");
    setRFormGrade("11. Sınıf");
    setRFormStatus("active");
    setRFormNotes("");
  };

  const handleClearRoleAssignment = async (roleId: string) => {
    if (!confirm("Bu görevin atamasını silmek istediğinizden emin misiniz?")) return;
    setSavingRole(true);
    try {
      await deleteDoc(doc(db, "team_roles", roleId));
      setRoles(prev => prev.map(r => r.id === roleId ? {
        ...r, assignedName: "", assignedEmail: "", notes: "", status: "none", updatedAt: Date.now()
      } : r));
      triggerNotification("Rol ataması temizlendi.", "deleted");
      setShowRoleForm(false);
      setSelectedRole(null);
    } catch {
      alert("Hata oluştu.");
    } finally {
      setSavingRole(false);
    }
  };

  const handleSaveRoleAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole || !rFormName.trim()) return;
    setSavingRole(true);

    const data: Partial<TeamRoleAssignment> = {
      id: selectedRole.id,
      roleName: selectedRole.roleName,
      assignedName: rFormName.trim(),
      assignedEmail: "",
      assignedGrade: "11. Sınıf",
      notes: "",
      status: "active",
      updatedAt: Date.now()
    };

    try {
      await setDoc(doc(db, "team_roles", selectedRole.id), data);
      setRoles(prev => prev.map(r => r.id === selectedRole.id ? { ...r, ...data } as TeamRoleAssignment : r));
      triggerNotification(`"${selectedRole.roleName}" başarıyla kaydedildi!`, "success");
      setShowRoleForm(false);
      setSelectedRole(null);
    } catch {
      alert("Kaydedilirken hata oluştu.");
    } finally {
      setSavingRole(false);
    }
  };

  const activeRolesCount = roles.filter(r => r.status !== "none" && r.assignedName.trim() !== "").length;


  // ==========================================
  // SECTION 7: SOSYAL MEDYA İÇERİKLERİ
  // ==========================================
  const INITIAL_POSTS = [
    { id: "p1", platform: "LinkedIn", title: "1 Haftalık Simülasyon Mezuniyeti", content: "Harika bir haberi paylaşmak istiyoruz! Liseli girişimcilerimiz Atölye Piksel 1 haftalık hızlandırılmış staj programımızda kendi fikirlerini pazar analizinden çalışan prototipe kadar taşıdılar. Geleceğin unicorn kurucularını tebrik ederiz! 🚀🎓 #Girişimcilik #LiseStajı #YapayZeka", date: "Şimdi Paylaşıldı" },
    { id: "p2", platform: "Instagram", title: "Ekip Sinerjisi ve Mentorluk", content: "Sorunları bul, çözümleri tasarla ve ekibini kur! Startup sürecimiz tüm hızıyla devam ediyor. Yapay zeka mimarımız, prompt mühendislerimiz ve marka tasarımcılarımız iş başında! 💡🎨 #AtölyePiksel #LiseGirişimciliği #Inovasyon", date: "1 Gün Önce" }
  ];
  const [socialPosts, setSocialPosts] = useState(INITIAL_POSTS);
  const [newPostPlatform, setNewPostPlatform] = useState("LinkedIn");
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [showPostForm, setShowPostForm] = useState(false);

  useEffect(() => {
    async function fetchSocialPosts() {
      try {
        const docRef = doc(db, "app_settings", "social_media_posts");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().posts) {
          setSocialPosts(docSnap.data().posts);
        }
      } catch {}
    }
    fetchSocialPosts();
  }, []);

  const handleAddSocialPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostContent.trim()) return;
    const newPost = {
      id: String(Date.now()),
      platform: newPostPlatform,
      title: newPostTitle.trim(),
      content: newPostContent.trim(),
      date: "Yazıldı"
    };
    const updated = [newPost, ...socialPosts];
    setSocialPosts(updated);
    try {
      await setDoc(doc(db, "app_settings", "social_media_posts"), { posts: updated });
      triggerNotification("Sosyal medya içeriği taslağı kaydedildi.", "success");
    } catch {}
    setNewPostTitle("");
    setNewPostContent("");
    setShowPostForm(false);
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm("Bu gönderi taslağını silmek istediğinize emin misiniz?")) return;
    const updated = socialPosts.filter(p => p.id !== id);
    setSocialPosts(updated);
    try {
      await setDoc(doc(db, "app_settings", "social_media_posts"), { posts: updated });
      triggerNotification("Gönderi taslağı silindi.", "deleted");
    } catch {}
  };


  // --- Render Layout helper ---
  const AccordionHeader = ({ 
    title, 
    icon: IconElem, 
    isOpen, 
    onClick, 
    badgeText, 
    badgeColor = "bg-indigo-50 text-indigo-700" 
  }: { 
    title: string; 
    icon: any; 
    isOpen: boolean; 
    onClick: () => void; 
    badgeText?: string | number; 
    badgeColor?: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50/80 text-left transition duration-200 border-b border-gray-100 ${
        isOpen ? "bg-slate-50/50" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-xl bg-gray-50 text-gray-700`}>
          <IconElem className="h-4.5 w-4.5" />
        </div>
        <div>
          <span className="text-xs font-bold text-gray-900 block tracking-tight uppercase">{title}</span>
          <span className="text-[10px] text-gray-400 font-semibold">{isOpen ? "Tıklayıp Kapat" : "Tıklayıp Aç"}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {badgeText && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border border-gray-100 ${badgeColor}`}>
            {badgeText}
          </span>
        )}
        <ChevronRight className={`h-4 w-4 text-gray-400 transition-transform duration-255 ${isOpen ? "rotate-90 text-indigo-650" : ""}`} />
      </div>
    </button>
  );

  return (
    <div className="space-y-4" id="left-sidebar-features-container">
      
      {/* Dynamic Alerts inside sidebar */}
      {notification.message && (
        <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold border transition-all duration-300 ${
          notification.type === "success" 
            ? "bg-emerald-50 text-emerald-800 border-emerald-250 animate-bounce" 
            : "bg-amber-50 text-amber-800 border-amber-250 animate-pulse"
        }`}>
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
          <span>{notification.message}</span>
        </div>
      )}

      {/* Corporate Identity Card widget */}
      <div className="bg-linear-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-5 shadow-md border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-3 -translate-y-3 opacity-15">
          <Rocket className="h-28 w-28" />
        </div>
        <div className="relative space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-400/30 uppercase tracking-widest rounded-md">
            🚀 Atölye Piksel A.Ş
          </div>
          <h2 className="text-sm font-black tracking-tight leading-snug uppercase">
            StajYerim Lise Girişim
          </h2>
          <p className="text-[10px] text-indigo-150 font-medium leading-relaxed">
            1 Haftalık Kurumsal Deneme Stajı Modülü
          </p>
          
          <div className="pt-2 flex items-center justify-between border-t border-indigo-850 text-[10px] font-bold text-indigo-200">
            <span>Sanal Bakiye:</span>
            <span className="text-emerald-400 font-extrabold text-xs">
              {walletBalance.toLocaleString("tr-TR")} TL
            </span>
          </div>
        </div>
      </div>

      {/* MAIN ACCORDIONS LIST */}
      <div className="bg-white rounded-2xl border border-gray-250/90 shadow-xs overflow-hidden divide-y divide-gray-150">
        
        {/* ==========================================
            ACCORDION 1: VİZYON VE MİSYONUMUZ
           ========================================== */}
        <div>
          <AccordionHeader 
            title="Vizyon & Misyonumuz" 
            icon={Compass} 
            isOpen={openSections.vision_mission} 
            onClick={() => toggleSection("vision_mission")}
            badgeText="Kurumsal"
            badgeColor="bg-slate-100 text-slate-700"
          />
          {openSections.vision_mission && (
            <div className="p-4 bg-slate-50/50 space-y-3 animate-in fade-in-15 duration-150">
              {editingVM ? (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Vizyon Bildirimi</label>
                    <textarea 
                      value={vision}
                      onChange={(e) => setVision(e.target.value)}
                      rows={2}
                      className="w-full text-xs p-2 rounded-xl border border-gray-250 bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Misyon Bildirimi</label>
                    <textarea 
                      value={mission}
                      onChange={(e) => setMission(e.target.value)}
                      rows={3}
                      className="w-full text-xs p-2 rounded-xl border border-gray-250 bg-white"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button 
                      onClick={() => setEditingVM(false)}
                      className="px-2.5 py-1 text-[10px] font-bold uppercase bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      Vazgeç
                    </button>
                    <button 
                      onClick={handleSaveVisionMission}
                      className="px-3 py-1 text-[10px] font-bold uppercase bg-indigo-650 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-1"
                    >
                      {savingVM ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}
                      Kaydet
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-white border border-gray-150 rounded-xl space-y-1">
                    <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">Gelecek Vizyonu</span>
                    <p className="text-gray-700 font-semibold leading-relaxed">"{vision}"</p>
                  </div>
                  <div className="p-3 bg-white border border-gray-150 rounded-xl space-y-1">
                    <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Çalışma Misyonu</span>
                    <p className="text-gray-700 font-semibold leading-relaxed">"{mission}"</p>
                  </div>
                  <button 
                    onClick={() => setEditingVM(true)}
                    className="w-full py-1.5 text-center text-[11px] font-bold border border-dashed border-gray-300 hover:border-indigo-400 bg-white hover:bg-indigo-50/50 text-indigo-650 rounded-xl transition"
                  >
                    📝 Vizyon & Misyonu Düzenle
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ==========================================
            ACCORDION 2: DİĞER ŞİRKETLERDEN FARKIMIZ
           ========================================== */}
        <div>
          <AccordionHeader 
            title="Şirketlerden Farkımız" 
            icon={Layers} 
            isOpen={openSections.differentiation} 
            onClick={() => toggleSection("differentiation")}
            badgeText={`${usps.length} Fark`}
            badgeColor="bg-amber-50 text-amber-700"
          />
          {openSections.differentiation && (
            <div className="p-4 bg-slate-50/50 space-y-3 animate-in fade-in-15">
              <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">
                Neden biz? Kıyaslama Tablosu
              </span>

              <div className="space-y-3">
                {usps.map((usp, index) => (
                  <div key={usp.id || index} className="p-3 bg-white border border-gray-150 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-900">{index + 1}. {usp.title}</span>
                      <span className="text-[9px] px-1.5 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded-md">USP</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px] leading-relaxed">
                      <div className="bg-emerald-50/45 p-2 rounded-lg border border-emerald-100/50">
                        <span className="font-extrabold text-emerald-800 block">✨ Atölye Piksel'de:</span>
                        <p className="text-gray-650 font-semibold">{usp.ours}</p>
                      </div>
                      <div className="bg-rose-50/45 p-2 rounded-lg border border-rose-100/50">
                        <span className="font-extrabold text-rose-800 block">❌ Diğer Yerlerde:</span>
                        <p className="text-gray-650">{usp.others}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {showUspForm ? (
                <form onSubmit={handleAddUsp} className="bg-white border border-gray-200 p-3 rounded-xl space-y-2">
                  <div className="space-y-1">
                    <input 
                      type="text" 
                      placeholder="Fark Başlığı (örn: Mentörlük Oranı)" 
                      required
                      value={newUspTitle}
                      onChange={(e) => setNewUspTitle(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-gray-200 bg-gray-50/30"
                    />
                  </div>
                  <div className="space-y-1">
                    <textarea 
                      placeholder="Atölye Piksel'de sunulan çözüm..." 
                      required
                      rows={2}
                      value={newUspOurs}
                      onChange={(e) => setNewUspOurs(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-gray-200 bg-gray-50/30"
                    />
                  </div>
                  <div className="space-y-1">
                    <textarea 
                      placeholder="Diğer şirketlerdeki eksiklik..." 
                      rows={2}
                      value={newUspOthers}
                      onChange={(e) => setNewUspOthers(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-gray-200 bg-gray-50/30"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button 
                      type="button"
                      onClick={() => setShowUspForm(false)}
                      className="px-2 py-1 text-[10px] font-bold bg-gray-100 rounded-lg"
                    >
                      İptal
                    </button>
                    <button 
                      type="submit"
                      className="px-3 py-1 text-[10px] font-bold bg-indigo-650 text-white rounded-lg hover:bg-indigo-700"
                    >
                      Fark Maddesi Ekle
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowUspForm(true)}
                  className="w-full py-2 bg-indigo-50 border border-indigo-150 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  <Plus className="h-4 w-4" /> Yeni Fark Maddesi Ekle
                </button>
              )}
            </div>
          )}
        </div>

        {/* ==========================================
            ACCORDION 3: ÜYELİK VE PARA YATIRMA
           ========================================== */}
        <div>
          <AccordionHeader 
            title="Üyelik & Para Yatırma" 
            icon={CreditCard} 
            isOpen={openSections.membership} 
            onClick={() => toggleSection("membership")}
            badgeText={activeTier.toUpperCase()}
            badgeColor="bg-sky-50 text-sky-700 border-sky-200"
          />
          {openSections.membership && (
            <div className="p-4 bg-slate-50/50 space-y-4 animate-in fade-in-15">
              
              {/* Virtual Wallet Deposit segment */}
              <div className="bg-white p-3.5 border border-gray-220 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1">
                    💳 Sanal Para Yatırma (Girişim Sermayesi)
                  </span>
                  <Award className="h-4 w-4 text-emerald-500 animate-bounce" />
                </div>
                
                <form onSubmit={handleDepositMoney} className="space-y-2.5 pt-1">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-gray-500 uppercase">Yatırılacak Tutar (TL)</label>
                      <input 
                        type="number" 
                        required
                        min="100"
                        max="100000"
                        placeholder="Örn: 5000"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        className="w-full text-xs p-2 rounded-lg border border-gray-250 bg-gray-55/10 font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-gray-500 uppercase">Kart Sahibi</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Ad Soyat"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        className="w-full text-xs p-2 rounded-lg border border-gray-250 bg-gray-55/10 font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-500 uppercase">Kredi Kartı Numarası</label>
                    <input 
                      type="text" 
                      required
                      placeholder="4355 •••• •••• 9822"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-gray-250 bg-gray-55/10 text-center tracking-widest font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-gray-500 uppercase">Son Kullanma (AA/YY)</label>
                      <input 
                        type="text" 
                        required
                        placeholder="07/28"
                        maxLength={5}
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full text-xs p-2 rounded-lg border border-gray-250 bg-gray-55/10 text-center"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-gray-500 uppercase">CVC Kodu</label>
                      <input 
                        type="password" 
                        required
                        placeholder="•••"
                        maxLength={3}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full text-xs p-2 rounded-lg border border-gray-250 bg-gray-55/10 text-center"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={depositing}
                    className="w-full py-2 shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                  >
                    {depositing ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Güvenli Banka Ağında İşleniyor...
                      </>
                    ) : (
                      <>
                        <DollarSign className="h-4 w-4" />
                        Sanal Ödemeyi Tamamla ve Yatır
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Membership Pricing Levels */}
              <div className="space-y-2 bg-white p-3 border border-gray-200 rounded-xl">
                <span className="text-[10px] font-extrabold text-gray-500 uppercase block tracking-wider">
                  ÜYELİK PAKETLERİMİZ (GİRİŞİM ORTAĞI)
                </span>
                
                {/* Standard package */}
                <div className={`p-2.5 rounded-lg border text-xs flex justify-between items-center transition ${
                  activeTier === "standard" ? "bg-indigo-50/50 border-indigo-300" : "bg-white border-gray-150"
                }`}>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-gray-900">Standard Ekip Giriş</span>
                      {activeTier === "standard" && <span className="text-[9px] px-1 bg-indigo-100 text-indigo-700 font-bold rounded">Aktif</span>}
                    </div>
                    <p className="text-[9px] text-gray-400">Klasik staj başvuruları ve asistan mentör erişimi.</p>
                  </div>
                  <span className="font-bold text-gray-500">Ücretsiz</span>
                </div>

                {/* Pro Builder */}
                <div className={`p-2.5 rounded-lg border text-xs flex justify-between items-center transition ${
                  activeTier === "pro" ? "bg-sky-50/50 border-sky-300" : "bg-white border-gray-150"
                }`}>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-gray-900">Pro Kurucu Paketi</span>
                      {activeTier === "pro" && <span className="text-[9px] px-1 bg-sky-100 text-sky-700 font-bold rounded">Aktif</span>}
                    </div>
                    <p className="text-[9px] text-gray-400">Ekstra 4 rol hakkı, sınırsız yapay zeka ve pitch deck mentörlüğü.</p>
                  </div>
                  {activeTier === "pro" ? (
                    <span className="text-[10px] text-sky-700 font-extrabold">Sahip Olundu</span>
                  ) : (
                    <button 
                      onClick={() => handleUpgradeTier("pro", 15000)}
                      className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-[10px]"
                    >
                      15.000 TL
                    </button>
                  )}
                </div>

                {/* Unicorn builder */}
                <div className={`p-2.5 rounded-lg border text-xs flex justify-between items-center transition ${
                  activeTier === "unicorn" ? "bg-rose-50/50 border-rose-300" : "bg-white border-gray-150"
                }`}>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-gray-900">Unicorn Elite Ortak</span>
                      {activeTier === "unicorn" && <span className="text-[9px] px-1 bg-rose-100 text-rose-700 font-bold rounded">Aktif</span>}
                    </div>
                    <p className="text-[9px] text-gray-400">Yatırımcılara doğrudan sunum garantisi, özel MVP geliştirici desteği.</p>
                  </div>
                  {activeTier === "unicorn" ? (
                    <span className="text-[10px] text-rose-700 font-extrabold">Sahip Olundu</span>
                  ) : (
                    <button 
                      onClick={() => handleUpgradeTier("unicorn", 30000)}
                      className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-[10px]"
                    >
                      30.000 TL
                    </button>
                  )}
                </div>
              </div>

            </div>
          )}
        </div>

        {/* ==========================================
            ACCORDION 4: SLAYTLAR / SUNUM (PITCH DECK)
           ========================================== */}
        <div>
          <AccordionHeader 
            title="Girişim Sunumu (Slaytlar)" 
            icon={TrendingUp} 
            isOpen={openSections.pitch_deck} 
            onClick={() => toggleSection("pitch_deck")}
            badgeText={`${activeSlide + 1} / ${slides.length}`}
            badgeColor="bg-sky-50 text-sky-700"
          />
          {openSections.pitch_deck && (() => {
            const currentSlide = slides[activeSlide] as any;
            return (
              <div className="p-4 bg-slate-50/50 space-y-3.5 animate-in fade-in-15">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">
                    StajYerim Resmi Yatırımcı Sunumu
                  </span>
                  <button
                    onClick={() => setShowFullscreenPresentation(true)}
                    className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-indigo-600 text-white rounded-lg hover:bg-indigo-755 transition flex items-center gap-1 shrink-0 cursor-pointer shadow-sm"
                  >
                    <Eye className="h-3 w-3" /> Sunumu Aç
                  </button>
                </div>

                {/* Mini Slide Render Panel */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md flex flex-col justify-between text-white select-none relative min-h-[190px]">
                  {/* Visualizer header */}
                  <div className="bg-slate-850 px-3 py-1.5 border-b border-slate-800 flex justify-between items-center text-[9px] font-mono text-slate-400">
                    <span className="px-1.5 py-0.5 rounded bg-indigo-505/10 text-indigo-400 font-extrabold uppercase border border-indigo-400/10">
                      Slayt {activeSlide + 1}: {currentSlide?.badge}
                    </span>
                    <span>Gamma Deck Player</span>
                  </div>

                  {/* Simulated slide display surface */}
                  <div className="p-3.5 space-y-2 font-sans overflow-hidden">
                    <h4 className="text-xs font-black tracking-tight text-white flex items-center gap-1">
                      <span className="text-indigo-400">●</span> {currentSlide?.title}
                    </h4>
                    {currentSlide?.tagline && (
                      <p className="text-[10px] text-indigo-250 italic font-semibold">{currentSlide?.tagline}</p>
                    )}
                    {currentSlide?.description && (
                      <p className="text-[10px] text-slate-300 leading-relaxed font-medium">
                        {currentSlide?.description}
                      </p>
                    )}

                    {/* Tiny layout previews based on type */}
                    {currentSlide?.visualType === "hero_illustration" && (
                      <div className="flex flex-wrap gap-1 mt-1 pb-1">
                        {currentSlide?.tags?.map((t: string, idx: number) => (
                          <span key={idx} className="text-[8px] px-1.5 py-0.5 rounded-full bg-indigo-950 text-indigo-300 font-black border border-indigo-500/10 uppercase">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}

                    {currentSlide?.points && (
                      <div className="space-y-1 pt-1">
                        {currentSlide.points.slice(0, 2).map((p: any, idx: number) => (
                          <div key={idx} className="text-[9px] leading-snug bg-slate-850/40 p-1.5 rounded border border-slate-800/50">
                            <strong className="text-indigo-300 font-extrabold">{p.title}:</strong>
                            <span className="text-slate-350 ml-1 block">{p.text}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {currentSlide?.steps && (
                      <div className="grid grid-cols-4 gap-1.5 mt-2 bg-slate-950 p-1.5 rounded border border-slate-800">
                        {currentSlide.steps.map((st: string, idx: number) => (
                          <div key={idx} className="text-center rounded bg-slate-850 p-1 text-[8px] font-black border border-indigo-500/10">
                            <div className="text-indigo-400 scale-90">0{idx + 1}</div>
                            <div className="text-[7px] text-slate-300 font-bold truncate">{st}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {currentSlide?.table && !currentSlide?.table.headers && (
                      <div className="space-y-0.5 mt-1.5 bg-slate-950 p-1 rounded border border-slate-850">
                        <div className="grid grid-cols-4 text-[7px] text-slate-400 font-bold border-b border-slate-800 pb-0.5 px-0.5">
                          <span>Platform</span>
                          <span>Kitle</span>
                          <span>Özel</span>
                          <span>TR</span>
                        </div>
                        {currentSlide.table.slice(0, 3).map((row: any, idx: number) => (
                          <div key={idx} className={`grid grid-cols-4 text-[7px] px-0.5 py-0.5 font-semibold ${row.highlight ? "bg-indigo-950 text-indigo-200" : "text-slate-300"}`}>
                            <span className="truncate">{row.name}</span>
                            <span className="truncate">{row.audience}</span>
                            <span>{row.privateSector}</span>
                            <span>{row.turkey}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Progress dot strip / controls footer */}
                  <div className="bg-slate-950 px-3 py-2 border-t border-slate-800 flex justify-between items-center text-[10px] font-bold">
                    {/* Miniature index dots */}
                    <div className="flex gap-1">
                      {slides.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveSlide(i)}
                          className={`h-1.5 w-1.5 rounded-full transition-all ${
                            activeSlide === i ? "bg-indigo-505 w-3 bg-indigo-500" : "bg-slate-705 bg-slate-700 hover:bg-slate-500"
                          }`}
                        />
                      ))}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        disabled={activeSlide === 0}
                        onClick={() => setActiveSlide(prev => prev - 1)}
                        className="p-1 px-2.5 rounded-md bg-slate-800/80 hover:bg-slate-700/80 text-white transition disabled:opacity-30 text-[9px]"
                      >
                        Geri
                      </button>
                      <button
                        disabled={activeSlide === slides.length - 1}
                        onClick={() => setActiveSlide(prev => prev + 1)}
                        className="p-1 px-2.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white transition disabled:opacity-30 text-[9px]"
                      >
                        İleri
                      </button>
                    </div>
                  </div>
                </div>

                {/* Big CTA for slide modal */}
                <button
                  onClick={() => setShowFullscreenPresentation(true)}
                  className="w-full py-2.5 rounded-xl border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-white hover:bg-indigo-50/20 text-indigo-650 transition font-extrabold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>🖥️ SUNUM DECK'İNİ TAM EKRAN AÇ VE SUN</span>
                </button>
              </div>
            );
          })()}
        </div>

        {/* ==========================================
            ACCORDION 5: GÖRSELLER (PROJECT MOODBOARD)
           ========================================== */}
        <div>
          <AccordionHeader 
            title="Moodboard & Görseller" 
            icon={ImageIcon} 
            isOpen={openSections.visuals} 
            onClick={() => toggleSection("visuals")}
            badgeText={`${images.length} Görsel`}
            badgeColor="bg-slate-50 text-slate-800"
          />
          {openSections.visuals && (
            <div className="p-4 bg-slate-50/50 space-y-3 animate-in fade-in-15">
              <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">
                Marka ve Görsel Kimlik Panosu
              </span>

              {/* Simple grid list of visual cards */}
              <div className="grid grid-cols-1 gap-2.5">
                {images.map((img) => (
                  <div key={img.id} className="bg-white rounded-xl border border-gray-150 p-2 relative group overflow-hidden">
                    <div className="flex gap-2.5 items-center">
                      <img 
                        src={img.url} 
                        alt={img.name} 
                        referrerPolicy="no-referrer"
                        className="h-14 w-18 object-cover rounded-lg shrink-0 border border-gray-100 bg-gray-100"
                        onError={(e) => {
                          // fallback
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=150&q=80";
                        }}
                      />
                      <div className="space-y-0.5 overflow-hidden">
                        <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                          {img.tag}
                        </span>
                        <h5 className="text-[11px] font-bold text-gray-900 truncate pr-4">{img.name}</h5>
                        <p className="text-[9px] text-gray-400 font-mono truncate">{img.url}</p>
                      </div>
                    </div>

                    {/* Delete button absolutely positioned */}
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(img.id)}
                      className="absolute right-2.5 top-2.5 opacity-0 group-hover:opacity-100 transition duration-150 p-1 bg-rose-50 hover:bg-rose-100 rounded text-rose-600"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>

              {showImageForm ? (
                <form onSubmit={handleAddImage} className="bg-white border border-gray-200 p-3 rounded-xl space-y-2">
                  <div className="space-y-1">
                    <input 
                      type="text" 
                      placeholder="Görsel Adı (örn: Logo Taslağımız)" 
                      required
                      value={newImageName}
                      onChange={(e) => setNewImageName(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-gray-200 bg-gray-50/30"
                    />
                  </div>
                  <div className="space-y-1">
                    <input 
                      type="url" 
                      placeholder="Görsel Link URL (https://...)" 
                      required
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-gray-200 bg-gray-50/30"
                    />
                  </div>
                  <div className="space-y-1">
                    <select 
                      value={newImageTag} 
                      onChange={(e) => setNewImageTag(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-gray-200 bg-white"
                    >
                      <option value="Logo">Logo / Marka</option>
                      <option value="Tasarım">Tasarım / Arayüz</option>
                      <option value="Ekip">Ekip / Kültür</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button 
                      type="button" 
                      onClick={() => setShowImageForm(false)}
                      className="px-2 py-1 text-[10px] font-bold bg-gray-100"
                    >
                      İptal
                    </button>
                    <button 
                      type="submit" 
                      className="px-3 py-1 text-[10px] font-bold bg-indigo-650 text-white rounded-lg hover:bg-indigo-700"
                    >
                      Ekle
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowImageForm(true)}
                  className="w-full py-1.5 border border-dashed border-gray-300 hover:border-indigo-450 bg-white hover:bg-indigo-50/50 text-indigo-700 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" /> Moodboarda Görsel Ekle
                </button>
              )}
            </div>
          )}
        </div>

        {/* ==========================================
            ACCORDION 6: TAKIM ROL ATAMALARI
           ========================================== */}
        <div>
          <AccordionHeader 
            title="Takım Rol Atamaları" 
            icon={Users} 
            isOpen={openSections.team_roles} 
            onClick={() => toggleSection("team_roles")}
            badgeText={`${activeRolesCount} / ${DEFAULT_ROLES.length}`}
            badgeColor="bg-indigo-50 text-indigo-700 border-indigo-150"
          />
          {openSections.team_roles && (
            <div className="p-4 bg-slate-50/50 space-y-3.5 animate-in fade-in-15">
              
              {/* Dynamic Progress indicator */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-extrabold text-gray-500">
                  <span>EKİP ROLÜ TAMAMLAMA ORANI</span>
                  <span className="text-indigo-650">
                    {Math.round((activeRolesCount / DEFAULT_ROLES.length) * 100)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden border border-gray-100">
                  <div 
                    className="h-full bg-indigo-600 transition-all duration-300"
                    style={{ width: `${(activeRolesCount / DEFAULT_ROLES.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Roles search field */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rol veya görevli arayın..."
                  value={rolesSearch}
                  onChange={(e) => setRolesSearch(e.target.value)}
                  className="w-full text-[11px] py-1.5 pl-8 pr-2.5 rounded-lg border border-gray-200 focus:outline-hidden bg-white"
                />
              </div>

              {/* List of roles */}
              {loadingRoles ? (
                <div className="flex flex-col items-center justify-center py-5 space-y-1">
                  <Loader2 className="h-5 w-5 text-indigo-600 animate-spin" />
                  <span className="text-[10px] text-gray-400">Yükleniyor...</span>
                </div>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {roles
                    .filter((r) => {
                      const str = `${r.roleName} ${r.assignedName}`.toLowerCase();
                      return str.includes(rolesSearch.toLowerCase());
                    })
                    .map((role) => {
                      const defDetails = DEFAULT_ROLES.find((d) => d.id === role.id) || DEFAULT_ROLES[0];
                      const IconComponent = defDetails.icon;
                      const hasAssignedName = role.status !== "none" && role.assignedName.trim() !== "";

                      return (
                        <div
                          key={role.id}
                          onClick={() => {
                            if (!hasAssignedName) {
                              handleEditRole(role);
                            }
                          }}
                          className={`p-2.5 rounded-lg border text-xs transition flex items-center justify-between bg-white ${
                            hasAssignedName 
                              ? "border-emerald-200 bg-emerald-50/20 cursor-default select-none" 
                              : "border-gray-150 hover:border-indigo-400 cursor-pointer"
                          }`}
                          title={hasAssignedName ? "Bu atama kalıcıdır ve değiştirilemez." : "Atamak için tıklayın"}
                        >
                          <div className="flex items-center gap-2 overflow-hidden mr-1">
                            <div className={`p-1 rounded bg-gray-50 border shrink-0 ${defDetails.color}`}>
                              <IconComponent className="h-3 w-3" />
                            </div>
                            <div className="overflow-hidden">
                              <span className="font-extrabold text-gray-900 block truncate">{role.roleName}</span>
                              {hasAssignedName ? (
                                <span className="text-[10px] text-emerald-850 font-extrabold tracking-wide truncate block">
                                  👤 {role.assignedName}
                                </span>
                              ) : (
                                <span className="text-[9px] text-gray-400 italic font-medium block">
                                  Atanmadı
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="shrink-0 flex items-center">
                            {hasAssignedName ? (
                              <div className="p-1 rounded bg-emerald-100/80 text-emerald-750 font-extrabold text-[9px] flex items-center gap-0.5" title="Kalıcı Atama">
                                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Kalıcı
                              </div>
                            ) : (
                              <div className="p-0.5 border border-transparent rounded bg-slate-50 hover:bg-indigo-50 text-indigo-650">
                                <Edit3 className="h-3 w-3" />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ==========================================
            ACCORDION 7: SOSYAL MEDYA İÇERİKLERİ
           ========================================== */}
        <div>
          <AccordionHeader 
            title="Sosyal Medya İçerikleri" 
            icon={Share2} 
            isOpen={openSections.social_posts} 
            onClick={() => toggleSection("social_posts")}
            badgeText={`${socialPosts.length} Gönderi`}
            badgeColor="bg-sky-50 text-sky-700"
          />
          {openSections.social_posts && (
            <div className="p-4 bg-slate-50/50 space-y-3 animate-in fade-in-15">
              <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">
                Ekip Sosyal Medya Taslak Yönetimi
              </span>

              {/* Social Media Content Grid list */}
              <div className="space-y-3">
                {socialPosts.map((post) => (
                  <div key={post.id} className="bg-white p-3 border border-gray-150 rounded-xl space-y-1.5 relative group">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1">
                        {post.platform === "LinkedIn" && <Linkedin className="h-3.5 w-3.5 text-blue-700" />}
                        {post.platform === "Instagram" && <Instagram className="h-3.5 w-3.5 text-pink-600" />}
                        {post.platform === "Twitter/X" && <Twitter className="h-3.5 w-3.5 text-slate-900" />}
                        <span className="text-[10px] font-black text-slate-800">{post.platform}</span>
                      </div>
                      <span className="text-[9px] text-gray-400">{post.date}</span>
                    </div>
                    <div className="space-y-0.5">
                      <h6 className="text-[11px] font-black leading-snug text-gray-900">{post.title}</h6>
                      <p className="text-[10px] text-gray-600 font-semibold leading-relaxed whitespace-pre-line">
                        {post.content}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeletePost(post.id)}
                      className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition p-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>

              {showPostForm ? (
                <form onSubmit={handleAddSocialPost} className="bg-white border border-gray-200 p-3 rounded-xl space-y-2">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-500 uppercase">Platform Seçimi</label>
                    <select 
                      value={newPostPlatform} 
                      onChange={(e) => setNewPostPlatform(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-gray-200 bg-white"
                    >
                      <option value="LinkedIn">LinkedIn</option>
                      <option value="Instagram">Instagram</option>
                      <option value="Twitter/X">Twitter / X</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <input 
                      type="text" 
                      placeholder="Gönderi Başlığı (örn: Haftalık Analiz)" 
                      required
                      value={newPostTitle}
                      onChange={(e) => setNewPostTitle(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-gray-200 bg-gray-55/40"
                    />
                  </div>
                  <div className="space-y-1">
                    <textarea 
                      placeholder="Gönderi gövde metni ve hashtagler..." 
                      required
                      rows={3}
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-gray-200 bg-gray-55/40"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button 
                      type="button" 
                      onClick={() => setShowPostForm(false)}
                      className="px-2 py-1 text-[10px] font-bold bg-gray-100"
                    >
                      İptal
                    </button>
                    <button 
                      type="submit" 
                      className="px-3 py-1 text-[10px] font-bold bg-indigo-650 text-white rounded-lg hover:bg-indigo-700"
                    >
                      Taslağı Ekle
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowPostForm(true)}
                  className="w-full py-1.5 border border-dashed border-gray-300 hover:border-indigo-400 bg-white hover:bg-slate-55/10 text-indigo-700 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" /> YeniGönderi Taslağı Ekle
                </button>
              )}
            </div>
          )}
        </div>

      </div>

      {/* =========================================================
          TAKIM ROL ATAMA MODAL GÖVDE PANELİ (COMPACT EMBED DIALOG)
         ========================================================= */}
      {showRoleForm && selectedRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-xs p-4 overflow-y-auto" id="role-assign-modal">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-gray-150 overflow-hidden animate-in fade-in-20 duration-200">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-100 bg-linear-to-r from-indigo-50 to-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 bg-indigo-650 text-white rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                  <UserPlus className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-gray-900 uppercase">Girişim Görevi Ekle/Güncelle</h4>
                  <p className="text-[10px] text-gray-500 font-bold">{selectedRole.roleName}</p>
                </div>
              </div>
              <button 
                onClick={() => { setShowRoleForm(false); setSelectedRole(null); }}
                className="p-1 text-gray-400 hover:text-gray-750 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form inputs */}
            <form onSubmit={handleSaveRoleAssignment} className="p-5 space-y-4">
              <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/50 text-[11px] leading-relaxed text-indigo-900">
                <span className="font-extrabold block">Rol Hedefimiz:</span>
                {selectedRole.description}
              </div>

              {/* Quick filler mock */}
              <div className="flex justify-between items-center bg-slate-50 p-2 rounded-xl text-[10px] border border-gray-100">
                <span className="text-gray-550 font-bold uppercase">Demo Test Aracılığı</span>
                <button
                  type="button"
                  onClick={handleQuickAssignRoleMock}
                  className="px-2 py-0.5 bg-white hover:bg-indigo-50 border rounded text-[10px] font-bold text-indigo-650 flex items-center gap-0.5 shadow-2xs"
                >
                  <Sparkles className="h-3 w-3" /> Rastgele Öğrenci Doldur
                </button>
              </div>

              {/* Name field is the only field requested */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 uppercase block tracking-wider">Görevli Öğrencinin Adı Soyadı *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Örn: Arda Güler"
                  value={rFormName}
                  onChange={(e) => setRFormName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-hidden font-bold"
                />
              </div>

              {/* Action buttons footer */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <div>
                  {selectedRole.status !== "none" && selectedRole.assignedName.trim() !== "" ? (
                    <button
                      type="button"
                      onClick={() => handleClearRoleAssignment(selectedRole.id)}
                      className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] rounded-xl font-bold border border-rose-100 transition shadow-2xs"
                    >
                      Kaldır
                    </button>
                  ) : <div />}
                </div>

                <div className="flex items-center gap-1.5">
                  <button 
                    type="button" 
                    onClick={() => { setShowRoleForm(false); setSelectedRole(null); }}
                    className="px-3 py-1.5 bg-gray-100 text-gray-600 font-bold rounded-xl text-xs"
                  >
                    İptal
                  </button>
                  <button 
                    type="submit" 
                    disabled={savingRole}
                    className="px-4.5 py-1.5 bg-indigo-650 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow-2xs cursor-pointer"
                  >
                    {savingRole ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : "Atama Yap"}
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* FULLSCREEN PITCH DECK PRESENTATION MODAL OVERLAY */}
      {showFullscreenPresentation && (
        <div className="fixed inset-0 z-1000 bg-slate-950/98 text-slate-100 flex flex-col font-sans select-none animate-in fade-in duration-200">
          
          {/* Deck Top Bar */}
          <header className="h-14 border-b border-slate-800 bg-slate-900/85 px-6 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-1 rounded-lg bg-indigo-650/20 border border-indigo-500/30 text-indigo-400">
                <Rocket className="h-4.5 w-4.5" />
              </div>
              <div>
                <span className="text-sm font-extrabold text-white tracking-widest uppercase">StajYerim</span>
                <span className="text-xs text-slate-400 ml-2 hidden sm:inline border-l border-slate-800 pl-2">Yatırımcı İlişkileri & Girişim Sunumu</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 font-bold bg-slate-800/60 px-2.5 py-1 rounded-full">
                Slayt {activeSlide + 1} / {slides.length}
              </span>
              <button
                onClick={() => setShowFullscreenPresentation(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 hover:text-rose-200 text-slate-350 border border-slate-700 transition cursor-pointer"
                title="Sunumu Kapat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </header>

          {/* Main Workspace Frame */}
          <div className="flex-1 flex overflow-hidden">
            
            {/* Left side panel: Slide Selector List (with clickable thumbnail item templates) */}
            <aside className="w-64 border-r border-slate-800 bg-slate-900/40 p-4 overflow-y-auto shrink-0 hidden md:block space-y-2">
              <span className="text-[10px] text-slate-455 font-black tracking-wider uppercase block mb-3 pl-1">Slayt Kılavuzu</span>
              
              <div className="space-y-1.5">
                {slides.map((s, idx) => (
                  <button
                    key={s.slideNumber}
                    onClick={() => setActiveSlide(idx)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all flex gap-2.5 items-center cursor-pointer ${
                      activeSlide === idx
                        ? "bg-indigo-650/20 border-indigo-505 text-white shadow-xs"
                        : "bg-transparent border-transparent text-slate-400 hover:bg-slate-850 hover:text-slate-200"
                    }`}
                  >
                    <span className={`text-[10px] w-5 h-5 rounded-md flex items-center justify-center font-extrabold shrink-0 ${
                      activeSlide === idx ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400"
                    }`}>
                      {idx + 1}
                    </span>
                    <div className="overflow-hidden">
                      <span className="text-[9px] text-slate-500 font-extrabold block tracking-wider uppercase">{s.badge}</span>
                      <span className="text-[11px] font-bold block truncate">{s.title}</span>
                    </div>
                  </button>
                ))}
              </div>
            </aside>

            {/* Display Slide stage area */}
            <main className="flex-1 flex flex-col justify-between bg-slate-950 p-6 overflow-y-auto">
              
              {(() => {
                const currentSlide = slides[activeSlide] as any;
                return (
                  <div className="max-w-4xl w-full mx-auto my-auto bg-white text-slate-900 rounded-2xl border border-slate-200 overflow-hidden shadow-2xl p-8 md:p-12 space-y-6 relative flex flex-col justify-between min-h-[460px] animate-in slide-in-from-bottom-3 duration-200">
                    
                    {/* Header Badge */}
                    <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                      <div>
                        <span className="text-[11px] font-black tracking-widest bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-100 uppercase">
                          {currentSlide?.badge}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-gray-400 font-mono font-bold tracking-wider">StajYerim Pitch-Deck 2026</span>
                      </div>
                    </div>

                    {/* Main Content Area based on index visualType */}
                    <div className="flex-1 py-4 flex flex-col justify-center">
                      
                      {/* TYPE 1: HERO OUTRO / INTRO */}
                      {currentSlide?.visualType === "hero_illustration" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                          <div className="space-y-4">
                            <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-none">
                              {currentSlide?.title}
                            </h1>
                            <p className="text-base font-bold text-indigo-600 italic">
                              {currentSlide?.tagline}
                            </p>
                            <p className="text-sm text-gray-650 leading-relaxed font-semibold">
                              {currentSlide?.description}
                            </p>
                            <div className="flex flex-wrap gap-2 pt-2">
                              {currentSlide?.tags?.map((t: string, i: number) => (
                                <span key={i} className="text-[10px] font-extrabold px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-850 rounded-lg border border-indigo-200 uppercase tracking-wider">
                                  {t}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          {/* Interactive graphic right side */}
                          <div className="bg-linear-to-br from-indigo-50 to-slate-100/50 rounded-2xl border border-indigo-200/50 p-6 flex flex-col items-center justify-center text-center space-y-4 relative overflow-hidden min-h-[200px]">
                            <div className="absolute top-2 right-2 px-2 py-0.5 bg-indigo-100 rounded text-[9px] font-black text-indigo-700">Lise Odaklı AI</div>
                            <div className="w-14 h-14 rounded-full bg-indigo-600/10 border border-indigo-500/20 text-indigo-600 flex items-center justify-center shadow-xs">
                              <Rocket className="w-7 h-7 animate-bounce" />
                            </div>
                            <div>
                              <span className="text-lg font-black text-gray-850 block">Yeni Nesil Staj Modeli</span>
                              <span className="text-[11px] text-gray-450 font-semibold block mt-1">Liseliler için 1 haftalık try-out deneyim kapıları</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* TYPE 2: PROBLEM_LAYOUT representation */}
                      {currentSlide?.visualType === "problem_layout" && (
                        <div className="space-y-5">
                          <div className="space-y-1">
                            <h2 className="text-2.5xl font-black text-gray-950 tracking-tight leading-none">{currentSlide?.title}</h2>
                            <p className="text-xs text-slate-500 font-bold">{currentSlide?.description}</p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4.5 pt-2">
                            {currentSlide?.points?.map((p: any, idx: number) => (
                              <div key={idx} className="bg-gray-50 border border-gray-150 p-4 rounded-xl flex flex-col justify-between hover:border-indigo-300 transition-all shadow-sm">
                                <div className="space-y-2">
                                  <div className="w-8 h-8 rounded-lg bg-orange-100 border border-orange-200 text-orange-600 flex items-center justify-center text-xs font-black">
                                    0{idx + 1}
                                  </div>
                                  <h4 className="text-xs font-black text-gray-900 block tracking-wider uppercase">{p.title}</h4>
                                  <p className="text-[11px] text-gray-550 leading-relaxed font-semibold">{p.text}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* TYPE 3: IMPACT WARNINGS */}
                      {currentSlide?.visualType === "impact_warning" && (
                        <div className="space-y-5">
                          <div className="space-y-1 text-center max-w-lg mx-auto">
                            <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest block font-mono">Toplumsal Etki Analizi</span>
                            <h2 className="text-2.5xl font-black text-rose-950 tracking-tight">{currentSlide?.title}</h2>
                            <p className="text-xs text-gray-450 font-bold">Öğrencilerin yanlış meslek seçimi yapması durumunda karşılaşılan sistematik zararlar.</p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4.5 pt-2">
                            {currentSlide?.points?.map((p: any, idx: number) => (
                              <div key={idx} className="bg-rose-50/40 border border-rose-100 p-4 rounded-xl flex flex-col justify-between hover:border-rose-300 transition-all shadow-sm relative">
                                <div className="space-y-2">
                                  <span className="text-[10px] font-mono text-rose-600 font-extrabold uppercase bg-rose-50 px-2 py-0.5 rounded border border-rose-200">Kritik Sorun</span>
                                  <h4 className="text-xs font-black text-rose-950 tracking-wider uppercase block pt-1">{p.title}</h4>
                                  <p className="text-[11px] text-gray-650 leading-relaxed font-medium">{p.text}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* TYPE 4: SOLUTION SPECIFICS */}
                      {currentSlide?.visualType === "solution_layout" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                          <div className="space-y-4">
                            <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-none">
                              {currentSlide?.title}
                            </h2>
                            <p className="text-xs text-indigo-650 font-semibold italic">
                              {currentSlide?.description}
                            </p>
                            
                            <div className="space-y-2.5 pt-2">
                              {currentSlide?.points?.map((p: any, i: number) => (
                                <div key={i} className="flex gap-2.5 items-start">
                                  <div className="w-5 h-5 rounded bg-emerald-100 border border-emerald-250 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                                    <CheckCircle className="w-3.5 h-3.5" />
                                  </div>
                                  <div>
                                    <strong className="text-xs text-gray-900 font-extrabold">{p.title}</strong>
                                    <p className="text-[10px] text-gray-550 font-medium">{p.text}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="bg-linear-to-br from-emerald-50 to-indigo-50 rounded-2xl border border-gray-200 p-6 space-y-4 flex flex-col items-center justify-center text-center">
                            <span className="text-[9px] font-black uppercase tracking-widest text-indigo-700 bg-indigo-100 px-2 py-1 rounded">DEĞER ÖNERİSİ</span>
                            <div className="p-3 bg-white rounded-full border border-indigo-200/50 text-indigo-650 shrink-0">
                              <Compass className="h-8 w-8 animate-spin" style={{ animationDuration: "12s" }} />
                            </div>
                            <div>
                              <span className="text-sm font-black text-gray-850 block">Güvenli Meslek Try-Out</span>
                              <span className="text-[10px] text-gray-500 font-semibold block mt-1.5 leading-relaxed max-w-xs">Torpili ve çevre sınırlarını ortadan kaldırarak lisede bizzat deneyimleme şansı sunuyoruz.</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* TYPE 5: WORKFLOW PROCESS */}
                      {currentSlide?.visualType === "workflow" && (
                        <div className="space-y-5">
                          <div className="space-y-1">
                            <h2 className="text-2.5xl font-black text-gray-950 tracking-tight">{currentSlide?.title}</h2>
                            <p className="text-xs text-gray-550 font-bold max-w-xl">{currentSlide?.description}</p>
                          </div>

                          {/* Giant horizontal sequence */}
                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4.5 pt-4">
                            {currentSlide?.steps?.map((step: string, idx: number) => (
                              <div key={idx} className="bg-indigo-50/30 border border-indigo-100 p-4 rounded-2xl flex flex-col justify-between shadow-xs hover:bg-white transition-all relative group">
                                <span className="text-[10px] font-mono text-indigo-600 font-extrabold uppercase">Step 0{idx + 1}</span>
                                <h4 className="text-xs font-black text-gray-900 leading-tight pt-3 uppercase tracking-wider">{step}</h4>
                                <p className="text-[9px] text-gray-450 font-semibold mt-1">Aşamayı başarıyla tamamlayıp deneyime başlayın.</p>
                                {idx < 3 && (
                                  <div className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 hidden sm:block text-indigo-200">
                                    <ChevronRight className="h-6 w-6" />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* TYPE 6: COMPETITOR ANALYSIS TABLE */}
                      {currentSlide?.visualType === "comparison_matrix" && (
                        <div className="space-y-4">
                          <div className="space-y-1">
                            <h2 className="text-2.5xl font-black text-gray-950 tracking-tight leading-none">{currentSlide?.title}</h2>
                            <p className="text-xs text-gray-550 font-bold max-w-xl">{currentSlide?.description}</p>
                          </div>

                          {/* Beautiful comparison matrix view */}
                          <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-xs">
                            <table className="w-full text-left text-xs">
                              <thead>
                                <tr className="bg-slate-50 border-b border-gray-200 text-gray-500 font-mono text-[9px] uppercase tracking-wider">
                                  <th className="py-2.5 px-4 font-black">Platform Adı</th>
                                  <th className="py-2.5 px-3 font-black">Hedef Kitle</th>
                                  <th className="py-2.5 px-3 font-black">Özel Sektör Entegresi</th>
                                  <th className="py-2.5 px-3 font-black">Türkiye Pazarı</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-150">
                                {currentSlide?.table?.map((row: any, idx: number) => (
                                  <tr key={idx} className={`font-semibold hover:bg-slate-50/50 transition-all ${row.highlight ? "bg-indigo-50/50 text-indigo-950 font-extrabold" : "text-gray-700"}`}>
                                    <td className="py-2 px-4 flex items-center gap-1.5">
                                      {row.highlight && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />}
                                      {row.name}
                                    </td>
                                    <td className="py-2 px-3">{row.audience}</td>
                                    <td className="py-2 px-3">{row.privateSector}</td>
                                    <td className="py-2 px-3">{row.turkey}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          <div className="p-3.5 rounded-xl bg-orange-50 border border-orange-100 text-[11px] leading-relaxed text-orange-950 font-extrabold">
                            💡 {currentSlide?.highlight}
                          </div>
                        </div>
                      )}

                      {/* TYPE 7: AI ARCHITECTURE DETAILED DIAGRAM */}
                      {currentSlide?.visualType === "ai_architecture" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                          <div className="space-y-4">
                            <span className="text-[10px] font-black text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded tracking-widest uppercase">{currentSlide?.subtitle}</span>
                            <h2 className="text-3xl font-black text-gray-950 tracking-tight leading-none">{currentSlide?.title}</h2>
                            
                            <div className="space-y-3.5 pt-2">
                              {currentSlide?.points?.map((p: any, i: number) => (
                                <div key={i} className="flex gap-2.5 items-start">
                                  <div className="w-5 h-5 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-700 flex items-center justify-center shrink-0 font-black text-[9px] mt-0.5">
                                    {i + 1}
                                  </div>
                                  <div>
                                    <strong className="text-xs text-slate-900 font-extrabold">{p.title}:</strong>
                                    <span className="text-[11px] text-gray-650 ml-1 leading-relaxed font-semibold block">{p.text}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Schematic Flow Representation Diagram */}
                          <div className="bg-slate-950 text-white rounded-2xl border border-slate-800 p-5 space-y-3 font-mono text-[9px]">
                            <span className="text-slate-500 block uppercase border-b border-slate-800 pb-1 text-[8px] tracking-wider text-center">AI Server Engineering</span>
                            
                            <div className="space-y-2.5">
                              <div className="flex justify-between items-center text-slate-300">
                                <span className="p-1 px-1.5 bg-slate-800 rounded">Öğrenci Profili</span>
                                <span className="text-indigo-400">➔ Embedding 1536d ➔</span>
                                <span className="p-1 px-1.5 bg-indigo-950 border border-indigo-700 rounded text-indigo-200">pgvector Store</span>
                              </div>
                              
                              <div className="flex justify-between items-center text-slate-300">
                                <span className="p-1 px-1.5 bg-slate-800 rounded">Şirket İlanları</span>
                                <span className="text-indigo-400">➔ Embedding 1536d ➔</span>
                                <span className="p-1 px-1.5 bg-indigo-950 border border-indigo-700 rounded text-indigo-200">pgvector Store</span>
                              </div>
                              
                              <div className="bg-slate-900 p-2 rounded text-center text-emerald-400 border border-slate-800">
                                🔍 K-NN Vektör Eşleşme Skorlama Sorgusu
                              </div>
                              
                              <div className="p-2 bg-indigo-950/40 rounded text-[8px] text-indigo-200 leading-relaxed border border-indigo-800/40">
                                <strong>Claude Sonnet 4.6 NLP Engine:</strong> "Neden uygun olduğunu öğrenciye Türkçe ve motive edici bir dilde açıklar."
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* TYPE 8: BUSINESS PRICING LAYOUT */}
                      {currentSlide?.visualType === "pricing_model" && (
                        <div className="space-y-4">
                          <div className="space-y-1">
                            <span className="text-[10px] font-black text-indigo-600 block tracking-widest uppercase">Gelir ve Sürdürülebilirlik</span>
                            <h2 className="text-2.5xl font-black text-gray-950 tracking-tight leading-none">{currentSlide?.title}</h2>
                          </div>

                          {/* Dynamic Pricing Comparison Columns Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
                            <div className="bg-slate-50 border border-gray-150 p-4 rounded-xl space-y-2 text-center">
                              <span className="text-[10px] font-black tracking-wider text-slate-500 uppercase">Ücretsiz Plan</span>
                              <div className="space-y-0.5">
                                <span className="text-lg font-black text-gray-900 block">0 ₺</span>
                                <span className="text-[8px] text-slate-455 block">Her zaman ücretsiz</span>
                              </div>
                              <p className="text-[9px] text-gray-500 font-semibold border-t border-gray-200 pt-2 leading-relaxed">
                                Aylık 1 ilan hakkı, 20 adaya kadar başvuru görüntüleme.
                              </p>
                            </div>
                            
                            <div className="bg-indigo-50/30 border-2 border-indigo-200 p-4 rounded-xl space-y-2 text-center relative">
                              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-indigo-600 rounded text-[7px] font-black text-white uppercase tracking-wider shadow-xs">POPÜLER</div>
                              <span className="text-[10px] font-black tracking-wider text-indigo-600 uppercase">Pro Kurucu</span>
                              <div className="space-y-0.5">
                                <span className="text-lg font-black text-gray-900 block">999 ₺ <span className="text-xs text-gray-550">/Ay</span></span>
                                <span className="text-[8px] text-indigo-500 block">Startup ve KOBİ'ler için</span>
                              </div>
                              <p className="text-[9px] text-indigo-950 font-bold border-t border-indigo-150 pt-2 leading-relaxed">
                                Sınırsız ilan, sınırsız başvuru, AI asistanı ve gelişmiş filtreler.
                              </p>
                            </div>

                            <div className="bg-slate-50 border border-gray-150 p-4 rounded-xl space-y-2 text-center">
                              <span className="text-[10px] font-black tracking-wider text-slate-500 uppercase">Kurumsal Ortak</span>
                              <div className="space-y-0.5">
                                <span className="text-lg font-black text-gray-900 block">4.999 ₺ <span className="text-xs text-gray-550">/Ay</span></span>
                                <span className="text-[8px] text-slate-450 block">Büyük ölçekli firmalara</span>
                              </div>
                              <p className="text-[9px] text-gray-500 font-semibold border-t border-gray-200 pt-2 leading-relaxed">
                                Çok şubeli yapı, gelişmiş İK paneli ve kurumsal KPI raporlama.
                              </p>
                            </div>
                          </div>

                          <div className="p-3 bg-emerald-50 border border-emerald-100 text-[10px] leading-relaxed text-emerald-950 rounded-xl font-extrabold text-center">
                            🎯 {currentSlide?.highlight}
                          </div>
                        </div>
                      )}

                      {/* TYPE 9: TECH STACK AND TABLES LIST */}
                      {currentSlide?.visualType === "tech_stack" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                          <div className="space-y-3">
                            <h2 className="text-2.5xl font-black text-gray-950 tracking-tight leading-none">{currentSlide?.title}</h2>
                            
                            <div className="space-y-2 pt-2">
                              {currentSlide?.techStack?.map((t: any, i: number) => (
                                <div key={i} className="flex justify-between items-center text-xs p-2.5 bg-gray-50 border border-gray-150 rounded-xl font-semibold">
                                  <span className="text-indigo-650 font-black tracking-wider uppercase text-[10px]">{t.category}</span>
                                  <span className="text-gray-900 text-[11px] font-extrabold">{t.tech}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* DB Schema Box */}
                          <div className="bg-slate-50 border border-gray-200/80 rounded-2xl p-5 space-y-4">
                            <div>
                              <span className="text-[10px] font-black tracking-wider text-indigo-700 uppercase block mb-1">DATA RELATION MODEL</span>
                              <h4 className="text-sm font-black text-gray-900 leading-tight">Temel Veri Tabanı Şeması</h4>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono font-black text-white">
                              <div className="p-2 rounded bg-indigo-600 border border-indigo-700 text-center">
                                Öğrenciler
                              </div>
                              <div className="p-2 rounded bg-slate-800 border border-slate-700 text-slate-200 text-center">
                                Şirketler
                              </div>
                              <div className="p-2 rounded bg-slate-800 border border-slate-700 text-slate-200 text-center col-span-2">
                                İlanlar <span className="text-indigo-400">➜</span> Başvurular
                              </div>
                            </div>
                            
                            <p className="text-[9px] text-gray-400 font-bold italic leading-relaxed text-center">
                              * pgvector eklentisi kullanılarak öğrenciler ile ilanlar arasında benzerlik sorguları yapılır.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* TYPE 10: VISION CALL TO ACTION */}
                      {currentSlide?.visualType === "vision_outro" && (
                        <div className="space-y-5 text-center max-w-2xl mx-auto">
                          <div className="space-y-2">
                            <span className="text-xs font-black tracking-widest uppercase text-indigo-600 block animate-pulse">BİZİMLE BİRLİKTE YÜRÜYÜN</span>
                            <h2 className="text-3xl md:text-4xl font-black text-gray-950 tracking-tight leading-none">{currentSlide?.title}</h2>
                            <p className="text-sm text-gray-550 font-semibold leading-relaxed max-w-xl mx-auto">{currentSlide?.description}</p>
                          </div>

                          {/* Display beautiful blocks */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-3">
                            {currentSlide?.ctas?.map((ca: string, idx: number) => (
                              <div key={idx} className="bg-indigo-50/20 border border-indigo-150 p-4.5 rounded-xl hover:bg-indigo-300 hover:text-white transition-all duration-200">
                                <span className="text-xs font-extrabold tracking-wide block text-indigo-850 uppercase">{ca.split(" ")[0]}</span>
                                <span className="text-[10px] text-gray-450 block mt-1 font-semibold">{ca.substring(ca.indexOf(" ") + 1)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>

                    {/* Footer Controls & Slide numbers indicator */}
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100 text-[10px] font-bold">
                      <div>
                        <span className="text-gray-450 uppercase tracking-widest">StajYerim Platform Sunumu</span>
                      </div>
                      
                      {/* Next / Previous Controls */}
                      <div className="flex items-center gap-2">
                        <button
                          disabled={activeSlide === 0}
                          onClick={() => setActiveSlide(prev => prev - 1)}
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-gray-800 transition disabled:opacity-30 cursor-pointer shadow-2xs"
                        >
                          Önceki Slayt
                        </button>
                        <button
                          disabled={activeSlide === slides.length - 1}
                          onClick={() => setActiveSlide(prev => prev + 1)}
                          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-white transition disabled:opacity-30 cursor-pointer shadow-2xs shadow-indigo-600/10"
                        >
                          Sonraki Slayt
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })()}
              
              {/* Escape instructions help banner helper */}
              <div className="text-center text-xs text-slate-500 font-semibold pt-4">
                * Kapatmak için sağ üstteki <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">X</kbd> butonunu kullanabilir veya sol menüden farklı slaytlara hızlıca atlayabilirsiniz.
              </div>
            </main>

          </div>
        </div>
      )}

    </div>
  );
}
