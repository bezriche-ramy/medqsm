import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertCircle, BookOpen, CheckCircle2, Clock3, RotateCcw, XCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import useExamStore from '../store/useExamStore';
import { areAnswerArraysEqual, formatDateTime, formatDuration, getQuestionsByIds } from '../lib/examUtils';

export default function Review() {
  const { sessionId } = useParams();
  const { questionMap, sessionHistory } = useExamStore();
  const session = sessionHistory.find((entry) => entry.id === sessionId) || null;

  if (!session) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center bg-slate-50 mt-10 rounded-2xl border border-slate-200 shadow-sm max-w-4xl mx-auto">
        <AlertCircle className="w-16 h-16 text-slate-400 mb-4" />
        <h2 className="text-2xl font-bold text-slate-700">Résultat introuvable</h2>
        <p className="text-slate-500 mt-2 mb-6 max-w-md">
          Cette session n&apos;est plus disponible. Relancez un nouveau bloc pour générer un historique complet.
        </p>
        <Link to="/setup-session">
          <Button>Lancer une nouvelle session</Button>
        </Link>
      </div>
    );
  }

  const questions = getQuestionsByIds(questionMap, session.questionIds);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <Card className="mb-10 overflow-hidden border-2 border-slate-200">
        <div className="bg-slate-950 px-8 py-10 md:flex items-center justify-between gap-8">
          <div className="text-white">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500 font-bold">Session terminée</p>
            <h1 className="text-3xl font-bold tracking-tight mt-3">Relecture détaillée</h1>
            <div className="mt-4 space-y-2 text-slate-300">
              <p>{session.topic} • {questions.length} questions</p>
              <p>Terminée le {formatDateTime(session.completedAt)}</p>
              <p>Temps utilisé: {formatDuration(session.durationSeconds)}</p>
            </div>
          </div>

          <div className="mt-6 md:mt-0 bg-slate-900/70 p-6 rounded-2xl border border-slate-800 text-center shadow-inner min-w-56">
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-2">Score final</p>
            <div className="flex items-end justify-center gap-1">
              <span
                className={clsx(
                  'text-6xl font-black tabular-nums',
                  session.scorePercent >= 70 ? 'text-green-400' : session.scorePercent >= 50 ? 'text-yellow-400' : 'text-red-400',
                )}
              >
                {session.scorePercent}
              </span>
              <span className="text-2xl text-slate-500 font-bold mb-1">%</span>
            </div>
            <p className="mt-3 text-sm text-slate-400">
              {session.correctCount} justes • {session.incorrectCount} fausses • {session.unansweredCount} vides
            </p>
          </div>
        </div>
      </Card>

      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-200 pb-4">Correction question par question</h2>

        {questions.map((question, index) => {
          const userAnswers = session.answersByQuestionId[question.id] || [];
          const correctAnswers = question.correctAnswers || [];
          const isFullyCorrect = areAnswerArraysEqual(userAnswers, correctAnswers);

          return (
            <Card key={question.id} className="overflow-hidden">
              <div
                className={clsx(
                  'px-6 py-4 flex items-center gap-3 border-b',
                  isFullyCorrect ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100',
                )}
              >
                {isFullyCorrect ? (
                  <CheckCircle2 className="text-green-600 w-6 h-6 shrink-0" />
                ) : (
                  <XCircle className="text-red-600 w-6 h-6 shrink-0" />
                )}
                <div>
                  <h3 className="font-bold text-slate-900">Question {index + 1}</h3>
                  <p className={clsx('text-sm font-medium', isFullyCorrect ? 'text-green-700' : 'text-red-700')}>
                    {isFullyCorrect ? 'Bonne réponse' : 'Réponse incorrecte'}
                  </p>
                </div>
              </div>

              <CardContent className="p-8">
                <div className="flex flex-wrap gap-3 mb-5">
                  <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wide">
                    {question.topic}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wide">
                    {question.chapter}
                  </span>
                </div>

                <p className="text-lg text-slate-900 font-medium mb-8 leading-relaxed">{question.questionText}</p>

                <div className="space-y-3 mb-10">
                  {question.options.map((option) => {
                    const isUserSelected = userAnswers.includes(option.id);
                    const isActuallyCorrect = correctAnswers.includes(option.id);

                    let bgClass = 'bg-white border-slate-200 opacity-70';
                    let icon = null;

                    if (isActuallyCorrect && isUserSelected) {
                      bgClass = 'bg-green-50 border-green-500 ring-1 ring-green-500';
                      icon = <CheckCircle2 className="text-green-600 ml-auto" />;
                    } else if (isActuallyCorrect && !isUserSelected) {
                      bgClass = 'bg-green-50 border-green-500 ring-1 ring-green-500 opacity-90';
                      icon = <CheckCircle2 className="text-green-600 ml-auto" />;
                    } else if (!isActuallyCorrect && isUserSelected) {
                      bgClass = 'bg-red-50 border-red-300';
                      icon = <XCircle className="text-red-500 ml-auto" />;
                    }

                    return (
                      <div key={option.id} className={clsx('flex items-center p-4 rounded-xl border', bgClass)}>
                        <span className="font-bold text-lg w-8 h-8 flex items-center justify-center bg-slate-100 rounded-md border border-slate-200 mr-4 shrink-0 shadow-sm text-slate-700">
                          {option.id}
                        </span>
                        <span className="text-slate-800 font-medium">{option.text}</span>
                        {icon}
                      </div>
                    );
                  })}
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                  <h4 className="flex items-center gap-2 font-bold text-slate-900 mb-3">
                    <BookOpen className="text-blue-600 w-5 h-5" />
                    Explication
                  </h4>
                  <p className="text-slate-700 leading-relaxed">{question.explanation}</p>

                  <div className="mt-6 pt-4 border-t border-slate-200 space-y-2">
                    <p className="text-sm text-slate-500 font-medium">
                      <span className="uppercase tracking-wider text-xs font-bold text-slate-400 mr-2">Référence:</span>
                      {question.reference}
                    </p>
                    <p className="text-sm text-slate-500 font-medium">
                      <span className="uppercase tracking-wider text-xs font-bold text-slate-400 mr-2">Source:</span>
                      {question.sourcePage}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-12 flex flex-wrap justify-center gap-4 pb-12">
        <Link to="/dashboard">
          <Button size="lg" className="px-8 gap-2">
            <Clock3 className="w-5 h-5" />
            Retour au dashboard
          </Button>
        </Link>
        <Link to="/setup-session">
          <Button variant="outline" size="lg" className="px-8 gap-2">
            <RotateCcw className="w-5 h-5" />
            Relancer un test
          </Button>
        </Link>
      </div>
    </div>
  );
}
