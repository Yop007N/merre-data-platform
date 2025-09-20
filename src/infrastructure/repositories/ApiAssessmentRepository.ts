import {
  IAssessmentRepository,
  Result,
  Question,
  Assessment,
  Answer,
  AssessmentResult,
  CreateAssessmentRequest,
  SubmitAnswersRequest,
  AssessmentProgress,
  AssessmentStatus,
  SeverityLevel,
  ANSWER_OPTIONS,
  QueryFilters,
  PaginatedResult,
  createSuccess,
  createFailure,
  createError
} from '../../domain';
import { HttpClient, HttpError } from '../http';

export class ApiAssessmentRepository implements IAssessmentRepository {
  constructor(private httpClient: HttpClient) {}

  async getAllQuestions(): Promise<Result<Question[]>> {
    try {
      const response = await this.httpClient.get<Question[]>('/preguntas');
      return createSuccess(response.data);
    } catch (error) {
      return this.handleError('GET_QUESTIONS_ERROR', 'Failed to get questions', error);
    }
  }

  async getQuestionById(questionId: number): Promise<Result<Question>> {
    try {
      const response = await this.httpClient.get<Question>(`/preguntas/${questionId}`);
      return createSuccess(response.data);
    } catch (error) {
      return this.handleError('GET_QUESTION_ERROR', 'Failed to get question', error);
    }
  }

