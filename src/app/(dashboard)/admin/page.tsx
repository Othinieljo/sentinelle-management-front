import React from 'react';
import AuthGuard from '@/lib/auth/auth-guard';
import AdminDashboardNew from '@/components/admin/AdminDashboardNew';

export default function AdminPage() {
  return (
    <AuthGuard roles={['admin']} requireAuth={true}>
      <AdminDashboardNew />
    </AuthGuard>
  );
}
