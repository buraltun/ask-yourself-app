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
