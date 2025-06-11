"""
Optimiseur de Portefeuille Quantique
Implémentation Python pour PyCharm
"""

import numpy as np
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation
import pandas as pd
from typing import List, Tuple, Dict
import itertools
from dataclasses import dataclass
import seaborn as sns

@dataclass
class Asset:
    """Classe pour représenter un actif financier"""
    name: str
    expected_return: float
    risk: float

class QuantumPortfolioOptimizer:
    """
    Optimiseur de portefeuille utilisant des principes d'informatique quantique
    Implémente une version simplifiée de QAOA (Quantum Approximate Optimization Algorithm)
    """
    
    def __init__(self, assets: List[Asset], risk_aversion: float = 0.5):
        self.assets = assets
        self.n_assets = len(assets)
        self.risk_aversion = risk_aversion
        
        # Matrice de corrélation (exemple simplifié)
        self.correlation_matrix = self._generate_correlation_matrix()
        
        # Historique pour visualisation
        self.convergence_history = []
        self.energy_landscape = []
        
    def _generate_correlation_matrix(self) -> np.ndarray:
        """Génère une matrice de corrélation réaliste entre actifs"""
        n = self.n_assets
        corr = np.eye(n)
        
        # Corrélations exemple
        correlations = {
            (0, 1): 0.3,   # Tech-Healthcare
            (0, 2): -0.2,  # Tech-Energy
            (0, 3): 0.4,   # Tech-Finance
            (0, 4): 0.1,   # Tech-RealEstate
            (1, 2): 0.1,   # Healthcare-Energy
            (1, 3): 0.2,   # Healthcare-Finance
            (1, 4): 0.3,   # Healthcare-RealEstate
            (2, 3): -0.3,  # Energy-Finance
            (2, 4): 0.2,   # Energy-RealEstate
            (3, 4): 0.5    # Finance-RealEstate
        }
        
        for (i, j), value in correlations.items():
            corr[i, j] = corr[j, i] = value
            
        return corr
    
    def calculate_portfolio_metrics(self, weights: np.ndarray) -> Dict[str, float]:
        """Calcule les métriques du portefeuille"""
        # Rendement du portefeuille
        returns = np.array([asset.expected_return for asset in self.assets])
        portfolio_return = np.dot(weights, returns)
        
        # Risque du portefeuille
        risks = np.array([asset.risk for asset in self.assets])
        portfolio_variance = 0
        for i in range(self.n_assets):
            for j in range(self.n_assets):
                portfolio_variance += weights[i] * weights[j] * risks[i] * risks[j] * self.correlation_matrix[i, j]
        
        portfolio_risk = np.sqrt(portfolio_variance)
        
        # Ratio de Sharpe (sans taux sans risque pour simplifier)
        sharpe_ratio = portfolio_return / portfolio_risk if portfolio_risk > 0 else 0
        
        return {
            'return': portfolio_return,
            'risk': portfolio_risk,
            'sharpe_ratio': sharpe_ratio
        }
    
    def qubo_energy(self, selection: np.ndarray) -> float:
        """
        Calcule l'énergie QUBO pour une sélection d'actifs
        selection: vecteur binaire indiquant quels actifs sont sélectionnés
        """
        energy = 0
        
        # Terme de rendement (négatif car on veut maximiser)
        for i in range(self.n_assets):
            if selection[i]:
                energy -= self.assets[i].expected_return
        
        # Terme de risque
        for i in range(self.n_assets):
            for j in range(self.n_assets):
                if selection[i] and selection[j]:
                    risk_ij = np.sqrt(self.assets[i].risk * self.assets[j].risk) * self.correlation_matrix[i, j]
                    energy += self.risk_aversion * risk_ij
        
        # Contrainte: exactement 3 actifs doivent être sélectionnés
        num_selected = np.sum(selection)
        budget_penalty = 10 * (num_selected - 3) ** 2
        energy += budget_penalty
        
        return energy
    
    def quantum_evolution_qaoa(self, n_layers: int = 3, visualize: bool = True) -> Tuple[np.ndarray, Dict]:
        """
        Simule l'évolution quantique avec QAOA
        """
        print("🚀 Démarrage de l'optimisation quantique...")
        
        # Initialisation: superposition uniforme
        n_states = 2 ** self.n_assets
        amplitudes = np.ones(n_states) / np.sqrt(n_states)
        
        # Paramètres QAOA
        betas = np.linspace(0, np.pi/4, n_layers)
        gammas = np.linspace(0, np.pi/2, n_layers)
        
        self.convergence_history = []
        
        # Evolution par couches
        for layer in range(n_layers):
            print(f"\n📊 Couche {layer + 1}/{n_layers}")
            
            # Opérateur de coût (phase shift)
            new_amplitudes = amplitudes.copy()
            for state in range(n_states):
                binary_state = [(state >> i) & 1 for i in range(self.n_assets)]
                energy = self.qubo_energy(binary_state)
                phase = np.exp(-1j * gammas[layer] * energy)
                new_amplitudes[state] *= phase
            
            # Opérateur de mélange (rotation X sur chaque qubit)
            for qubit in range(self.n_assets):
                temp_amplitudes = new_amplitudes.copy()
                for state in range(n_states):
                    flipped_state = state ^ (1 << qubit)
                    cos_beta = np.cos(betas[layer])
                    sin_beta = np.sin(betas[layer])
                    new_amplitudes[state] = cos_beta * temp_amplitudes[state] - 1j * sin_beta * temp_amplitudes[flipped_state]
            
            amplitudes = new_amplitudes
            
            # Calcul de l'énergie moyenne
            probabilities = np.abs(amplitudes) ** 2
            avg_energy = 0
            for state in range(n_states):
                binary_state = [(state >> i) & 1 for i in range(self.n_assets)]
                avg_energy += probabilities[state] * self.qubo_energy(binary_state)
            
            self.convergence_history.append(avg_energy)
            print(f"   Énergie moyenne: {avg_energy:.4f}")
        
        # Mesure et extraction du meilleur état
        probabilities = np.abs(amplitudes) ** 2
        best_energy = float('inf')
        best_state = None
        
        # Collecte du paysage énergétique
        self.energy_landscape = []
        for state in range(n_states):
            binary_state = np.array([(state >> i) & 1 for i in range(self.n_assets)])
            if np.sum(binary_state) == 3:  # Seulement les états avec 3 actifs
                energy = self.qubo_energy(binary_state)
                self.energy_landscape.append((state, energy, probabilities[state]))
                
                if energy < best_energy:
                    best_energy = energy
                    best_state = binary_state
        
        print(f"\n✅ Optimisation terminée!")
        print(f"   Énergie finale: {best_energy:.4f}")
        
        # Calcul des métriques du portefeuille optimal
        weights = best_state / np.sum(best_state) if np.sum(best_state) > 0 else np.zeros(self.n_assets)
        metrics = self.calculate_portfolio_metrics(weights)
        
        # Actifs sélectionnés
        selected_assets = [self.assets[i] for i in range(self.n_assets) if best_state[i]]
        
        results = {
            'selection': best_state,
            'selected_assets': selected_assets,
            'weights': weights,
            'metrics': metrics,
            'energy': best_energy
        }
        
        if visualize:
            self.visualize_results(results)
        
        return best_state, results
    
    def visualize_results(self, results: Dict):
        """Crée des visualisations des résultats"""
        fig = plt.figure(figsize=(15, 10))
        
        # 1. Convergence de l'algorithme
        ax1 = plt.subplot(2, 3, 1)
        iterations = range(1, len(self.convergence_history) + 1)
        ax1.plot(iterations, self.convergence_history, 'b-o', linewidth=2, markersize=8)
        ax1.set_xlabel('Itération QAOA')
        ax1.set_ylabel('Énergie Moyenne')
        ax1.set_title('Convergence de l\'Algorithme Quantique')
        ax1.grid(True, alpha=0.3)
        
        # 2. Paysage énergétique
        ax2 = plt.subplot(2, 3, 2)
        if self.energy_landscape:
            states, energies, probs = zip(*self.energy_landscape)
            scatter = ax2.scatter(states, energies, c=probs, cmap='viridis', s=100, alpha=0.6)
            plt.colorbar(scatter, ax=ax2, label='Probabilité')
            ax2.set_xlabel('État Quantique')
            ax2.set_ylabel('Énergie QUBO')
            ax2.set_title('Paysage Énergétique')
            ax2.grid(True, alpha=0.3)
        
        # 3. Portefeuille sélectionné
        ax3 = plt.subplot(2, 3, 3)
        selected_names = [asset.name for asset in results['selected_assets']]
        selected_weights = results['weights'][results['selection'] == 1]
        colors = plt.cm.Set3(range(len(selected_names)))
        ax3.pie(selected_weights, labels=selected_names, autopct='%1.1f%%', colors=colors)
        ax3.set_title('Composition du Portefeuille Optimal')
        
        # 4. Comparaison rendement/risque
        ax4 = plt.subplot(2, 3, 4)
        all_returns = [asset.expected_return for asset in self.assets]
        all_risks = [asset.risk for asset in self.assets]
        
        # Tous les actifs
        ax4.scatter(all_risks, all_returns, s=100, alpha=0.5, label='Tous les actifs')
        
        # Actifs sélectionnés
        selected_returns = [asset.expected_return for asset in results['selected_assets']]
        selected_risks = [asset.risk for asset in results['selected_assets']]
        ax4.scatter(selected_risks, selected_returns, s=200, color='red', marker='*', label='Sélectionnés')
        
        # Portefeuille optimal
        portfolio_risk = results['metrics']['risk']
        portfolio_return = results['metrics']['return']
        ax4.scatter(portfolio_risk, portfolio_return, s=300, color='green', marker='D', label='Portefeuille')
        
        ax4.set_xlabel('Risque (σ)')
        ax4.set_ylabel('Rendement Attendu')
        ax4.set_title('Frontière Efficiente')
        ax4.legend()
        ax4.grid(True, alpha=0.3)
        
        # 5. Métriques du portefeuille
        ax5 = plt.subplot(2, 3, 5)
        metrics_text = f"""
        Rendement: {results['metrics']['return']*100:.2f}%
        Risque: {results['metrics']['risk']*100:.2f}%
        Ratio de Sharpe: {results['metrics']['sharpe_ratio']:.3f}
        Énergie QUBO: {results['energy']:.3f}
        
        Aversion au risque: {self.risk_aversion:.2f}
        """
        ax5.text(0.1, 0.5, metrics_text, transform=ax5.transAxes, fontsize=12,
                verticalalignment='center', bbox=dict(boxstyle='round', facecolor='lightblue', alpha=0.5))
        ax5.axis('off')
        ax5.set_title('Métriques du Portefeuille')
        
        # 6. Matrice de corrélation
        ax6 = plt.subplot(2, 3, 6)
        asset_names = [asset.name for asset in self.assets]
        sns.heatmap(self.correlation_matrix, annot=True, fmt='.2f', cmap='coolwarm',
                   xticklabels=asset_names, yticklabels=asset_names, ax=ax6)
        ax6.set_title('Matrice de Corrélation')
        
        plt.tight_layout()
        plt.show()
    
    def classical_comparison(self):
        """Compare avec une approche classique exhaustive"""
        print("\n🔍 Comparaison avec recherche exhaustive classique...")
        
        best_classical_energy = float('inf')
        best_classical_state = None
        
        # Recherche exhaustive parmi toutes les combinaisons de 3 actifs
        for combination in itertools.combinations(range(self.n_assets), 3):
            state = np.zeros(self.n_assets)
            for idx in combination:
                state[idx] = 1
            
            energy = self.qubo_energy(state)
            if energy < best_classical_energy:
                best_classical_energy = energy
                best_classical_state = state
        
        print(f"   Meilleure énergie classique: {best_classical_energy:.4f}")
        return best_classical_state, best_classical_energy


