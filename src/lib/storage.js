import { STORAGE_KEYS } from './examUtils';

function hasWindow() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readJson(key, fallbackValue) {
  if (!hasWindow()) {
    return fallbackValue;
  }

  try {
    const rawValue = window.localStorage.getItem(key);

    if (!rawValue) {
      return fallbackValue;
    }

    return JSON.parse(rawValue);
  } catch (error) {
    console.warn(`Impossible de lire la clé ${key} dans le stockage local.`, error);
    return fallbackValue;
  }
}

function writeJson(key, value) {
  if (!hasWindow()) {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Impossible d'enregistrer la clé ${key} dans le stockage local.`, error);
  }
}

function removeKey(key) {
  if (!hasWindow()) {
    return;
  }

  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.warn(`Impossible de supprimer la clé ${key} dans le stockage local.`, error);
  }
}

export function loadActiveSession() {
  return readJson(STORAGE_KEYS.activeSession, null);
}

export function saveActiveSession(activeSession) {
  if (!activeSession) {
    removeKey(STORAGE_KEYS.activeSession);
    return;
  }

  writeJson(STORAGE_KEYS.activeSession, activeSession);
}

export function loadSessionHistory() {
  return readJson(STORAGE_KEYS.sessionHistory, []);
}

export function saveSessionHistory(sessionHistory) {
  writeJson(STORAGE_KEYS.sessionHistory, sessionHistory);
}
