import { Result, QueryFilters, PaginatedResult } from '../common';
import {
  Question,
  Assessment,
  Answer,
  AssessmentResult,
  CreateAssessmentRequest,
  SubmitAnswersRequest,
  AssessmentProgress,
  AssessmentStatus
} from '../../entities';

export interface IAssessmentRepository {
  // Question management
  getAllQuestions(): Promise<Result<Question[]>>;
  getQuestionById(questionId: number): Promise<Result<Question>>;
  createQuestion(question: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>): Promise<Result<Question>>;
  updateQuestion(questionId: number, updates: Partial<Question>): Promise<Result<Question>>;
  deleteQuestion(questionId: number): Promise<Result<void>>;

  // Assessment management
  createAssessment(request: CreateAssessmentRequest): Promise<Result<Assessment>>;
  getAssessmentById(assessmentId: string): Promise<Result<Assessment>>;
  getUserAssessments(userId: string): Promise<Result<Assessment[]>>;
  updateAssessmentStatus(assessmentId: string, status: AssessmentStatus): Promise<Result<Assessment>>;
  deleteAssessment(assessmentId: string): Promise<Result<void>>;

  // Answer management
  saveAnswer(answer: Omit<Answer, 'id' | 'createdAt'>): Promise<Result<Answer>>;
  saveAnswers(answers: Omit<Answer, 'id' | 'createdAt'>[]): Promise<Result<Answer[]>>;
  getAssessmentAnswers(assessmentId: string): Promise<Result<Answer[]>>;
  getUserAnswers(userId: string, assessmentId?: string): Promise<Result<Answer[]>>;
  deleteAssessmentAnswers(assessmentId: string): Promise<Result<void>>;

  // Assessment submission and evaluation
  submitAssessment(request: SubmitAnswersRequest): Promise<Result<AssessmentResult>>;
  getAssessmentResult(assessmentId: string): Promise<Result<AssessmentResult>>;
  getUserResults(userId: string): Promise<Result<AssessmentResult[]>>;

  // Assessment progress tracking
  getAssessmentProgress(assessmentId: string): Promise<Result<AssessmentProgress>>;
  updateAssessmentProgress(assessmentId: string, progress: Partial<AssessmentProgress>): Promise<Result<AssessmentProgress>>;

  // Assessment statistics and reporting
  getAllAssessments(filters?: QueryFilters): Promise<Result<PaginatedResult<Assessment>>>;
  getAssessmentStatistics(): Promise<Result<{
    totalAssessments: number;
    completedAssessments: number;
    averageScore: number;
    completionRate: number;
  }>>;

  // Bulk operations
  getAllResults(filters?: QueryFilters): Promise<Result<PaginatedResult<AssessmentResult>>>;
  exportAssessmentData(userId?: string): Promise<Result<any>>;
}