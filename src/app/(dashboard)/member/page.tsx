// Page dashboard membre
import AuthGuard from '@/lib/auth/auth-guard';
import MemberDashboardNew from '@/components/dashboard/MemberDashboardNew';     

export default function MemberPage() {
  return (
    <AuthGuard roles={['member', 'admin']} requireAuth={true}>
      <MemberDashboardNew />
    </AuthGuard>
  );
}