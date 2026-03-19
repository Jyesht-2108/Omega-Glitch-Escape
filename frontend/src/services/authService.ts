import apiClient from '@/lib/api';

export interface LoginRequest {
  team_name: string;
  password: string;
}

export interface Team {
  id: string;
  team_name: string;
  current_level: number;
  score: number;
  time_remaining: number;
  is_active: boolean;
  is_disqualified: boolean;
  disqualified_reason?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  token: string;
  team: Team;
}

export const authService = {
  /**
   * Login with team credentials
   */
  async login(teamName: string, password: string): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/login', {
        team_name: teamName,
        password: password,
      });

      // Store token
      apiClient.setToken(response.token);

      return response;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Login failed';
      throw new Error(message);
    }
  },

  /**
   * Logout - clear token and state
   */
  logout(): void {
    apiClient.clearToken();
    localStorage.clear();
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!apiClient.getToken();
  },

  /**
   * Get stored token
   */
  getToken(): string | null {
    return apiClient.getToken();
  },
};

export default authService;