# Exemple d'utilisation
def main():
    """Fonction principale pour démonstration"""
    
    # Définition des actifs
    assets = [
        Asset("Tech Stock", 0.12, 0.25),
        Asset("Healthcare", 0.08, 0.15),
        Asset("Energy", 0.15, 0.30),
        Asset("Finance", 0.10, 0.20),
        Asset("Real Estate", 0.06, 0.12)
    ]
    
    # Création de l'optimiseur
    print("="*60)
    print("🌟 OPTIMISATION DE PORTEFEUILLE QUANTIQUE 🌟")
    print("="*60)
    
    # Test avec différents niveaux d'aversion au risque
    risk_aversions = [0.2, 0.5, 0.8]
    
    for risk_aversion in risk_aversions:
        print(f"\n\n{'='*60}")
        print(f"Configuration: Aversion au risque = {risk_aversion}")
        print(f"{'='*60}")
        
        optimizer = QuantumPortfolioOptimizer(assets, risk_aversion=risk_aversion)
        
        # Optimisation quantique
        quantum_state, quantum_results = optimizer.quantum_evolution_qaoa(n_layers=4)
        
        # Comparaison classique
        classical_state, classical_energy = optimizer.classical_comparison()
        
        print(f"\n📊 Résumé:")
        print(f"   Énergie quantique: {quantum_results['energy']:.4f}")
        print(f"   Énergie classique: {classical_energy:.4f}")
        print(f"   Amélioration: {(classical_energy - quantum_results['energy'])/classical_energy*100:.2f}%")
        
        print(f"\n   Portefeuille sélectionné:")
        for asset in quantum_results['selected_assets']:
            print(f"      - {asset.name} (R: {asset.expected_return*100:.1f}%, σ: {asset.risk*100:.1f}%)")


if __name__ == "__main__":
    main()
