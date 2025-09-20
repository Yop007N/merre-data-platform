import {
  IAssessmentRepository,
  IUserRepository,
  Result,
  Question,
  Assessment,
  AssessmentResult,
  AssessmentProgress,
  SubmitAnswersRequest,
  CreateAssessmentRequest,
  AssessmentStatus,
  SeverityLevel,
  ANSWER_OPTIONS,
  createSuccess,
  createFailure,
  createError
} from '../../domain';

export class AssessmentUseCases {
  constructor(
    private assessmentRepository: IAssessmentRepository,
    private userRepository: IUserRepository
  ) {}

  async getAllQuestions(): Promise<Result<Question[]>> {
    try {
      return await this.assessmentRepository.getAllQuestions();
    } catch (error) {
      return createFailure(createError(
        'GET_QUESTIONS_ERROR',
        'Failed to retrieve questions',
        error
      ));
    }
  }

  async createAssessment(request: CreateAssessmentRequest): Promise<Result<Assessment>> {
    try {
      // Validate user exists
      const userStatus = await this.userRepository.getUserStatus(request.userId);
      if (!userStatus.success || !userStatus.data!.exists) {
        return createFailure(createError(
          'USER_NOT_FOUND',
          'User not found'
        ));
      }

      // Check if user has already completed an assessment
      const existingAssessments = await this.assessmentRepository.getUserAssessments(request.userId);
      if (existingAssessments.success) {
        const completedAssessment = existingAssessments.data!.find(
          a => a.status === AssessmentStatus.COMPLETED || a.status === AssessmentStatus.EVALUATED
        );
        if (completedAssessment) {
          return createFailure(createError(
            'ASSESSMENT_ALREADY_COMPLETED',
            'User has already completed an assessment'
          ));
        }
      }

      return await this.assessmentRepository.createAssessment(request);
    } catch (error) {
      return createFailure(createError(
        'CREATE_ASSESSMENT_ERROR',
        'Failed to create assessment',
        error
      ));
    }
  }

  async getAssessmentProgress(assessmentId: string): Promise<Result<AssessmentProgress>> {
    try {
      if (!assessmentId) {
        return createFailure(createError(
          'INVALID_ASSESSMENT_ID',
          'Assessment ID is required'
        ));
      }

      return await this.assessmentRepository.getAssessmentProgress(assessmentId);
    } catch (error) {
      return createFailure(createError(
        'GET_PROGRESS_ERROR',
        'Failed to get assessment progress',
        error
      ));
    }
  }

  async submitAssessment(request: SubmitAnswersRequest): Promise<Result<AssessmentResult>> {
    try {
      // Validate request
      const validation = this.validateSubmitAnswersRequest(request);
      if (!validation.success) {
        return validation;
      }

      // Get assessment
      const assessmentResult = await this.assessmentRepository.getAssessmentById(request.assessmentId);
      if (!assessmentResult.success) {
        return createFailure(createError(
          'ASSESSMENT_NOT_FOUND',
          'Assessment not found'
        ));
      }

      const assessment = assessmentResult.data!;

      // Verify user owns the assessment
      if (assessment.userId !== request.userId) {
        return createFailure(createError(
          'UNAUTHORIZED',
          'User is not authorized to submit this assessment'
        ));
      }

      // Verify assessment is in correct state
      if (assessment.status === AssessmentStatus.COMPLETED || assessment.status === AssessmentStatus.EVALUATED) {
        return createFailure(createError(
          'ASSESSMENT_ALREADY_COMPLETED',
          'Assessment has already been completed'
        ));
      }

      // Validate all questions are answered
      const questionsResult = await this.assessmentRepository.getAllQuestions();
      if (!questionsResult.success) {
        return createFailure(createError(
          'QUESTIONS_NOT_FOUND',
          'Could not retrieve questions for validation'
        ));
      }

      const questions = questionsResult.data!;
      const requiredQuestionIds = questions.filter(q => q.isRequired).map(q => q.id);
      const answeredQuestionIds = request.answers.map(a => a.questionId);

      const missingRequiredAnswers = requiredQuestionIds.filter(
        id => !answeredQuestionIds.includes(id)
      );

      if (missingRequiredAnswers.length > 0) {
        return createFailure(createError(
          'INCOMPLETE_ASSESSMENT',
          `Missing answers for required questions: ${missingRequiredAnswers.join(', ')}`
        ));
      }

      // Submit assessment and get result
      return await this.assessmentRepository.submitAssessment(request);
    } catch (error) {
      return createFailure(createError(
        'SUBMIT_ASSESSMENT_ERROR',
        'Failed to submit assessment',
        error
      ));
    }
  }

