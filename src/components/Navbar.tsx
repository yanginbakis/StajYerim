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
        <div className="flex items-center gap-3.5">
          {/* Custom SVG Logo matching StajYerim graduation cap + arrow design */}
          <div className="flex items-center justify-center">
            <svg 
              className="h-10 w-10 text-indigo-600 animate-pulse duration-1000" 
              viewBox="0 0 100 100" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              id="custom-stajyerim-logo"
            >
              {/* Gradients */}
              <defs>
                <linearGradient id="logo-blue-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2563EB" />
                  <stop offset="100%" stopColor="#3B82F6" />
                </linearGradient>
                <linearGradient id="logo-sky-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#60A5FA" />
                  <stop offset="100%" stopColor="#93C5FD" />
                </linearGradient>
                <linearGradient id="logo-dark-blue" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1E40AF" />
                  <stop offset="100%" stopColor="#1D4ED8" />
                </linearGradient>
              </defs>
              
              {/* Mortarboard (Graduation Cap) Top Board - Styled as Diamond */}
              <path 
                d="M 50 15 L 85 30 L 50 45 L 15 30 Z" 
                fill="url(#logo-blue-grad)" 
              />
              
              {/* Tassel Hanging Left */}
              <path 
                d="M 33 23 L 26 38 C 26 40 24 41.5 22.5 41.5 C 21 41.5 21 40 21 38 Z" 
                fill="url(#logo-dark-blue)" 
              />
              
              {/* Shield/Heart Lower Cap Support Body */}
              <path 
                d="M 37 45 C 37 60, 50 68, 50 68" 
                stroke="url(#logo-blue-grad)" 
                strokeWidth="7" 
                strokeLinecap="round" 
                fill="none"
              />
              <path 
                d="M 63 45 C 63 60, 50 68, 50 68" 
                stroke="url(#logo-sky-grad)" 
                strokeWidth="7" 
                strokeLinecap="round" 
                fill="none"
              />

              {/* Intersecting Arrow weaving upward and out */}
              <path 
                d="M 40 58 Q 50 48, 52 50 T 78 22" 
                stroke="url(#logo-blue-grad)" 
                strokeWidth="7" 
                strokeLinecap="round"
                fill="none"
              />
              {/* Arrow Head */}
              <path 
                d="M 68 22 L 79 21 L 78 32 C 77.5 27 73 22.5 68 22 Z" 
                fill="url(#logo-blue-grad)" 
              />
              
              {/* Central small shield overlay */}
              <path 
                d="M 50 38 C 45 44, 46 54, 50 58 C 54 54, 55 44, 50 38 Z" 
                fill="url(#logo-sky-grad)" 
                opacity="0.9"
              />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="text-xl font-black tracking-tight text-gray-900">
                <span className="text-indigo-650">Staj</span>
                <span className="text-blue-500">Yerim</span>
              </span>
              <span className="rounded-full bg-blue-50 border border-blue-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-blue-600">
                PRO
              </span>
            </div>
            <span className="block text-[8px] font-extrabold tracking-widest text-slate-450 uppercase leading-none mt-0.5">
              Lise Staj Bulma Platformu
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
