# Version Python - Quantum Portfolio Optimizer

## Installation

```bash
pip install -r requirements.txt
```

## Utilisation

### Exécution basique
```bash
python quantum_portfolio_optimizer.py
```

### Utilisation avancée

```python
from quantum_portfolio_optimizer import QuantumPortfolioOptimizer, Asset

# Créer vos actifs
assets = [
    Asset("AAPL", 0.15, 0.22),
    Asset("MSFT", 0.12, 0.18),
    Asset("GLD", 0.06, 0.10),
]

# Initialiser l'optimiseur
optimizer = QuantumPortfolioOptimizer(assets, risk_aversion=0.5)

# Lancer l'optimisation
state, results = optimizer.quantum_evolution_qaoa(n_layers=4)
```
