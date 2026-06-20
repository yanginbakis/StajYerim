import React, { useState } from "react";
import { 
  Search, 
  MapPin, 
  Clock, 
  Tag, 
  Sparkles, 
  Layers, 
  GraduationCap, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  X,
  FileText,
  HelpCircle,
  BookmarkCheck,
  Building,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { type Listing, type Application, type StudentProfile } from "../types";
import { db, collection, addDoc } from "../lib/firebase";

interface StudentDashboardProps {
  listings: Listing[];
  applications: Application[];
  onNewApplication: (app: Application) => void;
  studentProfile: StudentProfile;
  setStudentProfile: (p: StudentProfile) => void;
  activeSubTab: string;
  setActiveSubTab: (t: string) => void;
}

const CATEGORIES = ["Tümü", "Teknoloji", "Tasarım", "Sağlık", "Finans", "Mühendislik", "Sanat"];

const CATEGORY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  Teknoloji: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-100" },
  Tasarım: { bg: "bg-pink-50", text: "text-pink-700", border: "border-pink-100" },
  Sağlık: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-100" },
  Finans: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-100" },
  Mühendislik: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-100" },
  Sanat: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-100" },
  default: { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-100" }
};

export default function StudentDashboard({
  listings,
  applications,
  onNewApplication,
  studentProfile,
  setStudentProfile,
  activeSubTab,
  setActiveSubTab
}: StudentDashboardProps) {
  const [selectedCategory, setSelectedCategory] = useState("Tümü");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Apply Modal state
  const [selectedListingForApply, setSelectedListingForApply] = useState<Listing | null>(null);
  const [applyStep, setApplyStep] = useState<"profile" | "quiz" | "submitting">("profile");
  const [quizAnswers, setQuizAnswers] = useState<string[]>(["", "", ""]);
  const [submittingError, setSubmittingError] = useState("");

  // Details Modal
  const [selectedListingDetails, setSelectedListingDetails] = useState<Listing | null>(null);

  // Selected Application for Evaluation Feedback Report panel
  const [selectedAppForReport, setSelectedAppForReport] = useState<Application | null>(null);

  // Filter listings
  const filteredListings = listings.filter((listing) => {
    const matchesCategory = selectedCategory === "Tümü" || listing.category === selectedCategory;
    const matchesSearch = 
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleOpenApply = (listing: Listing) => {
    setSelectedListingForApply(listing);
    setQuizAnswers(listing.quizQuestions.map(() => ""));
    setApplyStep("profile");
    setSubmittingError("");
    setSelectedListingDetails(null); // Close details
  };

  const handleNextToQuiz = () => {
    if (!studentProfile.name.trim() || !studentProfile.email.trim() || !studentProfile.interests.trim()) {
      setSubmittingError("Lütfen mülakata geçmeden önce tüm alanları doldur.");
      return;
    }
    setSubmittingError("");
    setApplyStep("quiz");
  };

  const handleSubmitApplication = async () => {
    if (!selectedListingForApply) return;
    
    // Check if any answers are empty
    const emptyAnswerIdx = quizAnswers.findIndex(ans => !ans.trim());
    if (emptyAnswerIdx !== -1) {
      setSubmittingError("Lütfen tüm sorulara samimi ve açıklayıcı cevaplar yaz.");
      return;
    }

    setSubmittingError("");
    setApplyStep("submitting");

    try {
      // Trigger AI evaluation report concurrently before saving to DB
      const evalResponse = await fetch("/api/ai/evaluate-answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingTitle: selectedListingForApply.title,
          questions: selectedListingForApply.quizQuestions,
          answers: quizAnswers,
          studentInterests: studentProfile.interests
        })
      });

      let aiCoachingReport = {
        matchingScore: 80,
        coachingFeedback: "Cevapların başarıyla kaydedildi! Profesyonel ekibimiz başvurunu en kısa sürede değerlendirecek.",
        ratings: { motivation: 80, problemSolving: 80, adaptability: 80 }
      };

      if (evalResponse.ok) {
        const data = await evalResponse.json();
        aiCoachingReport = data;
      }

      const newApp: Omit<Application, "id"> = {
        listingId: selectedListingForApply.id,
        listingTitle: selectedListingForApply.title,
        companyName: selectedListingForApply.companyName,
        studentName: studentProfile.name,
        studentEmail: studentProfile.email,
        studentInterests: studentProfile.interests,
        answers: quizAnswers,
        status: "applied",
        aiCoachingReport,
        createdAt: Date.now()
      };

      // Save application to Firestore
      const docRef = await addDoc(collection(db, "applications"), newApp);

      // Add to local state
      onNewApplication({
        ...newApp,
        id: docRef.id
      });

      // Clear states
      setSelectedListingForApply(null);
      // Open success report popup by default
      setActiveSubTab("history");
      const appWithId: Application = { ...newApp, id: docRef.id };
      setSelectedAppForReport(appWithId);

    } catch (e: any) {
      console.error(e);
      setSubmittingError("Başvuru gönderilirken bir hata oluştu. Lütfen tekrar dene.");
      setApplyStep("quiz");
    }
  };

  const getStyle = (cat: string) => CATEGORY_STYLES[cat] || CATEGORY_STYLES.default;

  return (
    <div className="space-y-6">
      {/* Sub Tabs Toggle (Arama vs Başvurularım) */}
      <div className="flex border-b border-gray-100 pb-px gap-6">
        <button
          id="tab-discover-btn"
          onClick={() => setActiveSubTab("discover")}
          className={`pb-3 text-sm font-bold tracking-tight transition-colors duration-200 relative ${
            activeSubTab === "discover" ? "text-indigo-600" : "text-gray-500 hover:text-gray-900"
          }`}
        >
          {activeSubTab === "discover" && (
            <motion.div layoutId="studentSubTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
          )}
          Tüm Deneme Stajları
        </button>
        <button
          id="tab-history-btn"
          onClick={() => setActiveSubTab("history")}
          className={`pb-3 text-sm font-bold tracking-tight transition-colors duration-200 relative flex items-center gap-1.5 ${
            activeSubTab === "history" ? "text-indigo-600" : "text-gray-500 hover:text-gray-900"
          }`}
        >
          {activeSubTab === "history" && (
            <motion.div layoutId="studentSubTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
          )}
          Başvurularım & Mülakat Sonuçları
          {applications.length > 0 && (
            <span className="bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 rounded-full">
              {applications.length}
            </span>
          )}
        </button>
      </div>

      {activeSubTab === "discover" ? (
        <>
          {/* Welcome Intro Section */}
          <div className="rounded-3xl bg-neutral-900 text-white p-6 sm:p-8 relative overflow-hidden shadow-xl" id="student-welcome-hero">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <GraduationCap className="h-44 w-44 rotate-12 text-white" />
            </div>
            <div className="max-w-2xl space-y-3 relative z-10">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/10 mb-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Sınırlarını Aş, Geleceğini Keşfet
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Hayalindeki Mesleği 1 Haftada Keşfetmeye Hazır Mısın?
              </h2>
              <p className="text-sm text-gray-300 leading-relaxed">
                Hemen ilgilendiğin alanı seç, gerçek şirketlerin 5 günlük gözlem ve deneme programlarına göz at. Hazırlanan mini mülakat sorularına yanıt ver, AI kariyer koçu eşliğinde başvurunu şirkete ulaştır!
              </p>
            </div>
          </div>

          {/* Search and Categories row */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between py-2">
            {/* Horizontal Categories */}
            <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-none" id="categories-scroll-wrapper">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  id={`cat-filter-btn-${cat}`}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition duration-150 shrink-0 border uppercase tracking-wider ${
                    selectedCategory === cat
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                      : "bg-white text-gray-650 border-gray-150 hover:bg-gray-50"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Custom search */}
            <div className="relative w-full md:w-80">
              <input
                type="text"
                id="listing-search-field"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Şirket, pozisyon veya bilgi ara..."
                className="w-full rounded-xl border border-gray-200 bg-white py-2 px-3 pl-10 text-sm outline-none transition duration-150 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </div>

          {/* Listings List */}
          {filteredListings.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <p className="text-gray-400 font-medium">Buna uygun deneme stajı bulamadık.</p>
              <button
                onClick={() => { setSelectedCategory("Tümü"); setSearchQuery(""); }}
                className="mt-3 text-indigo-600 text-sm font-semibold hover:underline"
              >
                Filtreleri Sıfırla
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {filteredListings.map((listing) => {
                const styles = getStyle(listing.category);
                return (
                  <motion.div
                    key={listing.id}
                    id={`listing-card-${listing.id}`}
                    layout
                    className="group border border-gray-100 bg-white p-6 shadow-xs hover:shadow-md hover:border-indigo-100 rounded-2xl transition duration-200 flex flex-col justify-between"
                  >
                    <div>
                      {/* Badge and Tag */}
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-bold border ${styles.bg} ${styles.text} ${styles.border}`}>
                          {listing.category}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>{listing.locationCity} ({listing.locationType})</span>
                        </div>
                      </div>

                      {/* Header */}
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition tracking-tight">
                        {listing.title}
                      </h3>
                      <p className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-1.5 mt-1">
                        <Building className="h-4 w-4 text-gray-400 shrink-0" />
                        {listing.companyName}
                      </p>

                      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mb-4">
                        {listing.description}
                      </p>

                      {/* Weeks Program snippet */}
                      {listing.weeksPlan && listing.weeksPlan.length > 0 && (
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mb-5">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">5 Günlük Deneme Programı</p>
                          <div className="space-y-1">
                            <p className="text-xs text-slate-700 line-clamp-1">
                              <strong>1. Gün:</strong> {listing.weeksPlan[0]}
                            </p>
                            <p className="text-xs text-slate-700 line-clamp-1">
                              <strong>Hafta Sonu:</strong> {listing.weeksPlan[listing.weeksPlan.length - 1]}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer Buttons */}
                    <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
                      <button
                        id={`view-details-btn-${listing.id}`}
                        onClick={() => setSelectedListingDetails(listing)}
                        className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-bold text-gray-750 transition hover:bg-gray-50"
                      >
                        Programı İncele
                      </button>
                      <button
                        id={`apply-landing-btn-${listing.id}`}
                        onClick={() => handleOpenApply(listing)}
                        className="flex-1 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-4 py-2.5 text-xs font-bold shadow-md shadow-indigo-100 items-center justify-center flex gap-1.5"
                      >
                        Mülakata Gir & Başvur
                        <Sparkles className="h-3 w-3" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        /* Applications List & Analysis Panel */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* List of Applications */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Başvuruların</h3>
            {applications.length === 0 ? (
              <div className="bg-white p-6 rounded-2xl border border-gray-100 text-center">
                <p className="text-sm text-gray-500 leading-relaxed">
                  Henüz bir deneme stajı başvurusu yapmadın.
                </p>
                <button
                  onClick={() => setActiveSubTab("discover")}
                  className="mt-3 text-indigo-600 text-xs font-bold hover:underline"
                >
                  İlk ilanını keşfet &rarr;
                </button>
              </div>
            ) : (
              applications.map((app) => {
                const isActive = selectedAppForReport?.id === app.id;
                return (
                  <button
                    key={app.id}
                    id={`app-item-card-${app.id}`}
                    onClick={() => setSelectedAppForReport(app)}
                    className={`w-full text-left p-5 rounded-2xl border transition duration-150 flex flex-col gap-2 ${
                      isActive
                        ? "bg-indigo-50/50 border-indigo-400 ring-2 ring-indigo-50"
                        : "bg-white border-gray-100 hover:border-indigo-200"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold text-gray-400">
                        {new Date(app.createdAt).toLocaleDateString("tr-TR")}
                      </span>
                      {app.status === "applied" && (
                        <span className="bg-yellow-100 text-yellow-850 text-[10px] font-bold px-2 py-0.5 rounded-md border border-yellow-200">
                          Başvuruldu
                        </span>
                      )}
                      {app.status === "accepted" && (
                        <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-md border border-green-250">
                          Kabul Edildi 🎉
                        </span>
                      )}
                      {app.status === "rejected" && (
                        <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-md border border-rose-200">
                          Sonra Değerlendirilecek
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-gray-900 leading-tight">
                      {app.listingTitle}
                    </h4>
                    <p className="text-xs text-gray-500">{app.companyName}</p>
                    
                    {app.aiCoachingReport && (
                      <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-dashed border-gray-150 text-[10px] font-bold text-indigo-600">
                        <Sparkles className="h-3 w-3 shrink-0" />
                        AI Koç Skoru: {app.aiCoachingReport.matchingScore}%
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* AI Advisor Evaluation Report Details Screen */}
          <div className="lg:col-span-2">
            {selectedAppForReport ? (
              <div className="bg-white border border-gray-150 rounded-2xl overflow-hidden shadow-xs">
                {/* Header info */}
                <div className="p-6 bg-slate-50 border-b border-gray-150 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100 mb-1.5 inline-block">
                      BAŞVURU DETAYI VE DEĞERLENDİRME
                    </span>
                    <h3 className="text-lg font-bold text-gray-900">
                      {selectedAppForReport.listingTitle}
                    </h3>
                    <p className="text-xs text-gray-550 mt-1">Şirket: <strong>{selectedAppForReport.companyName}</strong></p>
                  </div>
                  <div className="flex gap-2.5">
                    {selectedAppForReport.status === "applied" && (
                      <span className="bg-yellow-50 text-yellow-800 text-xs font-semibold px-3 py-1.5 rounded-xl border border-yellow-100">
                        Durum: Değerlendiriliyor
                      </span>
                    )}
                    {selectedAppForReport.status === "accepted" && (
                      <span className="bg-green-50 text-green-800 text-xs font-semibold px-3 py-1.5 rounded-xl border border-green-150">
                        Durum: Kabul Edildi!
                      </span>
                    )}
                    {selectedAppForReport.status === "rejected" && (
                      <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-3 py-1.5 rounded-xl border border-gray-200">
                        Başvuru Sonuçlandı
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-6 space-y-8">
                  {/* AI Evaluation Report (If exists) */}
                  {selectedAppForReport.aiCoachingReport && (
                    <div className="rounded-2xl border border-indigo-100 bg-indigo-50/20 p-5 space-y-5 relative">
                      <div className="absolute top-4 right-4 text-indigo-500/35">
                        <Sparkles className="h-10 w-10 animate-pulse" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-indigo-600" />
                        <h4 className="text-sm font-bold text-gray-950 uppercase tracking-wider">AI Kariyer Koçu Değerlendirmesi</h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                        {/* Circle Matching score */}
                        <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-indigo-100 shadow-sm text-center">
                          <p className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-2">Eşleşme Oranı</p>
                          <div className="relative flex items-center justify-center h-20 w-20">
                            {/* SVG circle */}
                            <svg className="absolute transform -rotate-90 w-full h-full">
                              <circle cx="40" cy="40" r="34" stroke="#EEF2F6" strokeWidth="6" fill="transparent" />
                              <circle cx="40" cy="40" r="34" stroke="#4F46E5" strokeWidth="6" fill="transparent"
                                      strokeDasharray={`${2 * Math.PI * 34}`}
                                      strokeDashoffset={`${2 * Math.PI * 34 * (1 - (selectedAppForReport.aiCoachingReport.matchingScore || 80) / 100)}`} />
                            </svg>
                            <span className="text-xl font-bold text-gray-900">% {selectedAppForReport.aiCoachingReport.matchingScore}</span>
                          </div>
                        </div>

                        {/* Progress meters for traits */}
                        <div className="md:col-span-2 space-y-3">
                          <div>
                            <div className="flex items-center justify-between text-xs font-bold text-gray-700 mb-1">
                              <span>İlgi & Motivasyon</span>
                              <span className="text-indigo-600">%{selectedAppForReport.aiCoachingReport.ratings.motivation}</span>
                            </div>
                            <div className="h-2 w-full bg-gray-100 rounded-lg overflow-hidden">
                              <div className="h-full bg-indigo-600 rounded-lg" style={{ width: `${selectedAppForReport.aiCoachingReport.ratings.motivation}%` }} />
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center justify-between text-xs font-bold text-gray-700 mb-1">
                              <span>Problem Çözme Yeteneği</span>
                              <span className="text-indigo-600">%{selectedAppForReport.aiCoachingReport.ratings.problemSolving}</span>
                            </div>
                            <div className="h-2 w-full bg-gray-100 rounded-lg overflow-hidden">
                              <div className="h-full bg-indigo-600 rounded-lg" style={{ width: `${selectedAppForReport.aiCoachingReport.ratings.problemSolving}%` }} />
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center justify-between text-xs font-bold text-gray-700 mb-1">
                              <span>Gözleme Uyum & Merak</span>
                              <span className="text-indigo-600">%{selectedAppForReport.aiCoachingReport.ratings.adaptability}</span>
                            </div>
                            <div className="h-2 w-full bg-gray-100 rounded-lg overflow-hidden">
                              <div className="h-full bg-indigo-600 rounded-lg" style={{ width: `${selectedAppForReport.aiCoachingReport.ratings.adaptability}%` }} />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Coaching Feedback Text */}
                      <div className="bg-white p-4 rounded-xl border border-indigo-150">
                        <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                          <BookmarkCheck className="h-4 w-4" />
                          AI Koçun Öğrenci Tavsiyesi
                        </p>
                        <p className="text-xs text-gray-700 leading-relaxed italic">
                          "{selectedAppForReport.aiCoachingReport.coachingFeedback}"
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Company feedback report if accepted */}
                  {selectedAppForReport.evalFeedback && (
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/20 p-5 space-y-2">
                      <div className="flex items-center gap-2 text-emerald-800">
                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                        <h4 className="text-sm font-bold uppercase tracking-wider">Şirket Değerlendirme Mesajı</h4>
                      </div>
                      <p className="text-xs text-gray-700 leading-relaxed">
                        {selectedAppForReport.evalFeedback}
                      </p>
                    </div>
                  )}

                  {/* Student Answers to tryout quiz */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">Mülakat Soru & Cevapların</h4>
                    {selectedAppForReport.answers && selectedAppForReport.answers.map((ans, idx) => (
                      <div key={idx} className="bg-gray-50 p-4 rounded-2xl border border-gray-150">
                        <p className="text-xs font-bold text-gray-500 mb-1.5 flex gap-1.5">
                          <HelpCircle className="h-3.5 w-3.5 text-indigo-500 shrink-0 mt-0.5" />
                          Soru {idx+1}: {listings.find(l => l.id === selectedAppForReport.listingId)?.quizQuestions[idx] || "Mülakat Sorusu"}
                        </p>
                        <p className="text-xs font-semibold text-gray-800 bg-white p-3 rounded-lg border border-gray-100 whitespace-pre-wrap">
                          {ans || "Yanıt belirtilmedi"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center text-gray-400">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-30 text-indigo-600" />
                <p className="text-sm font-semibold">Tıklayarak bir başvurunu seçip detaylarını, AI Kariyer Koçu analiz raporunu ve şirket mülakat sonucunu inceleyebilirsin.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tryout Intern Program Details Modal */}
      {selectedListingDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl bg-white rounded-3xl p-6 shadow-xl space-y-6 max-h-[90vh] overflow-y-auto relative"
          >
            <button
              onClick={() => setSelectedListingDetails(null)}
              className="absolute top-5 right-5 p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition"
            >
              <X className="h-5 w-5" />
            </button>

            <div>
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                {selectedListingDetails.category}
              </span>
              <h3 className="text-xl font-bold text-gray-950 mt-3">{selectedListingDetails.title}</h3>
              <p className="text-sm font-semibold text-gray-500 flex items-center gap-1.5 mt-1.5">
                <Building className="h-4 w-4 text-gray-400" />
                {selectedListingDetails.companyName}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Staj Açıklaması</h4>
                <p className="text-xs text-gray-650 leading-relaxed bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                  {selectedListingDetails.description}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">1 Haftalık Gözlem Seansı Planı</h4>
                <div className="space-y-2">
                  {selectedListingDetails.weeksPlan && selectedListingDetails.weeksPlan.map((plan, idx) => (
                    <div key={idx} className="flex gap-3 text-xs leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <span className="font-extrabold text-indigo-600 shrink-0 px-2 py-0.5 bg-indigo-50 border border-indigo-100 rounded-md h-fit">
                        {idx + 1}. Gün
                      </span>
                      <p className="text-gray-700">{plan}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center text-xs mt-4 pt-4 border-t border-gray-100">
                <span className="text-gray-400 font-medium">Bölge: <strong>{selectedListingDetails.locationCity}</strong> ({selectedListingDetails.locationType})</span>
                <span className="text-indigo-600 font-semibold">{selectedListingDetails.quizQuestions.length} Hazırlık Sorusunu Çözmen Gerekir</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setSelectedListingDetails(null)}
                className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-xs font-bold text-gray-750 hover:bg-gray-50"
              >
                Kapat
              </button>
              <button
                onClick={() => handleOpenApply(selectedListingDetails)}
                className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 text-xs font-bold shadow-md shadow-indigo-100 flex items-center justify-center gap-1.5"
              >
                Hemen Mülakata Gir
                <Sparkles className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Application Wizard Modal (Interview) */}
      {selectedListingForApply && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-xl bg-white rounded-3xl p-6 shadow-xl space-y-6 max-h-[90vh] overflow-y-auto relative"
          >
            <button
              onClick={() => setSelectedListingForApply(null)}
              className="absolute top-5 right-5 p-1 rounded-full text-gray-400 hover:bg-gray-105 hover:text-gray-900 transition"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Title */}
            <div>
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">TRYOUT BAŞVURU SİHİRBAZI</span>
              <h3 className="text-lg font-black text-gray-900 mt-1">
                {selectedListingForApply.title}
              </h3>
              <p className="text-xs text-gray-500 font-medium">{selectedListingForApply.companyName}</p>
            </div>

            {/* Steps indicator */}
            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-1.5 rounded-full bg-indigo-600" />
              <div className={`flex-1 h-1.5 rounded-full ${applyStep !== "profile" ? "bg-indigo-600" : "bg-gray-100"}`} />
              <div className={`flex-1 h-1.5 rounded-full ${applyStep === "submitting" ? "bg-indigo-600" : "bg-gray-100"}`} />
            </div>

            {submittingError && (
              <div className="bg-rose-50 border border-rose-150 p-3 rounded-xl flex items-center gap-2 text-rose-800 text-xs">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{submittingError}</span>
              </div>
            )}

            {applyStep === "profile" ? (
              /* Step 1: Profile check before quiz */
              <div className="space-y-4">
                <p className="text-xs text-gray-500 leading-relaxed">
                  Şirkete iletilecek olan profil ve ilgi alanlarını aşağıda teyit et. Mülakat cevaplarınla beraber bu bilgiler değerlendirilecektir.
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-505 mb-1">Adın Soyadın</label>
                    <input
                      type="text"
                      id="wizard-name-field"
                      value={studentProfile.name}
                      onChange={(e) => setStudentProfile({ ...studentProfile, name: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-xs outline-none focus:border-indigo-500"
                      placeholder="Örn: Mehmet Can"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-505 mb-1">E-posta Adresin</label>
                    <input
                      type="email"
                      id="wizard-email-field"
                      value={studentProfile.email}
                      onChange={(e) => setStudentProfile({ ...studentProfile, email: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-xs outline-none focus:border-indigo-500"
                      placeholder="Örn: mehmet@lise.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-550 mb-1">Lise Detayların & İlgi Alanların</label>
                    <textarea
                      id="wizard-interests-field"
                      value={studentProfile.interests}
                      onChange={(e) => setStudentProfile({ ...studentProfile, interests: e.target.value })}
                      rows={3}
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-xs outline-none resize-none focus:border-indigo-500"
                      placeholder="Hangi konular ilginizi çekiyor? (Yapay zeka, dijital çizim, araştırma vs...)"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    onClick={() => setSelectedListingForApply(null)}
                    className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50"
                  >
                    Vazgeç
                  </button>
                  <button
                    onClick={handleNextToQuiz}
                    className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 text-xs font-bold shadow-md shadow-indigo-100 flex items-center justify-center gap-1.5"
                  >
                    Mülakat Sorularına Geç
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : applyStep === "quiz" ? (
              /* Step 2: Custom Quiz / Interview answers */
              <div className="space-y-4">
                <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 mb-3 flex gap-2">
                  <Sparkles className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5 animate-pulse" />
                  <p className="text-[11px] leading-relaxed text-indigo-850">
                    <strong>Tavsiye:</strong> Şirket bu stajda teknik bilgi aramaz; ancak sorulara verdiğin samimi, meraklı ve istekli yanıtlar senin seçilmende büyük rol oynayacaktır. Her soruya en az 2-3 cümle yazmaya çalış!
                  </p>
                </div>

                <div className="space-y-5 max-h-[45vh] overflow-y-auto pr-1">
                  {selectedListingForApply.quizQuestions && selectedListingForApply.quizQuestions.map((question, idx) => (
                    <div key={idx} className="space-y-2">
                      <label className="block text-xs font-semibold text-gray-750">
                        Soru {idx + 1}: <span className="text-gray-900">{question}</span>
                      </label>
                      <textarea
                        id={`wizard-quiz-ans-${idx}`}
                        value={quizAnswers[idx]}
                        onChange={(e) => {
                          const updated = [...quizAnswers];
                          updated[idx] = e.target.value;
                          setQuizAnswers(updated);
                        }}
                        rows={3}
                        placeholder="Yanıtını samimi ve açıklayıcı bir dille buraya yaz..."
                        className="w-full rounded-xl border border-gray-250 px-4 py-2.5 text-xs outline-none resize-none focus:border-indigo-500"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => setApplyStep("profile")}
                    className="rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50"
                  >
                    Geri Git
                  </button>
                  <button
                    onClick={handleSubmitApplication}
                    className="flex-1 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-750 text-white px-4 py-2.5 text-xs font-bold shadow-md shadow-indigo-100 flex items-center justify-center gap-1.5"
                  >
                    Mülakatı Değerlendirmeye Gönder
                    <Sparkles className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              /* Step 3: Loading evaluation results */
              <div className="text-center py-12 space-y-4">
                <Loader2 className="h-10 w-10 text-indigo-600 animate-spin mx-auto" />
                <div>
                  <h4 className="text-sm font-bold text-gray-900">AI Kariyer Koçu Geri Bildirimi Hazırlıyor...</h4>
                  <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                    Mülakat cevaplarınla ilgi alanların saniyeler içinde bütünleştiriliyor. Yapay zeka senin için güçlü motivasyon skoru ve rehberlik raporunu tasarlıyor...
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
