import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Clock, Target } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-1155/678 w-[36.125rem] -translate-x-1/2 rotate-[24deg] bg-linear-to-tr from-cyan-100 via-blue-200 to-blue-500 opacity-25 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
        </div>

        <div className="mx-auto max-w-4xl py-32 sm:py-48 lg:py-56 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl text-balance">
            Révisez la <span className="text-blue-600">cardiologie</span> avec des blocs de 30 QCM
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-600 text-pretty max-w-2xl mx-auto">
            Une banque de questions en français, des sessions chronométrées, des corrections détaillées et un dashboard qui sauvegarde votre progression réelle.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link to="/setup-session">
              <Button size="lg" className="rounded-full shadow-lg hover:shadow-xl transition-all">
                Lancer une session
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-blue-600">Révision active</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Tout ce qu&apos;il faut pour progresser sérieusement
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-3 lg:gap-y-16">
              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-slate-900">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  Banque cardio en français
                </dt>
                <dd className="mt-2 text-base leading-7 text-slate-600">
                  Des questions prêtes à être tirées aléatoirement pour générer un nouveau bloc à chaque session.
                </dd>
              </div>
              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-slate-900">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  Corrections détaillées
                </dt>
                <dd className="mt-2 text-base leading-7 text-slate-600">
                  Chaque question affiche la bonne réponse, l&apos;explication et la référence associée.
                </dd>
              </div>
              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-slate-900">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  Historique persistant
                </dt>
                <dd className="mt-2 text-base leading-7 text-slate-600">
                  Vos résultats restent visibles sur le dashboard, même après fermeture ou rechargement de la page.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
