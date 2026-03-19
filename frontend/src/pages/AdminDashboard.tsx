import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Trophy, Clock, Shield, LogOut, 
  RefreshCw, Plus, Activity, Ban, FileText, BarChart3
} from 'lucide-react';
import { StatCard, TeamRow, CreateTeamModal, EditTeamModal } from '@/components/admin/AdminComponents';

interface Team {
  id: string;
  team_name: string;
  current_level: number;
  score: number;
  time_remaining: number;
  custom_time_bonus: number;
  custom_score_adjustment: number;
  is_active: boolean;
  is_disqualified: boolean;
  disqualified_reason?: string;
  started_at?: string;
  completed_at?: string;
  tab_switches: number;
  suspicious_activity_count: number;
  created_at: string;
}

interface Stats {
  total_teams: number;
  active_teams: number;
  completed_teams: number;
  disqualified_teams: number;
  average_time: number;
  average_score: number;
  level_distribution: { [key: number]: number };
}

interface AdminLog {
  id: string;
  admin_username: string;
  action_type: string;
  target_team_name: string;
  details: any;
  created_at: string;
}

const AdminDashboard = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'disqualified'>('all');
  const navigate = useNavigate();

  const adminToken = localStorage.getItem('adminToken');

  useEffect(() => {
    if (!adminToken) {
      navigate('/admin');
      return;
    }
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [adminToken, navigate]);

  const loadData = async () => {
    try {
      const [teamsRes, statsRes, logsRes] = await Promise.all([
        fetch('http://localhost:3000/api/admin/teams', {
          headers: { 'Authorization': `Bearer ${adminToken}` }
        }),
        fetch('http://localhost:3000/api/admin/stats', {
          headers: { 'Authorization': `Bearer ${adminToken}` }
        }),
        fetch('http://localhost:3000/api/admin/logs?limit=50', {
          headers: { 'Authorization': `Bearer ${adminToken}` }
        })
      ]);

      if (teamsRes.ok) {
        const teamsData = await teamsRes.json();
        setTeams(teamsData);
      }
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setLogs(logsData);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to load data:', error);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin');
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  const filteredTeams = teams.filter(team => {
    if (filter === 'active') return team.is_active && !team.is_disqualified;
    if (filter === 'completed') return team.completed_at;
    if (filter === 'disqualified') return team.is_disqualified;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary text-glow-cyan">
          <RefreshCw className="w-8 h-8 animate-spin" />
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
              <Shield className="w-8 h-8 text-destructive" />
              <h1 className="text-3xl font-bold text-destructive text-glow-red">
                OMEGA CONTROL CENTER
              </h1>
            </div>
            <p className="text-sm text-muted-foreground font-mono">
              ▸ SYSTEM ADMINISTRATOR DASHBOARD ◂
            </p>
          </div>
          <div className="flex gap-2">
            <motion.button
              onClick={() => navigate('/admin/leaderboard')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 border border-accent bg-accent text-accent-foreground hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <Trophy className="w-4 h-4" />
              LEADERBOARD
            </motion.button>
            <motion.button
              onClick={() => setShowLogs(!showLogs)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-4 py-2 border ${showLogs ? 'border-accent bg-accent text-accent-foreground' : 'border-primary text-primary'} hover:bg-primary hover:text-primary-foreground transition-colors flex items-center gap-2`}
            >
              <FileText className="w-4 h-4" />
              LOGS
            </motion.button>
            <motion.button
              onClick={loadData}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              REFRESH
            </motion.button>
            <motion.button
              onClick={handleLogout}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 border border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              LOGOUT
            </motion.button>
          </div>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              icon={<Users className="w-6 h-6" />}
              label="TOTAL TEAMS"
              value={stats.total_teams}
              color="primary"
            />
            <StatCard
              icon={<Activity className="w-6 h-6" />}
              label="ACTIVE TEAMS"
              value={stats.active_teams}
              color="secondary"
            />
            <StatCard
              icon={<Trophy className="w-6 h-6" />}
              label="COMPLETED"
              value={stats.completed_teams}
              color="accent"
            />
            <StatCard
              icon={<Ban className="w-6 h-6" />}
              label="DISQUALIFIED"
              value={stats.disqualified_teams}
              color="destructive"
            />
          </div>
        )}

        {/* Level Distribution */}
        {stats && stats.level_distribution && (
          <div className="border border-primary bg-card p-4 mb-6 box-glow-cyan">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-mono text-primary">LEVEL DISTRIBUTION</h2>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map(level => (
                <div key={level} className="text-center">
                  <div className="text-2xl font-bold font-mono text-primary">
                    {stats.level_distribution[level] || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">LEVEL {level}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Activity Logs */}
        {showLogs && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border border-accent bg-card p-4 mb-6 box-glow-green"
          >
            <h2 className="text-lg font-mono text-accent mb-3">RECENT ADMIN ACTIONS</h2>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {logs.map(log => (
                <div key={log.id} className="text-xs font-mono border-l-2 border-accent pl-2 py-1">
                  <span className="text-muted-foreground">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                  {' - '}
                  <span className="text-accent">{log.action_type}</span>
                  {log.target_team_name && (
                    <>
                      {' → '}
                      <span className="text-primary">{log.target_team_name}</span>
                    </>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Filters */}
        <div className="flex gap-2 mb-4">
          {(['all', 'active', 'completed', 'disqualified'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 font-mono text-sm transition-colors ${
                filter === f
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border text-muted-foreground hover:text-primary'
              }`}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Teams Table */}
        <div className="border border-border bg-card overflow-hidden mb-4">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/30 border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-mono text-muted-foreground">TEAM</th>
                  <th className="px-4 py-3 text-left text-xs font-mono text-muted-foreground">LEVEL</th>
                  <th className="px-4 py-3 text-left text-xs font-mono text-muted-foreground">SCORE</th>
                  <th className="px-4 py-3 text-left text-xs font-mono text-muted-foreground">TIME</th>
                  <th className="px-4 py-3 text-left text-xs font-mono text-muted-foreground">STATUS</th>
                  <th className="px-4 py-3 text-left text-xs font-mono text-muted-foreground">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeams.map((team) => (
                  <TeamRow
                    key={team.id}
                    team={team}
                    onEdit={() => {
                      setSelectedTeam(team);
                      setShowEditModal(true);
                    }}
                    onRefresh={loadData}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Team Button */}
        <motion.button
          onClick={() => setShowCreateModal(true)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 border-2 border-dashed border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors flex items-center justify-center gap-2 font-mono"
        >
          <Plus className="w-5 h-5" />
          CREATE NEW TEAM
        </motion.button>

        {/* Average Stats */}
        {stats && (
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="border border-border bg-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-4 h-4 text-accent" />
                <span className="text-xs text-muted-foreground">AVG SCORE</span>
              </div>
              <div className="text-2xl font-bold font-mono text-accent">
                {stats.average_score}
              </div>
            </div>
            <div className="border border-border bg-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">AVG TIME</span>
              </div>
              <div className="text-2xl font-bold font-mono text-primary">
                {formatTime(stats.average_time)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateTeamModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={loadData}
      />
      <EditTeamModal
        show={showEditModal}
        team={selectedTeam}
        onClose={() => {
          setShowEditModal(false);
          setSelectedTeam(null);
        }}
        onSuccess={loadData}
      />
    </div>
  );
};

export default AdminDashboard;