  async getAssessmentResult(assessmentId: string): Promise<Result<AssessmentResult>> {
    try {
      if (!assessmentId) {
        return createFailure(createError(
          'INVALID_ASSESSMENT_ID',
          'Assessment ID is required'
        ));
      }

      return await this.assessmentRepository.getAssessmentResult(assessmentId);
    } catch (error) {
      return createFailure(createError(
        'GET_RESULT_ERROR',
        'Failed to get assessment result',
        error
      ));
    }
  }

  async getUserAssessments(userId: string): Promise<Result<Assessment[]>> {
    try {
      if (!userId) {
        return createFailure(createError(
          'INVALID_USER_ID',
          'User ID is required'
        ));
      }

      return await this.assessmentRepository.getUserAssessments(userId);
    } catch (error) {
      return createFailure(createError(
        'GET_USER_ASSESSMENTS_ERROR',
        'Failed to get user assessments',
        error
      ));
    }
  }

  async getUserResults(userId: string): Promise<Result<AssessmentResult[]>> {
    try {
      if (!userId) {
        return createFailure(createError(
          'INVALID_USER_ID',
          'User ID is required'
        ));
      }

      return await this.assessmentRepository.getUserResults(userId);
    } catch (error) {
      return createFailure(createError(
        'GET_USER_RESULTS_ERROR',
        'Failed to get user results',
        error
      ));
    }
  }

  async checkUserAssessmentStatus(userId: string): Promise<Result<{
    hasCompletedAssessment: boolean;
    canTakeAssessment: boolean;
    latestAssessment?: Assessment;
    latestResult?: AssessmentResult;
  }>> {
    try {
      if (!userId) {
        return createFailure(createError(
          'INVALID_USER_ID',
          'User ID is required'
        ));
      }

      // Get user status
      const userStatusResult = await this.userRepository.getUserStatus(userId);
      if (!userStatusResult.success) {
        return userStatusResult as any;
      }

      const userStatus = userStatusResult.data!;
      if (!userStatus.exists || !userStatus.hasProfile) {
        return createSuccess({
          hasCompletedAssessment: false,
          canTakeAssessment: false
        });
      }

      // Get user assessments
      const assessmentsResult = await this.assessmentRepository.getUserAssessments(userId);
      if (!assessmentsResult.success) {
        return createSuccess({
          hasCompletedAssessment: false,
          canTakeAssessment: true
        });
      }

      const assessments = assessmentsResult.data!;
      const latestAssessment = assessments.sort((a, b) =>
        new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
      )[0];

      if (!latestAssessment) {
        return createSuccess({
          hasCompletedAssessment: false,
          canTakeAssessment: true
        });
      }

      const hasCompleted = latestAssessment.status === AssessmentStatus.COMPLETED ||
                          latestAssessment.status === AssessmentStatus.EVALUATED;

      let latestResult: AssessmentResult | undefined;
      if (hasCompleted) {
        const resultResult = await this.assessmentRepository.getAssessmentResult(latestAssessment.id);
        if (resultResult.success) {
          latestResult = resultResult.data!;
        }
      }

      return createSuccess({
        hasCompletedAssessment: hasCompleted,
        canTakeAssessment: !hasCompleted,
        latestAssessment,
        latestResult
      });
    } catch (error) {
      return createFailure(createError(
        'CHECK_STATUS_ERROR',
        'Failed to check user assessment status',
        error
      ));
    }
  }

  private validateSubmitAnswersRequest(request: SubmitAnswersRequest): Result<void> {
    if (!request.assessmentId) {
      return createFailure(createError('MISSING_ASSESSMENT_ID', 'Assessment ID is required'));
    }

    if (!request.userId) {
      return createFailure(createError('MISSING_USER_ID', 'User ID is required'));
    }

    if (!request.answers || request.answers.length === 0) {
      return createFailure(createError('MISSING_ANSWERS', 'At least one answer is required'));
    }

    // Validate each answer
    for (const answer of request.answers) {
      if (!answer.questionId || answer.questionId <= 0) {
        return createFailure(createError('INVALID_QUESTION_ID', 'Valid question ID is required for all answers'));
      }

      if (!answer.response || answer.response.trim().length === 0) {
        return createFailure(createError('INVALID_RESPONSE', 'Response is required for all answers'));
      }

      // Validate response is a valid option
      const validResponses = ANSWER_OPTIONS.map(option => option.label);
      if (!validResponses.includes(answer.response)) {
        return createFailure(createError(
          'INVALID_RESPONSE_VALUE',
          `Invalid response '${answer.response}'. Valid options: ${validResponses.join(', ')}`
        ));
      }
    }

    // Check for duplicate question answers
    const questionIds = request.answers.map(a => a.questionId);
    const uniqueQuestionIds = new Set(questionIds);
    if (questionIds.length !== uniqueQuestionIds.size) {
      return createFailure(createError('DUPLICATE_ANSWERS', 'Multiple answers for the same question are not allowed'));
    }

    return createSuccess(undefined);
  }
}