  async createQuestion(question: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>): Promise<Result<Question>> {
    try {
      const response = await this.httpClient.post<Question>('/preguntas', {
        ...question,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return createSuccess(response.data);
    } catch (error) {
      return this.handleError('CREATE_QUESTION_ERROR', 'Failed to create question', error);
    }
  }

  async updateQuestion(questionId: number, updates: Partial<Question>): Promise<Result<Question>> {
    try {
      const response = await this.httpClient.put<Question>(`/preguntas/${questionId}`, {
        ...updates,
        updatedAt: new Date()
      });
      return createSuccess(response.data);
    } catch (error) {
      return this.handleError('UPDATE_QUESTION_ERROR', 'Failed to update question', error);
    }
  }

  async deleteQuestion(questionId: number): Promise<Result<void>> {
    try {
      await this.httpClient.delete(`/preguntas/${questionId}`);
      return createSuccess(undefined);
    } catch (error) {
      return this.handleError('DELETE_QUESTION_ERROR', 'Failed to delete question', error);
    }
  }

  async createAssessment(request: CreateAssessmentRequest): Promise<Result<Assessment>> {
    try {
      const response = await this.httpClient.post<Assessment>('/assessments', {
        ...request,
        status: AssessmentStatus.NOT_STARTED,
        startedAt: new Date(),
        lastModifiedAt: new Date()
      });
      return createSuccess(response.data);
    } catch (error) {
      return this.handleError('CREATE_ASSESSMENT_ERROR', 'Failed to create assessment', error);
    }
  }

  async getAssessmentById(assessmentId: string): Promise<Result<Assessment>> {
    try {
      const response = await this.httpClient.get<Assessment>(`/assessments/${assessmentId}`);
      return createSuccess(response.data);
    } catch (error) {
      return this.handleError('GET_ASSESSMENT_ERROR', 'Failed to get assessment', error);
    }
  }

  async getUserAssessments(userId: string): Promise<Result<Assessment[]>> {
    try {
      const response = await this.httpClient.get<Assessment[]>(`/assessments/user/${userId}`);
      return createSuccess(response.data);
    } catch (error) {
      return this.handleError('GET_USER_ASSESSMENTS_ERROR', 'Failed to get user assessments', error);
    }
  }

  async updateAssessmentStatus(assessmentId: string, status: AssessmentStatus): Promise<Result<Assessment>> {
    try {
      const response = await this.httpClient.put<Assessment>(`/assessments/${assessmentId}/status`, {
        status,
        lastModifiedAt: new Date(),
        ...(status === AssessmentStatus.COMPLETED ? { completedAt: new Date() } : {})
      });
      return createSuccess(response.data);
    } catch (error) {
      return this.handleError('UPDATE_ASSESSMENT_STATUS_ERROR', 'Failed to update assessment status', error);
    }
  }

  async deleteAssessment(assessmentId: string): Promise<Result<void>> {
    try {
      await this.httpClient.delete(`/assessments/${assessmentId}`);
      return createSuccess(undefined);
    } catch (error) {
      return this.handleError('DELETE_ASSESSMENT_ERROR', 'Failed to delete assessment', error);
    }
  }

  async saveAnswer(answer: Omit<Answer, 'id' | 'createdAt'>): Promise<Result<Answer>> {
    try {
      const response = await this.httpClient.post<Answer>('/respuestas/single', {
        ...answer,
        createdAt: new Date()
      });
      return createSuccess(response.data);
    } catch (error) {
      return this.handleError('SAVE_ANSWER_ERROR', 'Failed to save answer', error);
    }
  }

  async saveAnswers(answers: Omit<Answer, 'id' | 'createdAt'>[]): Promise<Result<Answer[]>> {
    try {
      const response = await this.httpClient.post<Answer[]>('/respuestas/batch', {
        answers: answers.map(answer => ({
          ...answer,
          createdAt: new Date()
        }))
      });
      return createSuccess(response.data);
    } catch (error) {
      return this.handleError('SAVE_ANSWERS_ERROR', 'Failed to save answers', error);
    }
  }

  async getAssessmentAnswers(assessmentId: string): Promise<Result<Answer[]>> {
    try {
      const response = await this.httpClient.get<Answer[]>(`/respuestas/assessment/${assessmentId}`);
      return createSuccess(response.data);
    } catch (error) {
      return this.handleError('GET_ASSESSMENT_ANSWERS_ERROR', 'Failed to get assessment answers', error);
    }
  }

  async getUserAnswers(userId: string, assessmentId?: string): Promise<Result<Answer[]>> {
    try {
      const url = assessmentId
        ? `/respuestas/user/${userId}?assessmentId=${assessmentId}`
        : `/respuestas/user/${userId}`;

      const response = await this.httpClient.get<Answer[]>(url);
      return createSuccess(response.data);
    } catch (error) {
      return this.handleError('GET_USER_ANSWERS_ERROR', 'Failed to get user answers', error);
    }
  }

  async deleteAssessmentAnswers(assessmentId: string): Promise<Result<void>> {
    try {
      await this.httpClient.delete(`/respuestas/assessment/${assessmentId}`);
      return createSuccess(undefined);
    } catch (error) {
      return this.handleError('DELETE_ANSWERS_ERROR', 'Failed to delete assessment answers', error);
    }
  }

  async submitAssessment(request: SubmitAnswersRequest): Promise<Result<AssessmentResult>> {
    try {
      // Map request to API format
      const apiRequest = {
        persona_id: request.userId,
        respuestas: request.answers.map(answer => ({
          pregunta_id: answer.questionId,
          respuesta: answer.response
        }))
      };

      const response = await this.httpClient.post<{
        resultado: AssessmentResult;
      }>('/respuestas', apiRequest);

      return createSuccess(response.data.resultado);
    } catch (error) {
      return this.handleError('SUBMIT_ASSESSMENT_ERROR', 'Failed to submit assessment', error);
    }
  }

  async getAssessmentResult(assessmentId: string): Promise<Result<AssessmentResult>> {
    try {
      const response = await this.httpClient.get<AssessmentResult>(`/results/assessment/${assessmentId}`);
      return createSuccess(response.data);
    } catch (error) {
      return this.handleError('GET_RESULT_ERROR', 'Failed to get assessment result', error);
    }
  }

  async getUserResults(userId: string): Promise<Result<AssessmentResult[]>> {
    try {
      const response = await this.httpClient.get<AssessmentResult[]>(`/results/user/${userId}`);
      return createSuccess(response.data);
    } catch (error) {
      return this.handleError('GET_USER_RESULTS_ERROR', 'Failed to get user results', error);
    }
  }

  async getAssessmentProgress(assessmentId: string): Promise<Result<AssessmentProgress>> {
    try {
      const response = await this.httpClient.get<AssessmentProgress>(`/assessments/${assessmentId}/progress`);
      return createSuccess(response.data);
    } catch (error) {
      return this.handleError('GET_PROGRESS_ERROR', 'Failed to get assessment progress', error);
    }
  }

  async updateAssessmentProgress(assessmentId: string, progress: Partial<AssessmentProgress>): Promise<Result<AssessmentProgress>> {
    try {
      const response = await this.httpClient.put<AssessmentProgress>(`/assessments/${assessmentId}/progress`, progress);
      return createSuccess(response.data);
    } catch (error) {
      return this.handleError('UPDATE_PROGRESS_ERROR', 'Failed to update assessment progress', error);
    }
  }

  async getAllAssessments(filters?: QueryFilters): Promise<Result<PaginatedResult<Assessment>>> {
    try {
      const params = this.buildQueryParams(filters);
      const response = await this.httpClient.get<PaginatedResult<Assessment>>('/assessments', { params });
      return createSuccess(response.data);
    } catch (error) {
      return this.handleError('GET_ALL_ASSESSMENTS_ERROR', 'Failed to get all assessments', error);
    }
  }

  async getAssessmentStatistics(): Promise<Result<{
    totalAssessments: number;
    completedAssessments: number;
    averageScore: number;
    completionRate: number;
  }>> {
    try {
      const response = await this.httpClient.get<{
        totalAssessments: number;
        completedAssessments: number;
        averageScore: number;
        completionRate: number;
      }>('/assessments/statistics');
      return createSuccess(response.data);
    } catch (error) {
      return this.handleError('GET_ASSESSMENT_STATISTICS_ERROR', 'Failed to get assessment statistics', error);
    }
  }

  async getAllResults(filters?: QueryFilters): Promise<Result<PaginatedResult<AssessmentResult>>> {
    try {
      const params = this.buildQueryParams(filters);
      const response = await this.httpClient.get<PaginatedResult<AssessmentResult>>('/results', { params });
      return createSuccess(response.data);
    } catch (error) {
      return this.handleError('GET_ALL_RESULTS_ERROR', 'Failed to get all results', error);
    }
  }

  async exportAssessmentData(userId?: string): Promise<Result<any>> {
    try {
      const url = userId ? `/export/assessments?userId=${userId}` : '/export/assessments';
      const response = await this.httpClient.get(url);
      return createSuccess(response.data);
    } catch (error) {
      return this.handleError('EXPORT_DATA_ERROR', 'Failed to export assessment data', error);
    }
  }

  private buildQueryParams(filters?: QueryFilters): Record<string, any> {
    if (!filters) return {};

    const params: Record<string, any> = {};

    if (filters.page !== undefined) params.page = filters.page;
    if (filters.pageSize !== undefined) params.pageSize = filters.pageSize;
    if (filters.sortBy) params.sortBy = filters.sortBy;
    if (filters.sortOrder) params.sortOrder = filters.sortOrder;
    if (filters.search) params.search = filters.search;

    return params;
  }

  private isHttpError(error: any): error is HttpError {
    return error && typeof error.status === 'number';
  }

  private handleError(code: string, message: string, error: any): Result<any> {
    if (this.isHttpError(error)) {
      return createFailure(createError(
        error.code || code,
        error.message || message,
        error
      ));
    }

    return createFailure(createError(code, message, error));
  }
}