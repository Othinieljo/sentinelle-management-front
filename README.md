# SENTINELLE - Frontend

Plateforme de gestion de communauté avec système de cotisations et roue de la fortune.

## 🎯 Vue d'ensemble

**SENTINELLE** est une plateforme moderne permettant aux communautés de :
- Collecter des cotisations via des campagnes configurables
- Suivre les paiements et soldes des membres
- Animer la participation avec une roue de la fortune ultra-moderne
- Gérer complètement la communauté via un back-office admin

## 🏗️ Architecture technique

### Stack technologique
- **Framework** : Next.js 14+ (App Router)
- **TypeScript** : Obligatoire pour tout le code
- **Styling** : Tailwind CSS + CSS Modules pour composants custom
- **UI Components** : 100% custom avec Headless UI pour comportements
- **Animations** : Framer Motion
- **State Management** : Zustand
- **HTTP Client** : Axios avec intercepteurs
- **Form Management** : React Hook Form + Zod
- **Icons** : Lucide React + Heroicons
- **Font** : Poppins (Google Fonts)

## 🚀 Installation

```bash
# Cloner le projet
git clone <repository-url>
cd sentinelle-frontend

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env.local
# Éditer .env.local avec vos valeurs

# Démarrer le serveur de développement
npm run dev
```

## 📁 Structure du projet

```
src/
├── app/
│   ├── (auth)/
│   │   └── login/
│   ├── (dashboard)/
│   │   ├── member/
│   │   └── admin/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/ (composants custom)
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Card/
│   │   └── Modal/
│   ├── auth/
│   ├── dashboard/
│   ├── wheel/
│   ├── admin/
│   └── common/
├── lib/
│   ├── api.ts
│   ├── validations.ts
│   └── utils.ts
├── stores/
│   └── auth.ts
├── types/
├── hooks/
└── styles/
    └── components/ (CSS Modules)
```

## 🎨 Design System

### Palette de couleurs
- **Orange principal** : #f97316
- **Orange secondaire** : #ea580c
- **Gris neutres** : #f9fafb à #111827
- **Couleurs fonctionnelles** : Success, Error, Warning

### Typography
- **Font** : Poppins (300, 400, 500, 600, 700, 800)
- **Responsive** : Mobile-first avec breakpoints Tailwind

## 🔐 Authentification

- **Méthode** : Numéro de téléphone + mot de passe
- **Rôles** : Membre et Administrateur
- **Protection** : Middleware Next.js + ProtectedRoute component
- **State** : Zustand avec persistance localStorage

## 👤 Interface Membre

### Dashboard Membre
- **Header** : Informations utilisateur, solde, tours disponibles
- **Campagnes** : Cartes avec progression et actions
- **Roue de la fortune** : Composant interactif ultra-custom
- **Statistiques** : Aperçu des contributions et activités

### Fonctionnalités
- Contribution aux campagnes
- Tour de la roue de la fortune
- Suivi des paiements
- Historique des activités

## 👑 Interface Admin

### Dashboard Admin
- **Vue d'ensemble** : Statistiques globales
- **Gestion des campagnes** : Création, modification, suivi
- **Gestion des membres** : Liste, détails, actions
- **Analytiques** : Graphiques et rapports

### Fonctionnalités
- Création de campagnes
- Gestion des membres
- Configuration des prix de la roue
- Suivi des revenus
- Rapports et statistiques

## 🎮 Roue de la Fortune

### Caractéristiques
- **Design 3D** : Ombres, reflets, perspectives
- **Animation physique** : Momentum réaliste, friction
- **Particules** : Effets visuels custom
- **Responsive** : Adapté mobile et desktop
- **Accessibilité** : Navigation clavier, ARIA

### Configuration
- Prix configurables par l'admin
- Probabilités personnalisables
- Couleurs et icônes custom
- Sons et vibrations (optionnel)

## 🎨 Composants UI

### Design System Unique
- **100% Custom** : Aucun framework UI externe
- **Identité visuelle forte** : Orange/Blanc avec nuances
- **Animations fluides** : 60fps, micro-interactions
- **Responsive** : Mobile-first, touch-friendly
- **Accessibilité** : WCAG 2.1 AA compliant

### Composants principaux
- **Button** : Variants, tailles, états, effets
- **Input** : Validation, icônes, floating labels
- **Card** : Variants, effets hover, animations
- **Modal** : Animations, focus trap, responsive
- **Toast** : Notifications contextuelles

## 📱 Mobile Experience

### Optimisations
- **Touch-friendly** : Boutons min 44px
- **Gestures** : Swipe, pull-to-refresh
- **Performance** : 60fps garanti
- **Responsive** : Breakpoints adaptatifs
- **PWA Ready** : Service worker, manifest

## 🔧 Configuration

### Variables d'environnement
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_NAME=SENTINELLE
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### Scripts disponibles
```bash
npm run dev          # Développement
npm run build        # Production
npm run start        # Serveur production
npm run lint         # Linting
```

## 🚀 Déploiement

### Vercel (Recommandé)
```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel

# Variables d'environnement
vercel env add NEXT_PUBLIC_API_URL
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🧪 Tests

```bash
# Tests unitaires
npm run test

# Tests E2E
npm run test:e2e

# Coverage
npm run test:coverage
```

## 📚 Documentation

### API Integration
- **Base URL** : Configurable via env
- **Authentification** : Bearer token
- **Intercepteurs** : Refresh automatique
- **Gestion d'erreurs** : Centralisée

### State Management
- **Auth Store** : Utilisateur, token, état
- **Persistence** : localStorage
- **Type Safety** : TypeScript strict

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

Pour toute question ou problème :
- Ouvrir une issue sur GitHub
- Contacter l'équipe de développement
- Consulter la documentation API

---

**SENTINELLE** - Gestion de communauté intelligente 🛡️