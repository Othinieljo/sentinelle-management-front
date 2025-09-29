# 🚀 Intégration API SENTINELLE

## 📋 Vue d'ensemble

L'application SENTINELLE a été intégrée avec l'API CommuWheel pour fournir une expérience utilisateur complète et fonctionnelle. Cette intégration permet la gestion des utilisateurs, campagnes, paiements et système de roue de la fortune.

## 🔧 Configuration

### Variables d'environnement

Créez un fichier `.env.local` à la racine du projet :

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Configuration par défaut

L'application utilise `http://localhost:3001/api` comme URL de base par défaut si aucune variable d'environnement n'est définie.

## 🏗️ Architecture

### Services API

- **AuthService** : Gestion de l'authentification
- **UserService** : Gestion des utilisateurs
- **CampaignService** : Gestion des campagnes
- **SpinService** : Gestion des spins et roue de la fortune
- **PaymentService** : Gestion des paiements
- **ReportService** : Rapports et statistiques (Admin)

### Hooks personnalisés

- **useApiError** : Gestion centralisée des erreurs API
- **useDashboard** : Gestion des données du dashboard
- **useSpins** : Gestion des spins et solde

### Composants

- **ApiStatus** : Indicateur de statut de connexion API
- **LoginForm** : Formulaire de connexion avec intégration API
- **MemberDashboard** : Dashboard membre avec données réelles
- **AdminDashboard** : Dashboard admin avec statistiques réelles

## 🔐 Authentification

### Connexion

```typescript
const { login } = useAuthStore();

await login('0789413618', 'admin123');
```

### Gestion des tokens

- Les tokens JWT sont automatiquement gérés
- Stockage sécurisé dans localStorage
- Intercepteurs Axios pour l'injection automatique
- Redirection automatique en cas d'expiration

## 📊 Fonctionnalités intégrées

### Dashboard Membre

- ✅ Affichage des campagnes actives
- ✅ Solde de spins en temps réel
- ✅ Roue de la fortune fonctionnelle
- ✅ Système de contribution
- ✅ Gestion des paiements

### Dashboard Admin

- ✅ Statistiques en temps réel
- ✅ Gestion des utilisateurs
- ✅ Gestion des campagnes
- ✅ Rapports et analytics
- ✅ Interface de gestion complète

## 🎯 Endpoints utilisés

### Authentification
- `POST /auth/login` - Connexion
- `GET /users/profile` - Profil utilisateur

### Campagnes
- `GET /campaigns/active` - Campagnes actives
- `GET /campaigns` - Liste des campagnes
- `POST /campaigns` - Créer une campagne

### Spins
- `GET /spins/balance` - Solde de spins
- `POST /spins` - Effectuer un spin
- `GET /spins` - Historique des spins

### Paiements
- `POST /payments` - Créer un paiement
- `GET /payments` - Historique des paiements

### Rapports (Admin)
- `GET /reports/dashboard` - Statistiques dashboard
- `GET /reports/spins` - Rapport des spins
- `GET /reports/payments` - Rapport des paiements

## 🛠️ Gestion des erreurs

### Types d'erreurs gérées

- **Erreurs de réseau** : Connexion internet
- **Erreurs d'authentification** : Token expiré
- **Erreurs de permissions** : Accès refusé
- **Erreurs de validation** : Données invalides
- **Erreurs serveur** : Problèmes backend

### Affichage des erreurs

- Notifications toast automatiques
- Messages d'erreur contextuels
- Gestion gracieuse des erreurs

## 🧪 Test de l'intégration

### 1. Vérification de la connexion API

L'application affiche automatiquement le statut de connexion API sur la page de login.

### 2. Test de connexion

Utilisez ces identifiants de test :

**Membre :**
- Téléphone : `+33 6 12 34 56 78`
- Mot de passe : `password`

**Administrateur :**
- Téléphone : `+33 6 98 76 54 32`
- Mot de passe : `admin`

### 3. Test des fonctionnalités

1. **Connexion** : Testez la connexion avec les identifiants
2. **Dashboard** : Vérifiez le chargement des données
3. **Spins** : Testez la roue de la fortune
4. **Contributions** : Testez le système de paiement
5. **Admin** : Testez les fonctionnalités d'administration

## 🔧 Développement

### Ajout de nouveaux endpoints

1. Ajoutez le type dans `src/lib/api.ts`
2. Créez la méthode dans le service approprié
3. Utilisez le hook `useApiError` pour la gestion d'erreurs

### Exemple

```typescript
// Dans src/lib/api.ts
export interface NewFeature {
  id: string;
  name: string;
}

// Dans src/lib/services/newFeatureService.ts
export class NewFeatureService {
  static async getFeatures(): Promise<NewFeature[]> {
    return await apiClient.get<NewFeature[]>('/new-features');
  }
}
```

## 📱 Production

### Configuration

1. Définissez `NEXT_PUBLIC_API_URL` avec l'URL de production
2. Vérifiez que l'API backend est accessible
3. Testez toutes les fonctionnalités

### Déploiement

L'application peut être déployée sur :
- Vercel
- Netlify
- AWS
- Tout hébergeur compatible Next.js

## 🐛 Dépannage

### Problèmes courants

1. **API non accessible** : Vérifiez l'URL et la connectivité
2. **Erreurs CORS** : Configurez le backend pour accepter les requêtes
3. **Tokens expirés** : L'application redirige automatiquement
4. **Données manquantes** : Vérifiez les permissions utilisateur

### Logs

Les erreurs sont automatiquement loggées dans la console du navigateur pour le débogage.

## 📞 Support

Pour toute question ou problème :
1. Vérifiez les logs de la console
2. Testez la connectivité API
3. Vérifiez la configuration des variables d'environnement
4. Consultez la documentation de l'API CommuWheel

---

**Note** : Cette intégration est compatible avec l'API CommuWheel v1.0. Assurez-vous que le backend est en cours d'exécution sur `http://localhost:3001` pour le développement.
