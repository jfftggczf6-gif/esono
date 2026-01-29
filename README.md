# Plateforme EdTech Afrique - MVP Phase 1

## 📋 Vue d'ensemble du projet

**Nom**: Plateforme EdTech Afrique  
**Objectif**: Accompagner les entrepreneurs africains de l'apprentissage au financement en transformant leurs idées en entreprises crédibles et finançables.

**Vision**: Une plateforme reposant sur un tronc pédagogique unique qui transforme progressivement l'apprentissage en livrables standardisés, validés par l'IA et par des coachs humains.

---

## 🌐 URLs

- **Application Local**: http://localhost:3000
- **Application Publique**: https://3000-idz38hzqfzrnrpqb61exq-18e660f9.sandbox.novita.ai
- **GitHub**: _(À configurer)_
- **Production Cloudflare Pages**: _(À déployer)_

---

## ✅ Fonctionnalités Actuelles (Phase 1 - MVP)

### Écrans Transversaux Implémentés

✅ **A1 - Landing/Entry Screen**
- Choix du point de départ (pré-entrepreneur vs entrepreneur)
- Design moderne avec Tailwind CSS
- Orientation claire dès la première seconde

✅ **A2 - Création de compte**
- Formulaire d'inscription complet
- Authentification JWT sécurisée
- Hashing des mots de passe (SHA-256)
- Validation des données
- Redirection automatique vers le dashboard

✅ **A3 - Dashboard Principal**
- Vue globale de la progression
- Score de progression (Learning Progress / Investment Readiness)
- Barre de progression par étapes (1→5)
- Carte "Next Step" avec module recommandé
- Liste complète des modules avec statut
- Statistiques en temps réel

### API Backend

✅ `/api/register` - Création de compte utilisateur  
✅ `/api/login` - Connexion utilisateur  
✅ `/api/logout` - Déconnexion  
✅ `/api/user` - Récupération du profil utilisateur  

---

## 🗄️ Architecture de Base de Données (Cloudflare D1)

### Tables Principales

**users** - Comptes utilisateurs
- Authentification JWT
- Types: pre_entrepreneur / entrepreneur
- Statuts: student / entrepreneur / alumni

**projects** - Projets entrepreneuriaux
- Un projet par défaut créé à l'inscription
- Lié aux utilisateurs

**modules** - Modules pédagogiques prédéfinis
- 7 modules fondation (Étapes 1-5)
- Business Model Canvas, Analyse Financière, Projections, etc.

**progress** - Suivi de progression
- État: not_started / in_progress / completed / validated
- Scores de quiz
- Timestamps de complétion

**questions** - Réponses utilisateurs
- Feedback IA
- Itérations multiples
- Validation coach

**quiz_attempts** - Tentatives de quiz
- Historique complet
- Scores et résultats

**deliverables** - Documents générés
- PDF, Slides, Canvas, Reports
- Livrables prêts pour investisseurs

---

## 🎯 Parcours Utilisateur (Phase 1)

```
1. Landing Page (/)
   ↓
2. Choix: Pré-entrepreneur ou Entrepreneur
   ↓
3. Inscription (/register?type=...)
   ↓
4. Dashboard (/dashboard)
   ↓
5. Sélection module (/module/:code) [En développement]
```

---

## 🚧 Fonctionnalités En Attente (Phase 2+)

### Tronc Pédagogique (B1→B7)
⏳ **B1** - Écran vidéo pédagogique  
⏳ **B2** - Quiz de validation  
⏳ **B3** - Question guidée (Input structurant)  
⏳ **B4** - Analyse IA / Challenge  
⏳ **B5** - Réécriture / Itération  
⏳ **B6** - Validation IA / Coach  
⏳ **B7** - Livrable généré  

### Étapes Complètes
⏳ **Étape 1** - Comprendre l'activité (upload pitch, questionnaires)  
⏳ **Étape 2** - Analyse financière  
⏳ **Étape 3** - Projections financières (3 scénarios)  
⏳ **Étape 4** - Business Plan complet  
⏳ **Étape 5** - Impact & ODD  

