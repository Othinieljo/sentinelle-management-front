// Page Roue de la Fortune - Expérience Pleine Page
import AuthGuard from '@/lib/auth/auth-guard';
import WheelPage from '@/components/wheel/WheelPage';

export default function WheelPageRoute() {
  return (
    <AuthGuard roles={['member', 'admin']} requireAuth={true}>
      <WheelPage />
    </AuthGuard>
  );
}
