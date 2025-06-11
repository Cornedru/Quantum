# Théorie de l'Optimisation de Portefeuille Quantique

## Introduction

L'optimisation de portefeuille quantique utilise les principes de la mécanique quantique pour résoudre des problèmes d'optimisation combinatoire complexes.

## Formulation QUBO

Le problème est transformé en minimisation d'une fonction quadratique :

```
H = -Σᵢ rᵢxᵢ + λΣᵢⱼ σᵢⱼxᵢxⱼ
```

Où :
- rᵢ : rendement de l'actif i
- σᵢⱼ : covariance entre actifs i et j
- xᵢ : variable binaire (1 si actif sélectionné, 0 sinon)
- λ : paramètre d'aversion au risque

## Algorithme QAOA

QAOA (Quantum Approximate Optimization Algorithm) alterne entre :
1. Opérateur de coût : applique une phase basée sur l'énergie
2. Opérateur de mélange : explore l'espace des solutions

## Avantages Quantiques

- Exploration parallèle via superposition
- Interférence quantique pour amplifier les bonnes solutions
- Potentiel de speedup pour problèmes NP-difficiles
