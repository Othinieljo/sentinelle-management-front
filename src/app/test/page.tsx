// Page de test simple
'use client';

import { useAuthStore } from '@/lib/auth/auth-store';
import { Button } from '@/components/ui/Button/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card/Card';

export default function TestPage() {
  const { user, isAuthenticated, login, logout, isLoading } = useAuthStore();

  const handleTestLogin = async () => {
    try {
      await login({
        phone_number: '+33123456789',
        password: 'password123',
        remember_me: true,
      });
    } catch (error) {
      console.error('Test login failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Page de Test SENTINELLE</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">État d&apos;authentification :</h3>
              <p>Authentifié : {isAuthenticated ? 'Oui' : 'Non'}</p>
              <p>Chargement : {isLoading ? 'Oui' : 'Non'}</p>
              {user && (
                <div>
                  <p>Utilisateur : {user.first_name} {user.last_name}</p>
                  <p>Rôle : {user.role}</p>
                  <p>Téléphone : {user.phone_number}</p>
                </div>
              )}
            </div>

            <div className="flex space-x-4">
              <Button onClick={handleTestLogin} disabled={isLoading}>
                Test Connexion
              </Button>
              <Button onClick={logout} variant="secondary">
                Déconnexion
              </Button>
            </div>

            <div className="mt-8">
              <h3 className="font-semibold mb-2">Liens de test :</h3>
              <div className="space-x-4">
                <a href="/login" className="text-blue-600 hover:underline">
                  Page de connexion
                </a>
                <a href="/member" className="text-blue-600 hover:underline">
                  Dashboard membre
                </a>
                <a href="/admin" className="text-blue-600 hover:underline">
                  Dashboard admin
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
