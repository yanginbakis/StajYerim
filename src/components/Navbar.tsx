import React from "react";
import { GraduationCap, Building2, Sparkles, User, Briefcase } from "lucide-react";

interface NavbarProps {
  currentRole: "student" | "company";
  onRoleChange: (role: "student" | "company") => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Navbar({
  currentRole,
  onRoleChange,
  activeTab,
  setActiveTab
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-100">
            <GraduationCap className="h-6 w-6" id="logo-cap-icon" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-gray-900 bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent">
              Stajyerim
            </span>
            <span className="ml-1.5 rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700">
              Lise Gelişim
            </span>
          </div>
        </div>

        {/* Global Role Toggle */}
        <div className="flex items-center gap-4">
          <div className="flex rounded-full bg-gray-100 p-1" id="role-toggle-container">
            <button
              id="role-student-btn"
              onClick={() => {
                onRoleChange("student");
                setActiveTab("discover");
              }}
              className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                currentRole === "student"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <User className="h-4 w-4" />
              Öğrenci
            </button>
            <button
              id="role-company-btn"
              onClick={() => {
                onRoleChange("company");
                setActiveTab("listings");
              }}
              className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                currentRole === "company"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Building2 className="h-4 w-4" />
              Şirket
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