### Avancé
⏳ Upload de fichiers (Pitch Deck, documents financiers)  
⏳ Génération de PDF/Slides  
⏳ Intégration IA (OpenAI/Claude)  
⏳ Interface bailleurs/donateurs  
⏳ Modules avancés (Croissance, Gouvernance, Marketing)  

---

## 🛠️ Stack Technique

### Frontend
- **Hono JSX** - Rendu côté serveur
- **TailwindCSS** - Design system via CDN
- **FontAwesome** - Iconographie
- **JavaScript Vanilla** - Interactions client

### Backend
- **Hono Framework** - Web framework léger
- **Cloudflare Workers** - Runtime edge
- **Cloudflare D1** - Base de données SQLite distribuée
- **JWT** - Authentification stateless

### Outils
- **Vite** - Build tool
- **Wrangler** - CLI Cloudflare
- **PM2** - Process manager (dev)
- **TypeScript** - Type safety

---

## 🚀 Guide de Développement

### Prérequis
- Node.js 18+
- npm ou pnpm
- Compte Cloudflare (pour production)

### Installation

```bash
cd /home/user/webapp
npm install
```

### Configuration Base de Données

```bash
# Appliquer les migrations en local
npm run db:migrate:local

# Console D1 locale
npm run db:console:local
```

### Développement Local

```bash
# Build du projet
npm run build

# Démarrer avec PM2 (sandbox)
pm2 start ecosystem.config.cjs

# Ou démarrer directement (local machine)
npm run dev:sandbox
```

### Tests

```bash
# Tester le serveur
curl http://localhost:3000

# Tester l'API d'inscription
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"test123","country":"SN","status":"entrepreneur","user_type":"entrepreneur"}'
```

---

## 📦 Scripts Disponibles

```json
{
  "dev": "vite",
  "dev:sandbox": "wrangler pages dev dist --d1=webapp-production --local --ip 0.0.0.0 --port 3000",
  "build": "vite build",
  "deploy:prod": "npm run build && wrangler pages deploy dist --project-name webapp",
  "db:migrate:local": "wrangler d1 migrations apply webapp-production --local",
  "db:migrate:prod": "wrangler d1 migrations apply webapp-production",
  "clean-port": "fuser -k 3000/tcp 2>/dev/null || true",
  "git:commit": "git add . && git commit -m"
}
```

---

## 📊 Statut du Projet

**Phase Actuelle**: Phase 1 - MVP Fondations  
**Dernière Mise à Jour**: 2025-01-29  
**Statut**: ✅ Phase 1 Complète - Prêt pour tests utilisateurs

### Prochaines Étapes Recommandées

1. **Tests Utilisateurs** - Valider le flow A1 → A2 → A3
2. **Intégration IA** - Configurer OpenAI/Claude pour feedback
3. **Développer B1→B3** - Premier module pédagogique complet
4. **Upload Fichiers** - Cloudflare R2 pour pitch decks
5. **Déploiement Production** - Cloudflare Pages

---

## 🔐 Sécurité

- ✅ Mots de passe hashés (SHA-256 + salt)
- ✅ JWT avec expiration (7 jours)
- ✅ Cookies httpOnly, secure, sameSite
- ✅ Validation inputs côté serveur
- ⚠️ **TODO**: Implémenter rate limiting
- ⚠️ **TODO**: Passer à bcrypt en production

---

## 🤝 Contribution

### Structure de Commit
```
git add .
git commit -m "feat: ajouter fonctionnalité X"
git commit -m "fix: corriger bug Y"
git commit -m "docs: mettre à jour README"
```

### Branches
- `main` - Production
- `dev` - Développement
- `feature/*` - Nouvelles fonctionnalités

---

## 📞 Support & Contact

Pour toute question ou problème, consultez la documentation ou créez une issue sur GitHub.

---

**Fait avec ❤️ pour l'écosystème entrepreneurial africain**
