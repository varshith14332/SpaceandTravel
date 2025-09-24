import { useEffect, useState, useCallback } from 'react';
import {
  fetchMissions,
  fetchMission,
  fetchTrainingModules,
  startTrainingSession,
  getTrainingSession,
  postTrainingEvent,
  completeTrainingSession,
  fetchLeaderboard,
  trackActivities
} from './api';

interface AsyncState<T> { data: T | null; loading: boolean; error: string | null; }

function useAsync<T>(fn: () => Promise<T>, deps: any[] = []): AsyncState<T> & { refresh: () => void } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick(t => t + 1), []);
  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(null);
    fn().then(r => { if (!cancelled) setData(r); }).catch(e => { if (!cancelled) setError(e.message || 'Error'); }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);
  return { data, loading, error, refresh };
}

// Missions
export function useMissions() { return useAsync(fetchMissions, []); }
export function useMission(code: string | undefined) {
  return useAsync(() => {
    if (!code) return Promise.reject(new Error('No code provided'));
    return fetchMission(code);
  }, [code]);
}

// Training
export function useTrainingModules() { return useAsync(fetchTrainingModules, []); }

export function useTrainingSession(sessionId: string | null) {
  return useAsync(() => {
    if (!sessionId) return Promise.reject(new Error('No session id'));
    return getTrainingSession(sessionId);
  }, [sessionId]);
}

export function useStartTraining(moduleKey: string | null) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const start = async () => {
    if (!moduleKey) return; setStarting(true); setError(null);
    try { const s = await startTrainingSession(moduleKey); setSessionId(s._id); } catch (e: any) { setError(e.message); } finally { setStarting(false); }
  };
  return { start, sessionId, starting, error };
}

export async function recordTrainingEvent(sessionId: string, type: string, payload?: any, progress?: number) {
  return postTrainingEvent(sessionId, type, payload, progress);
}
export async function completeTraining(sessionId: string, score: number) {
  return completeTrainingSession(sessionId, score);
}

// Leaderboard
export function useLeaderboard(params?: { category?: string; reference?: string; limit?: number }) {
  return useAsync(() => fetchLeaderboard(params), [JSON.stringify(params)]);
}

// Analytics event helper
export function useActivityTracker() {
  const track = useCallback((events: { action: string; resource: string; metadata?: any }[]) => {
    return trackActivities(events).catch(() => void 0);
  }, []);
  return { track };
}
