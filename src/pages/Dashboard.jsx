import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, CheckCircle2, Clock3, Layers3, PlayCircle, Trophy } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import useExamStore from '../store/useExamStore';
import { calculateDashboardStats, formatAverageDuration, formatDateTime, formatDuration } from '../lib/examUtils';

function StatCard({ icon: Icon, label, value, caption, tone }) {
  return (
    <Card className="border-0 ring-1 ring-slate-200 shadow-sm">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <h3 className="text-3xl font-bold text-slate-900 mt-1">{value}</h3>
            <p className="text-sm text-slate-500 mt-2">{caption}</p>
          </div>
          <div className={`p-3 rounded-2xl border ${tone}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { sessionHistory, lastCompletedSession } = useExamStore();
  const stats = calculateDashboardStats(sessionHistory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] font-bold text-blue-600">Tableau de bord</p>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mt-3">Suivi réel de vos sessions cardio</h1>
          <p className="text-slate-600 mt-2">Toutes les statistiques ci-dessous viennent des tests réellement terminés sur cet appareil.</p>
        </div>
        <Link to="/setup-session">
          <Button className="gap-2">
            <PlayCircle className="w-5 h-5" />
            Créer un nouveau test
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          icon={Layers3}
          label="Questions répondues"
          value={stats.totalQuestionsDone}
          caption={`${stats.totalQuestionsPresented} questions affichées au total`}
          tone="bg-blue-100 border-blue-200 text-blue-600"
        />
        <StatCard
          icon={CheckCircle2}
          label="Précision globale"
          value={`${stats.overallAccuracy}%`}
          caption="Calculée sur toutes les sessions terminées"
          tone="bg-green-100 border-green-200 text-green-600"
        />
        <StatCard
          icon={Trophy}
          label="Sessions terminées"
          value={stats.completedSessions}
          caption="Historique local persistant"
          tone="bg-amber-100 border-amber-200 text-amber-600"
        />
        <StatCard
          icon={Clock3}
          label="Temps moyen / question"
          value={formatAverageDuration(stats.averageTimePerQuestion)}
          caption="Basé sur vos réponses enregistrées"
          tone="bg-orange-100 border-orange-200 text-orange-600"
        />
      </div>

      {lastCompletedSession ? (
        <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
          <Card className="border-0 ring-1 ring-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>Dernière session</CardTitle>
              <CardDescription>Résumé du dernier test sauvegardé</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5">
                <p className="text-sm text-slate-500">Score</p>
                <p className="mt-2 text-4xl font-black text-slate-900">{lastCompletedSession.scorePercent}%</p>
                <p className="mt-2 text-sm text-slate-500">
                  {lastCompletedSession.correctCount} justes • {lastCompletedSession.incorrectCount} fausses
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5">
                <p className="text-sm text-slate-500">Temps utilisé</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{formatDuration(lastCompletedSession.durationSeconds)}</p>
                <p className="mt-2 text-sm text-slate-500">{formatDateTime(lastCompletedSession.completedAt)}</p>
              </div>

              <div className="md:col-span-2 flex flex-wrap gap-3">
                <Link to={`/review/${lastCompletedSession.id}`}>
                  <Button>Voir la correction</Button>
                </Link>
                <Link to="/setup-session">
                  <Button variant="outline">Relancer un bloc</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 ring-1 ring-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>Rythme d&apos;activité</CardTitle>
              <CardDescription>Vue rapide sur votre progression récente</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {sessionHistory.slice(0, 4).map((session) => (
                <div key={session.id} className="rounded-2xl border border-slate-200 p-4 bg-white">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-900">{session.topic} • 30 questions</p>
                      <p className="text-sm text-slate-500 mt-1">{formatDateTime(session.completedAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">{session.scorePercent}%</p>
                      <p className="text-sm text-slate-500">{formatDuration(session.durationSeconds)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="mt-8 border-0 ring-1 ring-slate-200 shadow-sm">
          <CardContent className="py-16 text-center">
            <Activity className="w-14 h-14 text-slate-300 mx-auto" />
            <h2 className="text-2xl font-bold text-slate-900 mt-5">Aucune session terminée pour le moment</h2>
            <p className="text-slate-500 mt-3 max-w-2xl mx-auto">
              Lancez votre premier test de cardiologie pour commencer à remplir automatiquement le dashboard avec vos vraies statistiques.
            </p>
            <div className="mt-8">
              <Link to="/setup-session">
                <Button>Commencer maintenant</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4 text-slate-900">Tests récents</h2>
        <Card className="border-0 ring-1 ring-slate-200 shadow-sm">
          {sessionHistory.length === 0 ? (
            <CardContent className="py-10 text-center text-slate-500">
              Aucun historique enregistré pour l&apos;instant.
            </CardContent>
          ) : (
            <div className="divide-y divide-slate-100">
              {sessionHistory.map((session) => (
                <Link
                  key={session.id}
                  to={`/review/${session.id}`}
                  className="block p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h4 className="font-semibold text-slate-900">{session.topic} • Session de 30 questions</h4>
                      <p className="text-sm text-slate-500 mt-1">{formatDateTime(session.completedAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">{session.scorePercent}%</p>
                      <p className="text-sm text-slate-500">{session.correctCount}/{session.questionIds.length} justes</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
