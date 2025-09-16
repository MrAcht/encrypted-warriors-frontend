import React, { useState, useEffect, useCallback, useRef } from "react";
import { ethers } from "ethers";
import { GameBoard } from "./components/GameBoard";
import { UnitForm } from "./components/UnitForm";
import { CombatLog } from "./components/CombatLog";
import { EnhancedLoader } from "./components/EnhancedLoader";
import { Achievements } from "./components/Achievements";
import { useContract } from "./hooks/useContract";
import { CONTRACT_ADDRESS } from "./config";
import { OnboardingModal } from "./components/OnboardingModal";
import { Stepper } from "./components/Stepper";
import { FaQuestionCircle, FaPlus, FaWallet, FaSignOutAlt, FaExchangeAlt, FaEllipsisH, FaTrophy, FaCrown, FaMagic, FaShieldAlt, FaEye, FaDragon } from "react-icons/fa";
import { QRCodeCanvas } from "qrcode.react";

const steps = [
  "Join Game",
  "Deploy Unit",
  "Attack",
  "Reveal Outcome"
];

// Define the game state type
interface GameState {
  playersJoined: number;
  player1: string | null;
  player2: string | null;
  myUnit: any | null;
  opponentUnit: any | null;
  lastCombatOutcome: number | null;
}

