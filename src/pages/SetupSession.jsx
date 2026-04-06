import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookCopy, Clock3, FlaskConical, Settings2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import useExamStore from '../store/useExamStore';
import { QUESTION_COUNT, SESSION_DURATION_SECONDS } from '../lib/examUtils';

export default function SetupSession() {
  const navigate = useNavigate();
  const { questionBank, startSession } = useExamStore();

  const handleStart = () => {
    const session = startSession();
    navigate(`/session/${session.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <Card className="shadow-lg border-0 ring-1 ring-slate-200 overflow-hidden">
        <CardHeader className="bg-slate-50 border-b border-slate-100 px-8 py-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-2xl">
              <Settings2 className="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-3xl">Configurer une session</CardTitle>
              <CardDescription className="text-base mt-2">
                Lancez un bloc cardio en français avec des questions tirées aléatoirement depuis la banque validée.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-8 py-8 space-y-8">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-3 text-slate-900 font-semibold">
                <BookCopy className="w-5 h-5 text-blue-600" />
                Banque cardio
              </div>
              <p className="mt-3 text-3xl font-bold text-slate-900">{questionBank.length}</p>
              <p className="mt-1 text-sm text-slate-500">questions disponibles</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-3 text-slate-900 font-semibold">
                <FlaskConical className="w-5 h-5 text-blue-600" />
                Bloc par session
              </div>
              <p className="mt-3 text-3xl font-bold text-slate-900">{QUESTION_COUNT}</p>
              <p className="mt-1 text-sm text-slate-500">questions uniques</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-3 text-slate-900 font-semibold">
                <Clock3 className="w-5 h-5 text-blue-600" />
                Temps imparti
              </div>
              <p className="mt-3 text-3xl font-bold text-slate-900">{SESSION_DURATION_SECONDS / 60}</p>
              <p className="mt-1 text-sm text-slate-500">minutes</p>
            </div>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6">
            <h2 className="text-lg font-bold text-slate-900">Bloc actif</h2>
            <div className="mt-5 grid gap-5 md:grid-cols-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Spécialité</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">Cardiologie</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Langue</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">Français</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Sélection</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">
                  30 questions différentes à chaque session
                </p>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end">
          <Button size="lg" onClick={handleStart} className="w-full sm:w-auto px-10">
            Démarrer le test
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
