import ProfilePage from "../../components/common/ProfilePage";

export default function WardenProfile({ onLogout }) {
  return (
    <ProfilePage
      roleKey="warden"
      badgeStatus="warden"
      gradient="from-[#0c2340] to-[#1a56db]"
      avatarBg="bg-blue-600"
      onLogout={onLogout}
    />
  );
}
