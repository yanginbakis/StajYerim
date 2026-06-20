export interface Listing {
  id: string;
  title: string;
  companyName: string;
  category: "Teknoloji" | "Tasarım" | "Sağlık" | "Finans" | "Mühendislik" | "Sanat" | "Pazarlama" | string;
  description: string;
  weeksPlan: string[];
  locationType: "Uzaktan" | "Hibrit" | "Yerinde";
  locationCity: string;
  quizQuestions: string[];
  createdAt: number;
}

export interface Application {
  id: string;
  listingId: string;
  listingTitle: string;
  companyName: string;
  studentName: string;
  studentEmail: string;
  studentInterests: string;
  answers: string[];
  status: "applied" | "reviewing" | "accepted" | "rejected" | "completed";
  evalFeedback?: string;
  aiCoachingReport?: {
    matchingScore: number;
    coachingFeedback: string;
    ratings: {
      motivation: number;
      problemSolving: number;
      adaptability: number;
    }
  };
  createdAt: number;
}

export interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: number;
}

export interface StudentProfile {
  name: string;
  email: string;
  interests: string;
  grade: string; // örn: Lise 1, Lise 2...
}

export interface CompanyProfile {
  name: string;
  sector: string;
  location: string;
}

export interface TeamRoleAssignment {
  id: string;
  roleName: string;
  description: string;
  assignedName: string;
  assignedEmail?: string;
  assignedGrade?: string;
  notes?: string;
  status: "active" | "support" | "none";
  updatedAt: number;
}

