import apiClient from '@/lib/api';

export interface LeaderboardEntry {
  rank: number;
  team_name: string;
  score: number;
  time_elapsed: string;
  completed_at: string;
}

export const leaderboardService = {
  /**
   * Get leaderboard data
   */
  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    try {
      return await apiClient.get<LeaderboardEntry[]>('/leaderboard');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch leaderboard';
      throw new Error(message);
    }
  },
};

export default leaderboardService;
