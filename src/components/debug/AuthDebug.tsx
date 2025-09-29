'use client';

import { useAuthStore } from '../../stores/auth';

const AuthDebug: React.FC = () => {
  const { user, isAuthenticated, isLoading, token, error } = useAuthStore();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">Auth Debug</h3>
      <div className="space-y-1">
        <div>Loading: {isLoading ? 'true' : 'false'}</div>
        <div>Authenticated: {isAuthenticated ? 'true' : 'false'}</div>
        <div>Token: {token ? 'present' : 'null'}</div>
        <div>User: {user ? `${user.first_name} ${user.last_name}` : 'null'}</div>
        <div>Role: {user?.role || 'null'}</div>
        <div>Error: {error || 'none'}</div>
      </div>
    </div>
  );
};

export default AuthDebug;
