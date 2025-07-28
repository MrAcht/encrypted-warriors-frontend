import { FaDragon, FaShieldAlt, FaTrophy, FaClock, FaCheckCircle, FaTimes } from "react-icons/fa";

export function CombatLog({ log }: { log: string[] }) {
  if (log.length === 0) {
    return (
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-600 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <FaTrophy className="w-5 h-5 text-purple-300" />
          <h3 className="text-lg font-semibold text-purple-300">Combat Log</h3>
        </div>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaClock className="w-8 h-8 text-gray-400" />
          </div>
          <div className="text-gray-400 text-lg mb-2">No actions yet</div>
          <div className="text-gray-500 text-sm">Join the game to start logging events!</div>
        </div>
      </div>
    );
  }

  // Parse log entries to categorize them
  const categorizedLog = log.map((entry, index) => {
    const timestamp = new Date();
    timestamp.setMinutes(timestamp.getMinutes() - (log.length - index - 1) * 2); // Simulate timestamps
    
    let category = 'info';
    let icon = <FaClock className="w-4 h-4" />;
    
    if (entry.toLowerCase().includes('attack')) {
      category = 'attack';
      icon = <FaDragon className="w-4 h-4" />;
    } else if (entry.toLowerCase().includes('deploy') || entry.toLowerCase().includes('unit')) {
      category = 'deploy';
      icon = <FaShieldAlt className="w-4 h-4" />;
    } else if (entry.toLowerCase().includes('join')) {
      category = 'join';
      icon = <FaCheckCircle className="w-4 h-4" />;
    } else if (entry.toLowerCase().includes('win') || entry.toLowerCase().includes('victory')) {
      category = 'victory';
      icon = <FaTrophy className="w-4 h-4" />;
    } else if (entry.toLowerCase().includes('error') || entry.toLowerCase().includes('failed')) {
      category = 'error';
      icon = <FaTimes className="w-4 h-4" />;
    }

    return { entry, timestamp, category, icon };
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'attack': return 'border-red-500 bg-red-900/20';
      case 'deploy': return 'border-blue-500 bg-blue-900/20';
      case 'join': return 'border-green-500 bg-green-900/20';
      case 'victory': return 'border-yellow-500 bg-yellow-900/20';
      case 'error': return 'border-red-600 bg-red-900/30';
      default: return 'border-purple-500 bg-purple-900/20';
    }
  };

  const getCategoryTextColor = (category: string) => {
    switch (category) {
      case 'attack': return 'text-red-300';
      case 'deploy': return 'text-blue-300';
      case 'join': return 'text-green-300';
      case 'victory': return 'text-yellow-300';
      case 'error': return 'text-red-400';
      default: return 'text-purple-300';
    }
  };

  return (
    <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-600 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FaTrophy className="w-5 h-5 text-purple-300" />
          <h3 className="text-lg font-semibold text-purple-300">Combat Log</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-2 py-1 bg-purple-600 text-white text-xs rounded-full font-semibold">
            {log.length} Events
          </div>
        </div>
      </div>
      
      <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
        {categorizedLog.map((item, i) => (
          <div
            key={i}
            className={`flex items-start gap-3 p-3 rounded-lg border-l-4 transition-all duration-200 hover:scale-105 ${getCategoryColor(item.category)} animate-fade-in`}
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex-shrink-0 mt-1">
              <div className={`p-1 rounded-full ${getCategoryTextColor(item.category)}`}>
                {item.icon}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className={`text-sm font-medium ${getCategoryTextColor(item.category)}`}>
                {item.entry}
              </div>
              <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                <FaClock className="w-3 h-3" />
                {item.timestamp.toLocaleTimeString()}
                <span className="text-gray-600">•</span>
                <span className="capitalize">{item.category}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Log Statistics */}
      <div className="mt-4 pt-4 border-t border-gray-600">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="text-center">
            <div className="text-gray-400">Total Events</div>
            <div className="text-white font-bold">{log.length}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-400">Attacks</div>
            <div className="text-red-300 font-bold">
              {categorizedLog.filter(item => item.category === 'attack').length}
            </div>
          </div>
          <div className="text-center">
            <div className="text-gray-400">Deployments</div>
            <div className="text-blue-300 font-bold">
              {categorizedLog.filter(item => item.category === 'deploy').length}
            </div>
          </div>
          <div className="text-center">
            <div className="text-gray-400">Joins</div>
            <div className="text-green-300 font-bold">
              {categorizedLog.filter(item => item.category === 'join').length}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-4 flex gap-2">
        <button 
          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs rounded-lg transition-colors"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          Scroll to Top
        </button>
        <button 
          className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white text-xs rounded-lg transition-colors"
          onClick={() => {
            const logText = log.join('\n');
            navigator.clipboard.writeText(logText);
          }}
        >
          Copy Log
        </button>
      </div>
    </div>
  );
} 