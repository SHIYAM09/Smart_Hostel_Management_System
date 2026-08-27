import { useState, lazy, Suspense } from "react";

import { useAuth } from "./hooks/useAuth";
import { useHostel } from "./context/HostelContext";

import { Sidebar } from "./layouts/Sidebar";
import { Topbar } from "./layouts/Topbar";
import { ErrorBoundary } from "./components/common/ErrorBoundary";

import Login from "./pages/auth/Login";

const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminWardens = lazy(() => import("./pages/admin/AdminWardens"));
const AdminHostels = lazy(() => import("./pages/admin/AdminHostels"));
const AdminAllStudents = lazy(() => import("./pages/admin/AdminAllStudents"));
const AdminComplaints = lazy(() => import("./pages/admin/AdminComplaints"));
const AdminMessUtilityMonitoring = lazy(() => import("./pages/admin/AdminMessUtilityMonitoring"));
const AdminReports = lazy(() => import("./pages/admin/AdminReports"));
const AdminProfile = lazy(() => import("./pages/admin/AdminProfile"));

const WardenDashboard = lazy(() => import("./pages/warden/WardenDashboard"));
const WardenStudents = lazy(() => import("./pages/warden/WardenStudents"));
const WardenRooms = lazy(() => import("./pages/warden/WardenRooms"));
const WardenAttendance = lazy(() => import("./pages/warden/WardenAttendance"));
const WardenLeave = lazy(() => import("./pages/warden/WardenLeave"));
const VisitorVerification = lazy(() => import("./pages/warden/VisitorVerification"));
const WardenComplaints = lazy(() => import("./pages/warden/WardenComplaints"));
const WardenMessMenu = lazy(() => import("./pages/warden/WardenMessMenu"));
const MessAnalytics = lazy(() => import("./pages/warden/MessAnalytics"));
const ResourceMonitor = lazy(() => import("./pages/warden/ResourceMonitor"));
const AISafetyMonitor = lazy(() => import("./pages/warden/AISafetyMonitor"));
const WardenProfile = lazy(() => import("./pages/warden/WardenProfile"));

const StudentHome = lazy(() => import("./pages/student/StudentHome"));
const StudentAttendance = lazy(() => import("./pages/student/StudentAttendance"));
const StudentLeave = lazy(() => import("./pages/student/StudentLeave"));
const StudentComplaints = lazy(() => import("./pages/student/StudentComplaints"));
const MessMenu = lazy(() => import("./pages/student/MessMenu"));
const VisitorRequest = lazy(() => import("./pages/student/VisitorRequest"));
const StudentProfile = lazy(() => import("./pages/student/StudentProfile"));

const SharedNotifications = lazy(() => import("./pages/shared/SharedNotifications"));

import { HostelAssistantWidget } from "./components/ai/HostelAssistantWidget";

import { ADMIN_NAV, WARDEN_NAV, STUDENT_NAV, ADMIN_TITLES, WARDEN_TITLES, STUDENT_TITLES } from "./routes/navigation";

import "./styles/appAnimations.css";

// Page transition wrapper component
function PageTransition({ children }) {
  return (
    <ErrorBoundary>
      <Suspense
        fallback={
          <div className="flex items-center justify-center p-12 min-h-[300px]">
            <div className="flex flex-col items-center gap-3">
              <span className="w-8 h-8 border-3 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
              <span className="text-xs font-semibold text-gray-500">Loading module...</span>
            </div>
          </div>
        }
      >
        <div className="animate-fade-in">{children}</div>
      </Suspense>
    </ErrorBoundary>
  );
}

