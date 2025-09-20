export interface Question {
  id: number;
  descripcion: string;
  category?: string;
  order: number;
  isRequired: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AnswerOption {
  label: string;
  value: number;
  weight: number;
}

export interface Answer {
  id: string;
  questionId: number;
  userId: string;
  response: string;
  responseValue: number;
  createdAt: Date;
}

export interface Assessment {
  id: string;
  userId: string;
  title: string;
  description: string;
  questions: Question[];
  answers: Answer[];
  status: AssessmentStatus;
  startedAt: Date;
  completedAt?: Date;
  lastModifiedAt: Date;
}

export interface AssessmentResult {
  id: string;
  assessmentId: string;
  userId: string;
  score: number;
  maxScore: number;
  percentage: number;
  interpretation: string;
  recommendations: string[];
  severity: SeverityLevel;
  calculatedAt: Date;
}

export interface CreateAssessmentRequest {
  userId: string;
  title: string;
  description: string;
}

export interface SubmitAnswersRequest {
  assessmentId: string;
  userId: string;
  answers: {
    questionId: number;
    response: string;
  }[];
}

export interface AssessmentProgress {
  assessmentId: string;
  totalQuestions: number;
  answeredQuestions: number;
  currentQuestionIndex: number;
  percentageCompleted: number;
}

export enum AssessmentStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  EVALUATED = 'EVALUATED'
}

export enum SeverityLevel {
  NONE = 'NONE',
  MILD = 'MILD',
  MODERATE = 'MODERATE',
  SEVERE = 'SEVERE',
  VERY_SEVERE = 'VERY_SEVERE'
}

export const ANSWER_OPTIONS: AnswerOption[] = [
  { label: "Nada", value: 0, weight: 0 },
  { label: "Muy poco", value: 1, weight: 1 },
  { label: "Un poco", value: 2, weight: 2 },
  { label: "Mucho", value: 3, weight: 3 },
  { label: "Demasiado", value: 4, weight: 4 }
];