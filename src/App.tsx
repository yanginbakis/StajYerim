import React, { useState, useEffect } from "react";
import { 
  HeartHandshake, 
  Sparkles, 
  Briefcase, 
  BrainCircuit, 
  History, 
  Search, 
  GraduationCap, 
  Building2,
  Users,
  ChevronRight,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import Navbar from "./components/Navbar";
import StudentDashboard from "./components/StudentDashboard";
import CompanyDashboard from "./components/CompanyDashboard";
import AICounselor from "./components/AICounselor";
import LeftSidebarFeatures from "./components/LeftSidebarFeatures";
import { type Listing, type Application, type StudentProfile, type CompanyProfile } from "./types";
import { seedListingsIfEmpty } from "./utils/seed";
import { db, collection, getDocs, doc, deleteDoc } from "./lib/firebase";

export default function App() {
  // Global App States
  const [currentRole, setCurrentRole] = useState<"student" | "company">("student");
  const [activeTab, setActiveTab] = useState<string>("discover"); // Student tabs: discover, counselor, history / Company tabs: listings, applicants
  const [loading, setLoading] = useState(true);

  // Core Data Lists
  const [listings, setListings] = useState<Listing[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);

  // Local Profiles
  const [studentProfile, setStudentProfile] = useState<StudentProfile>({
    name: "Ömer Asaf Alp",
    email: "asaf.alp@lise.com",
    interests: "Mobil uygulama geliştirme, bilgisayar oyunları, dijital çizim ve teknoloji yenilikleri.",
    grade: "11. Sınıf (Lise 3)"
  });

  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>({
    name: "Atölye Piksel Ajansı",
    sector: "Dijital Tasarım & Reklam",
    location: "İstanbul"
  });

  // Load Data on startup
  useEffect(() => {
    async function loadInitialData() {
      setLoading(true);
      try {
        // Seed and load listings
        const loadedListings = await seedListingsIfEmpty();
        setListings(loadedListings);

        // Load applications from Firestore
        const appSnapshot = await getDocs(collection(db, "applications"));
        const loadedApps: Application[] = [];
        appSnapshot.forEach((doc) => {
          const data = doc.data();
          loadedApps.push({
            id: doc.id,
            listingId: data.listingId || "",
            listingTitle: data.listingTitle || "",
            companyName: data.companyName || "",
            studentName: data.studentName || "",
            studentEmail: data.studentEmail || "",
            studentInterests: data.studentInterests || "",
            answers: data.answers || [],
            status: data.status || "applied",
            evalFeedback: data.evalFeedback,
            aiCoachingReport: data.aiCoachingReport,
            createdAt: data.createdAt || Date.now()
          });
        });
        
        // Return reverse sorted
        setApplications(loadedApps.sort((a,b) => b.createdAt - a.createdAt));
      } catch (error) {
        console.error("Error loading application states:", error);
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, []);

  // Action methods
  const handleNewApplication = (newApp: Application) => {
    setApplications((prev) => [newApp, ...prev]);
  };

  const handleNewListing = (newListing: Listing) => {
    setListings((prev) => [newListing, ...prev]);
  };

  const handleUpdateApplicationStatus = (appId: string, status: Application["status"], feedback: string) => {
    setApplications((prev) =>
      prev.map((app) =>
        app.id === appId
          ? {
              ...app,
              status,
              evalFeedback: feedback || (status === "accepted" ? "Tebrikler, 1 haftalık mülakatınız kabul edildi!" : "Başvurunuz olumsuz sonuçlandı.")
            }
          : app
      )
    );
  };

  const handleDeleteListing = async (id: string) => {
    try {
      // Remove from firebase
      await deleteDoc(doc(db, "listings", id));
      // Remove from state
      setListings((prev) => prev.filter((item) => item.id !== id));
    } catch (e) {
      console.error("Listing deletion error:", e);
      // fallback state delete
      setListings((prev) => prev.filter((item) => item.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-gray-800 antialiased font-sans flex flex-col justify-between">
      {/* Dynamic Top Navigation Bar */}
      <Navbar
        currentRole={currentRole}
        onRoleChange={(role) => setCurrentRole(role)}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
        }}
      />

      {/* Main Main Stage Area with adaptive width container */}
      <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="h-10 w-10 text-indigo-650 animate-spin" />
            <p className="text-gray-500 font-semibold text-sm">StajYerim Platformu Yükleniyor...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Header Description context (Welcome Board for specific roles) */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                  {currentRole === "student" ? "Öğrenci Deneme Portalı" : "İş Veren İlan & Değerlendirme Portalı"}
                  <span className="text-indigo-600">.</span>
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  {currentRole === "student"
                    ? "Meslekleri henüz lisedeyken 1 haftalık deneme stajlarıyla bizzat mutfağında tecrübe edin."
                    : "Lise düzeyindeki istekli adaylarla 1 haftalık gözlem programları kurgulayarak yarının yeteneklerini keşfedin."}
                </p>
              </div>

              {/* Action buttons inside Student View */}
              {currentRole === "student" && (
                <div className="flex flex-wrap gap-2">
                  <button
                    id="sub-tab-browse-btn"
                    onClick={() => setActiveTab("discover")}
                    className={`flex items-center gap-1.5 px-4  py-2 rounded-xl text-xs font-bold transition duration-150 ${
                      activeTab === "discover"
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "bg-white text-gray-650 hover:bg-gray-100 border border-gray-200"
                    }`}
                  >
                    <Briefcase className="h-4 w-4" />
                    Staj Ara
                  </button>
                  <button
                    id="sub-tab-advisor-btn"
                    onClick={() => setActiveTab("counselor")}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition duration-150 ${
                      activeTab === "counselor"
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "bg-white text-gray-650 hover:bg-gray-100 border border-gray-200"
                    }`}
                  >
                    <BrainCircuit className="h-4 w-4" />
                    AI Kariyer Danışmanı
                  </button>
                  <button
                    id="sub-tab-history-btn"
                    onClick={() => setActiveTab("history")}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition duration-150 ${
                      activeTab === "history"
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "bg-white text-gray-650 hover:bg-gray-100 border border-gray-200"
                    }`}
                  >
                    <History className="h-4 w-4" />
                    Başvurularım & Sonuçlar
                  </button>
                </div>
              )}
            </div>

            {/* Split layout: Left sidebar for Team Role Assignments, Right for Main Views */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
              {/* Left Column - Sticky Team assignments sidebar */}
              <div className="md:col-span-1 lg:col-span-4 xl:col-span-3 md:sticky md:top-6">
                <LeftSidebarFeatures />
              </div>

              {/* Right Column - Main dashboard interactive routing */}
              <div className="md:col-span-2 lg:col-span-8 xl:col-span-9 min-h-[500px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${currentRole}-${activeTab}`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.2 }}
                  >
                    {currentRole === "student" ? (
                      activeTab === "counselor" ? (
                        <AICounselor
                          studentProfile={studentProfile}
                          setStudentProfile={(p) => setStudentProfile(p)}
                        />
                      ) : (
                        <StudentDashboard
                          listings={listings}
                          applications={applications}
                          onNewApplication={handleNewApplication}
                          studentProfile={studentProfile}
                          setStudentProfile={(p) => setStudentProfile(p)}
                          activeSubTab={activeTab === "discover" ? "discover" : "history"}
                          setActiveSubTab={(tab) => {
                            if (tab === "discover") setActiveTab("discover");
                            else setActiveTab("history");
                          }}
                        />
                      )
                    ) : (
                      <CompanyDashboard
                        listings={listings}
                        applications={applications}
                        onNewListing={handleNewListing}
                        onUpdateApplicationStatus={handleUpdateApplicationStatus}
                        onDeleteListing={handleDeleteListing}
                        companyProfile={companyProfile}
                        setCompanyProfile={(p) => setCompanyProfile(p)}
                        activeSubTab={activeTab === "listings" ? "listings" : "applicants"}
                        setActiveSubTab={(tab) => {
                          if (tab === "listings") setActiveTab("listings");
                          else setActiveTab("applicants");
                        }}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Corporate/Academic Footer */}
      <footer className="bg-white border-t border-gray-150 py-8 mt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <p className="text-xs text-gray-400 font-semibold tracking-wide uppercase">
            &copy; 2026 StajYerim Kariyer ve Gelişim Platformu. Lise Öğrencileri İçin Özel Tasarlanmıştır.
          </p>
          <div className="flex justify-center gap-6 text-xs text-gray-450 font-medium">
            <span className="hover:text-indigo-600 cursor-pointer">Rehberlik Dokümanı</span>
            <span className="hover:text-indigo-600 cursor-pointer">Şirket Protokolleri</span>
            <span className="hover:text-indigo-600 cursor-pointer">İletişim & Destek</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
