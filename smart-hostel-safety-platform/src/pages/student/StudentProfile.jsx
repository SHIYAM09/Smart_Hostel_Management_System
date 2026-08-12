import ProfilePage from "../../components/common/ProfilePage";

export default function StudentProfile({ onLogout }) {
  return (
    <ProfilePage
      roleKey="student"
      badgeStatus="student"
      gradient="from-[#0c2340] to-[#0ea5e9]"
      avatarBg="bg-cyan-600"
      onLogout={onLogout}
    />
  );
}
