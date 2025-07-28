import { useState } from "react";
import { FaShieldAlt, FaDragon, FaMagic, FaEye, FaCrown, FaStar } from "react-icons/fa";

// Unit types with special abilities
const UNIT_TYPES = {
  WARRIOR: {
    name: "Warrior",
    icon: <FaDragon className="w-5 h-5" />,
    color: "from-red-500 to-red-700",
    borderColor: "border-red-500",
    description: "Balanced fighter with high defense",
    bonus: { attack: 0, defense: 10 }
  },
  MAGE: {
    name: "Mage",
    icon: <FaMagic className="w-5 h-5" />,
    color: "from-purple-500 to-purple-700",
    borderColor: "border-purple-500",
    description: "Powerful attacker with low defense",
    bonus: { attack: 15, defense: -5 }
  },
  TANK: {
    name: "Tank",
    icon: <FaShieldAlt className="w-5 h-5" />,
    color: "from-blue-500 to-blue-700",
    borderColor: "border-blue-500",
    description: "High defense specialist",
    bonus: { attack: -5, defense: 20 }
  },
  ASSASSIN: {
    name: "Assassin",
    icon: <FaEye className="w-5 h-5" />,
    color: "from-green-500 to-green-700",
    borderColor: "border-green-500",
    description: "Stealthy high-damage dealer",
    bonus: { attack: 20, defense: -10 }
  }
};

// Special abilities
const SPECIAL_ABILITIES = {
  CRITICAL_STRIKE: {
    name: "Critical Strike",
    icon: <FaStar className="w-4 h-4" />,
    description: "15% chance to deal double damage",
    cost: 20
  },
  SHIELD_WALL: {
    name: "Shield Wall",
    icon: <FaShieldAlt className="w-4 h-4" />,
    description: "Reduce incoming damage by 25%",
    cost: 25
  },
  MAGIC_BURST: {
    name: "Magic Burst",
    icon: <FaMagic className="w-4 h-4" />,
    description: "Deal 50% bonus damage to low-defense targets",
    cost: 30
  }
};

