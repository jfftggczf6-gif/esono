# Investment Readiness Platform — PME Afrique

## Vue d'ensemble

Plateforme intelligente de preparation a l'investissement pour les PME africaines (focus Cote d'Ivoire / Afrique de l'Ouest). Accompagne un entrepreneur etape par etape, du business model jusqu'au dossier investisseur complet.

- **Devise par defaut** : XOF (FCFA)
- **TVA** : 18% | **IS** : 25% | **Charges sociales** : ~25% du brut

## Architecture : 8 Modules Sequentiels

### Modules Hybrides (1-3) : Micro-learning + IA + Coaching

| Module | Code | Description | Livrables |
|--------|------|-------------|-----------|
| 1. BMC | `mod1_bmc` | Business Model Canvas — 9 blocs | Excel BMC + HTML Diagnostic |
| 2. SIC | `mod2_sic` | Social Impact Canvas — ODD, indicateurs | Excel SIC + HTML Diagnostic |
| 3. Inputs | `mod3_inputs` | Donnees financieres — historiques, RH, CAPEX | Excel Inputs + Rapport validation |

Chaque section des modules hybrides suit le parcours :
1. **Capsule educative** (30s-2min) avec exemples sectoriels
2. **Saisie assistee IA** — suggestions, validation temps reel
3. **Coaching humain** (optionnel) — chat/visio integre

### Modules Automatiques (4-8) : Traitement IA

| Module | Code | Description | Livrable |
|--------|------|-------------|----------|
| 4. Framework | `mod4_framework` | Modelisation financiere 5 ans | Excel Framework (8 feuilles) |
| 5. Diagnostic | `mod5_diagnostic` | Score credibilite /20, risques, plan action | HTML Diagnostic Expert |
| 6. Plan OVO | `mod6_ovo` | Template financier 8 ans | Plan Financier OVO (.xlsm) |
| 7. Business Plan | `mod7_business_plan` | Document complet max 20 pages | Business Plan (.docx) |
| 8. ODD | `mod8_odd` | Evaluation 40 cibles ODD | ODD Template (.xlsx) |

### Flux de donnees

```
Module 1 (BMC) ────────────────┐
                                ├──→ Module 4 (Framework)
Module 2 (SIC) ────────────────┤         │
                                │         ├──→ Module 5 (Diagnostic)
Module 3 (Inputs) ─────────────┘         │         │
                                          │         ├──→ Module 6 (OVO)
                                          │         │
Module 2 (SIC) ──────────────────────────────────────────→ Module 8 (ODD)
                                          │         │
Modules 1-6 ──────────────────────────────┴─────────┴──→ Module 7 (BP)
```

## Pages de l'application

| Page | URL | Description |
|------|-----|-------------|
| Landing | `/` | Page publique avec presentation des 8 modules |
| Inscription | `/register` | Creation de compte |
| Connexion | `/login` | Authentification |
| Dashboard | `/dashboard` | Vue d'ensemble, progression, cartes modules |
| Module hybride | `/module/:code/video` | Micro-learning → quiz → saisie → analyse |
| Module auto (overview) | `/module/:code/overview` | Resume des donnees + bouton generer |
| Module auto (generate) | `/module/:code/generate` | Page de generation IA en cours |
| Livrables | `/livrables` | Liste tous les livrables, statut, telechargement |

## Stack technique

- **Backend** : Hono (TypeScript) sur Cloudflare Workers
- **Base de donnees** : Cloudflare D1 (SQLite)
- **Frontend** : JSX server-side + Tailwind CSS (CDN) + FontAwesome
- **Design system** : ESONO (CSS custom)

## Developpement local

```bash
# Installation
npm install

# Appliquer les migrations
npm run db:migrate:local

# Build
npm run build

# Demarrer
pm2 start ecosystem.config.cjs

# Tester
curl http://localhost:3000
```

## Fonctionnalites implementees

- [x] Landing page avec presentation 8 modules (hybrides + automatiques)
- [x] Inscription / Connexion avec JWT
- [x] Dashboard avec barre de progression 8 etapes
- [x] Cartes modules hybrides (1-3) avec badges micro-learning/IA/coaching
- [x] Cartes modules automatiques (4-8) avec formats livrables
- [x] Systeme de verrouillage sequentiel (dependances entre modules)
- [x] Page module automatique : overview + generation + download
- [x] Page livrables centralisee avec statut par fichier
- [x] Navigation sidebar avec les 8 modules + livrables
- [x] Module BMC (Module 1) : parcours complet video → quiz → questions → analyse → validation → livrable
- [x] Migration DB pour 8 modules + tables module_data + coaching_sessions

## Prochaines etapes

- [ ] Contenu SIC (Module 2) : capsules educatives + formulaire 5 sections
- [ ] Contenu Inputs (Module 3) : 9 onglets financiers avec validation mathematique
- [ ] Integration IA reelle (API OpenAI) pour analyse et generation
- [ ] Moteur de generation des livrables Excel/HTML/Word/XLSM
- [ ] Chat coaching integre avec notifications
- [ ] Export pack complet (.zip) depuis la page livrables
- [ ] Deploiement Cloudflare Pages

## Derniere mise a jour

2026-02-11 — Refactoring complet vers architecture 8 modules sequentiels
