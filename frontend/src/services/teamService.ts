import apiClient from '@/lib/api';
import { Team } from './authService';

export interface UpdateProgressRequest {
  current_level: number;
  score: number;
  time_remaining: number;
  stage?: string;
}

export interface CompleteGameRequest {
  final_score: number;
  time_remaining: number;
}

export const teamService = {
  /**
   * Get current team data
   */
  async getTeam(): Promise<Team> {
    try {
      return await apiClient.get<Team>('/team/me');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch team data';
      throw new Error(message);
    }
  },

  /**
   * Update team progress
   */
  async updateProgress(data: UpdateProgressRequest): Promise<void> {
    try {
      await apiClient.put('/team/progress', data);
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to update progress';
      throw new Error(message);
    }
  },

  /**
   * Complete the game
   */
  async completeGame(data: CompleteGameRequest): Promise<void> {
    try {
      await apiClient.post('/team/complete', data);
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to complete game';
      throw new Error(message);
    }
  },

  /**
   * Disqualify current team
   */
  async disqualifyTeam(reason: string): Promise<void> {
    try {
      await apiClient.post('/team/disqualify', { reason });
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to disqualify team';
      throw new Error(message);
    }
  },
};

export default teamService;
