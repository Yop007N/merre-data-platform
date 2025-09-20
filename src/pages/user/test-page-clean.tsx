import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Questions from '../../components/questions-component';
import Layout from '../../components/layout-component';
import {
  useAuth,
  useUser,
  useAssessment
} from '../../presentation/hooks';
import {
  useAuthUseCases,
  useUserUseCases,
  useAssessmentUseCases
} from '../../presentation/providers';
import { Question } from '../../domain';
import '../../styles/estilo.css';
import '../../styles/test.css';

const TestPageClean: React.FC = () => {
  // Clean Architecture dependencies
  const authUseCases = useAuthUseCases();
  const userUseCases = useUserUseCases();
  const assessmentUseCases = useAssessmentUseCases();

  // Hooks
  const { user, logout } = useAuth(authUseCases);
  const { checkUserStatus } = useUser(userUseCases);
  const {
    questions,
    loading: assessmentLoading,
    error: assessmentError,
    loadQuestions,
    submitAssessment,
    checkAssessmentStatus,
    clearError
  } = useAssessment(assessmentUseCases);

  // Local state
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  // Initialize component
  useEffect(() => {
    const initializeTestPage = async () => {
      if (!user) {
        console.log('Usuario no autenticado, redirigiendo...');
        navigate('/');
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Check user status
        const userStatus = await checkUserStatus(user.id);
        if (!userStatus?.exists) {
          navigate('/user-page');
          return;
        }

        if (!userStatus.hasProfile) {
          navigate('/user-page');
          return;
        }

        // Check assessment status
        const assessmentStatus = await checkAssessmentStatus(user.id);
        if (assessmentStatus?.hasCompletedAssessment) {
          navigate('/result-page');
          return;
        }

        // Load questions
        await loadQuestions();
      } catch (error) {
        console.error('Error initializing test page:', error);
        setError('Error al cargar la página de evaluación');
      } finally {
        setLoading(false);
      }
    };

    initializeTestPage();
  }, [user, navigate, checkUserStatus, checkAssessmentStatus, loadQuestions]);

  // Handle answer change
  const handleChangeAnswer = useCallback((questionId: number, response: string) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: response,
    }));
    setShowAlert(false); // Clear alert when user answers
  }, []);

  // Navigation handlers
  const handleNextQuestion = useCallback(() => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion || !answers[currentQuestion.id]) {
      setShowAlert(true);
      return;
    }

    setShowAlert(false);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  }, [questions, currentQuestionIndex, answers]);

  const handlePrevQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setShowAlert(false);
    }
  }, [currentQuestionIndex]);

  // Submit assessment
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!user) {
      setError('Usuario no autenticado');
      return;
    }

    // Validate all questions are answered
    const allQuestionsAnswered = questions.every((question) =>
      answers[question.id] !== undefined
    );

    if (!allQuestionsAnswered) {
      setShowAlert(true);
      return;
    }

    try {
      setLoading(true);
      clearError();

      // Prepare answers for submission
      const answersArray = Object.keys(answers).map((questionId) => ({
        questionId: parseInt(questionId),
        response: answers[parseInt(questionId)]
      }));

      // Submit assessment
      const result = await submitAssessment({
        assessmentId: 'default', // You might need to create an assessment first
        userId: user.id,
        answers: answersArray
      });

      if (result.success) {
        navigate('/result-page', {
          state: {
            resultado: result.data
          }
        });
      } else {
        setError(result.error?.message || 'Error al enviar las respuestas');
      }
    } catch (error) {
      console.error('Error submitting assessment:', error);
      setError('Error inesperado al enviar las respuestas');
    } finally {
      setLoading(false);
    }
  };

  // Error display helper
  const displayError = error || assessmentError;

  // Loading state
  if (loading || assessmentLoading) {
    return (
      <Layout
        user={user}
        handleLogout={logout}
        title="Inventario de Fobia Social"
        subtitle="Cargando evaluación..."
      >
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2">Cargando...</p>
        </div>
      </Layout>
    );
  }

  // Error state
  if (displayError) {
    return (
      <Layout
        user={user}
        handleLogout={logout}
        title="Inventario de Fobia Social"
        subtitle="Error al cargar la evaluación"
      >
        <div className="alert alert-danger" role="alert">
          {displayError}
          <button
            className="btn btn-outline-danger btn-sm ms-2"
            onClick={() => {
              setError(null);
              clearError();
              window.location.reload();
            }}
          >
            Reintentar
          </button>
        </div>
      </Layout>
    );
  }

  // No questions available
  if (questions.length === 0) {
    return (
      <Layout
        user={user}
        handleLogout={logout}
        title="Inventario de Fobia Social"
        subtitle="No hay preguntas disponibles"
      >
        <div className="alert alert-warning" role="alert">
          No se encontraron preguntas para la evaluación.
        </div>
      </Layout>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <Layout
      user={user}
      handleLogout={logout}
      title="Inventario de Fobia Social"
      subtitle="Por favor, indique en qué medida le han molestado los siguientes problemas durante las últimas semanas. Responda con sinceridad y tómese el tiempo que necesite; no se preocupe, ya que no hay respuestas correctas o incorrectas. Su honestidad nos ayudará a proporcionarle la mejor evaluación posible."
    >
      {showAlert && (
        <div className="alert alert-warning" role="alert">
          Por favor, responde la pregunta antes de continuar.
        </div>
      )}

      <div className="progress-container">
        <div
          className="progress-bar"
          style={{
            width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`
          }}
        />
        <span className="progress-text">
          {`${currentQuestionIndex + 1} / ${questions.length}`}
        </span>
      </div>

      <div className="content">
        <form onSubmit={handleSubmit}>
          {currentQuestion && (
            <Questions
              pregunta={currentQuestion}
              onChangeRespuesta={handleChangeAnswer}
              respuestaActual={answers[currentQuestion.id] || ''}
            />
          )}

          <div className="navigation-buttons text-center">
            <button
              className="vlad_btn previous"
              type="button"
              onClick={handlePrevQuestion}
              disabled={currentQuestionIndex === 0 || loading}
            >
              Anterior
            </button>

            {currentQuestionIndex < questions.length - 1 ? (
              <button
                className="vlad_btn next shadow-sm p-2 mb-1"
                type="button"
                onClick={handleNextQuestion}
                disabled={loading}
              >
                Siguiente
              </button>
            ) : (
              <button
                className="vlad_btn next"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Guardando...' : 'Guardar y Evaluar'}
              </button>
            )}
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default TestPageClean;