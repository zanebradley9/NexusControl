import {
  LayoutDashboard,
  Terminal,
  ScrollText,
  BookOpen,
  MessageSquare,
  ClipboardList,
  ShieldCheck,
  Handshake,
  Zap,
  KeyRound,
} from "lucide-react";

export const navItems = [
  {
    label: "Core",
    icon: LayoutDashboard,
    children: [
      { icon: LayoutDashboard, label: "Dashboard", path: "/" },
      { icon: Terminal, label: "Scripts", path: "/scripts" },
      { icon: ScrollText, label: "Logs", path: "/logs" },
      { icon: MessageSquare, label: "Chat", path: "/chat" },
      { icon: ClipboardList, label: "Audit Logs", path: "/audit-logs" },
      { icon: ShieldCheck, label: "Permissions", path: "/permissions" },
      { icon: Handshake, label: "Partnerships", path: "/partnerships" },
      { icon: BookOpen, label: "API Docs", path: "/api-docs" },
      { icon: Zap, label: "Subscription", path: "/subscription" },
    ],
  },

  {
    label: "AI",
    icon: Terminal,
    children: [
      { label: "Jarvis", path: "/dashboards/jarvis" },
      { label: "AI Integrations", path: "/ai-integrations" },
    ],
  },

  {
    label: "Game Store",
    icon: ClipboardList,
    children: [
      { label: "Home", path: "/gamestore" },
      { label: "Guns", path: "/gamestore/guns" },
      { label: "Cars", path: "/gamestore/cars" },
      { label: "Create Skills 3D", path: "/gamestore/createskills3d" },
    ],
  },

  {
    label: "BookNook Studio",
    icon: BookOpen,
    children: [
      { label: "Dashboard", path: "/booknookstudio/dashboard" },
      { label: "Home", path: "/booknookstudio/home" },
      { label: "Library", path: "/booknookstudio/library" },
      { label: "Read Book", path: "/booknookstudio/readbook" },
      { label: "Write", path: "/booknookstudio/write" },
      { label: "Community", path: "/booknookstudio/community" },
      { label: "Events", path: "/booknookstudio/events" },
      { label: "Manage Events", path: "/booknookstudio/manage-events" },
      { label: "Orders", path: "/booknookstudio/orders" },
      { label: "Earnings", path: "/booknookstudio/earnings" },
      { label: "Profile", path: "/booknookstudio/profile" },
      { label: "Promotions", path: "/booknookstudio/promotions" },
      { label: "Showcase", path: "/booknookstudio/showcase" },
      { label: "Tools", path: "/booknookstudio/tools" },

      {
        label: "Admin",
        children: [
          { label: "Admin", path: "/booknookstudio/admin" },
          { label: "Analytics", path: "/booknookstudio/analytics" },
          { label: "Reporting", path: "/booknookstudio/adminreporting" },
          { label: "Settings", path: "/booknookstudio/settings" },
        ],
      },
    ],
  },

  {
    label: "Sentinel AI",
    icon: ShieldCheck,
    children: [
      { label: "Dashboard", path: "/sentinelai/sentinelaidashboard" },
      { label: "Incidents", path: "/sentinelai/incidents" },
      { label: "New Incident", path: "/sentinelai/newincident" },
      { label: "Incident Detail", path: "/sentinelai/incidentdetail" },
      { label: "Chat", path: "/sentinelai/sentinelaichat" },
      { label: "Register", path: "/sentinelai/register" },
    ],
  },

  {
    label: "Seth",
    icon: BookOpen,
    children: [
      { label: "Film Studio", path: "/seth/filmstudio" },
      { label: "Seth", path: "/seth/seth" },
    ],
  },

  {
    label: "NexusCode",
    icon: ScrollText,
    children: [
      { label: "Home", path: "/nexuscode/nexuscodehome" },
    ],
  },

  {
    label: "Authentication",
    icon: KeyRound,
    children: [
      { label: "Login", path: "/auth/login" },
      { label: "Signup", path: "/auth/signup" },
      { label: "Forgot Password", path: "/auth/forgotpassword" },
      { label: "Reset Password", path: "/auth/resetpassword" },
      { label: "Change Password", path: "/auth/changepassword" },
      { label: "Logout", path: "/auth/logout" },

      { label: "Sentinel Login", path: "/sentinelai/sentinelailogin" },
      { label: "Sentinel Forgot Password", path: "/sentinelai/sentinelaiforgotpassword" },
      { label: "Sentinel Reset Password", path: "/sentinelai/sentinelairesetpassword" },
    ],
  },
];