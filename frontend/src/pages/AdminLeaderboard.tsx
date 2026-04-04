import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Trophy, Medal, Award, Clock, Zap, AlertTriangle, 
  TrendingUp, Target, Activity, Ban, CheckCircle, ArrowLeft,
  Crown, Star, Flame
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface LeaderboardEntry {
  rank: number;
  team_name: string;
  team_id: string;
  current_level: number;
  score: number;
  time_elapsed: number;
  time_remaining: number;
  total_hints_used: number;
  total_attempts: number;
  total_wrong_attempts: number;
  tab_switches: number;
  suspicious_activity_count: number;
  is_completed: boolean;
  is_disqualified: boolean;
  completed_at?: string;
  ranking_score: number;
}

const AdminLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'completed' | 'active'>('all');
  const navigate = useNavigate();

  const adminToken = localStorage.getItem('adminToken');

  useEffect(() => {
    if (!adminToken) {
      navigate('/admin');
      return;
    }
    loadLeaderboard();
    const interval = setInterval(loadLeaderboard, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, [adminToken, navigate]);

  const loadLeaderboard = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/leaderboard`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });

      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <div className="flex flex-col items-center"><Crown className="w-4 h-4 text-yellow-400 mb-0.5" /><span className="text-[10px] leading-none font-bold text-yellow-400">1ST</span></div>;
    if (rank === 2) return <div className="flex flex-col items-center"><Medal className="w-4 h-4 text-gray-400 mb-0.5" /><span className="text-[10px] leading-none font-bold text-gray-300">2ND</span></div>;
    if (rank === 3) return <div className="flex flex-col items-center"><Award className="w-4 h-4 text-amber-600 mb-0.5" /><span className="text-[10px] leading-none font-bold text-amber-500">3RD</span></div>;
    return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return 'bg-yellow-500/20 border-yellow-500 text-yellow-400';
    if (rank === 2) return 'bg-gray-500/20 border-gray-400 text-gray-300';
    if (rank === 3) return 'bg-amber-600/20 border-amber-600 text-amber-500';
    return 'bg-muted/20 border-border text-muted-foreground';
  };

  const filteredLeaderboard = leaderboard.filter(entry => {
    if (filter === 'completed') return entry.is_completed;
    if (filter === 'active') return !entry.is_completed && !entry.is_disqualified;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary text-glow-cyan">
          <Trophy className="w-8 h-8 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="w-8 h-8 text-accent" />
              <h1 className="text-3xl font-bold text-accent text-glow-green">
                OMEGA LEADERBOARD
              </h1>
            </div>
            <p className="text-sm text-muted-foreground font-mono">
              ▸ ADVANCED RANKING SYSTEM ◂
            </p>
          </div>
          <motion.button
            onClick={() => navigate('/admin/dashboard')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            BACK TO DASHBOARD
          </motion.button>
        </div>

        {/* Rank Score Formula Info */}
        <div className="border border-accent bg-card p-4 mb-6 box-glow-green">
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-mono text-accent">RANK SCORE FORMULA</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-mono">
            <div>
              <div className="text-green-500 mb-2">BONUSES:</div>
              <div className="space-y-1 text-muted-foreground">
                <div>• Live Score: Points after hint/answer penalties</div>
                <div>• Level Bonus: Level² × 200 points</div>
                <div>• Time Bonus (Completed): (Time Remaining / Total) × 1000</div>
                <div>• Time Bonus (Incomplete): (Time Remaining / Total) × 200</div>
                <div>• Completion Bonus: +2000 points</div>
              </div>
            </div>
            <div>
              <div className="text-red-500 mb-2">BEHAVIORAL PENALTIES:</div>
              <div className="space-y-1 text-muted-foreground">
                <div>• Excessive Wrong Attempts: -10 points each</div>
                <div>• Tab Switches: -30 points each</div>
                <div>• Suspicious Activity: -100 points each</div>
                <div className="text-xs text-yellow-500 mt-2">
                  Note: Hint penalties already included in Live Score
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4">
          {(['all', 'completed', 'active'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 font-mono text-sm transition-colors ${
                filter === f
                  ? 'bg-accent text-accent-foreground'
                  : 'border border-border text-muted-foreground hover:text-accent'
              }`}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Top 3 Podium */}
        {filteredLeaderboard.length >= 3 && filter !== 'active' && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            {/* 2nd Place */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="border border-gray-400 bg-card p-4 text-center"
            >
              <Medal className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-300 mb-1">2nd</div>
              <div className="text-lg font-mono text-primary mb-2">{filteredLeaderboard[1].team_name}</div>
              <div className="text-sm text-muted-foreground">Score: {Math.round(filteredLeaderboard[1].ranking_score)}</div>
            </motion.div>

            {/* 1st Place */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="border-2 border-yellow-500 bg-card p-6 text-center box-glow-yellow -mt-4"
            >
              <Crown className="w-16 h-16 text-yellow-400 mx-auto mb-2" />
              <div className="text-3xl font-bold text-yellow-400 mb-1">1st</div>
              <div className="text-xl font-mono text-primary mb-2">{filteredLeaderboard[0].team_name}</div>
              <div className="text-sm text-muted-foreground">Score: {Math.round(filteredLeaderboard[0].ranking_score)}</div>
            </motion.div>

            {/* 3rd Place */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="border border-amber-600 bg-card p-4 text-center"
            >
              <Award className="w-12 h-12 text-amber-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-amber-500 mb-1">3rd</div>
              <div className="text-lg font-mono text-primary mb-2">{filteredLeaderboard[2].team_name}</div>
              <div className="text-sm text-muted-foreground">Score: {Math.round(filteredLeaderboard[2].ranking_score)}</div>
            </motion.div>
          </div>
        )}

        {/* Full Leaderboard Table */}
        <div className="border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/30 border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-mono text-muted-foreground">RANK</th>
                  <th className="px-4 py-3 text-left text-xs font-mono text-muted-foreground">TEAM</th>
                  <th className="px-4 py-3 text-left text-xs font-mono text-muted-foreground">LEVEL</th>
                  <th className="px-4 py-3 text-left text-xs font-mono text-muted-foreground">SCORE</th>
                  <th className="px-4 py-3 text-left text-xs font-mono text-muted-foreground">TIME</th>
                  <th className="px-4 py-3 text-left text-xs font-mono text-muted-foreground">HINTS</th>
                  <th className="px-4 py-3 text-left text-xs font-mono text-muted-foreground">WRONG</th>
                  <th className="px-4 py-3 text-left text-xs font-mono text-muted-foreground">FLAGS</th>
                  <th className="px-4 py-3 text-left text-xs font-mono text-muted-foreground">RANK SCORE</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeaderboard.map((entry, index) => (
                  <motion.tr
                    key={entry.team_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`border-b border-border hover:bg-muted/20 transition-colors ${
                      entry.is_disqualified ? 'opacity-50' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className={`flex items-center justify-center w-12 h-12 border ${getRankBadge(entry.rank)}`}>
                        {getRankIcon(entry.rank)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold">{entry.team_name}</span>
                        {entry.is_completed && <CheckCircle className="w-4 h-4 text-accent" />}
                        {entry.is_disqualified && <Ban className="w-4 h-4 text-destructive" />}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-mono ${
                        entry.current_level === 4 ? 'bg-accent text-accent-foreground' :
                        entry.current_level === 3 ? 'bg-secondary text-secondary-foreground' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        LVL {entry.current_level}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Zap className="w-4 h-4 text-accent" />
                        <span className="font-mono font-bold">{entry.score}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-primary" />
                        <span className="font-mono text-sm">{formatTime(entry.time_elapsed)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Target className="w-4 h-4 text-yellow-500" />
                        <span className="font-mono">{entry.total_hints_used}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4 text-destructive" />
                        <span className="font-mono">{entry.total_wrong_attempts}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {entry.tab_switches > 5 && (
                          <span className="px-2 py-1 text-xs bg-yellow-500/20 text-yellow-500">
                            TAB:{entry.tab_switches}
                          </span>
                        )}
                        {entry.suspicious_activity_count > 0 && (
                          <span className="px-2 py-1 text-xs bg-destructive/20 text-destructive">
                            SUS:{entry.suspicious_activity_count}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Flame className="w-4 h-4 text-accent" />
                        <span className="font-mono font-bold text-accent">
                          {Math.round(entry.ranking_score)}
                        </span>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Statistics Summary */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-4 h-4 text-accent" />
              <span className="text-xs text-muted-foreground">TOTAL TEAMS</span>
            </div>
            <div className="text-2xl font-bold font-mono text-accent">
              {filteredLeaderboard.length}
            </div>
          </div>
          <div className="border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-xs text-muted-foreground">COMPLETED</span>
            </div>
            <div className="text-2xl font-bold font-mono text-green-500">
              {filteredLeaderboard.filter(e => e.is_completed).length}
            </div>
          </div>
          <div className="border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">ACTIVE</span>
            </div>
            <div className="text-2xl font-bold font-mono text-primary">
              {filteredLeaderboard.filter(e => !e.is_completed && !e.is_disqualified).length}
            </div>
          </div>
          <div className="border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Ban className="w-4 h-4 text-destructive" />
              <span className="text-xs text-muted-foreground">DISQUALIFIED</span>
            </div>
            <div className="text-2xl font-bold font-mono text-destructive">
              {filteredLeaderboard.filter(e => e.is_disqualified).length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLeaderboard;