function App() {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [gameState, setGameState] = useState<GameState>({
    playersJoined: 0,
    player1: null,
    player2: null,
    myUnit: null,
    opponentUnit: null,
    lastCombatOutcome: null
  });
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [appKey, setAppKey] = useState(0);
  
  // Add contract address state
  const [contractAddress, setContractAddress] = useState<string>(CONTRACT_ADDRESS);
  const [showContractInput, setShowContractInput] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    // Show onboarding on first load (can be improved with localStorage)
    return true;
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);

  const [walletMenuOpen, setWalletMenuOpen] = useState(false);
  const walletMenuRef = useRef<HTMLDivElement>(null);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const [connecting, setConnecting] = useState(false);
  const [createdGameCode, setCreatedGameCode] = useState<string | null>(null);
  const [joinCode, setJoinCode] = useState<string>("");
  const joinCodeInputRef = useRef<HTMLInputElement>(null);
  const [achievements] = useState([
    {
      id: "first_win",
      name: "First Victory",
      description: "Win your first game",
      icon: <FaTrophy className="w-4 h-4" />,
      color: "text-yellow-400",
      unlocked: false
    },
    {
      id: "warrior_master",
      name: "Warrior Master",
      description: "Win 5 games as a Warrior",
      icon: <FaDragon className="w-4 h-4" />,
      color: "text-red-400",
      unlocked: false,
      progress: 2,
      maxProgress: 5
    },
    {
      id: "mage_master",
      name: "Mage Master",
      description: "Win 3 games as a Mage",
      icon: <FaMagic className="w-4 h-4" />,
      color: "text-purple-400",
      unlocked: false,
      progress: 1,
      maxProgress: 3
    },
    {
      id: "tank_master",
      name: "Tank Master",
      description: "Win 3 games as a Tank",
      icon: <FaShieldAlt className="w-4 h-4" />,
      color: "text-blue-400",
      unlocked: false,
      progress: 0,
      maxProgress: 3
    },
    {
      id: "assassin_master",
      name: "Assassin Master",
      description: "Win 3 games as an Assassin",
      icon: <FaEye className="w-4 h-4" />,
      color: "text-green-400",
      unlocked: false,
      progress: 0,
      maxProgress: 3
    },
    {
      id: "undefeated",
      name: "Undefeated",
      description: "Win 10 games in a row",
      icon: <FaCrown className="w-4 h-4" />,
      color: "text-yellow-400",
      unlocked: false,
      progress: 0,
      maxProgress: 10
    }
  ]);

  const [leaderboard] = useState([
    {
      address: "0x1234567890abcdef1234567890abcdef12345678",
      wins: 15,
      games: 20,
      rank: 1
    },
    {
      address: "0xabcdef1234567890abcdef1234567890abcdef12",
      wins: 12,
      games: 18,
      rank: 2
    },
    {
      address: "0x7890abcdef1234567890abcdef1234567890abcd",
      wins: 8,
      games: 15,
      rank: 3
    }
  ]);

  const contract = useContract(provider, contractAddress);

  const SEPOLIA_CHAIN_ID = '0xaa36a7'; // all lowercase, no leading zeros
  const [wrongNetwork, setWrongNetwork] = useState(false);

  const handleConnectWallet = useCallback(async () => {
    if (!window.ethereum) {
      setError("MetaMask is not installed. Please install MetaMask and try again.");
      return;
    }
    setConnecting(true);
    try {
      // Request accounts and set up listeners
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      
      // Set up account change listener
      window.ethereum.on('accountsChanged', async (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected wallet
          setProvider(null);
          setAccount(null);
          setGameState({
            playersJoined: 0,
            player1: null,
            player2: null,
            myUnit: null,
            opponentUnit: null,
            lastCombatOutcome: null
          });
        } else {
          // New account connected
          const newProvider = new ethers.providers.Web3Provider(window.ethereum);
          setProvider(newProvider);
          setAccount(accounts[0]);
        }
      });

      setProvider(provider);
      setAccount(address);
      setConnecting(false);
    } catch (err) {
      setError(((err as Error)?.message) || "Failed to connect to MetaMask");
      setConnecting(false);
    }
  }, []);

  const fetchGameState = useCallback(async () => {
    if (!contract || !account) return;
    
    try {
      console.log("🔍 Fetching game state for account:", account);
      
      // Check if provider and account are still valid
      if (!provider || !provider.getSigner) {
        console.log("⚠️ Provider not available, attempting to reconnect...");
        setError("Wallet connection lost. Please reconnect your wallet.");
        return;
      }
      
      // Verify account is still connected
      try {
        const signer = provider.getSigner();
        const currentAccount = await signer.getAddress();
        if (currentAccount !== account) {
          console.log("⚠️ Account changed, updating...");
          setAccount(currentAccount);
          return;
        }
      } catch (err) {
        console.log("⚠️ Cannot get signer address, wallet may be disconnected");
        setError("Wallet disconnected. Please reconnect your wallet.");
        return;
      }
      
      // Get the game code for the current player
      let playerGameCode = await contract.playerGameCode(account);
      if (playerGameCode === "0x0000000000000000000000000000000000000000000000000000000000000000") {
        const storedGameCode = localStorage.getItem("gameCode");
        if (storedGameCode) {
          playerGameCode = storedGameCode;
        }
      }
      console.log("📋 Player game code:", playerGameCode);
      
      if (playerGameCode && playerGameCode !== "0x0000000000000000000000000000000000000000000000000000000000000000") {
        // Player is in a game, get game details
        const gameInfo = await contract.getGame(playerGameCode);
        const [creator, player2] = gameInfo;
        console.log("🎮 Game info - Creator:", creator, "Player2:", player2);
        
        // Check if both players have joined
        // The creator is always set when game is created, so we only need to check if player2 is set
        const playersJoined = player2 !== "0x0000000000000000000000000000000000000000" ? 2 : 1;
        console.log("👥 Players joined:", playersJoined);
        
        // Handle lastCombatOutcome with proper null checking
        let lastCombatOutcome: number | null = null;
        try {
          const outcome = await contract.lastCombatOutcome();
          lastCombatOutcome = outcome && typeof outcome.toNumber === 'function' ? outcome.toNumber() : null;
        } catch (err) {
          console.log("lastCombatOutcome not available yet:", err);
          lastCombatOutcome = null;
        }
        
        setGameState((prev: GameState) => {
          const newState = {
            ...prev,
            playersJoined,
            player1: creator !== "0x0000000000000000000000000000000000000000" ? creator : null,
            player2: player2 !== "0x0000000000000000000000000000000000000000" ? player2 : null,
            lastCombatOutcome
          };
          
          console.log("🔄 Updating game state:", newState);
          
          // Check if second player just joined
          if (playersJoined === 2 && prev.playersJoined === 1) {
            setToast("Second player joined! Game is ready to begin!");
            setCombatLog((prevLog: string[]) => [...prevLog, "Second player joined the game!"]);
          }
          
          return newState;
        });
      } else {
        console.log("❌ Player not in any game, resetting state");
        // Player is not in any game, reset state
        setGameState({
          playersJoined: 0,
          player1: null,
          player2: null,
          myUnit: null,
          opponentUnit: null,
          lastCombatOutcome: null
        });
      }
    } catch (err: any) {
      console.error("Error fetching game state:", err);
      
      // Check if it's a wallet connection error
      if (err?.message && typeof err.message === 'string' && err.message.includes("unknown account")) {
        console.log("🔄 Wallet connection error detected, attempting to reconnect...");
        setError("Wallet connection lost. Please reconnect your wallet.");
        
        // Try to reconnect automatically
        try {
          await handleConnectWallet();
        } catch (reconnectErr) {
          console.log("Failed to auto-reconnect:", reconnectErr);
        }
      } else {
        setError("Failed to fetch game state");
      }
    }
  }, [contract, account, provider, setAccount, setGameState, setToast, setCombatLog, setError, handleConnectWallet]);

  // Detect network and handle account changes
  useEffect(() => {
    async function checkNetwork() {
      if (window.ethereum) {
        const chainId = (await window.ethereum.request({ method: 'eth_chainId' })).toLowerCase();
        setWrongNetwork(chainId !== SEPOLIA_CHAIN_ID);
        
        // Listen for network changes
        window.ethereum.on('chainChanged', (id: string) => {
          setWrongNetwork(id.toLowerCase() !== SEPOLIA_CHAIN_ID);
        });

        // Listen for account changes
        window.ethereum.on('accountsChanged', async (accounts: string[]) => {
          if (accounts.length === 0) {
            // User disconnected their wallet
            setProvider(null);
            setAccount(null);
            setGameState({
              playersJoined: 0,
              player1: null,
              player2: null,
              myUnit: null,
              opponentUnit: null,
              lastCombatOutcome: null
            });
          } else {
            // Account changed, update state and refetch game state
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            setProvider(provider);
            setAccount(accounts[0]);
            await fetchGameState();
          }
        });
      }
    }
    checkNetwork();
    return () => {
      if (window.ethereum && window.ethereum.removeListener) {
        window.ethereum.removeListener('chainChanged', () => {});
        window.ethereum.removeListener('accountsChanged', () => {});
      }
    };
  }, [fetchGameState]);

  async function switchToSepolia() {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        // Chain not added to MetaMask
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: SEPOLIA_CHAIN_ID,
            chainName: 'Sepolia',
            rpcUrls: ['https://rpc.sepolia.org'],
            nativeCurrency: { name: 'SepoliaETH', symbol: 'ETH', decimals: 18 },
            blockExplorerUrls: ['https://sepolia.etherscan.io'],
          }],
        });
      } else {
        setError('Failed to switch network: ' + (switchError.message || switchError));
      }
    }
  }

  // Close wallet menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (walletMenuRef.current && !walletMenuRef.current.contains(e.target as Node)) {
        setWalletMenuOpen(false);
      }
    }
    if (walletMenuOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [walletMenuOpen]);

  // Close more menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setMoreMenuOpen(false);
      }
    }
    if (moreMenuOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [moreMenuOpen]);

  // This effect derives the current UI step from the game state
  useEffect(() => {
    if (!account) {
      setCurrentStep(0);
      return;
    }

    // If you're not in a game yet
    if (gameState.playersJoined === 0) {
      setCurrentStep(0);
      return;
    }

    // If you're in a game with one player (waiting for second player)
    if (gameState.playersJoined === 1) {
      setCurrentStep(0);
      return;
    }

    // If two players have joined but units aren't deployed
    if (gameState.playersJoined === 2 && !gameState.myUnit?.deployed) {
      setCurrentStep(1);
      return;
    }

    // If units are deployed but no combat has occurred
    if (gameState.myUnit?.deployed && gameState.lastCombatOutcome === null) {
      setCurrentStep(2);
      return;
    }

    // If combat has occurred
    if (gameState.lastCombatOutcome !== null) {
      setCurrentStep(3);
      return;
    }
  }, [gameState.playersJoined, gameState.myUnit, gameState.lastCombatOutcome, account]);

  // Fetch game state on mount and when contract/account changes
  useEffect(() => {
    try {
      fetchGameState();
    } catch (err) {
      console.error("Error in fetchGameState effect:", err);
      setError("Failed to initialize game state");
    }
  }, [fetchGameState, contract, account]);

  // Listen for PlayerJoined event
  useEffect(() => {
    if (!contract) return;

    const handlePlayerJoined = (gameCode: string, player: string) => {
      console.log("PlayerJoined event received:", { gameCode, player });
      setToast(`A player has joined the game!`);
      fetchGameState();
    };

    contract.on("PlayerJoined", handlePlayerJoined);

    return () => {
      contract.off("PlayerJoined", handlePlayerJoined);
    };
  }, [contract, fetchGameState]);

  // Add manual refresh functionality instead of polling
  const handleManualRefresh = async () => {
    setLoading(true);
    try {
      await fetchGameState();
      setToast("Game state refreshed successfully!");
    } catch (err) {
      console.error("Error refreshing game state:", err);
      setError("Failed to refresh game state");
    } finally {
      setLoading(false);
    }
  };

  // Clear error when component unmounts or when error is handled
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Global error handler
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error("Global error caught:", event.error);
      setError("An unexpected error occurred. Please refresh the page.");
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error("Unhandled promise rejection:", event.reason);
      setError("A network or contract error occurred. Please check your connection.");
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // Toast component for transaction status
  function showTxToast(status: 'pending' | 'confirmed' | 'failed', txHash?: string, errorMsg?: string, extraMsg?: string) {
    let message = '';
    if (status === 'pending') {
      message = `⏳ <b>Transaction pending...</b> ` + (txHash ? `<a href='https://sepolia.etherscan.io/tx/${txHash}' target='_blank' rel='noopener noreferrer' class='underline text-blue-300'>View on Etherscan</a>` : '');
    } else if (status === 'confirmed') {
      message = `✅ <b>Transaction confirmed!</b> ` + (txHash ? `<a href='https://sepolia.etherscan.io/tx/${txHash}' target='_blank' rel='noopener noreferrer' class='underline text-blue-300'>View on Etherscan</a>` : '');
      if (extraMsg) message += `<br/>${extraMsg}`;
    } else if (status === 'failed') {
      message = `❌ <b>Transaction failed:</b> ${errorMsg || 'Unknown error.'}`;
    }
    setToast(message);
  }

  // Deploy unit with FHEVM encryption
  async function deployUnit(attack: number, defense: number, unitType: string, abilities: string[]) {
    if (!contract) return;
    setLoading(true);
    try {
      // TODO: Integrate FHEVM SDK for proper encryption
      // For now, we'll simulate the deployment for UI demonstration
      // In a real implementation, you'd use:
      // const encryptedAttack = await fhevm.encrypt(attack);
      // const encryptedDefense = await fhevm.encrypt(defense);
      
      console.log("Simulating unit deployment with stats:", { attack, defense, unitType, abilities });
      
      // For demo purposes, we'll create dummy encrypted values
      // In production, these would be properly encrypted using FHEVM SDK
      const dummyEncryptedAttack = "0x" + "0".repeat(64); // 32 bytes of zeros
      const dummyEncryptedDefense = "0x" + "0".repeat(64); // 32 bytes of zeros
      const dummyProof = "0x" + "0".repeat(64); // 32 bytes of zeros
      
      console.log("Using dummy encrypted values for demo:", { dummyEncryptedAttack, dummyEncryptedDefense, dummyProof });
      
      const tx = await contract.deployUnit(dummyEncryptedAttack, dummyProof, dummyEncryptedDefense, dummyProof);
      showTxToast('pending', tx.hash);
      await tx.wait();
      showTxToast('confirmed', tx.hash);
      setToast(`Unit deployed successfully! (Demo mode - FHEVM integration pending)`);
      setCombatLog((prev: string[]) => [...prev, `${unitType} deployed with Attack: ${attack}, Defense: ${defense} (Demo)`]);
      setCurrentStep(2);
      
      // Update local game state
      setGameState((prev: GameState) => ({
        ...prev,
        myUnit: { attack, defense, unitType, abilities, deployed: true }
      }));
      
    } catch (err: any) {
      showTxToast('failed', undefined, err?.message || String(err));
    }
    setLoading(false);
  }

  // Attack opponent
  async function attackOpponent() {
    if (!contract || !gameState.player1 || !gameState.player2) return;
    setLoading(true);
    try {
      const attacker = account;
      const defender = account === gameState.player1 ? gameState.player2 : gameState.player1;
      
      const tx = await contract.attack(attacker, defender);
      showTxToast('pending', tx.hash);
      await tx.wait();
      showTxToast('confirmed', tx.hash);
      setToast("Attack completed! Combat results are encrypted.");
      setCombatLog((prev: string[]) => [...prev, `You attacked ${defender.slice(0, 6)}...${defender.slice(-4)}`]);
      setCurrentStep(3);
      await fetchGameState();
    } catch (err: any) {
      showTxToast('failed', undefined, err?.message || String(err));
    }
    setLoading(false);
  }

  // Reveal combat outcome (only owner can do this)
  async function revealOutcome() {
    if (!contract) return;
    setLoading(true);
    try {
      // This would typically be done by the contract owner or a relayer
      // For demo purposes, we'll just show a placeholder
      // The contract has submitCombatOutcome(CombatOutcome) function
      // CombatOutcome enum: NO_COMBAT = 0, ATTACKER_WINS = 1, DEFENDER_WINS = 2, DRAW = 3
      const tx = await contract.submitCombatOutcome(1); // ATTACKER_WINS for demo
      showTxToast('pending', tx.hash);
      await tx.wait();
      showTxToast('confirmed', tx.hash);
      setToast("Combat outcome revealed!");
      setCombatLog((prev: string[]) => [...prev, "Combat outcome: Attacker wins!"]);
      await fetchGameState();
    } catch (err: any) {
      showTxToast('failed', undefined, err?.message || String(err));
    }
    setLoading(false);
  }

  // Deploy a new EncryptedWarriors contract
  async function createNewGame() {
    console.log("Starting createNewGame...");
    if (!contract) {
      console.error("Contract not initialized");
      showTxToast('failed', undefined, "Contract not initialized. Please check your wallet connection.");
      return;
    }
    if (!provider) {
      console.error("Provider not available");
      showTxToast('failed', undefined, "Web3 provider not available. Please check your wallet connection.");
      return;
    }
    
    setLoading(true);
    try {
      console.log("Checking network connection...");
      // Verify network connection
      try {
        await provider.getNetwork();
      } catch (networkErr) {
        console.error("Network check failed:", networkErr);
        throw new Error("Network connection failed. Please check your internet connection and wallet network.");
      }
      
      // Reset game state before creating new game
      console.log("Resetting game state...");
      setGameState({
        playersJoined: 0,
        player1: null,
        player2: null,
        myUnit: null,
        opponentUnit: null,
        lastCombatOutcome: null
      });
      setCurrentStep(0);
      
      console.log("Calling contract.createGame()...");
      const tx = await contract.createGame();
      console.log("Transaction initiated:", tx.hash);
      showTxToast('pending', tx.hash);
      
      console.log("Waiting for transaction confirmation...");
      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);
      
      // Get the code from the event
      const event = receipt.events && receipt.events.find((e: any) => e.event === 'GameCreated');
      const code = event?.args?.code;
      console.log("Game created with code:", code);
      
      localStorage.setItem("gameCode", code);
      setCreatedGameCode(code);
      showTxToast('confirmed', tx.hash, undefined, `🎉 <b>Game created!</b> <br/>Game Code: <b>${code}</b>`);
      setCombatLog((prev: string[]) => [...prev, `New game created! Game Code: ${code}`]);
      
      // Force an immediate state refresh
      console.log("Refreshing game state...");
      await fetchGameState();
    } catch (err: any) {
      console.error("Create game error:", err);
      let errorMessage = err?.message || String(err);
      if (errorMessage.includes("Failed to fetch")) {
        errorMessage = "Network connection error. Please check your internet connection and wallet network.";
      } else if (errorMessage.includes("user rejected")) {
        errorMessage = "Transaction was rejected by the user.";
      }
      showTxToast('failed', undefined, errorMessage);
    }
    setLoading(false);
  }

  // Make sure joinGameByCode does not take any parameters
  async function joinGameByCode() {
    try {
      console.log("joinGameByCode called with", joinCode, contract);
      console.log("joinCode type:", typeof joinCode, "length:", joinCode?.length);
      console.log("contract available:", !!contract);
      
      setToast("Attempting to join game...");
      if (!contract) {
        setToast("Contract not available. Please connect your wallet first.");
        return;
      }
      if (!joinCode || joinCode.trim() === '') {
        setToast("Please enter a game code.");
        return;
      }
      
      // Clean the game code - remove any whitespace and ensure it starts with 0x
      let cleanCode = joinCode.trim();
      if (!cleanCode.startsWith('0x')) {
        cleanCode = '0x' + cleanCode;
      }
      
      console.log("Cleaned game code:", cleanCode);
      
      setLoading(true);
      console.log("About to call contract.joinGame with joinCode:", cleanCode, typeof cleanCode);
      const tx = await contract.joinGame(cleanCode);
      showTxToast('pending', tx.hash);
      await tx.wait();
      localStorage.setItem("gameCode", cleanCode);
      showTxToast('confirmed', tx.hash, undefined, "Successfully joined the game!");
      setCombatLog((prev: string[]) => [...prev, `Joined game with code: ${cleanCode}`]);
      await fetchGameState();
    } catch (err) {
      // Improved error handling for 'Creator cannot join their own game'
      const message = (err as any)?.message || String(err);
      if (message.includes('Creator cannot join their own game')) {
        setToast("You cannot join your own game. Please share the code with a friend!");
      } else {
        setToast("Error: " + message);
      }
      console.error("Join game error:", err);
    }
    setLoading(false);
  }

  // Import Stepper from the new component

  // Check if current user has joined
  const hasJoined = Boolean(account && gameState.playersJoined > 0);

  // Get current action button
  function getActionButton() {
    if (!contract) {
      return (
        <button className="transition-all duration-200 bg-gray-600 text-gray-400 font-bold py-3 px-6 rounded-xl shadow-lg cursor-not-allowed" disabled>
          Connect Wallet First
        </button>
      );
    }

    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-4">
              <h3 className="text-yellow-300 font-bold mb-2">Game Status</h3>
              <div className="text-sm text-gray-300">
                <p>Players joined: {gameState.playersJoined}/2</p>
                {gameState.player1 && (
                  <p className="mt-1">Player 1: {gameState.player1.slice(0, 6)}...{gameState.player1.slice(-4)}</p>
                )}
                {gameState.player2 && (
                  <p className="mt-1">Player 2: {gameState.player2.slice(0, 6)}...{gameState.player2.slice(-4)}</p>
                )}
                {gameState.playersJoined === 0 && !hasJoined && (
                  <p className="mt-2 text-yellow-200">Be the first to join!</p>
                )}
                {gameState.playersJoined === 1 && !hasJoined && (
                  <p className="mt-2 text-blue-200">Waiting for second player to join...</p>
                )}
                {hasJoined && (
                  <p className="mt-2 text-green-200">You have joined the game! Waiting for other player...</p>
                )}
                {gameState.playersJoined >= 2 && !hasJoined && (
                  <p className="mt-2 text-red-200">Game is full! You cannot join this game.</p>
                )}
              </div>
              
              {/* Advanced section for contract address */}
              <div className="mb-4">
                <button onClick={() => setShowAdvanced(v => !v)} className="text-xs text-gray-400 underline focus:outline-none">{showAdvanced ? 'Hide' : 'Show'} Advanced</button>
                {showAdvanced && (
                  <div className="mt-2 p-2 bg-gray-800 rounded border border-gray-700">
                    <div className="text-xs text-gray-300 mb-1">Contract Address (for advanced users):</div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-blue-300 text-xs select-all">{contractAddress}</span>
                      <button onClick={() => {navigator.clipboard.writeText(contractAddress); setToast('Copied!');}} className="px-2 py-1 bg-blue-600 text-white rounded text-xs">Copy</button>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2 mt-3">
                <button
                  onClick={async () => {
                    console.log("🔄 Manual refresh triggered");
                    setAppKey(Math.random());
                  }}
                  className="flex-1 transition-all duration-200 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white py-2 px-4 rounded-lg shadow-lg font-semibold flex items-center justify-center gap-2"
                >
                  <span className="animate-spin-slow">🔄</span> Refresh Game State
                </button>
                <button
                  onClick={async () => {
                    console.log("🔌 Manual reconnect triggered");
                    try {
                      setLoading(true);
                      await handleConnectWallet();
                      setToast("✅ Wallet reconnected!");
                    } catch (err) {
                      console.error("Manual reconnect failed:", err);
                      setToast("❌ Reconnect failed. Please try again.");
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="flex-1 transition-all duration-200 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white py-2 px-4 rounded-lg shadow-lg font-semibold flex items-center justify-center gap-2"
                >
                  🔌 Reconnect Wallet
                </button>
              </div>
              
              {/* Add helper text to inform users about manual refresh */}
              <div className="mt-2 text-xs text-gray-400 text-center">
                Click "Refresh Game State" to update the game status manually
              </div>
            </div>
            {/* Replace the main Join Game button with two options if not joined and game not full */}
            {!hasJoined && gameState.playersJoined < 2 && (
              <div className="flex flex-col sm:flex-row gap-4 w-full">
                <button
                  className="flex-1 transition-all duration-200 bg-gradient-to-r from-green-400 to-green-600 text-gray-900 font-bold py-3 px-6 rounded-xl shadow-lg hover:scale-105 hover:from-green-300 hover:to-green-500 focus:outline-none focus:ring-4 focus:ring-green-400/50"
                  onClick={createNewGame}
                  disabled={loading || wrongNetwork}
                >
                  Create New Game
                </button>
                <button
                  className="flex-1 transition-all duration-200 bg-gradient-to-r from-blue-400 to-blue-600 text-gray-900 font-bold py-3 px-6 rounded-xl shadow-lg hover:scale-105 hover:from-blue-300 hover:to-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-400/50"
                  onClick={() => {
                    if (joinCodeInputRef.current) {
                      joinCodeInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      joinCodeInputRef.current.focus();
                    }
                  }}
                  disabled={loading || wrongNetwork}
                >
                  Join Game with Code
                </button>
              </div>
            )}
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4">
              <h3 className="text-blue-300 font-bold mb-2">Deploy Your Unit</h3>
              <div className="text-sm text-gray-300 mb-4">
                <p>Both players have joined! Deploy your encrypted unit.</p>
                <p className="mt-1">Your opponent: {account === gameState.player1 ? gameState.player2?.slice(0, 6) + "..." + gameState.player2?.slice(-4) : gameState.player1?.slice(0, 6) + "..." + gameState.player1?.slice(-4)}</p>
              </div>
              <UnitForm onDeploy={deployUnit} />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4">
              <h3 className="text-red-300 font-bold mb-2">Combat Phase</h3>
              <div className="text-sm text-gray-300 mb-4">
                <p>Both units deployed! Ready for confidential combat.</p>
                <p className="mt-1">Your opponent: {account === gameState.player1 ? gameState.player2?.slice(0, 6) + "..." + gameState.player2?.slice(-4) : gameState.player1?.slice(0, 6) + "..." + gameState.player1?.slice(-4)}</p>
              </div>
              <button
                className="w-full transition-all duration-200 bg-gradient-to-r from-red-500 to-red-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:scale-105 hover:from-red-400 hover:to-red-600 focus:outline-none focus:ring-4 focus:ring-red-400/50 disabled:opacity-50"
                onClick={attackOpponent}
                disabled={loading || wrongNetwork}
              >
                Attack Opponent
              </button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-4">
              <h3 className="text-green-300 font-bold mb-2">Reveal Outcome</h3>
              <div className="text-sm text-gray-300 mb-4">
                <p>Combat completed! The outcome is encrypted on-chain.</p>
                <p className="mt-1">Only the contract owner can reveal the result.</p>
              </div>
              <button
                className="w-full transition-all duration-200 bg-gradient-to-r from-green-500 to-green-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:scale-105 hover:from-green-400 hover:to-green-600 focus:outline-none focus:ring-4 focus:ring-green-400/50 disabled:opacity-50"
                onClick={revealOutcome}
                disabled={loading || wrongNetwork}
              >
                Reveal Outcome
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  }

  // Auto-dismiss toast after 4 seconds
  useEffect(() => {
    if (toast) {
      setToastVisible(true);
      const timer = setTimeout(() => {
        setToastVisible(false);
        setTimeout(() => setToast(null), 300); // allow fade-out
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  return (
    <div key={appKey} className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 text-white font-sans">
      {/* Network warning banner */}
      {wrongNetwork && (
        <div className="fixed top-0 left-0 w-full z-50 bg-red-700 text-white flex items-center justify-center gap-4 py-3 px-4 font-semibold shadow-lg animate-fade-in">
          <span>⚠️ You are connected to the wrong network. Please switch to Sepolia.</span>
          <button
            onClick={switchToSepolia}
            className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-4 py-2 rounded-lg shadow transition-colors"
          >
            Switch Network
          </button>
        </div>
      )}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800" />
      {/* Glassy, Gradient Header */}
      <header className={`sticky top-0 z-40 flex flex-col sm:flex-row items-center justify-between px-4 sm:px-8 py-4 sm:py-5 bg-gray-900/80 border-b-2 border-yellow-400/30 shadow-2xl rounded-b-3xl ${wrongNetwork ? 'mt-16' : ''}`}>
        <div className="flex items-center gap-3 sm:gap-5 mb-3 sm:mb-0">
          <img src="/logo192.png" alt="Logo" className="w-12 h-12 sm:w-14 sm:h-14 drop-shadow-lg rounded-2xl border-2 border-yellow-400/60" />
          <span className="text-2xl sm:text-3xl font-extrabold tracking-wider bg-gradient-to-r from-yellow-400 via-purple-400 to-blue-400 bg-clip-text text-transparent drop-shadow-lg">Encrypted Warriors</span>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 flex-1 justify-end w-full sm:w-auto">
          {/* How to Play always visible */}
          <button
            className="flex items-center gap-1 px-3 sm:px-4 py-2 bg-gradient-to-r from-yellow-400 via-purple-400 to-blue-400 hover:from-yellow-500 hover:to-blue-500 text-white rounded-full text-sm sm:text-base font-bold shadow-lg transition-all duration-200 focus:ring-2 focus:ring-yellow-400 [text-shadow:0_1px_2px_rgba(0,0,0,0.12)] w-full sm:w-auto"
            onClick={() => setShowOnboarding(true)}
            title="How to Play"
            disabled={wrongNetwork}
          >
            <FaQuestionCircle className="w-5 h-5" /> How to Play
          </button>
          
          {/* Achievements Button */}
          <button
            className="flex items-center gap-1 px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-400 to-purple-600 hover:from-purple-500 hover:to-purple-700 text-white rounded-full text-sm sm:text-base font-bold shadow-lg transition-all duration-200 focus:ring-2 focus:ring-purple-400 [text-shadow:0_1px_2px_rgba(0,0,0,0.12)] w-full sm:w-auto"
            onClick={() => setShowAchievements(!showAchievements)}
            title="Achievements & Leaderboard"
            disabled={wrongNetwork}
          >
            <FaTrophy className="w-5 h-5" /> Achievements
          </button>
          {/* More dropdown for secondary actions */}
          <div className="relative w-full sm:w-auto" ref={moreMenuRef}>
            <button
              onClick={() => setMoreMenuOpen((v) => !v)}
              className="flex items-center gap-1 px-3 sm:px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-gray-900 text-gray-100 rounded-full shadow-lg font-bold text-base transition-all duration-200 focus:ring-2 focus:ring-gray-400 w-full sm:w-auto"
              title="More"
              aria-haspopup="true"
              aria-expanded={moreMenuOpen}
            >
              <FaEllipsisH className="w-5 h-5" />
            </button>
            {moreMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 max-w-xs bg-gray-800 rounded-xl shadow-2xl border border-gray-700 z-50 p-0">
                <button
                  onClick={() => {
                    createNewGame();
                    setMoreMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-3 text-gray-100 hover:bg-gray-700 transition-colors rounded-t-xl font-semibold text-base"
                  disabled={wrongNetwork}
                >
                  <FaPlus className="w-5 h-5 text-gray-100" /> New Game
                </button>
                <button
                  onClick={() => setShowContractInput((v) => !v)}
                  className="w-full flex items-center gap-2 px-4 py-3 text-gray-100 hover:bg-gray-700 transition-colors font-semibold text-base"
                  disabled={wrongNetwork}
                >
                  <FaExchangeAlt className="w-5 h-5 text-gray-100" /> {showContractInput ? "Hide" : "Change"} Contract
                </button>
                {showContractInput && (
                  <div className="px-4 py-4">
                    <label className="block text-xs text-gray-400 mb-1">Contract Address</label>
                    <input
                      type="text"
                      value={contractAddress}
                      onChange={(e) => setContractAddress(e.target.value)}
                      placeholder="Enter contract address"
                      className="w-full bg-gray-800 text-gray-100 px-3 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 mb-2"
                    />
                    <button
                      onClick={() => {
                        setShowContractInput(false);
                        setToast("Contract address updated!");
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors shadow font-semibold"
                    >
                      Connect
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          {/* Right-aligned wallet pill menu */}

          <div className="relative w-full sm:w-auto ml-0 sm:ml-2" ref={walletMenuRef}>
            {!account ? (
              <button
                onClick={handleConnectWallet}
                className="flex items-center gap-2 px-3 sm:px-6 py-2 bg-gradient-to-r from-green-400 to-blue-500 text-gray-900 rounded-full shadow-lg font-bold text-base transition-all duration-200 focus:ring-2 focus:ring-green-400 [text-shadow:0_1px_2px_rgba(0,0,0,0.12)] disabled:opacity-60 w-full sm:w-auto"
                title="Connect Wallet"
                disabled={connecting || wrongNetwork}
              >
                <FaWallet className="w-5 h-5" />
                {connecting ? "Connecting..." : <span className="hidden xs:inline">Connect Wallet</span>}
              </button>
            ) : (
              <>
                <button
                  onClick={() => setWalletMenuOpen((v) => !v)}
                  className="flex items-center gap-2 px-3 sm:px-6 py-2 bg-gradient-to-r from-green-400 to-blue-500 text-gray-900 rounded-full shadow-lg font-bold text-base transition-all duration-200 focus:ring-2 focus:ring-green-400 [text-shadow:0_1px_2px_rgba(0,0,0,0.12)] w-full sm:w-auto"
                  title="Wallet Menu"
                  aria-haspopup="true"
                  aria-expanded={walletMenuOpen}
                >
                  <FaWallet className="w-5 h-5" /> {account.slice(0, 6)}...{account.slice(-3)} <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </button>
                {walletMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 max-w-xs bg-gray-800 rounded-xl shadow-2xl border border-gray-700 z-50">
                    <button
                      onClick={() => {
                        setProvider(null);
                        setAccount(null);
                        setGameState({
                          playersJoined: 0,
                          player1: null,
                          player2: null,
                          myUnit: null,
                          opponentUnit: null,
                          lastCombatOutcome: null
                        });
                        setCombatLog([]);
                        setToast("Wallet disconnected!");
                        setWalletMenuOpen(false);
                        window.location.reload();
                      }}
                      className="w-full flex items-center gap-2 px-4 py-3 text-gray-100 hover:bg-gray-700 transition-colors rounded-t-xl font-semibold text-base"
                    >
                      <FaSignOutAlt className="w-5 h-5 text-red-500" /> Disconnect
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(account);
                        setToast("Address copied!");
                        setWalletMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-3 text-gray-100 hover:bg-gray-700 transition-colors rounded-b-xl font-semibold text-base"
                    >
                      <FaWallet className="w-5 h-5 text-blue-400" /> Copy Address
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </header>
      {/* Main Content Card */}
      <main className="max-w-3xl mx-auto mt-12 p-10 bg-gray-900/90 rounded-3xl shadow-2xl border border-yellow-400/30 relative">
        {/* Game Progress Stepper */}
        <Stepper steps={steps} currentStep={currentStep} />
        {/* Game Flow Banners */}
        <div className="mb-6">
          {currentStep === 0 && (
            <div className="bg-yellow-900/60 border-l-4 border-yellow-400 p-4 rounded shadow flex items-center gap-3 animate-fade-in">
              <svg className="w-6 h-6 text-yellow-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-9.193 9.193a2.121 2.121 0 102.999 2.999l9.193-9.193m-2.999-2.999l2.999 2.999m-2.999-2.999l-2.999-2.999m2.999 2.999l2.999-2.999" />
              </svg>
              <span className="text-yellow-200 font-semibold text-lg">Step 1: Join the game to begin your confidential battle!</span>
            </div>
          )}
          {currentStep === 1 && (
            <div className="bg-blue-900/60 border-l-4 border-blue-400 p-4 rounded shadow flex items-center gap-3 animate-fade-in">
              <svg className="w-6 h-6 text-blue-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span className="text-blue-200 font-semibold">Step 2: Deploy your encrypted unit (attack & defense stats are private!)</span>
            </div>
          )}
          {currentStep === 2 && (
            <div className="bg-red-900/60 border-l-4 border-red-400 p-4 rounded shadow flex items-center gap-3 animate-fade-in">
              <svg className="w-6 h-6 text-red-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.121 14.121l4.95 4.95m0 0a2.121 2.121 0 002.999-2.999l-4.95-4.95m-2.121 2.121l-4.95-4.95m0 0a2.121 2.121 0 00-2.999 2.999l4.95 4.95" />
              </svg>
              <span className="text-red-200 font-semibold">Step 3: Attack your opponent! All combat is confidential.</span>
            </div>
          )}
          {currentStep === 3 && (
            <div className="bg-green-900/60 border-l-4 border-green-400 p-4 rounded shadow flex items-center gap-3 animate-fade-in">
              <svg className="w-6 h-6 text-green-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 21h8m-4-4v4m0-4a7 7 0 007-7V5a2 2 0 00-2-2H7a2 2 0 00-2 2v5a7 7 0 007 7z" />
              </svg>
              <span className="text-green-200 font-semibold">Step 4: Reveal the outcome and see who wins!</span>
            </div>
          )}
        </div>

        {/* Main Game Actions */}
        <div className="flex flex-col gap-6">
          {getActionButton()}
          {/* Game Code Box with QR and Copied feedback */}
          {createdGameCode && (
            <div className="my-4 p-4 bg-blue-900/80 rounded-xl text-center shadow-lg border border-blue-400 relative">
              <div className="font-bold text-lg text-blue-200 mb-2 flex items-center justify-center gap-2">
                <span>Share this Game Code:</span>
                <QRCodeCanvas value={createdGameCode} size={48} bgColor="#1e293b" fgColor="#facc15" />
              </div>
              <div className="text-yellow-300 text-base font-mono break-all select-all bg-gray-800 rounded px-2 py-1 inline-block mb-2">
                {createdGameCode}
              </div>
              <button
                onClick={() => {navigator.clipboard.writeText(createdGameCode); setCopied(true); setToast('Copied!'); setTimeout(() => setCopied(false), 1500);}}
                className="mt-2 px-4 py-2 bg-yellow-400 text-gray-900 rounded-lg font-semibold hover:bg-yellow-300 transition"
              >
                {copied ? 'Copied!' : 'Copy Code'}
              </button>
            </div>
          )}
          {/* Join Game by Code input above main action */}
          <div className="my-4">
            <label htmlFor="join-code" className="block text-sm text-gray-200 mb-1">Have a code? Join a friend’s game:</label>
            <input
              id="join-code"
              type="text"
              value={joinCode}
              ref={joinCodeInputRef}
              onChange={e => {
                console.log("Input changed to", e.target.value, typeof e.target.value);
                setJoinCode(e.target.value);
              }}
              placeholder="Enter Game Code"
              className="px-4 py-2 rounded border border-gray-600 bg-gray-800 text-white w-64"
              maxLength={66}
              pattern="^0x[0-9a-fA-F]{64}$"
              aria-label="Game Code"
            />
            <button onClick={joinGameByCode} className="ml-2 px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50" disabled={!joinCode || joinCode.trim() === ''}>
              Join Game
            </button>
          </div>
          <GameBoard gameState={gameState} account={account} />
          <CombatLog log={combatLog} />
          
          {/* Achievements and Leaderboard */}
          {showAchievements && (
            <Achievements achievements={achievements} leaderboard={leaderboard} />
          )}
        </div>

        {loading && (
          <EnhancedLoader 
            message="Processing transaction..." 
            type="default"
          />
        )}
        {/* Toast for transaction status */}
        {toast && toastVisible && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-gray-900 text-white px-6 py-3 rounded-xl shadow-lg border border-yellow-400/40 text-center text-base animate-fade-in flex items-center gap-4" style={{ minWidth: 300, maxWidth: 500 }}>
            <span dangerouslySetInnerHTML={{ __html: toast }} />
            <button onClick={() => setToastVisible(false)} className="ml-2 text-xl font-bold text-yellow-400 hover:text-yellow-200 focus:outline-none" aria-label="Close">×</button>
          </div>
        )}
      </main>
      <footer className="text-center text-gray-400 mt-10 pb-4">
        &copy; 2024 Encrypted Warriors. Powered by FHEVM.
      </footer>
      <OnboardingModal open={showOnboarding} onClose={() => setShowOnboarding(false)} />
    </div>
  );
}

export default App;