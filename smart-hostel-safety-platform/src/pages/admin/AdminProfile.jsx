import ProfilePage from "../../components/common/ProfilePage";

export default function AdminProfile({ onLogout }) {
  return (
    <ProfilePage
      roleKey="admin"
      badgeStatus="admin"
      gradient="from-[#0c2340] to-[#7c3aed]"
      avatarBg="bg-violet-600"
      onLogout={onLogout}
    />
  );
}
