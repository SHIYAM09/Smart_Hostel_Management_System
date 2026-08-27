// Navigation menu definitions and page-title lookups for each portal (role).
// The app uses in-app section switching (not URL routing); this file is the
// single source of truth for sidebar items and section titles per role.
import {
  Activity,
  Bell,
  BedDouble,
  Brain,
  Building2,
  CalendarCheck,
  CalendarDays,
  FileText,
  Home,
  LayoutDashboard,
  MessageSquareWarning,
  Shield,
  UserCheck,
  UserCircle,
  Users,
  Utensils,
} from "lucide-react";

export const ADMIN_NAV = [
  {id:"dashboard",    label:"Dashboard",         icon:LayoutDashboard},
  {id:"wardens",      label:"Warden Management", icon:Shield          },
  {id:"hostels",      label:"Hostel Blocks",     icon:Building2       },
  {id:"all-students", label:"All Students",      icon:Users           },
  {id:"complaints",   label:"Complaints",        icon:MessageSquareWarning},
  {id:"mess-utility", label:"Mess & Utility",    icon:Utensils        },
  {id:"reports",      label:"Reports",           icon:FileText        },
  {id:"ai-safety",    label:"AI Safety Monitor", icon:Brain},
  {id:"notifications",label:"Notifications",     icon:Bell            },
  {id:"profile",      label:"Profile",           icon:UserCircle      },
];

export const WARDEN_NAV = [
  {id:"dashboard",    label:"Dashboard",      icon:LayoutDashboard},
  {id:"students",     label:"Students",       icon:Users           },
  {id:"rooms",        label:"Rooms",          icon:BedDouble       },
  {id:"attendance",   label:"Attendance",     icon:CalendarCheck   },
  {id:"leave",        label:"Leave Requests", icon:CalendarDays    },
  {id:"visitors",     label:"Visitor Verify", icon:UserCheck       },
  {id:"complaints",   label:"Complaints",     icon:MessageSquareWarning},
  {id:"mess-menu",    label:"Daily Mess Menu",icon:Utensils        },
  {id:"mess",         label:"Mess Analytics", icon:Activity        },
  {id:"resources",    label:"Utility Monitoring", icon:Building2   },
  {id:"ai-safety",    label:"AI Safety Monitor", icon:Brain},
  {id:"notifications",label:"Notifications",  icon:Bell            },
  {id:"profile",      label:"Profile",        icon:UserCircle      },
];

export const STUDENT_NAV = [
  {id:"home",            label:"My Home",         icon:Home             },
  {id:"my-attendance",   label:"My Attendance",   icon:CalendarCheck    },
  {id:"leave-requests",  label:"Leave Requests",  icon:CalendarDays     },
  {id:"my-complaint",    label:"My Complaints",   icon:MessageSquareWarning},
  {id:"mess-menu",       label:"Mess Menu",       icon:Utensils         },
  {id:"visitor-request", label:"Visitor Request", icon:UserCheck        },
  {id:"ai-safety",       label:"AI Safety Monitor", icon:Brain},
  {id:"notifications",   label:"Notifications",   icon:Bell             },
  {id:"profile",         label:"Profile",         icon:UserCircle       },
];

export const ADMIN_TITLES = {
  dashboard:"Dashboard", wardens:"Warden Management", hostels:"Hostel Blocks",
  "all-students":"All Students", complaints:"Complaint Management",
  "mess-utility":"Mess Feedback & Utility Monitoring", reports:"Reports",
  "ai-safety":"AI Safety Monitor",
  notifications:"Notifications", profile:"Profile",
};

export const WARDEN_TITLES = {
  dashboard:"Dashboard", students:"Student Management", rooms:"Room Management",
  attendance:"Attendance Tracking", leave:"Leave Requests", complaints:"Complaint Management",
  visitors:"Visitor Verification", "mess-menu":"Daily Mess Menu Management", mess:"Mess Analytics", resources:"Utility Monitoring",
  "ai-safety":"AI Safety Monitor",
  notifications:"Notifications", profile:"Profile",
};

export const STUDENT_TITLES = {
  home:"My Home", "my-attendance":"My Attendance", "leave-requests":"Leave Requests",
  "my-complaint":"My Complaints", "mess-menu":"Mess Menu", "visitor-request":"Visitor Request",
  "ai-safety":"AI Safety Monitor",
  notifications:"Notifications", profile:"Profile",
};
