export const QUESTION_COUNT = 30;
export const SESSION_DURATION_SECONDS = 60 * 60;

export const STORAGE_KEYS = {
  activeSession: 'medqsm.activeSession',
  sessionHistory: 'medqsm.sessionHistory',
};

const DEFAULT_LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];

function clampToZero(value) {
  return Math.max(0, value);
}

function hashSeed(seed) {
  let hash = 0;

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }

  return hash;
}

export function getTimeRemaining(expiresAt, now = Date.now()) {
  if (!expiresAt) {
    return 0;
  }

  return clampToZero(Math.ceil((new Date(expiresAt).getTime() - now) / 1000));
}

export function formatTime(seconds) {
  const safeSeconds = clampToZero(seconds);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const remainingSeconds = safeSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  }

  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

export function formatDuration(durationSeconds) {
  const total = clampToZero(durationSeconds);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;

  if (minutes === 0) {
    return `${seconds}s`;
  }

  if (seconds === 0) {
    return `${minutes} min`;
  }

  return `${minutes} min ${seconds}s`;
}

export function formatAverageDuration(durationSeconds) {
  const total = clampToZero(Math.round(durationSeconds));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;

  return `${minutes}m ${String(seconds).padStart(2, '0')}s`;
}

export function formatDateTime(value) {
  if (!value) {
    return 'Date indisponible';
  }

  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function areAnswerArraysEqual(left = [], right = []) {
  if (left.length !== right.length) {
    return false;
  }

  const sortedLeft = [...left].sort();
  const sortedRight = [...right].sort();

  return sortedLeft.every((value, index) => value === sortedRight[index]);
}

export function createQuestionMap(questionBank) {
  return questionBank.reduce((accumulator, question) => {
    accumulator[question.id] = question;
    return accumulator;
  }, {});
}

export function getQuestionsByIds(questionMap, questionIds = []) {
  return questionIds
    .map((questionId) => questionMap[questionId])
    .filter(Boolean);
}

export function deterministicShuffle(items, seed, rng = Math.random) {
  const list = [...items];
  let state = hashSeed(seed);

  for (let index = list.length - 1; index > 0; index -= 1) {
    state = (state * 1664525 + 1013904223) >>> 0;
    const randomValue = rng === Math.random ? state / 0x100000000 : rng();
    const swapIndex = Math.floor(randomValue * (index + 1));
    [list[index], list[swapIndex]] = [list[swapIndex], list[index]];
  }

  return list;
}

export function selectSessionQuestionIds(questionBank, lastCompletedSession, count = QUESTION_COUNT, rng = Math.random) {
  const allIds = questionBank.map((question) => question.id);
  const previousIds = new Set(lastCompletedSession?.questionIds || []);
  const freshIds = allIds.filter((questionId) => !previousIds.has(questionId));

  if (allIds.length < count) {
    throw new Error(`La banque contient ${allIds.length} questions, mais ${count} sont nécessaires pour lancer une session.`);
  }

  if (freshIds.length >= count) {
    return deterministicShuffle(freshIds, `${lastCompletedSession?.id || 'aucune'}:${count}`, rng).slice(0, count);
  }

  const shuffledFresh = deterministicShuffle(freshIds, `${lastCompletedSession?.id || 'aucune'}:fresh`, rng);
  const remainingIds = deterministicShuffle(
    allIds.filter((questionId) => !shuffledFresh.includes(questionId)),
    `${lastCompletedSession?.id || 'aucune'}:remaining`,
    rng,
  );

  return [...shuffledFresh, ...remainingIds].slice(0, count);
}

export function buildQuestionResult(question, answersByQuestionId) {
  const userAnswers = answersByQuestionId[question.id] || [];
  const correctAnswers = question.correctAnswers || [];
  const isCorrect = areAnswerArraysEqual(userAnswers, correctAnswers);

  return {
    questionId: question.id,
    userAnswers,
    correctAnswers,
    isCorrect,
  };
}

export function buildStoredSession(questionMap, activeSession, completedAt = new Date().toISOString(), finishedReason = 'submitted') {
  const questions = getQuestionsByIds(questionMap, activeSession.questionIds);
  const questionResults = questions.map((question) => buildQuestionResult(question, activeSession.answersByQuestionId));
  const correctCount = questionResults.filter((result) => result.isCorrect).length;
  const answeredCount = questionResults.filter((result) => result.userAnswers.length > 0).length;
  const unansweredCount = questions.length - answeredCount;
  const incorrectCount = questions.length - correctCount - unansweredCount;
  const durationSeconds = clampToZero(
    Math.round((new Date(completedAt).getTime() - new Date(activeSession.startedAt).getTime()) / 1000),
  );
  const scorePercent = Math.round((correctCount / questions.length) * 100);

  return {
    id: activeSession.id,
    topic: activeSession.topic,
    startedAt: activeSession.startedAt,
    completedAt,
    expiresAt: activeSession.expiresAt,
    durationSeconds,
    questionIds: activeSession.questionIds,
    answersByQuestionId: activeSession.answersByQuestionId,
    correctCount,
    incorrectCount,
    unansweredCount,
    answeredCount,
    scorePercent,
    finishedReason,
  };
}

export function calculateDashboardStats(sessionHistory = []) {
  const completedSessions = sessionHistory.length;
  const totalQuestionsDone = sessionHistory.reduce((total, session) => total + session.answeredCount, 0);
  const totalQuestionsPresented = sessionHistory.reduce((total, session) => total + session.questionIds.length, 0);
  const totalCorrect = sessionHistory.reduce((total, session) => total + session.correctCount, 0);
  const totalDuration = sessionHistory.reduce((total, session) => total + session.durationSeconds, 0);

  return {
    completedSessions,
    totalQuestionsDone,
    totalQuestionsPresented,
    overallAccuracy: totalQuestionsPresented > 0 ? Math.round((totalCorrect / totalQuestionsPresented) * 100) : 0,
    averageTimePerQuestion: totalQuestionsDone > 0 ? totalDuration / totalQuestionsDone : 0,
  };
}

export function createSessionRecord(questionIds, topic = 'Cardiologie') {
  const startedAt = new Date();
  const expiresAt = new Date(startedAt.getTime() + SESSION_DURATION_SECONDS * 1000);

  return {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `session-${Date.now()}`,
    topic,
    startedAt: startedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    questionIds,
    answersByQuestionId: {},
    currentQuestionIndex: 0,
    questionCount: questionIds.length,
    durationSeconds: SESSION_DURATION_SECONDS,
  };
}

export function createOptions(optionTexts) {
  return optionTexts.map((text, index) => ({
    id: DEFAULT_LABELS[index],
    text,
  }));
}
