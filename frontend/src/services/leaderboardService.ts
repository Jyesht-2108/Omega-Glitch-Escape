import apiClient from '@/lib/api';

export interface LeaderboardEntry {
  rank: number;
  team_name: string;
  score: number;
  time_elapsed: string;
  completed_at: string;
}

export interface LiveLeaderboardEntry {
  rank: number;
  team_name: string;
  score: number;
  level: number;
  is_active: boolean;
}

export const leaderboardService = {
  /**
   * Get leaderboard data (completed teams only)
   */
  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    try {
      return await apiClient.get<LeaderboardEntry[]>('/leaderboard');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch leaderboard';
      throw new Error(message);
    }
  },

  /**
   * Get live leaderboard data (all active teams, ranked by current score/level)
   */
  async getLiveLeaderboard(): Promise<LiveLeaderboardEntry[]> {
    try {
      return await apiClient.get<LiveLeaderboardEntry[]>('/leaderboard/live');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch live leaderboard';
      throw new Error(message);
    }
  },
};

export default leaderboardService;
