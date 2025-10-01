// Page Roue de la Fortune - Expérience Pleine Page
import AuthGuard from '@/lib/auth/auth-guard';
import WheelPageWrapper from '@/components/wheel/WheelPageWrapper';

export default function WheelPageRoute() {
  return (
    <AuthGuard roles={['member', 'admin']} requireAuth={true}>
      <WheelPageWrapper />
    </AuthGuard>
  );
}
