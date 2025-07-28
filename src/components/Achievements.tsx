import { FaTrophy, FaCrown, FaStar, FaDragon, FaUsers } from "react-icons/fa";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

interface LeaderboardEntry {
  address: string;
  wins: number;
  games: number;
  rank: number;
}

export function Achievements({ 
  achievements, 
  leaderboard 
}: { 
  achievements: Achievement[];
  leaderboard: LeaderboardEntry[];
}) {
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalAchievements = achievements.length;

  return (
    <div className="space-y-6">
      {/* Achievements Section */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-600 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <FaTrophy className="w-6 h-6 text-yellow-400" />
            <h3 className="text-xl font-bold text-yellow-300">Achievements</h3>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-yellow-400">{unlockedCount}/{totalAchievements}</div>
            <div className="text-xs text-gray-400">Unlocked</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                achievement.unlocked
                  ? 'bg-gradient-to-r from-yellow-900/30 to-yellow-800/30 border-yellow-500 shadow-lg'
                  : 'bg-gray-800/50 border-gray-600 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-full ${achievement.color}`}>
                  {achievement.icon}
                </div>
                <div className="flex-1">
                  <div className={`font-semibold ${achievement.unlocked ? 'text-yellow-300' : 'text-gray-400'}`}>
                    {achievement.name}
                  </div>
                  <div className="text-xs text-gray-500">{achievement.description}</div>
                </div>
                {achievement.unlocked && (
                  <FaStar className="w-4 h-4 text-yellow-400" />
                )}
              </div>
              
              {achievement.progress !== undefined && achievement.maxProgress && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Progress</span>
                    <span>{achievement.progress}/{achievement.maxProgress}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Leaderboard Section */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-600 shadow-lg">
        <div className="flex items-center gap-2 mb-6">
          <FaCrown className="w-6 h-6 text-yellow-400" />
          <h3 className="text-xl font-bold text-yellow-300">Leaderboard</h3>
        </div>

        {leaderboard.length === 0 ? (
          <div className="text-center py-8">
            <FaUsers className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <div className="text-gray-400 text-lg mb-2">No players yet</div>
            <div className="text-gray-500 text-sm">Be the first to win a game!</div>
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((entry, index) => (
              <div
                key={entry.address}
                className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                  index === 0 ? 'bg-gradient-to-r from-yellow-900/30 to-yellow-800/30 border-yellow-500 shadow-lg' :
                  index === 1 ? 'bg-gradient-to-r from-gray-700/50 to-gray-600/50 border-gray-500 shadow-md' :
                  index === 2 ? 'bg-gradient-to-r from-orange-900/30 to-orange-800/30 border-orange-500 shadow-md' :
                  'bg-gray-800/50 border-gray-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === 0 ? 'bg-yellow-500 text-gray-900' :
                    index === 1 ? 'bg-gray-400 text-gray-900' :
                    index === 2 ? 'bg-orange-500 text-white' :
                    'bg-gray-600 text-white'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex items-center gap-2">
                    {index === 0 && <FaCrown className="w-4 h-4 text-yellow-400" />}
                    <span className="font-mono text-sm">
                      {entry.address.slice(0, 6)}...{entry.address.slice(-4)}
                    </span>
                  </div>
                </div>
                
                <div className="flex-1"></div>
                
                <div className="flex items-center gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-gray-400 text-xs">Wins</div>
                    <div className="font-bold text-green-400">{entry.wins}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-400 text-xs">Games</div>
                    <div className="font-bold text-blue-400">{entry.games}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-400 text-xs">Win Rate</div>
                    <div className="font-bold text-purple-400">
                      {entry.games > 0 ? Math.round((entry.wins / entry.games) * 100) : 0}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 