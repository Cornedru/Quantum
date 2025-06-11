import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BarChart2, TrendingUp, Zap, AlertCircle, Play, Settings } from 'lucide-react';

const QuantumPortfolioOptimizer = () => {
  // États pour les actifs et paramètres
  const [assets, setAssets] = useState([
    { name: 'Tech Stock', return: 0.12, risk: 0.25, selected: false },
    { name: 'Healthcare', return: 0.08, risk: 0.15, selected: false },
    { name: 'Energy', return: 0.15, risk: 0.30, selected: false },
    { name: 'Finance', return: 0.10, risk: 0.20, selected: false },
    { name: 'Real Estate', return: 0.06, risk: 0.12, selected: false }
  ]);
  
  const [riskAversion, setRiskAversion] = useState(0.5);
  const [quantumDepth, setQuantumDepth] = useState(3);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [results, setResults] = useState(null);
  const [energyLandscape, setEnergyLandscape] = useState([]);
  const [convergenceHistory, setConvergenceHistory] = useState([]);

  // Matrice de corrélation simplifiée
  const correlationMatrix = [
    [1.0, 0.3, -0.2, 0.4, 0.1],
    [0.3, 1.0, 0.1, 0.2, 0.3],
    [-0.2, 0.1, 1.0, -0.3, 0.2],
    [0.4, 0.2, -0.3, 1.0, 0.5],
    [0.1, 0.3, 0.2, 0.5, 1.0]
  ];

  // Fonction pour calculer l'énergie QUBO
  const calculateQUBOEnergy = (selection) => {
    let energy = 0;
    const n = assets.length;
    
    // Terme de rendement (négatif car on maximise)
    for (let i = 0; i < n; i++) {
      if (selection[i]) {
        energy -= assets[i].return;
      }
    }
    
    // Terme de risque
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (selection[i] && selection[j]) {
          const risk = Math.sqrt(assets[i].risk * assets[j].risk) * correlationMatrix[i][j];
          energy += riskAversion * risk;
        }
      }
    }
    
    // Contrainte de budget (pénalité si pas exactement 3 actifs)
    const numSelected = selection.reduce((sum, val) => sum + (val ? 1 : 0), 0);
    const budgetPenalty = Math.pow(numSelected - 3, 2) * 10;
    energy += budgetPenalty;
    
    return energy;
  };

  // Simulation d'évolution quantique (QAOA simplifié)
  const quantumEvolution = useCallback(async () => {
    setIsOptimizing(true);
    const history = [];
    const landscape = [];
    
    // État initial : superposition uniforme
    const n = assets.length;
    const numStates = Math.pow(2, n);
    let amplitudes = new Array(numStates).fill(1 / Math.sqrt(numStates));
    
    // Évolution par couches QAOA
    for (let layer = 0; layer < quantumDepth; layer++) {
      // Phase d'évolution
      const beta = (layer + 1) / quantumDepth * Math.PI / 4;
      const gamma = (layer + 1) / quantumDepth * Math.PI / 2;
      
      // Opérateur de coût (phase shift basé sur l'énergie)
      const newAmplitudes = [...amplitudes];
      for (let state = 0; state < numStates; state++) {
        const selection = state.toString(2).padStart(n, '0').split('').map(bit => bit === '1');
        const energy = calculateQUBOEnergy(selection);
        // Pour un nombre complexe e^(-i*gamma*energy), la partie réelle est cos(gamma*energy)
        const phaseReal = Math.cos(gamma * energy);
        newAmplitudes[state] = amplitudes[state] * phaseReal;
      }
      
      // Opérateur de mélange (rotation X sur chaque qubit)
      for (let qubit = 0; qubit < n; qubit++) {
        const tempAmplitudes = [...newAmplitudes];
        for (let state = 0; state < numStates; state++) {
          const flippedState = state ^ (1 << qubit);
          const cos = Math.cos(beta);
          const sin = Math.sin(beta);
          // Rotation X sans partie imaginaire pour simplification
          newAmplitudes[state] = cos * tempAmplitudes[state] - sin * tempAmplitudes[flippedState];
        }
      }
      
      amplitudes = newAmplitudes;
      
      // Calcul de l'énergie moyenne
      let avgEnergy = 0;
      let probabilities = amplitudes.map(a => Math.pow(Math.abs(a), 2));
      for (let state = 0; state < numStates; state++) {
        const selection = state.toString(2).padStart(n, '0').split('').map(bit => bit === '1');
        avgEnergy += probabilities[state] * calculateQUBOEnergy(selection);
      }
      
      history.push({ iteration: layer + 1, energy: avgEnergy });
      
      // Pause pour l'animation
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    // Mesure finale et extraction du meilleur état
    const probabilities = amplitudes.map(a => Math.pow(Math.abs(a), 2));
    let bestState = 0;
    let bestEnergy = Infinity;
    
    for (let state = 0; state < numStates; state++) {
      const selection = state.toString(2).padStart(n, '0').split('').map(bit => bit === '1');
      const energy = calculateQUBOEnergy(selection);
      
      // Ajouter au paysage énergétique (échantillonnage)
      if (Math.random() < 0.1 || energy < bestEnergy) {
        const numSelected = selection.reduce((sum, val) => sum + (val ? 1 : 0), 0);
        landscape.push({
          state: state,
          energy: energy,
          probability: probabilities[state] * 100,
          numAssets: numSelected
        });
      }
      
      if (energy < bestEnergy && selection.reduce((sum, val) => sum + (val ? 1 : 0), 0) === 3) {
        bestEnergy = energy;
        bestState = state;
      }
    }
    
    // Définir la solution optimale
    const optimalSelection = bestState.toString(2).padStart(n, '0').split('').map(bit => bit === '1');
    const selectedAssets = assets.filter((_, i) => optimalSelection[i]);
    
    // Calculer les métriques du portefeuille
    let portfolioReturn = 0;
    let portfolioRisk = 0;
    
    selectedAssets.forEach((asset, i) => {
      portfolioReturn += asset.return / 3; // Poids égaux
    });
    
    // Calcul du risque du portefeuille
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (optimalSelection[i] && optimalSelection[j]) {
          portfolioRisk += (1/9) * Math.sqrt(assets[i].risk * assets[j].risk) * correlationMatrix[i][j];
        }
      }
    }
    portfolioRisk = Math.sqrt(portfolioRisk);
    
    setResults({
      selectedAssets,
      portfolioReturn,
      portfolioRisk,
      sharpeRatio: portfolioReturn / portfolioRisk,
      energy: bestEnergy
    });
    
    setConvergenceHistory(history);
    setEnergyLandscape(landscape.sort((a, b) => a.energy - b.energy).slice(0, 20));
    setIsOptimizing(false);
  }, [assets, riskAversion, quantumDepth]);

  // Mise à jour de la sélection manuelle
  const toggleAsset = (index) => {
    const newAssets = [...assets];
    newAssets[index].selected = !newAssets[index].selected;
    setAssets(newAssets);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-8 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Zap className="w-10 h-10" />
          Optimisation de Portefeuille Quantique
        </h1>
        <p className="text-lg opacity-90">
          Explorez comment les algorithmes quantiques peuvent optimiser la sélection d'actifs
        </p>
      </div>

      {/* Paramètres */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Paramètres d'Optimisation
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Aversion au Risque: {riskAversion.toFixed(2)}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={riskAversion}
              onChange={(e) => setRiskAversion(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Agressif</span>
              <span>Conservateur</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Profondeur Quantique: {quantumDepth}
            </label>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={quantumDepth}
              onChange={(e) => setQuantumDepth(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Rapide</span>
              <span>Précis</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sélection d'actifs */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <BarChart2 className="w-5 h-5" />
          Univers d'Investissement
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assets.map((asset, index) => (
            <div
              key={index}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                asset.selected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => toggleAsset(index)}
            >
              <h3 className="font-semibold">{asset.name}</h3>
              <div className="mt-2 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Rendement:</span>
                  <span className="text-green-600 font-medium">{(asset.return * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Risque:</span>
                  <span className="text-red-600 font-medium">{(asset.risk * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-4 bg-yellow-50 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-yellow-800">
            L'algorithme quantique sélectionnera automatiquement 3 actifs optimaux selon vos paramètres de risque.
          </p>
        </div>
      </div>

      {/* Bouton d'optimisation */}
      <div className="flex justify-center">
        <button
          onClick={quantumEvolution}
          disabled={isOptimizing}
          className={`px-8 py-4 rounded-lg font-semibold text-white transition-all transform hover:scale-105 ${
            isOptimizing 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
          }`}
        >
          {isOptimizing ? (
            <span className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Optimisation Quantique en Cours...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Play className="w-5 h-5" />
              Lancer l'Optimisation Quantique
            </span>
          )}
        </button>
      </div>

      {/* Visualisations */}
      {(convergenceHistory.length > 0 || energyLandscape.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Convergence */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Convergence de l'Algorithme</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={convergenceHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="iteration" label={{ value: 'Itération', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'Énergie', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="energy" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  dot={{ fill: '#8b5cf6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Paysage énergétique */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Paysage Énergétique Quantique</h3>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="state" label={{ value: 'État Quantique', position: 'insideBottom', offset: -5 }} />
                <YAxis dataKey="energy" label={{ value: 'Énergie', angle: -90, position: 'insideLeft' }} />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-2 border rounded shadow">
                          <p className="text-sm">État: {payload[0].payload.state}</p>
                          <p className="text-sm">Énergie: {payload[0].value.toFixed(3)}</p>
                          <p className="text-sm">Probabilité: {payload[0].payload.probability.toFixed(2)}%</p>
                          <p className="text-sm">Actifs: {payload[0].payload.numAssets}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter 
                  data={energyLandscape} 
                  fill="#3b82f6"
                  fillOpacity={0.6}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Résultats */}
      {results && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Portefeuille Optimal
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Actifs Sélectionnés:</h3>
              <ul className="space-y-2">
                {results.selectedAssets.map((asset, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>{asset.name}</span>
                    <span className="text-sm text-gray-600">
                      (R: {(asset.return * 100).toFixed(1)}%, σ: {(asset.risk * 100).toFixed(1)}%)
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Métriques du Portefeuille:</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Rendement Attendu:</span>
                  <span className="font-semibold text-green-600">
                    {(results.portfolioReturn * 100).toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Risque (Volatilité):</span>
                  <span className="font-semibold text-red-600">
                    {(results.portfolioRisk * 100).toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Ratio de Sharpe:</span>
                  <span className="font-semibold text-blue-600">
                    {results.sharpeRatio.toFixed(3)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Énergie QUBO:</span>
                  <span className="font-semibold text-purple-600">
                    {results.energy.toFixed(3)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Explication */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="font-semibold mb-3">Comment fonctionne l'optimisation quantique ?</h3>
        <div className="space-y-3 text-sm text-gray-700">
          <p>
            <strong>1. Formulation QUBO:</strong> Le problème est transformé en minimisation d'énergie où 
            chaque configuration possible du portefeuille a une énergie associée combinant rendement, 
            risque et contraintes.
          </p>
          <p>
            <strong>2. Évolution Quantique:</strong> L'algorithme QAOA fait évoluer un état quantique en 
            superposition à travers des couches d'opérateurs qui explorent l'espace des solutions.
          </p>
          <p>
            <strong>3. Interférence Quantique:</strong> Les bonnes solutions sont amplifiées par interférence 
            constructive tandis que les mauvaises sont supprimées par interférence destructive.
          </p>
          <p>
            <strong>4. Mesure:</strong> La mesure finale collapse l'état quantique sur une solution optimale 
            avec haute probabilité.
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuantumPortfolioOptimizer;
