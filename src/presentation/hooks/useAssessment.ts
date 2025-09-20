import { useState, useEffect, useCallback } from 'react';
import {
  Question,
  Assessment,
  AssessmentResult,
  AssessmentProgress,
  SubmitAnswersRequest,
  CreateAssessmentRequest,
  Result
} from '../../domain';
import { AssessmentUseCases } from '../../application';

export interface UseAssessmentReturn {
  questions: Question[];
  currentAssessment: Assessment | null;
  assessmentResult: AssessmentResult | null;
  progress: AssessmentProgress | null;
  loading: boolean;
  error: string | null;

  // Actions
  loadQuestions: () => Promise<void>;
  createAssessment: (request: CreateAssessmentRequest) => Promise<Result<Assessment>>;
  submitAssessment: (request: SubmitAnswersRequest) => Promise<Result<AssessmentResult>>;
  getAssessmentResult: (assessmentId: string) => Promise<void>;
  getUserAssessments: (userId: string) => Promise<Assessment[]>;
  checkAssessmentStatus: (userId: string) => Promise<{
    hasCompletedAssessment: boolean;
    canTakeAssessment: boolean;
    latestAssessment?: Assessment;
    latestResult?: AssessmentResult;
  } | null>;
  clearError: () => void;
}

export const useAssessment = (assessmentUseCases: AssessmentUseCases): UseAssessmentReturn => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentAssessment, setCurrentAssessment] = useState<Assessment | null>(null);
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);
  const [progress, setProgress] = useState<AssessmentProgress | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load questions
  const loadQuestions = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const result = await assessmentUseCases.getAllQuestions();

      if (result.success) {
        setQuestions(result.data!);
      } else {
        setError(result.error!.message);
      }
    } catch (error) {
      setError('Failed to load questions');
    } finally {
      setLoading(false);
    }
  }, [assessmentUseCases]);

  // Create assessment
  const createAssessment = useCallback(async (request: CreateAssessmentRequest): Promise<Result<Assessment>> => {
    setLoading(true);
    setError(null);

    try {
      const result = await assessmentUseCases.createAssessment(request);

      if (result.success) {
        setCurrentAssessment(result.data!);
      } else {
        setError(result.error!.message);
      }

      return result;
    } catch (error) {
      const errorMessage = 'Failed to create assessment';
      setError(errorMessage);
      return {
        success: false,
        error: {
          code: 'UNEXPECTED_ERROR',
          message: errorMessage
        }
      };
    } finally {
      setLoading(false);
    }
  }, [assessmentUseCases]);

  // Submit assessment
  const submitAssessment = useCallback(async (request: SubmitAnswersRequest): Promise<Result<AssessmentResult>> => {
    setLoading(true);
    setError(null);

    try {
      const result = await assessmentUseCases.submitAssessment(request);

      if (result.success) {
        setAssessmentResult(result.data!);
      } else {
        setError(result.error!.message);
      }

      return result;
    } catch (error) {
      const errorMessage = 'Failed to submit assessment';
      setError(errorMessage);
      return {
        success: false,
        error: {
          code: 'UNEXPECTED_ERROR',
          message: errorMessage
        }
      };
    } finally {
      setLoading(false);
    }
  }, [assessmentUseCases]);

  // Get assessment result
  const getAssessmentResult = useCallback(async (assessmentId: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const result = await assessmentUseCases.getAssessmentResult(assessmentId);

      if (result.success) {
        setAssessmentResult(result.data!);
      } else {
        setError(result.error!.message);
      }
    } catch (error) {
      setError('Failed to get assessment result');
    } finally {
      setLoading(false);
    }
  }, [assessmentUseCases]);

  // Get user assessments
  const getUserAssessments = useCallback(async (userId: string): Promise<Assessment[]> => {
    try {
      const result = await assessmentUseCases.getUserAssessments(userId);

      if (result.success) {
        return result.data!;
      } else {
        setError(result.error!.message);
        return [];
      }
    } catch (error) {
      setError('Failed to get user assessments');
      return [];
    }
  }, [assessmentUseCases]);

  // Check assessment status
  const checkAssessmentStatus = useCallback(async (userId: string): Promise<{
    hasCompletedAssessment: boolean;
    canTakeAssessment: boolean;
    latestAssessment?: Assessment;
    latestResult?: AssessmentResult;
  } | null> => {
    if (!userId) return null;

    try {
      const result = await assessmentUseCases.checkUserAssessmentStatus(userId);

      if (result.success) {
        return result.data!;
      } else {
        setError(result.error!.message);
        return null;
      }
    } catch (error) {
      setError('Failed to check assessment status');
      return null;
    }
  }, [assessmentUseCases]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    questions,
    currentAssessment,
    assessmentResult,
    progress,
    loading,
    error,
    loadQuestions,
    createAssessment,
    submitAssessment,
    getAssessmentResult,
    getUserAssessments,
    checkAssessmentStatus,
    clearError
  };
};