export default function App() {
  const { loggedIn, role, userName, login, logout } = useAuth();
  const { notifications } = useHostel();
  const [adminS,      setAdminS]      = useState("dashboard");
  const [wardenS,     setWardenS]     = useState("dashboard");
  const [studentS,    setStudentS]    = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogin  = (r, name, token, userObj) => login(r, name, token, userObj);
  const handleLogout = () => { logout(); setAdminS("dashboard"); setWardenS("dashboard"); setStudentS("home"); };

  const currentTitle   = role==="admin"?ADMIN_TITLES[adminS]:role==="warden"?WARDEN_TITLES[wardenS]:STUDENT_TITLES[studentS];
  const roleSubtitle   = role==="admin"?"Administrator Portal":role==="warden"?"Warden Portal":"Student Portal";
  const unread         = notifications.filter(n=>!n.read&&(n.forRole==="all"||n.forRole===role)).length;
  const bellNav        = ()=>{ if(role==="admin") setAdminS("notifications"); else if(role==="warden") setWardenS("notifications"); else setStudentS("notifications"); };

  const getNavWithBadge = (baseNav) =>
    baseNav.map((item) => (item.id === "notifications" ? { ...item, badge: unread > 0 ? unread : undefined } : item));

  if(!loggedIn) return <Login onLogin={handleLogin}/>;

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex">
      {role==="admin"  && <Sidebar nav={getNavWithBadge(ADMIN_NAV)}   current={adminS}   onNav={setAdminS}   onProfile={()=>setAdminS("profile")}   open={sidebarOpen} onClose={()=>setSidebarOpen(false)} accentClass="bg-violet-600" tagLabel="Admin Portal"   footerName={userName} footerSub="System Administrator"/>}
      {role==="warden" && <Sidebar nav={getNavWithBadge(WARDEN_NAV)}  current={wardenS}  onNav={setWardenS}  onProfile={()=>setWardenS("profile")}  open={sidebarOpen} onClose={()=>setSidebarOpen(false)} accentClass="bg-blue-500"   tagLabel="Warden Portal"  footerName={userName} footerSub="Chief Warden"/>}
      {role==="student"&& (() => {
        const u = (() => { try { return JSON.parse(localStorage.getItem("user")) || {}; } catch { return {}; } })();
        const sRoom = u.roomNumber || u.room || "D-214";
        const sRoll = u.rollNumber || u.rollNo || u.username || "717824F251";
        return <Sidebar nav={getNavWithBadge(STUDENT_NAV)} current={studentS} onNav={setStudentS} open={sidebarOpen} onClose={()=>setSidebarOpen(false)} accentClass="bg-cyan-500" tagLabel="Student Portal" footerName={userName} footerSub={`Room ${sRoom} · ${sRoll}`} onProfile={()=>setStudentS("profile")}/>;
      })()}

      <div className="flex-1 lg:ml-72 flex flex-col min-h-screen">
        <Topbar title={currentTitle} subtitle={roleSubtitle} onMenu={()=>setSidebarOpen(true)} onBell={bellNav} unread={unread}/>
        <main className="flex-1 p-4 lg:p-5 overflow-auto">
          <PageTransition>
            {role==="admin" && adminS==="dashboard"    && <AdminDashboard onNav={setAdminS}/>}
            {role==="admin" && adminS==="wardens"      && <AdminWardens/>}
            {role==="admin" && adminS==="hostels"      && <AdminHostels/>}
            {role==="admin" && adminS==="all-students" && <AdminAllStudents/>}
            {role==="admin" && adminS==="complaints"   && <AdminComplaints/>}
            {role==="admin" && adminS==="mess-utility" && <AdminMessUtilityMonitoring/>}
            {role==="admin" && adminS==="reports"      && <AdminReports/>}
            {role==="admin" && adminS==="ai-safety"    && <AISafetyMonitor/>}
            {role==="admin" && adminS==="notifications"&& <SharedNotifications role="admin"/>}
            {role==="admin" && adminS==="profile"      && <AdminProfile onLogout={handleLogout}/>}
            {role==="warden" && wardenS==="dashboard"    && <WardenDashboard onNav={setWardenS}/>}
            {role==="warden" && wardenS==="students"     && <WardenStudents/>}
            {role==="warden" && wardenS==="rooms"        && <WardenRooms/>}
            {role==="warden" && wardenS==="attendance"   && <WardenAttendance/>}
            {role==="warden" && wardenS==="leave"        && <WardenLeave/>}
            {role==="warden" && wardenS==="visitors"     && <VisitorVerification/>}
            {role==="warden" && wardenS==="complaints"   && <WardenComplaints/>}
            {role==="warden" && wardenS==="mess-menu"    && <WardenMessMenu/>}
            {role==="warden" && wardenS==="mess"         && <MessAnalytics/>}
            {role==="warden" && wardenS==="resources"    && <ResourceMonitor/>}
            {role==="warden" && wardenS==="ai-safety"    && <AISafetyMonitor/>}
            {role==="warden" && wardenS==="notifications"&& <SharedNotifications role="warden"/>}
            {role==="warden" && wardenS==="profile"      && <WardenProfile onLogout={handleLogout}/>}
            {role==="student" && studentS==="home"            && <StudentHome onNav={setStudentS}/>}
            {role==="student" && studentS==="my-attendance"   && <StudentAttendance/>}
            {role==="student" && studentS==="leave-requests"  && <StudentLeave/>}
            {role==="student" && studentS==="my-complaint"    && <StudentComplaints/>}
            {role==="student" && studentS==="mess-menu"       && <MessMenu/>}
            {role==="student" && studentS==="visitor-request" && <VisitorRequest/>}
            {role==="student" && studentS==="ai-safety"       && <AISafetyMonitor/>}
            {role==="student" && studentS==="notifications"   && <SharedNotifications role="student"/>}
            {role==="student" && studentS==="profile"         && <StudentProfile onLogout={handleLogout}/>}
          </PageTransition>
        </main>
      </div>
      <HostelAssistantWidget role={role} userName={userName} />
    </div>
  );
}
