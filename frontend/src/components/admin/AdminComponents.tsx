import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Edit, Trash2, RotateCcw, Ban, CheckCircle, X, AlertTriangle,
  Clock, TrendingUp, TrendingDown, Activity, Zap
} from 'lucide-react';

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

const adminToken = () => localStorage.getItem('adminToken');

export const StatCard = ({ icon, label, value, color }: any) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className={`border border-${color} bg-card p-4 box-glow-${color === 'destructive' ? 'red' : color === 'primary' ? 'cyan' : 'green'}`}
  >
    <div className={`flex items-center gap-3 text-${color}`}>
      {icon}
      <div>
        <div className="text-2xl font-bold font-mono">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  </motion.div>
);

export const TeamRow = ({ team, onEdit, onRefresh }: { team: Team; onEdit: () => void; onRefresh: () => void }) => {
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleDisqualify = async () => {
    const reason = prompt('Enter disqualification reason:');
    if (!reason) return;

    try {
      const res = await fetch(`http://localhost:3000/api/admin/teams/${team.id}/disqualify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });

      if (res.ok) {
        onRefresh();
      }
    } catch (error) {
      console.error('Failed to disqualify team:', error);
    }
  };

  const handleRequalify = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/admin/teams/${team.id}/requalify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken()}`,
        },
      });

      if (res.ok) {
        onRefresh();
      }
    } catch (error) {
      console.error('Failed to requalify team:', error);
    }
  };

  const handleReset = async () => {
    if (!confirm(`Reset team ${team.team_name}? This will clear all progress.`)) return;

    try {
      const res = await fetch(`http://localhost:3000/api/admin/teams/${team.id}/reset`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken()}`,
        },
      });

      if (res.ok) {
        onRefresh();
      }
    } catch (error) {
      console.error('Failed to reset team:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete team ${team.team_name}? This action cannot be undone.`)) return;

    try {
      const res = await fetch(`http://localhost:3000/api/admin/teams/${team.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken()}`,
        },
      });

      if (res.ok) {
        onRefresh();
      }
    } catch (error) {
      console.error('Failed to delete team:', error);
    }
  };

  return (
    <tr className="border-b border-border hover:bg-muted/20 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="font-mono">{team.team_name}</span>
          {team.suspicious_activity_count > 0 && (
            <span title={`${team.suspicious_activity_count} suspicious activities`}>
              <AlertTriangle className="w-4 h-4 text-destructive" />
            </span>
          )}
          {team.tab_switches > 5 && (
            <span title={`${team.tab_switches} tab switches`}>
              <Activity className="w-4 h-4 text-yellow-500" />
            </span>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <span className={`px-2 py-1 text-xs font-mono ${
          team.current_level === 4 ? 'bg-accent text-accent-foreground' :
          team.current_level === 3 ? 'bg-secondary text-secondary-foreground' :
          'bg-muted text-muted-foreground'
        }`}>
          LEVEL {team.current_level}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <span className="font-mono">{team.score}</span>
          {team.custom_score_adjustment !== 0 && (
            <span className={`text-xs ${team.custom_score_adjustment > 0 ? 'text-green-500' : 'text-red-500'}`}>
              ({team.custom_score_adjustment > 0 ? '+' : ''}{team.custom_score_adjustment})
            </span>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <span className="font-mono text-sm">{formatTime(team.time_remaining)}</span>
          {team.custom_time_bonus !== 0 && (
            <span className={`text-xs ${team.custom_time_bonus > 0 ? 'text-green-500' : 'text-red-500'}`}>
              ({team.custom_time_bonus > 0 ? '+' : ''}{Math.floor(team.custom_time_bonus / 60)}m)
            </span>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        {team.is_disqualified ? (
          <span className="px-2 py-1 text-xs bg-destructive text-destructive-foreground">DISQUALIFIED</span>
        ) : team.completed_at ? (
          <span className="px-2 py-1 text-xs bg-accent text-accent-foreground">COMPLETED</span>
        ) : team.is_active ? (
          <span className="px-2 py-1 text-xs bg-secondary text-secondary-foreground">ACTIVE</span>
        ) : (
          <span className="px-2 py-1 text-xs bg-muted text-muted-foreground">INACTIVE</span>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-1">
          <button
            onClick={onEdit}
            className="p-1 hover:bg-primary hover:text-primary-foreground transition-colors"
            aria-label="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          {team.is_disqualified ? (
            <button
              onClick={handleRequalify}
              className="p-1 hover:bg-secondary hover:text-secondary-foreground transition-colors"
              aria-label="Requalify"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleDisqualify}
              className="p-1 hover:bg-destructive hover:text-destructive-foreground transition-colors"
              aria-label="Disqualify"
            >
              <Ban className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={handleReset}
            className="p-1 hover:bg-accent hover:text-accent-foreground transition-colors"
            aria-label="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1 hover:bg-destructive hover:text-destructive-foreground transition-colors"
            aria-label="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export const CreateTeamModal = ({ show, onClose, onSuccess }: any) => {
  const [teamName, setTeamName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('http://localhost:3000/api/admin/teams', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ team_name: teamName, password }),
      });

      if (res.ok) {
        setTeamName('');
        setPassword('');
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Failed to create team:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-card border border-primary p-6 max-w-md w-full box-glow-cyan"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-primary">CREATE NEW TEAM</h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-primary">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">TEAM NAME:</label>
              <input
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="input-cyber w-full"
                placeholder="Enter team name"
                required
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">PASSWORD:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-cyber w-full"
                placeholder="Enter password"
                required
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2 bg-primary text-primary-foreground font-mono hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? 'CREATING...' : 'CREATE'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 border border-border text-muted-foreground hover:text-primary transition-colors"
              >
                CANCEL
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export const EditTeamModal = ({ show, team, onClose, onSuccess }: any) => {
  const [timeAdjustment, setTimeAdjustment] = useState(0);
  const [scoreAdjustment, setScoreAdjustment] = useState(0);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  if (!show || !team) return null;

  const handleAdjustTime = async () => {
    if (timeAdjustment === 0) return;
    setLoading(true);

    try {
      const res = await fetch(`http://localhost:3000/api/admin/teams/${team.id}/adjust-time`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ time_adjustment: timeAdjustment * 60, reason }),
      });

      if (res.ok) {
        setTimeAdjustment(0);
        setReason('');
        onSuccess();
      }
    } catch (error) {
      console.error('Failed to adjust time:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustScore = async () => {
    if (scoreAdjustment === 0) return;
    setLoading(true);

    try {
      const res = await fetch(`http://localhost:3000/api/admin/teams/${team.id}/adjust-score`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ score_adjustment: scoreAdjustment, reason }),
      });

      if (res.ok) {
        setScoreAdjustment(0);
        setReason('');
        onSuccess();
      }
    } catch (error) {
      console.error('Failed to adjust score:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-card border border-accent p-6 max-w-md w-full box-glow-green"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-accent">EDIT: {team.team_name}</h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-accent">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Time Adjustment */}
            <div className="border border-border p-4">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-mono text-primary">TIME ADJUSTMENT</h3>
              </div>
              <div className="space-y-2">
                <input
                  type="number"
                  value={timeAdjustment}
                  onChange={(e) => setTimeAdjustment(parseInt(e.target.value) || 0)}
                  className="input-cyber w-full"
                  placeholder="Minutes (+ to add, - to subtract)"
                />
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="input-cyber w-full"
                  placeholder="Reason for adjustment"
                />
                <button
                  onClick={handleAdjustTime}
                  disabled={loading || timeAdjustment === 0}
                  className="w-full py-2 bg-primary text-primary-foreground font-mono hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {timeAdjustment > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  APPLY TIME CHANGE
                </button>
              </div>
            </div>

            {/* Score Adjustment */}
            <div className="border border-border p-4">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-accent" />
                <h3 className="text-sm font-mono text-accent">SCORE ADJUSTMENT</h3>
              </div>
              <div className="space-y-2">
                <input
                  type="number"
                  value={scoreAdjustment}
                  onChange={(e) => setScoreAdjustment(parseInt(e.target.value) || 0)}
                  className="input-cyber w-full"
                  placeholder="Points (+ to add, - to subtract)"
                />
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="input-cyber w-full"
                  placeholder="Reason for adjustment"
                />
                <button
                  onClick={handleAdjustScore}
                  disabled={loading || scoreAdjustment === 0}
                  className="w-full py-2 bg-accent text-accent-foreground font-mono hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {scoreAdjustment > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  APPLY SCORE CHANGE
                </button>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2 border border-border text-muted-foreground hover:text-primary transition-colors"
            >
              CLOSE
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
