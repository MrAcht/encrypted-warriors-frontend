import { FaShieldAlt, FaTrophy, FaClock, FaUsers, FaCrown, FaExclamationTriangle, FaCheckCircle } from "react-icons/fa";

export function GameBoard({ gameState, account }: { gameState: any; account: string | null }) {
  if (!account) {
    return (
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-600 shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-gray-300 flex items-center gap-2">
          <FaCrown className="w-5 h-5" />
          Game Board
        </h2>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaUsers className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-400 text-lg">Connect your wallet to view game information</p>
        </div>
      </div>
    );
  }

  const isPlayer1 = account === gameState.player1;
  const isPlayer2 = account === gameState.player2;
  const isInGame = isPlayer1 || isPlayer2;
  const gameStatus = gameState.playersJoined === 2 ? 'Ready' : gameState.playersJoined === 1 ? 'Waiting' : 'Empty';

  // Calculate game progress percentage
  const progressPercentage = (gameState.playersJoined / 2) * 100;

  return (
    <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-600 shadow-lg">
      <h2 className="text-xl font-bold mb-6 text-yellow-300 flex items-center gap-2">
        <FaCrown className="w-5 h-5" />
        Game Board
      </h2>
      
      {/* Game Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-300">Game Progress</span>
          <span className="text-sm text-gray-400">{gameState.playersJoined}/2 Players</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>Empty</span>
          <span>Ready</span>
        </div>
      </div>

      {/* Game Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-900/50 to-blue-800/50 rounded-lg p-4 border border-blue-500/30 shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <FaTrophy className="w-5 h-5 text-blue-300" />
            <h3 className="text-lg font-semibold text-blue-300">Game Status</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Status:</span>
              <span className={`font-semibold px-2 py-1 rounded-full text-xs ${
                gameStatus === 'Ready' ? 'bg-green-600 text-white' :
                gameStatus === 'Waiting' ? 'bg-yellow-600 text-white' :
                'bg-gray-600 text-white'
              }`}>
                {gameStatus}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Your Status:</span>
              <span className={`font-semibold flex items-center gap-1 ${
                isInGame ? 'text-green-400' : 'text-yellow-400'
              }`}>
                {isInGame ? <FaCheckCircle className="w-4 h-4" /> : <FaExclamationTriangle className="w-4 h-4" />}
                {isInGame ? 'In Game' : 'Not Joined'}
              </span>
            </div>
            {gameState.lastCombatOutcome !== null && (
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Last Outcome:</span>
                <span className="text-white font-mono text-sm">
                  {gameState.lastCombatOutcome === 0 ? 'No Combat' :
                   gameState.lastCombatOutcome === 1 ? 'Attacker Wins' :
                   gameState.lastCombatOutcome === 2 ? 'Defender Wins' : 'Draw'}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-900/50 to-green-800/50 rounded-lg p-4 border border-green-500/30 shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <FaUsers className="w-5 h-5 text-green-300" />
            <h3 className="text-lg font-semibold text-green-300">Players</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Player 1:</span>
              <div className="flex items-center gap-2">
                <span className={`font-mono text-sm ${gameState.player1 ? 'text-white' : 'text-gray-500'}`}>
                  {gameState.player1 ? `${gameState.player1.slice(0, 6)}...${gameState.player1.slice(-4)}` : 'Waiting...'}
                </span>
                {gameState.player1 && (
                  <div className={`w-2 h-2 rounded-full ${isPlayer1 ? 'bg-green-400' : 'bg-blue-400'}`}></div>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Player 2:</span>
              <div className="flex items-center gap-2">
                <span className={`font-mono text-sm ${gameState.player2 ? 'text-white' : 'text-gray-500'}`}>
                  {gameState.player2 ? `${gameState.player2.slice(0, 6)}...${gameState.player2.slice(-4)}` : 'Waiting...'}
                </span>
                {gameState.player2 && (
                  <div className={`w-2 h-2 rounded-full ${isPlayer2 ? 'bg-green-400' : 'bg-blue-400'}`}></div>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Your Position:</span>
              <span className="text-white font-semibold">
                {isPlayer1 ? 'Player 1' : isPlayer2 ? 'Player 2' : 'Not Assigned'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Game Instructions with Enhanced Design */}
      <div className="bg-gradient-to-r from-purple-900/30 to-purple-800/30 border border-purple-500/30 rounded-lg p-4 shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <FaClock className="w-5 h-5 text-purple-300" />
          <h3 className="text-lg font-semibold text-purple-300">How to Play</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-yellow-500 text-gray-900 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                1
              </div>
              <div>
                <div className="font-semibold text-yellow-300">Join the Game</div>
                <div className="text-sm text-gray-300">Only 2 players allowed per game</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                2
              </div>
              <div>
                <div className="font-semibold text-blue-300">Deploy Your Unit</div>
                <div className="text-sm text-gray-300">Choose attack & defense stats (encrypted)</div>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                3
              </div>
              <div>
                <div className="font-semibold text-red-300">Attack Opponent</div>
                <div className="text-sm text-gray-300">Combat is completely confidential</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                4
              </div>
              <div>
                <div className="font-semibold text-green-300">Reveal Outcome</div>
                <div className="text-sm text-gray-300">See who wins the battle</div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-300 text-sm font-semibold">
            <FaShieldAlt className="w-4 h-4" />
            <span>Privacy First:</span>
          </div>
          <div className="text-xs text-gray-300 mt-1">
            All sensitive data is encrypted using FHEVM technology! Your stats remain private until combat resolution.
          </div>
        </div>
      </div>

      {/* Game Tips */}
      {gameState.playersJoined === 1 && !isInGame && (
        <div className="mt-4 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg animate-pulse">
          <div className="flex items-center gap-2 text-blue-300 font-semibold">
            <FaExclamationTriangle className="w-4 h-4" />
            <span>Quick Tip:</span>
          </div>
          <div className="text-sm text-gray-300 mt-1">
            A player has already joined! Join quickly to secure your spot in this game.
          </div>
        </div>
      )}

      {gameState.playersJoined === 0 && (
        <div className="mt-4 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
          <div className="flex items-center gap-2 text-green-300 font-semibold">
            <FaCheckCircle className="w-4 h-4" />
            <span>Ready to Start:</span>
          </div>
          <div className="text-sm text-gray-300 mt-1">
            Be the first to join and create a new game! Share the game code with a friend to begin.
          </div>
        </div>
      )}
    </div>
  );
} 