export function UnitForm({ onDeploy }: { onDeploy: (attack: number, defense: number, unitType: string, abilities: string[]) => void }) {
  const [attack, setAttack] = useState(50);
  const [defense, setDefense] = useState(50);
  const [selectedUnitType, setSelectedUnitType] = useState("WARRIOR");
  const [selectedAbilities, setSelectedAbilities] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const unitType = UNIT_TYPES[selectedUnitType as keyof typeof UNIT_TYPES];
  const totalAttack = attack + unitType.bonus.attack;
  const totalDefense = defense + unitType.bonus.defense;
  const remainingPoints = 100 - (totalAttack + totalDefense);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (remainingPoints < 0) {
      alert("You've exceeded the point limit! Please adjust your stats.");
      return;
    }
    setIsSubmitting(true);
    await onDeploy(totalAttack, totalDefense, selectedUnitType, selectedAbilities);
    setIsSubmitting(false);
  };

  const toggleAbility = (abilityKey: string) => {
    setSelectedAbilities(prev => 
      prev.includes(abilityKey) 
        ? prev.filter(a => a !== abilityKey)
        : [...prev, abilityKey]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Unit Type Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-yellow-300 mb-3">Choose Your Unit Type</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(UNIT_TYPES).map(([key, unit]) => (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedUnitType(key)}
              className={`p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                selectedUnitType === key
                  ? `bg-gradient-to-r ${unit.color} ${unit.borderColor} shadow-lg scale-105`
                  : "bg-gray-800/50 border-gray-600 hover:border-gray-500"
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <div className="text-2xl">{unit.icon}</div>
                <div className="text-center">
                  <div className="font-bold text-sm">{unit.name}</div>
                  <div className="text-xs text-gray-400 mt-1">{unit.description}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Stats Configuration */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-blue-300">Configure Stats</h3>
          <div className={`text-sm font-bold ${remainingPoints >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            Points Remaining: {remainingPoints}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Attack Input */}
                  <div className="space-y-3">
          <label className="block text-sm font-semibold text-blue-300 flex items-center gap-2">
            <FaDragon className="w-4 h-4" />
            Attack Power
          </label>
            <div className="relative">
              <input
                type="range"
                min="0"
                max="100"
                value={attack}
                onChange={(e) => setAttack(Number(e.target.value))}
                className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>0</span>
                <span className="text-blue-300 font-bold">{attack}</span>
                <span>100</span>
              </div>
            </div>
          </div>

          {/* Defense Input */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-green-300 flex items-center gap-2">
              <FaShieldAlt className="w-4 h-4" />
              Defense Power
            </label>
            <div className="relative">
              <input
                type="range"
                min="0"
                max="100"
                value={defense}
                onChange={(e) => setDefense(Number(e.target.value))}
                className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>0</span>
                <span className="text-green-300 font-bold">{defense}</span>
                <span>100</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Special Abilities */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-purple-300">Special Abilities</h3>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-gray-400 hover:text-gray-300 underline"
          >
            {showAdvanced ? 'Hide' : 'Show'} Advanced
          </button>
        </div>
        
        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {Object.entries(SPECIAL_ABILITIES).map(([key, ability]) => (
              <button
                key={key}
                type="button"
                onClick={() => toggleAbility(key)}
                className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                  selectedAbilities.includes(key)
                    ? "bg-gradient-to-r from-purple-500 to-purple-700 border-purple-500 shadow-lg"
                    : "bg-gray-800/50 border-gray-600 hover:border-gray-500"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {ability.icon}
                  <span className="font-semibold text-sm">{ability.name}</span>
                </div>
                <div className="text-xs text-gray-400">{ability.description}</div>
                <div className="text-xs text-yellow-400 mt-1">Cost: {ability.cost} points</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Unit Preview */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-600 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-yellow-300 flex items-center gap-2">
            <FaCrown className="w-5 h-5" />
            Unit Preview
          </h4>
          <div className={`px-3 py-1 rounded-full text-xs font-bold ${
            remainingPoints >= 0 ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
          }`}>
            {remainingPoints >= 0 ? 'Valid' : 'Invalid'}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Base Attack:</span>
              <span className="text-blue-300 font-mono">{attack}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Unit Bonus:</span>
              <span className={`font-mono ${unitType.bonus.attack >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {unitType.bonus.attack >= 0 ? '+' : ''}{unitType.bonus.attack}
              </span>
            </div>
            <div className="flex justify-between items-center border-t border-gray-600 pt-2">
              <span className="text-gray-300 font-semibold">Total Attack:</span>
              <span className="text-blue-300 font-mono font-bold">{totalAttack}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Base Defense:</span>
              <span className="text-green-300 font-mono">{defense}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Unit Bonus:</span>
              <span className={`font-mono ${unitType.bonus.defense >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {unitType.bonus.defense >= 0 ? '+' : ''}{unitType.bonus.defense}
              </span>
            </div>
            <div className="flex justify-between items-center border-t border-gray-600 pt-2">
              <span className="text-gray-300 font-semibold">Total Defense:</span>
              <span className="text-green-300 font-mono font-bold">{totalDefense}</span>
            </div>
          </div>
        </div>
        
        {selectedAbilities.length > 0 && (
          <div className="border-t border-gray-600 pt-4">
            <div className="text-sm text-gray-400 mb-2">Special Abilities:</div>
            <div className="flex flex-wrap gap-2">
              {selectedAbilities.map(abilityKey => (
                <span key={abilityKey} className="px-2 py-1 bg-purple-600 text-white text-xs rounded-full">
                  {SPECIAL_ABILITIES[abilityKey as keyof typeof SPECIAL_ABILITIES].name}
                </span>
              ))}
            </div>
          </div>
        )}
        
        <div className="mt-4 text-xs text-gray-400 bg-gray-800/50 p-3 rounded-lg">
          ⚠️ All stats and abilities will be encrypted on-chain using FHEVM technology!
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || remainingPoints < 0}
        className="w-full transition-all duration-200 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:scale-105 hover:from-blue-400 hover:to-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-400/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        {isSubmitting ? (
          <div className="flex items-center justify-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Deploying {unitType.name}...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <FaCrown className="w-5 h-5" />
            <span>Deploy {unitType.name} (Encrypted)</span>
          </div>
        )}
      </button>
    </form>
  );
} 