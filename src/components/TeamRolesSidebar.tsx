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
  SearchCode,
  Briefcase,
  FileText,
  UserCheck2,
  Trash2
} from "lucide-react";
import { db, collection, getDocs, doc, setDoc, deleteDoc } from "../lib/firebase";
import { type TeamRoleAssignment } from "../types";

// Static Initial Roles definitions
const DEFAULT_ROLES = [
  {
    id: "problem_analyst",
    roleName: "Problem Analisti",
    description: "Gözlemlenen sorunları veya pazar ihtiyaçlarını tespit eder, yapılandırır ve analiz eder.",
    icon: HelpCircle,
    color: "text-amber-600 bg-amber-50 border-amber-250"
  },
  {
    id: "researcher",
    roleName: "Araştırma Uzmanı",
    description: "Hedef kitle beklentilerini, pazar büyüklüğünü ve rakip çözümleri araştırır.",
    icon: Search,
    color: "text-blue-600 bg-blue-50 border-blue-250"
  },
  {
    id: "business_modeler",
    roleName: "İş Modeli Uzmanı",
    description: "Çözümün nasıl gelir elde edeceğini, maliyetleri ve değer önerisini tasarlar.",
    icon: Briefcase,
    color: "text-emerald-600 bg-emerald-50 border-emerald-250"
  },
  {
    id: "ai_architect",
    roleName: "Yapay Zeka Mimarı",
    description: "Süreçte hangi yapay zeka teknolojilerinin ve modellerinin kullanılacağına karar verir.",
    icon: Brain,
    color: "text-indigo-600 bg-indigo-50 border-indigo-250"
  },
  {
    id: "prompt_engineer",
    roleName: "Prompt Mühendisi",
    description: "Gerekli prompt'ları tasarlar, test eder ve yapay zeka çıktılarının kalitesini optimize eder.",
    icon: Sparkles,
    color: "text-purple-600 bg-purple-50 border-purple-250"
  },
  {
    id: "brand_designer",
    roleName: "Marka Tasarımcısı",
    description: "Logodan renk paletine kadar projenin kurumsal kimliğini ve tasarım dilini kurgular.",
    icon: Palette,
    color: "text-rose-600 bg-rose-50 border-rose-250"
  },
  {
    id: "content_designer",
    roleName: "İçerik Tasarımcısı",
    description: "Web/mobil arayüz metinlerini, sosyal medya postlarını ve sunum içeriklerini hazırlar.",
    icon: FileText,
    color: "text-orange-600 bg-orange-50 border-orange-250"
  },
  {
    id: "prototype_developer",
    roleName: "Prototip Geliştiricisi",
    description: "Uygulamanın çalışan ilk çalışan taslağını (MVP) veya akışını teknik olarak hayata geçirir.",
    icon: Code,
    color: "text-teal-600 bg-teal-50 border-teal-250"
  },
  {
    id: "pitch_relations",
    roleName: "Sunum ve Yatırımcı İlişkileri Uzmanı",
    description: "Yatırımcılara sunum yapacak pitch deck'leri hazırlar, ekip hikayesini anlatır.",
    icon: TrendingUp,
    color: "text-cyan-600 bg-cyan-50 border-cyan-250"
  }
];

// Mock autocomplete student names list for quick assignment
const POPULAR_STUDENTS = [
  "Ayşe Yılmaz", "Ahmet Demir", "Elif Kaya", "Mehmet Öztürk", 
  "Zeynep Çelik", "Can Şahin", "Yağmur Koç", "Burak Arslan", 
  "Merve Yıldız", "Yiğit Doğan", "Selin Kılıç", "Kaan Aydın"
];

const GRADES = ["9. Sınıf", "10. Sınıf", "11. Sınıf", "12. Sınıf", "Mezun"];

