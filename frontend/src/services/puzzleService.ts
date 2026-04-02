import apiClient from '@/lib/api';

export interface SubmitAnswerRequest {
  level: string;
  answer: string;
}

export interface SubmitAnswerResponse {
  correct: boolean;
  message: string;
  score: number;
  time_remaining: number;
  wrong_attempts: number;
  current_level: number;
}

export interface RequestHintRequest {
  level: string;
}

export interface RequestHintResponse {
  hint: string;
  time_remaining: number;
  score: number;
  hints_used: number;
  next_hint_time_cost: number;
  next_hint_pts_cost: number;
  max_hints_reached: boolean;
}

export interface HintInfoResponse {
  level: string;
  hints_used: number;
  max_hints_reached: boolean;
  next_hint_time_cost: number;
  next_hint_pts_cost: number;
  purchased_hints: string[];
}
export const puzzleService = {
  /**
   * Submit an answer for validation
   */
  async submitAnswer(level: string, answer: string): Promise<SubmitAnswerResponse> {
    try {
      const response = await apiClient.post<SubmitAnswerResponse>('/puzzle/submit', {
        level,
        answer,
      });
      return response;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to submit answer';
      throw new Error(message);
    }
  },

  /**
   * Request a hint for a puzzle
   */
  async requestHint(level: string): Promise<RequestHintResponse> {
    try {
      const response = await apiClient.post<RequestHintResponse>('/puzzle/hint', {
        level,
      });
      return response;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to request hint';
      throw new Error(message);
    }
  },

  /**
   * Get hint info before requesting (for costs)
   */
  async getHintInfo(level: string): Promise<HintInfoResponse> {
    try {
      const response = await apiClient.get<HintInfoResponse>(`/puzzle/hint-info/${level}`);
      return response;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to get hint info';
      throw new Error(message);
    }
  },
};

export default puzzleService;
