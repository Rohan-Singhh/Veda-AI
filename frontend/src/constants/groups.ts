export interface GroupInfo {
  id: string;
  name: string;
  subject: string;
  studentsCount: number;
  avatarText: string;
  bgGradient: string;
  borderColor: string;
  defaultTopic: string;
}

export const DEFAULT_GROUPS: GroupInfo[] = [
  {
    id: "g1",
    name: "Class 10-A Science",
    subject: "Science",
    studentsCount: 32,
    avatarText: "10S",
    bgGradient: "linear-gradient(135deg, #10b981, #059669)",
    borderColor: "#10b981",
    defaultTopic: "Chemical Reactions",
  },
  {
    id: "g2",
    name: "Class 11-C Physics",
    subject: "Physics",
    studentsCount: 35,
    avatarText: "11P",
    bgGradient: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
    borderColor: "#3b82f6",
    defaultTopic: "Thermodynamics",
  },
  {
    id: "g3",
    name: "Class 9-B English",
    subject: "English",
    studentsCount: 28,
    avatarText: "09E",
    bgGradient: "linear-gradient(135deg, #f59e0b, #d97706)",
    borderColor: "#f59e0b",
    defaultTopic: "Reading Comprehension",
  },
  {
    id: "g4",
    name: "Class 12-A Chemistry",
    subject: "Chemistry",
    studentsCount: 30,
    avatarText: "12C",
    bgGradient: "linear-gradient(135deg, #ec4899, #be185d)",
    borderColor: "#ec4899",
    defaultTopic: "Organic Chemistry",
  },
];
