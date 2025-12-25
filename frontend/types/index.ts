export interface Question {
  id: number;
  text: string;
}

export interface Answer {
  date: string;
  questionId: number;
  questionText: string;
  answer: string;
  createdAt: number;
}

export interface NotificationSettings {
  enabled: boolean;
  time: string;
}

export interface User {
  id: string;
  email: string | null;
  fullName: string | null;
  isAnonymous: boolean;
}