export default function TeamRolesSidebar() {
  const [loading, setLoading] = useState<boolean>(true);
  const [roles, setRoles] = useState<TeamRoleAssignment[]>([]);
  const [selectedRole, setSelectedRole] = useState<TeamRoleAssignment | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showForm, setShowForm] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  
  // Form States
  const [formName, setFormName] = useState<string>("");
  const [formEmail, setFormEmail] = useState<string>("");
  const [formGrade, setFormGrade] = useState<string>("11. Sınıf");
  const [formNotes, setFormNotes] = useState<string>("");
  const [formStatus, setFormStatus] = useState<"active" | "support" | "none">("active");

  const [notification, setNotification] = useState<{message: string; type: "success" | "deleted" | null}>({
    message: "",
    type: null
  });

  // Load team roles from Firestore on component mount
  useEffect(() => {
    async function fetchTeamRoles() {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "team_roles"));
        const dbRolesMap: { [key: string]: Partial<TeamRoleAssignment> } = {};
        
        querySnapshot.forEach((doc) => {
          dbRolesMap[doc.id] = doc.data() as Partial<TeamRoleAssignment>;
        });

        // Map the default roles in order, merge with db assignments
        const mergedRoles: TeamRoleAssignment[] = DEFAULT_ROLES.map((def) => {
          const dbData = dbRolesMap[def.id];
          return {
            id: def.id,
            roleName: def.roleName,
            description: def.description,
            assignedName: dbData?.assignedName || "",
            assignedEmail: dbData?.assignedEmail || "",
            assignedGrade: dbData?.assignedGrade || "11. Sınıf",
            notes: dbData?.notes || "",
            status: dbData?.status || "none",
            updatedAt: dbData?.updatedAt || Date.now()
          };
        });

        setRoles(mergedRoles);
      } catch (error) {
        console.error("Firestore team_roles collection reading error:", error);
        // Fallback to offline defaults
        const offlineRoles = DEFAULT_ROLES.map((def) => ({
          id: def.id,
          roleName: def.roleName,
          description: def.description,
          assignedName: "",
          assignedEmail: "",
          assignedGrade: "11. Sınıf",
          notes: "",
          status: "none" as const,
          updatedAt: Date.now()
        }));
        setRoles(offlineRoles);
      } finally {
        setLoading(false);
      }
    }

    fetchTeamRoles();
  }, []);

  // Show status indicator values
  const assignedCount = roles.filter(r => r.status !== "none" && r.assignedName.trim() !== "").length;
  const coverageRatePercent = Math.round((assignedCount / DEFAULT_ROLES.length) * 100);

  // Auto-hide alert banners after 3 seconds
  useEffect(() => {
    if (notification.message) {
      const timer = setTimeout(() => {
        setNotification({ message: "", type: null });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Open edit modal
  const handleEditRole = (role: TeamRoleAssignment) => {
    setSelectedRole(role);
    setFormName(role.assignedName);
    setFormEmail(role.assignedEmail || "");
    setFormGrade(role.assignedGrade || "11. Sınıf");
    setFormNotes(role.notes || "");
    setFormStatus(role.status === "none" ? "active" : role.status);
    setShowForm(true);
  };

  // Quick Random Mock Student filler
  const handleQuickAssignMock = () => {
    const randomName = POPULAR_STUDENTS[Math.floor(Math.random() * POPULAR_STUDENTS.length)];
    const randomGrade = GRADES[Math.floor(Math.random() * (GRADES.length - 1))];
    const emailPrefix = randomName.toLowerCase().replace(/[^a-z]/g, "");
    setFormName(randomName);
    setFormEmail(`${emailPrefix}@lise.edu.tr`);
    setFormGrade(randomGrade);
    setFormStatus("active");
    if (!formNotes) {
      setFormNotes(`${selectedRole?.roleName} görevlerini yürütecek.`);
    }
  };

  // Clear role assignment
  const handleClearRole = async (roleId: string) => {
    if (!confirm("Bu görevin atamasını kaldırmak istediğinize emin misiniz?")) return;
    
    setSaving(true);
    try {
      // Delete document or set data parameters to defaults
      await deleteDoc(doc(db, "team_roles", roleId));

      setRoles((prev) =>
        prev.map((r) =>
          r.id === roleId
            ? {
                ...r,
                assignedName: "",
                assignedEmail: "",
                assignedGrade: "11. Sınıf",
                notes: "",
                status: "none",
                updatedAt: Date.now()
              }
            : r
        )
      );

      setNotification({
        message: "Rol ataması başarıyla kaldırıldı.",
        type: "deleted"
      });
      setShowForm(false);
      setSelectedRole(null);
    } catch (error) {
      console.error("Firestore removal error: ", error);
      alert("Atama silinirken bir hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  // Save changes to Firestore
  const handleSaveRoleAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;

    if (!formName.trim()) {
      alert("Lütfen görevlinin adını giriniz.");
      return;
    }

    setSaving(true);

    const updatedData: Partial<TeamRoleAssignment> = {
      id: selectedRole.id,
      roleName: selectedRole.roleName,
      assignedName: formName.trim(),
      assignedEmail: formEmail.trim(),
      assignedGrade: formGrade,
      notes: formNotes.trim(),
      status: formStatus,
      updatedAt: Date.now()
    };

    try {
      // Save to firebase
      await setDoc(doc(db, "team_roles", selectedRole.id), updatedData);

      // Update state
      setRoles((prev) =>
        prev.map((r) =>
          r.id === selectedRole.id
            ? {
                ...r,
                assignedName: updatedData.assignedName || "",
                assignedEmail: updatedData.assignedEmail || "",
                assignedGrade: updatedData.assignedGrade || "11. Sınıf",
                notes: updatedData.notes || "",
                status: updatedData.status || "none",
                updatedAt: updatedData.updatedAt || Date.now()
              }
            : r
        )
      );

      setNotification({
        message: `"${selectedRole.roleName}" görevi başarıyla güncellendi.`,
        type: "success"
      });
      setShowForm(false);
      setSelectedRole(null);
    } catch (error) {
      console.error("Firestore save error: ", error);
      alert("Atama kaydedilirken hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  // Search filter
  const filteredRoles = roles.filter((role) => {
    const searchString = `${role.roleName} ${role.assignedName} ${role.notes}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-5 space-y-5" id="team-roles-panel">
      
      {/* Visual Identity Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="font-bold flex items-center justify-center h-9 w-9 bg-indigo-50 text-indigo-650 rounded-xl">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 tracking-tight">Takım Rol Atamaları</h3>
            <p className="text-xs text-gray-500 font-medium">1 Haftalık Startup Ekibi Kurulumu</p>
          </div>
        </div>
        
        {/* Fill Badge count */}
        <span className="text-xs font-bold px-2.5 py-1 bg-indigo-50 text-indigo-705 border border-indigo-100 rounded-lg">
          {assignedCount} / {DEFAULT_ROLES.length} Dolu
        </span>
      </div>

      {/* Dynamic progress bar */}
      <div className="space-y-1.5 bg-gray-50 p-3 rounded-xl border border-gray-100">
        <div className="flex items-center justify-between text-xs font-semibold text-gray-650">
          <span>Ekip Atama İlerlemesi</span>
          <span className="text-indigo-600">{coverageRatePercent}% Tamamlandı</span>
        </div>
        <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-500 rounded-full" 
            style={{ width: `${coverageRatePercent}%` }}
          />
        </div>
        <p className="text-[10px] leading-relaxed text-gray-400 font-medium">
          Mevcut rol dağılımına göre ekibinizi kurun. Görevleri atayabilmek için rol kartlarına tıklayın.
        </p>
      </div>

      {/* Live system notification alert popup */}
      {notification.message && (
        <div className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium border animate-pulse ${
          notification.type === "success" 
            ? "bg-emerald-50 text-emerald-800 border-emerald-250" 
            : "bg-amber-50 text-amber-800 border-amber-250"
        }`}>
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>{notification.message}</span>
        </div>
      )}

      {/* Role list filtering */}
      <div className="relative">
        <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-gray-400" />
        <input
          id="team-roles-search"
          type="text"
          placeholder="Görevi veya atanan ismi arayın..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-xs py-2.5 pl-10 pr-3.5 rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all font-medium"
        />
      </div>

      {/* Standard loader or empty elements */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-10 space-y-2">
          <Loader2 className="h-6 w-6 text-indigo-600 animate-spin" />
          <span className="text-xs text-gray-400 font-medium">Görevler listesi yükleniyor...</span>
        </div>
      ) : (
        <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
          {filteredRoles.length === 0 ? (
            <p className="text-center text-xs py-8 text-gray-400 font-medium bg-gray-50 rounded-xl border border-dashed border-gray-200">
              Aranan kritere uygun rol bulunamadı.
            </p>
          ) : (
            filteredRoles.map((role) => {
              const defDetails = DEFAULT_ROLES.find((d) => d.id === role.id) || DEFAULT_ROLES[0];
              const IconComponent = defDetails.icon;
              const hasAssignment = role.status !== "none" && role.assignedName.trim() !== "";

              return (
                <div
                  key={role.id}
                  onClick={() => handleEditRole(role)}
                  className={`group relative overflow-hidden flex flex-col p-3.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                    hasAssignment 
                      ? "bg-white border-indigo-150 hover:border-indigo-400/80 shadow-xs hover:shadow-xs" 
                      : "bg-gray-50/70 hover:bg-white border-gray-200/85 hover:border-indigo-300 shadow-none hover:shadow-xs"
                  }`}
                >
                  {/* Left Role Category Colored indicator border strip */}
                  <div className={`absolute top-0 bottom-0 left-0 w-1 ${hasAssignment ? "bg-indigo-650" : "bg-gray-300"}`} />

                  <div className="flex items-start justify-between gap-2.5 pl-1">
                    {/* Visual Role Icon representation */}
                    <div className="flex items-start gap-2.5">
                      <div className={`p-1.5 rounded-lg border flex items-center justify-center shrink-0 ${defDetails.color}`}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-gray-900 group-hover:text-indigo-650 transition">
                            {role.roleName}
                          </h4>
                          {hasAssignment && (
                            <span className="text-[9px] px-1.5 py-0.5 font-bold uppercase tracking-wider rounded-sm bg-emerald-50 text-emerald-708 border border-emerald-100">
                              {role.status === "active" ? "Aktif" : "Destek"}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] leading-relaxed text-gray-400 font-medium line-clamp-2">
                          {role.description}
                        </p>
                      </div>
                    </div>

                    {/* Pencil indicator */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 p-1 bg-gray-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-md">
                      <Edit3 className="h-3 w-3 text-gray-550" />
                    </div>
                  </div>

                  {/* Assingment Status Segment */}
                  <div className="mt-3.5 pt-2.5 border-t border-gray-100 flex items-center justify-between text-[11px] pl-1">
                    <span className="text-gray-400 font-bold uppercase tracking-wider">Atanan Kişi</span>
                    {hasAssignment ? (
                      <div className="flex items-center gap-1 text-gray-800 font-semibold bg-indigo-50/50 py-0.5 px-2 rounded-md border border-indigo-100/60 shadow-none">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="truncate max-w-[140px]">{role.assignedName}</span>
                        {role.assignedGrade && (
                          <span className="text-[10px] text-gray-450 font-medium">({role.assignedGrade})</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 font-medium italic flex items-center gap-1">
                        Atama Yok 👤
                      </span>
                    )}
                  </div>

                  {/* Show assignment notes inline if exists */}
                  {hasAssignment && role.notes && (
                    <div className="mt-1.5 pl-1.5 py-1 px-2 bg-gray-50/80 rounded-md text-[10px] text-gray-500 border border-gray-100 leading-normal italic line-clamp-1">
                      "{role.notes}"
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Standard popup modal dialog box for assigning a student to the role */}
      {showForm && selectedRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-gray-150 overflow-hidden animate-in fade-in-20 duration-200">
            
            {/* Modal Header banner */}
            <div className="p-5 border-b border-gray-100 bg-linear-to-r from-indigo-50 to-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 bg-indigo-650 text-white rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                  <UserPlus className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Rol Atama & Güncelleme</h4>
                  <p className="text-[11px] text-gray-500 font-semibold">{selectedRole.roleName}</p>
                </div>
              </div>
              <button 
                onClick={() => { setShowForm(false); setSelectedRole(null); }}
                className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal content area */}
            <form onSubmit={handleSaveRoleAssignment} className="p-5 space-y-4">
              
              {/* Info alert block about the role description */}
              <div className="flex items-start gap-2.5 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100/50 text-[11px] leading-relaxed text-indigo-805">
                <Info className="h-4 w-4 shrink-0 mt-0.5 text-indigo-600" />
                <div>
                  <span className="font-bold">Görev Tanımı: </span>
                  {selectedRole.description}
                </div>
              </div>

              {/* Mock quick auto-fill button */}
              <div className="flex justify-between items-center bg-gray-50 px-3.5 py-2 rounded-xl border border-gray-100">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Demo / Test Kolaylığı</span>
                <button
                  type="button"
                  onClick={handleQuickAssignMock}
                  className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-indigo-50 text-indigo-650 text-[10px] font-bold rounded-lg border border-gray-200 hover:border-indigo-200 transition-all shadow-xs"
                >
                  <Sparkles className="h-3 w-3" />
                  Rastgele Öğrenci Doldur
                </button>
              </div>

              {/* Student name */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-750 uppercase tracking-widest block">Görevli Öğrenci Adı Soyadı *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Eren Şen"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full text-xs py-2.5 px-3 rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Grade */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-750 uppercase tracking-widest block">Sınıf Seviyesi</label>
                  <select
                    value={formGrade}
                    onChange={(e) => setFormGrade(e.target.value)}
                    className="w-full text-xs py-2.5 px-3 rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all bg-white font-semibold"
                  >
                    {GRADES.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                {/* Status selection */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-750 uppercase tracking-widest block">Sorumluluk Seviyesi</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as "active" | "support" | "none")}
                    className="w-full text-xs py-2.5 px-3 rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all bg-white font-semibold"
                  >
                    <option value="active">Asil Görevli (Aktif)</option>
                    <option value="support">Yardımcı Sorumlu (Destek)</option>
                  </select>
                </div>
              </div>

              {/* Student Email */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-750 uppercase tracking-widest block">E-posta Adresi (İletişim)</label>
                <input
                  type="email"
                  placeholder="Örn: eren.sen@lise.edu.tr"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full text-xs py-2.5 px-3 rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all font-semibold"
                />
              </div>

              {/* Assignment Notes */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-750 uppercase tracking-widest block">Özel Çalışma Notları / Sorumluluk Alanı</label>
                <textarea
                  rows={2}
                  placeholder="Görevin kilit hedefleri, yapacağı çalışmalar veya çalışma alanına dair özel notlar..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full text-xs py-2 px-3 rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all font-medium leading-relaxed"
                />
              </div>

              {/* Actions Button panel */}
              <div className="flex items-center justify-between gap-2.5 pt-3 border-t border-gray-100">
                {/* Delete button if already assigned */}
                {selectedRole.status !== "none" && selectedRole.assignedName.trim() !== "" ? (
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => handleClearRole(selectedRole.id)}
                    className="flex items-center gap-1.5 px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-100 transition-all disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Kaldır
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => { setShowForm(false); setSelectedRole(null); }}
                    className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-650 text-xs font-bold rounded-xl transition-all disabled:opacity-50"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-1.5 px-4.5 py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs disabled:opacity-60 cursor-pointer"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Kaydediliyor...
                      </>
                    ) : (
                      <>
                        <UserCheck className="h-4 w-4" />
                        Atama Yap
                      </>
                    )}
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
