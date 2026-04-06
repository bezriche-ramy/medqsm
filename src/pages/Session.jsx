import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle, CheckSquare, ChevronLeft, ChevronRight, Clock, Square } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from '../components/ui/Button';
import useExamStore from '../store/useExamStore';
import { formatTime, getQuestionsByIds } from '../lib/examUtils';

function getAnsweredCount(activeSession) {
  if (!activeSession) {
    return 0;
  }

  return activeSession.questionIds.filter((questionId) => {
    const answers = activeSession.answersByQuestionId[questionId] || [];
    return answers.length > 0;
  }).length;
}

export default function Session() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const {
    questionMap,
    activeSession,
    toggleAnswer,
    goToNextQuestion,
    goToPrevQuestion,
    goToQuestion,
    submitExam,
    syncActiveSession,
  } = useExamStore();

  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    if (!activeSession) {
      navigate('/setup-session', { replace: true });
      return;
    }

    if (sessionId !== activeSession.id) {
      navigate(`/session/${activeSession.id}`, { replace: true });
    }
  }, [activeSession, navigate, sessionId]);

  useEffect(() => {
    if (!activeSession) {
      return undefined;
    }

    const syncClock = () => {
      const result = syncActiveSession();
      setTimeRemaining(result.timeRemaining);

      if (result.expired && result.completedSession) {
        navigate(`/review/${result.completedSession.id}`, { replace: true });
      }
    };

    syncClock();
    const timerId = window.setInterval(syncClock, 1000);

    return () => window.clearInterval(timerId);
  }, [activeSession, navigate, syncActiveSession]);

  if (!activeSession) {
    return null;
  }

  const questions = getQuestionsByIds(questionMap, activeSession.questionIds);
  const currentQuestionIndex = activeSession.currentQuestionIndex;
  const currentQuestion = questions[currentQuestionIndex];

  if (!currentQuestion) {
    return null;
  }

  const currentSelections = activeSession.answersByQuestionId[currentQuestion.id] || [];
  const answeredCount = getAnsweredCount(activeSession);
  const progressPercent = (answeredCount / questions.length) * 100;
  const isMultiSelect = (currentQuestion.correctAnswers || []).length > 1;

  const handleSubmit = () => {
    const shouldSubmit = window.confirm('Voulez-vous vraiment terminer cette session et enregistrer vos réponses ?');

    if (!shouldSubmit) {
      return;
    }

    const completedSession = submitExam();

    if (completedSession) {
      navigate(`/review/${completedSession.id}`);
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      <aside className="w-80 bg-slate-900 text-slate-200 flex flex-col shadow-2xl relative z-10 shrink-0">
        <div className="p-6 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500 font-bold">Session active</p>
              <h2 className="font-bold text-white text-lg tracking-tight mt-2">Bloc cardio</h2>
            </div>
            <div
              className={clsx(
                'flex items-center gap-2 font-mono text-lg font-bold px-3 py-2 rounded-xl border',
                timeRemaining < 300 ? 'text-red-300 border-red-900/60 bg-red-950/40' : 'text-slate-100 border-slate-700 bg-slate-800',
              )}
            >
              <Clock size={18} />
              {formatTime(timeRemaining)}
            </div>
          </div>

          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full transition-all" style={{ width: `${progressPercent}%` }} />
          </div>
          <p className="text-sm mt-3 text-slate-400 text-center font-medium">
            {answeredCount} / {questions.length} réponses enregistrées
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-5 gap-2">
            {questions.map((question, index) => {
              const hasAnswered = (activeSession.answersByQuestionId[question.id] || []).length > 0;
              const isActive = index === currentQuestionIndex;

              return (
                <button
                  key={question.id}
                  type="button"
                  onClick={() => goToQuestion(index)}
                  className={clsx(
                    'h-10 rounded-lg text-sm font-semibold flex items-center justify-center transition-all',
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-950/40 ring-2 ring-blue-300 ring-offset-2 ring-offset-slate-900'
                      : hasAnswered
                        ? 'bg-slate-700 text-slate-100'
                        : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700',
                  )}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t border-slate-800">
          <Button variant="danger" className="w-full py-6 text-sm flex gap-2 items-center font-bold" onClick={handleSubmit}>
            <CheckCircle size={18} />
            Terminer le test
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-full bg-white relative">
        <div className="h-16 flex items-center justify-between px-8 border-b border-slate-200 bg-white absolute top-0 w-full z-10">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] font-bold text-slate-500">Question en cours</p>
            <h2 className="font-semibold text-slate-800 text-lg mt-1">
              Question {currentQuestionIndex + 1} sur {questions.length}
            </h2>
          </div>

          <div className="flex gap-2">
            <span className="px-3 py-2 rounded-full bg-slate-100 text-slate-700 text-sm font-semibold">
              {currentQuestion.chapter}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-24 bg-slate-50">
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-10">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full uppercase tracking-wide">
                {currentQuestion.topic}
              </span>
              <span className="px-3 py-1 bg-rose-100 text-rose-800 text-xs font-bold rounded-full uppercase tracking-wide">
                {currentQuestion.difficulty}
              </span>
            </div>

            <p className="text-lg leading-relaxed text-slate-900 font-medium mb-8">{currentQuestion.questionText}</p>

            {isMultiSelect && (
              <p className="text-sm font-semibold text-blue-700 mb-4 bg-blue-50 p-3 rounded-xl border border-blue-100 italic">
                Plusieurs réponses peuvent être justes.
              </p>
            )}

            <div className="space-y-3">
              {currentQuestion.options.map((option) => {
                const isSelected = currentSelections.includes(option.id);

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => toggleAnswer(currentQuestion.id, option.id)}
                    className={clsx(
                      'w-full flex items-center p-5 rounded-xl border text-left transition-all',
                      isSelected
                        ? 'bg-blue-50 border-blue-600 ring-1 ring-blue-600 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700',
                    )}
                  >
                    <div className="mr-5 shrink-0 flex items-center justify-center">
                      <div className={clsx('flex items-center gap-3', isSelected ? 'text-blue-700' : 'text-slate-400')}>
                        <span className="font-bold text-lg w-8 h-8 flex items-center justify-center bg-slate-100 rounded-md border border-slate-200">
                          {option.id}
                        </span>
                        {isSelected ? <CheckSquare size={22} className="ml-2" /> : <Square size={22} className="ml-2" />}
                      </div>
                    </div>
                    <span className={clsx('text-base leading-snug', isSelected ? 'text-blue-900 font-medium' : 'text-slate-700')}>
                      {option.text}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="h-20 border-t border-slate-200 bg-white flex items-center justify-between px-8 absolute bottom-0 w-full z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <Button
            variant="outline"
            size="lg"
            onClick={goToPrevQuestion}
            disabled={currentQuestionIndex === 0}
            className="w-40 font-semibold shadow-sm"
          >
            <ChevronLeft size={20} className="mr-1" />
            Précédente
          </Button>

          <Button
            size="lg"
            onClick={currentQuestionIndex === questions.length - 1 ? handleSubmit : goToNextQuestion}
            className="w-40 font-semibold shadow-sm text-base"
          >
            {currentQuestionIndex === questions.length - 1 ? (
              'Terminer'
            ) : (
              <>
                Suivante
                <ChevronRight size={20} className="ml-1" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
