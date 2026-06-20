import React, { useState } from "react";
import { 
  Plus, 
  MapPin, 
  Users, 
  Calendar, 
  Sparkles, 
  Trash2, 
  ArrowLeft, 
  Check, 
  X, 
  FileText, 
  Loader2, 
  AlertCircle,
  TrendingUp,
  Award,
  BookOpen,
  Briefcase
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { type Listing, type Application, type CompanyProfile } from "../types";
import { db, collection, addDoc, doc, updateDoc, deleteDoc } from "../lib/firebase";

interface CompanyDashboardProps {
  listings: Listing[];
  applications: Application[];
  onNewListing: (listing: Listing) => void;
  onUpdateApplicationStatus: (appId: string, status: Application["status"], feedback: string) => void;
  onDeleteListing: (id: string) => void;
  companyProfile: CompanyProfile;
  setCompanyProfile: (p: CompanyProfile) => void;
  activeSubTab: string;
  setActiveSubTab: (t: string) => void;
}

const CATEGORIES = ["Teknoloji", "Tasarım", "Sağlık", "Finans", "Mühendislik", "Sanat", "Pazarlama"];

export default function CompanyDashboard({
  listings,
  applications,
  onNewListing,
  onUpdateApplicationStatus,
  onDeleteListing,
  companyProfile,
  setCompanyProfile,
  activeSubTab,
  setActiveSubTab
}: CompanyDashboardProps) {
  // New listing wizard state
  const [showAddForm, setShowAddForm] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState("Teknoloji");
  const [formLocationType, setFormLocationType] = useState<"Uzaktan" | "Hibrit" | "Yerinde">("Uzaktan");
  const [formCity, setFormCity] = useState("Tüm Türkiye");
  const [formDesc, setFormDesc] = useState("");
  const [formSyllabus, setFormSyllabus] = useState<string[]>([
    "Hoş Geldiniz, Oryantasyon ve Ekip Rollerive Görevleri Tanıtımı.",
    "Birebir Uzman İzleme (Shadowing) Seansı.",
    "Örnek Küçültülmüş Vaka Çalışması Pratiği.",
    "Proje Tasarımı / Oluşturulan Fikirlerin Sentezi.",
    "Fikir Sunumu, Kıdemli Mentor Geri Bildirimleri ve Sertifikasyon."
  ]);
  const [formQuiz, setFormQuiz] = useState<string[]>([
    "Bu mesleğe veya faaliyetlerimize ilgi duymandaki temel faktör nedir? Seni en çok ne heyecanlandırıyor?",
    "Okulda veya kişisel hobilerinde karşılaştığın ve çözmekten gurur duyduğun bir problemi anlatır mısın?",
    "Bizimle geçireceğin 1 haftalık deneme süreci sonunda neleri gerçekten başarmış ve yerinde gözlemlemiş olmak istersin?"
  ]);

  // Loading indicator for Gemini Quiz Suggestion
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [formError, setFormError] = useState("");

  // Managing Applicants
  const [selectedListingForApplicants, setSelectedListingForApplicants] = useState<Listing | null>(null);
  const [selectedApplicantForReview, setSelectedApplicantForReview] = useState<Application | null>(null);
  const [companyFeedbackInput, setCompanyFeedbackInput] = useState("");
  const [submittingStatus, setSubmittingStatus] = useState(false);

  // Filter listings by active company profile name
  const companyListings = listings.filter(
    (l) => l.companyName.toLowerCase() === companyProfile.name.toLowerCase()
  );

  // Filter applications for this company's listings
  const companyApplications = applications.filter((app) => app.companyName.toLowerCase() === companyProfile.name.toLowerCase());

  // Generate Questions via server-side Gemini endpoint
  const handleSuggestQuizViaGemini = async () => {
    if (!formTitle.trim()) {
      setFormError("AI'ın soru önerebilmesi için öncelikle bir İlan Başlığı (Pozisyon) girmelisin.");
      return;
    }
    setFormError("");
    setGeneratingQuestions(true);

    try {
      const response = await fetch("/api/ai/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formTitle,
          category: formCategory,
          description: formDesc || "1 haftalık lise deneme stajı",
          syllabus: formSyllabus.join(", ")
        })
      });

      if (!response.ok) {
        throw new Error("Soru oluşturulamadı.");
      }

      const data = await response.json();
      if (data.questions && data.questions.length > 0) {
        setFormQuiz(data.questions);
      }
    } catch (e: any) {
      console.error(e);
      setFormError("AI soru üretemedi. Hazır/bölgesel sorular yüklendi.");
    } finally {
      setGeneratingQuestions(false);
    }
  };

  // Submit Listing to DB
  const handleSaveListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDesc.trim() || !companyProfile.name.trim()) {
      setFormError("Lütfen Pozisyon Başlığı, Şirket İsmi ve Staj Açıklaması alanlarını doldur.");
      return;
    }

    setFormError("");
    try {
      const newListingData: Omit<Listing, "id"> = {
        title: formTitle,
        companyName: companyProfile.name,
        category: formCategory,
        locationType: formLocationType,
        locationCity: formCity,
        description: formDesc,
        weeksPlan: formSyllabus,
        quizQuestions: formQuiz,
        createdAt: Date.now()
      };

      // Add to Firestore index
      const docRef = await addDoc(collection(db, "listings"), newListingData);

      onNewListing({
        ...newListingData,
        id: docRef.id
      });

      // Reset
      setShowAddForm(false);
      setFormTitle("");
      setFormDesc("");
      setActiveSubTab("listings");
    } catch (err) {
      console.error(err);
      setFormError("İlan kaydedilirken bir sorun oluştu.");
    }
  };

  // Evaluated status updates
  const handleEvaluateApplicant = async (status: "accepted" | "rejected") => {
    if (!selectedApplicantForReview) return;
    setSubmittingStatus(true);
    try {
      // Update in Firestore
      const docRef = doc(db, "applications", selectedApplicantForReview.id);
      await updateDoc(docRef, {
        status,
        evalFeedback: companyFeedbackInput || (status === "accepted" ? "Tebrikler, 1 haftalık gözlem stajı başvurunuz onaylandı! Sizinle iletişime geçeceğiz." : "Başvurunuz için teşekkürler. Diğer dönemsel fırsatlarımızda görüşmek üzere.")
      });

      onUpdateApplicationStatus(
        selectedApplicantForReview.id,
        status,
        companyFeedbackInput
      );

      // Close details or update local
      setSelectedApplicantForReview({
        ...selectedApplicantForReview,
        status,
        evalFeedback: companyFeedbackInput
      });

      setCompanyFeedbackInput("");

    } catch (error) {
      console.error(error);
    } finally {
      setSubmittingStatus(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub Tabs */}
      <div className="flex border-b border-gray-100 pb-px gap-6">
        <button
          onClick={() => {
            setActiveSubTab("listings");
            setSelectedListingForApplicants(null);
            setSelectedApplicantForReview(null);
            setShowAddForm(false);
          }}
          className={`pb-3 text-sm font-bold tracking-tight transition-colors duration-200 relative ${
            activeSubTab === "listings" ? "text-indigo-600" : "text-gray-500 hover:text-gray-950"
          }`}
        >
          {activeSubTab === "listings" && (
            <motion.div layoutId="companySubTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
          )}
          Aktif Deneme İlanları ({companyListings.length})
        </button>
        <button
          onClick={() => {
            setActiveSubTab("applicants");
            setSelectedListingForApplicants(null);
            setSelectedApplicantForReview(null);
            setShowAddForm(false);
          }}
          className={`pb-3 text-sm font-bold tracking-tight transition-colors duration-200 relative flex items-center gap-1.5 ${
            activeSubTab === "applicants" ? "text-indigo-600" : "text-gray-500 hover:text-gray-950"
          }`}
        >
          {activeSubTab === "applicants" && (
            <motion.div layoutId="companySubTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
          )}
          Gelen Başvurular ({companyApplications.length})
          {companyApplications.filter((a) => a.status === "applied").length > 0 && (
            <span className="bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700 rounded-full animate-pulse">
              {companyApplications.filter((a) => a.status === "applied").length} yeni
            </span>
          )}
        </button>
      </div>

      {/* Company Profile Settings Header panel */}
      <div className="bg-white rounded-2xl border border-gray-150 p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-xs">
        <div className="space-y-1">
          <p className="text-[10px] font-extrabold text-indigo-650 uppercase tracking-widest">AKTİF ŞİRKET HESABINIZ</p>
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-black text-gray-900" id="current-company-name-hdr">{companyProfile.name}</h3>
            <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs text-indigo-700 font-semibold">{companyProfile.sector}</span>
          </div>
          <p className="text-xs text-gray-400">Yönetici Paneli &bull; Lise Stajyer Seçim Bölümü</p>
        </div>

        {/* Dynamic Name Edit input within UI card triggers */}
        <div className="flex gap-3 bg-gray-50 p-3 rounded-xl border border-gray-150 items-center">
          <span className="text-xs text-gray-500 font-bold shrink-0">Şirket Adı Değiştir:</span>
          <input
            type="text"
            id="company-name-setting-input"
            value={companyProfile.name}
            onChange={(e) => setCompanyProfile({ ...companyProfile, name: e.target.value })}
            className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs outline-none focus:border-indigo-500 font-bold"
          />
        </div>
      </div>

      {activeSubTab === "listings" ? (
        /* Listings Tab */
        showAddForm ? (
          /* Create New Listing view Card */
          <div className="bg-white rounded-3xl border border-gray-150 p-6 sm:p-8 space-y-6" id="add-listing-form-card">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">1 Haftalık Deneme Staj İlanı Vermek</h3>
                <p className="text-xs text-gray-500">Lise düzeyine uygun, motive edici 5 günlük gözlem programı</p>
              </div>
              <button
                onClick={() => setShowAddForm(false)}
                className="flex items-center gap-1.5 rounded-xl border border-gray-205 px-3 py-1.5 text-xs font-semibold text-gray-650 hover:bg-gray-50"
              >
                Geri Dön
              </button>
            </div>

            {formError && (
              <div className="bg-rose-50 border border-rose-150 p-3 rounded-xl text-rose-800 text-xs flex gap-2 items-center">
                <AlertCircle className="h-4 w-4" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveListing} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">İlan / Pozisyon Başlığı</label>
                  <input
                    type="text"
                    id="form-title-input"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Örn: Genç Grafik Tasarım Gözlemcisi"
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-xs outline-none focus:border-indigo-505 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Sektör / Kategori</label>
                  <select
                    id="form-category-select"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-xs outline-none bg-white"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Çalışma Şekli</label>
                  <div className="flex gap-2.5">
                    {["Uzaktan", "Hibrit", "Yerinde"].map((type) => (
                      <button
                        key={type}
                        type="button"
                        id={`form-loc-type-${type}`}
                        onClick={() => setFormLocationType(type as any)}
                        className={`flex-1 rounded-xl py-2 text-xs font-semibold border ${
                          formLocationType === type
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "bg-white text-gray-600 border-gray-150 hover:bg-gray-50"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Ofis Şehri</label>
                  <input
                    type="text"
                    id="form-city-input"
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    placeholder="Örn: İstanbul (Şişli)"
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-xs outline-none focus:border-indigo-550 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Staj Açıklaması & Hükümleri</label>
                <textarea
                  id="form-desc-input"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Lise öğrencisinin bir hafta boyunca nelerle karşılaşacağını, hangi ekiplerle oturup izleyeceğini buraya açıklayın..."
                  rows={4}
                  className="w-full rounded-xl border border-gray-250 px-4 py-2.5 text-xs outline-none focus:border-indigo-500 bg-white"
                />
              </div>

              {/* Day-by-day Syllabus */}
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                  <h4 className="text-xs font-black text-gray-500 uppercase tracking-wider">5 Günlük Gözlem Takvimi Planı</h4>
                  <span className="text-[10px] text-gray-400 font-medium">Lütfen günlük ana vizyonu girin</span>
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-5 animate-fadeIn">
                  {formSyllabus.map((dayPlan, index) => (
                    <div key={index} className="space-y-1">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Gün {index+1}</label>
                      <input
                        type="text"
                        id={`form-syllabus-day-${index}`}
                        value={dayPlan}
                        onChange={(e) => {
                          const updated = [...formSyllabus];
                          updated[index] = e.target.value;
                          setFormSyllabus(updated);
                        }}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-indigo-500 bg-white"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Tryout Custom Quiz / Interview Questions */}
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-black text-gray-500 uppercase tracking-wider">Tryout Giriş Soruları (Mülakat Soruları)</h4>
                    <p className="text-[10px] text-gray-400 leading-none">Öğrencinin başvuru esnasında kendini tanıtacağı 3 soru</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSuggestQuizViaGemini}
                    disabled={generatingQuestions}
                    className="flex items-center gap-1.5 bg-orange-50 text-orange-700 hover:bg-orange-100 transition px-3.5 py-1.5 rounded-full text-xs font-bold border border-orange-150 disabled:opacity-50"
                  >
                    {generatingQuestions ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        AI Soru Üretiyor...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5 text-orange-600" />
                        AI ile Soru Önerileri Üret!
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-3">
                  {formQuiz.map((qText, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <span className="text-xs font-extrabold text-gray-405 shrink-0">Soru {idx+1}:</span>
                      <input
                        type="text"
                        id={`form-quiz-q-${idx}`}
                        value={qText}
                        onChange={(e) => {
                          const updated = [...formQuiz];
                          updated[idx] = e.target.value;
                          setFormQuiz(updated);
                        }}
                        className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-xs outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress submit */}
              <div className="flex gap-4 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 rounded-xl border border-gray-200 py-3 text-xs font-bold text-gray-650 hover:bg-gray-50 bg-white"
                >
                  İptal Et
                </button>
                <button
                  type="submit"
                  id="submit-listing-btn"
                  className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white py-3 text-xs font-bold shadow-md shadow-indigo-100 flex items-center justify-center gap-1.5"
                >
                  İlanı Yayına Al
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* List Company Listings */
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Açtığınız Deneme İlanları</h3>
              <button
                id="add-new-listing-btn"
                onClick={() => {
                  setFormTitle("");
                  setFormDesc("");
                  setShowAddForm(true);
                }}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition shadow-md shadow-indigo-100"
              >
                Yeni Deneme İlanı Ekle
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {companyListings.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center space-y-3">
                <Plus className="h-10 w-10 text-indigo-200 mx-auto" />
                <p className="text-sm text-gray-500">Henüz yayınlanmış bir tryout ilanınız bulunmuyor.</p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="text-indigo-600 text-xs font-bold hover:underline"
                >
                  Hemen İlk İlanını Yayınla &rarr;
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {companyListings.map((list) => {
                  const appliedCount = applications.filter((a) => a.listingId === list.id).length;
                  return (
                    <div
                      key={list.id}
                      id={`company-listing-detail-card-${list.id}`}
                      className="bg-white p-6 rounded-2xl border border-gray-150 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                            {list.category}
                          </span>
                          <span className="text-xs text-gray-400 font-medium">
                            {list.locationCity} ({list.locationType})
                          </span>
                        </div>
                        <h4 className="font-bold text-gray-900 text-base">{list.title}</h4>
                        <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">{list.description}</p>

                        <div className="flex gap-4 mt-4 pt-4 border-t border-gray-100 text-xs">
                          <span className="flex items-center gap-1.5 text-gray-650">
                            <Users className="h-4 w-4 text-indigo-505" />
                            <strong>{appliedCount}</strong> Lise Başvurusu
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-5">
                        <button
                          id={`view-applicants-shortcut-btn-${list.id}`}
                          onClick={() => {
                            setSelectedListingForApplicants(list);
                            setActiveSubTab("applicants");
                          }}
                          className="flex-1 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-150 px-3 py-2 text-xs font-semibold flex items-center justify-center gap-1"
                        >
                          Başvuruları İncele ({appliedCount})
                        </button>
                        <button
                          id={`delete-listing-btn-${list.id}`}
                          onClick={() => {
                            if(confirm("Bu staj deneme ilanını tamamen kapatmak ve silmek istediğinizden emin misiniz?")) {
                              onDeleteListing(list.id);
                            }
                          }}
                          className="p-2 rounded-xl border border-gray-200 text-gray-400 hover:text-red-650 hover:bg-red-50 transition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )
      ) : (
        /* Applicants / Değerlendirmeler Tab */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* List of applications */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Değerlendirme bekleyenler</h3>
            {companyApplications.length === 0 ? (
              <div className="bg-white p-6 rounded-2xl border border-gray-100 text-center">
                <p className="text-xs text-gray-500">Henüz staj başvurusu yapılmadı.</p>
              </div>
            ) : (
              companyApplications.map((app) => {
                const isActive = selectedApplicantForReview?.id === app.id;
                return (
                  <button
                    key={app.id}
                    id={`company-app-item-${app.id}`}
                    onClick={() => {
                      setSelectedApplicantForReview(app);
                      setCompanyFeedbackInput("");
                    }}
                    className={`w-full text-left p-5 rounded-2xl border transition duration-150 flex flex-col gap-2 ${
                      isActive
                        ? "bg-indigo-50/50 border-indigo-400 ring-2 ring-indigo-50"
                        : "bg-white border-gray-100 hover:border-indigo-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                        {app.listingTitle.slice(0, 24)}...
                      </span>
                      {app.status === "applied" ? (
                        <span className="bg-yellow-10s0 text-yellow-850 text-[10px] font-bold px-2 py-0.5 rounded border border-yellow-200">
                          Yanıt Bekliyor
                        </span>
                      ) : app.status === "accepted" ? (
                        <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded border border-green-200">
                          Onaylandı
                        </span>
                      ) : (
                        <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-1.5 py-0.5 rounded">
                          Sonuçlandı
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-gray-950 font-sans tracking-tight leading-none mt-1">{app.studentName}</h4>
                    <p className="text-[10px] text-gray-400 font-medium">E-posta: {app.studentEmail}</p>

                    {app.aiCoachingReport && (
                      <div className="flex items-center gap-1 border-t border-dashed border-gray-100 pt-2 text-[10px] font-bold text-indigo-650">
                        <Sparkles className="h-3 w-3 shrink-0" />
                        AI Eşleşme Oranı: %{app.aiCoachingReport.matchingScore}
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Details & Review Panel */}
          <div className="lg:col-span-2">
            {selectedApplicantForReview ? (
              <div className="bg-white border border-gray-150 rounded-2xl overflow-hidden shadow-xs">
                {/* Applicant Bio header */}
                <div className="p-6 bg-slate-50 border-b border-gray-150 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded border border-slate-205">LYS-TRYOUT BAŞVURU DOSYASI</span>
                    <h3 className="text-lg font-bold text-gray-900 mt-1.5">{selectedApplicantForReview.studentName}</h3>
                    <p className="text-xs text-gray-500 font-medium">İlgi Alanları: {selectedApplicantForReview.studentInterests}</p>
                  </div>
                  <div>
                    {selectedApplicantForReview.status === "applied" ? (
                      <span className="bg-yellow-50 text-yellow-800 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-yellow-100">
                        Karar Aşamasında
                      </span>
                    ) : selectedApplicantForReview.status === "accepted" ? (
                      <span className="bg-green-50 text-green-800 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-green-100">
                        Onaylandı ✔
                      </span>
                    ) : (
                      <span className="bg-gray-50 text-gray-600 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-gray-100">
                        Kapatıldı
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* AI Evaluation analysis integration sidebox */}
                  {selectedApplicantForReview.aiCoachingReport && (
                    <div className="rounded-2xl border border-indigo-100 bg-indigo-50/15 p-5 space-y-4">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4.5 w-4.5 text-indigo-700 animate-pulse" />
                        <h4 className="text-xs font-bold text-gray-950 uppercase tracking-wider">AI Koç Değerlendirme Analizi</h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                        <div className="text-center md:border-r border-indigo-100 pr-4">
                          <p className="text-[9px] font-bold text-gray-400 uppercase">AI Eşleşme Oranı</p>
                          <p className="text-3xl font-black text-indigo-600">% {selectedApplicantForReview.aiCoachingReport.matchingScore}</p>
                        </div>
                        <div className="md:col-span-3 space-y-2 text-xs">
                          <div className="flex justify-between font-bold text-gray-700">
                            <span>Motivasyon: %{selectedApplicantForReview.aiCoachingReport.ratings.motivation}</span>
                            <span>Problem Çözme: %{selectedApplicantForReview.aiCoachingReport.ratings.problemSolving}</span>
                            <span>Merak/Uyum: %{selectedApplicantForReview.aiCoachingReport.ratings.adaptability}</span>
                          </div>
                          <p className="text-xs text-gray-700 leading-relaxed italic bg-white p-3 rounded-lg border border-indigo-50">
                            "{selectedApplicantForReview.aiCoachingReport.coachingFeedback}"
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Interview Answers list */}
                  <div className="space-y-4 text-xs">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Öğrencinin Mülakat Cevapları</h4>
                    
                    {/* Answers */}
                    {selectedApplicantForReview.answers && selectedApplicantForReview.answers.map((ans, idx) => (
                      <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-150">
                        <p className="font-bold text-gray-500 mb-1 flex gap-1.5">
                          <Plus className="h-4.5 w-4.5 text-indigo-500 shrink-0 rotate-45" />
                          Soru {idx+1}: {listings.find(l => l.id === selectedApplicantForReview.listingId)?.quizQuestions[idx] || "Mülakat Sorusu"}
                        </p>
                        <p className="text-xs font-semibold text-gray-800 bg-white p-3 rounded-lg border border-gray-100 whitespace-pre-wrap">
                          {ans || "Cevap verilmemiş."}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Decision operations and comments actions */}
                  {selectedApplicantForReview.status === "applied" && (
                    <div className="space-y-4 pt-4 border-t border-gray-100">
                      <div>
                        <label className="block text-xs font-bold text-gray-650 uppercase tracking-wider mb-2">Başvuru Değerlendirme & Geri Bildirim Notu</label>
                        <textarea
                          id="company-feedback-textarea"
                          value={companyFeedbackInput}
                          onChange={(e) => setCompanyFeedbackInput(e.target.value)}
                          placeholder="Öğrenciye iletilecek değerlendirme veya davet notunu buraya yazın..."
                          rows={3}
                          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-xs outline-none bg-white transition focus:border-indigo-505"
                        />
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => handleEvaluateApplicant("rejected")}
                          disabled={submittingStatus}
                          className="flex-1 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 py-3 text-xs font-bold transition flex items-center justify-center gap-1"
                        >
                          <X className="h-4 w-4" />
                          Girişi Reddet
                        </button>
                        <button
                          onClick={() => handleEvaluateApplicant("accepted")}
                          disabled={submittingStatus}
                          className="flex-1 rounded-xl bg-green-600 hover:bg-green-700 text-white py-3 text-xs font-bold shadow-md shadow-green-100 transition flex items-center justify-center gap-1.5"
                        >
                          <Check className="h-4 w-4" />
                          Mülakatı Onayla & Kabul Et
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Feedback written display */}
                  {selectedApplicantForReview.status !== "applied" && selectedApplicantForReview.evalFeedback && (
                    <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-150 text-xs">
                      <p className="font-bold text-gray-500 uppercase mb-1">Gönderilen Değerlendirme Notunuz</p>
                      <p className="text-gray-800 italic">"{selectedApplicantForReview.evalFeedback}"</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center text-gray-400">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-30 text-indigo-600" />
                <p className="text-sm font-semibold">Sol listeden bir başvuruyu seçerek öğrencinin özgün mülakat cevaplarını, AI Career raporunu inceleyebilir ve karara bağlayabilirsiniz.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
