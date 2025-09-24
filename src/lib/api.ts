// Centralized API helper layer
// Provides thin wrappers around fetch with JSON envelope handling

export interface ApiOptions {
	method?: string;
	body?: any;
	headers?: Record<string, string>;
	cache?: RequestCache;
}

interface ApiEnvelope<T> { success: boolean; data?: T; message?: string; }

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE || '';

async function request<T>(path: string, options: ApiOptions = {}): Promise<T> {
	const { method = 'GET', body, headers = {}, cache } = options;
	let url = `${BASE_URL}${path}`;
	// Ensure leading slash behavior is consistent
	if (!BASE_URL && !url.startsWith('/')) url = '/' + url;

	const res = await fetch(url, {
		method,
		headers: {
			'Content-Type': 'application/json',
			...headers
		},
		body: body ? JSON.stringify(body) : undefined,
		cache: cache || 'no-store'
	});

	const contentType = res.headers.get('content-type') || '';
	// If we got HTML back, likely we hit Next.js page instead of backend (proxy misconfig or server down)
	if (contentType.includes('text/html')) {
		const snippet = (await res.text()).slice(0, 300);
		throw new Error(
			`Backend did not return JSON. Received HTML instead. Hint: Is the Express server running and rewrite/NEXT_PUBLIC_API_BASE set? Snippet: ${snippet}`
		);
	}

	let json: any = null;
	try {
		json = await res.json();
	} catch (e) {
		throw new Error(`Failed to parse JSON: ${(e as Error).message}`);
	}

	if (!res.ok || (json && json.success === false)) {
		throw new Error(json?.message || `API error ${res.status}`);
	}
	return (json && json.data !== undefined ? json.data : json) as T;
}

// Missions
export interface MissionDTO { _id: string; title: string; code: string; description: string; difficulty: string; objectives: string[]; rewards: { xp: number; badges: string[] }; estimatedDurationMinutes: number; }
export const fetchMissions = () => request<MissionDTO[]>("/api/missions");
export const fetchMission = (code: string) => request<MissionDTO>(`/api/missions/${code}`);

// Training Modules & Sessions
export interface TrainingModuleDTO { _id: string; key: string; title: string; description: string; category: string; difficulty: string; estimatedMinutes: number; objectives: string[]; }
export const fetchTrainingModules = () => request<TrainingModuleDTO[]>("/api/training/modules");

export interface TrainingSessionDTO { _id: string; moduleKey: string; userId: string; score?: number; progress?: number; startedAt: string; completedAt?: string; events: any[]; }
export const startTrainingSession = (moduleKey: string) => request<TrainingSessionDTO>("/api/training/sessions", { method: 'POST', body: { moduleKey } });
export const getTrainingSession = (id: string) => request<TrainingSessionDTO>(`/api/training/sessions/${id}`);
export const postTrainingEvent = (id: string, type: string, payload?: any, progress?: number) => request<TrainingSessionDTO>(`/api/training/sessions/${id}/events`, { method: 'POST', body: { type, payload, progress } });
export const completeTrainingSession = (id: string, score: number) => request<TrainingSessionDTO>(`/api/training/sessions/${id}/complete`, { method: 'POST', body: { score } });

// Leaderboard
export interface LeaderboardEntryDTO { _id: string; userId: string; username: string; category: string; reference: string; score: number; createdAt: string; }
export const fetchLeaderboard = (params?: { category?: string; reference?: string; limit?: number }) => {
	const q = new URLSearchParams();
	if (params?.category) q.set('category', params.category);
	if (params?.reference) q.set('reference', params.reference);
	if (params?.limit) q.set('limit', String(params.limit));
	const qs = q.toString();
	return request<LeaderboardEntryDTO[]>(`/api/leaderboard${qs ? '?' + qs : ''}`);
};
export const submitLeaderboardScore = (data: { category: string; reference: string; score: number; username?: string }) => request<LeaderboardEntryDTO>("/api/leaderboard", { method: 'POST', body: data });

// Analytics (basic wrappers)
export const fetchAnalytics = (timeframe: string = '30d') => request(`/api/analytics?timeframe=${timeframe}`);
export const fetchRealTimeAnalytics = () => request(`/api/analytics/realtime`);
export const trackActivities = (events: { action: string; resource: string; metadata?: any }[]) => request(`/api/analytics/track`, { method: 'POST', body: { events } });

// Community (existing routes)
// Minimal examples; can be expanded
export const fetchCommunityPosts = () => request(`/api/community/forum/posts`);

// Generic helper for future expansion
export const apiClient = { request };

