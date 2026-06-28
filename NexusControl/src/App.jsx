import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import AppLayout from '@/components/layout/AppLayout';
import Dashboard from '@/pages/Dashboard/Dashboards/Dashboard';
import Scripts from '@/pages/Dashboard/Dashboards/Scripts';
import ScriptDetail from '@/pages/Dashboard/Dashboards/ScriptDetail';
import Logs from '@/pages/Dashboard/Dashboards/Logs';
import Settings from '@/pages/Dashboard/Dashboards/Settings';
import ApiDocs from '@/pages/Dashboard/Dashboards/ApiDocs';
import Chat from '@/pages/Dashboard/Dashboards/Chat';
import AuditLogs from '@/pages/Dashboard/Dashboards/AuditLogs';
import Partnerships from  '@/pages/Dashboard/Dashboards/Partnerships';
import Permissions from '@/pages/Dashboard/Dashboards/Permissions';
import Feedback from '@/pages/Dashboard/Dashboards/Feedback';
import AIIntegrations from '@/pages/Dashboard/Dashboards/AI-Integrations';
import Support from '@/pages/Dashboard/Dashboards/Support';
import Contact from '@/pages/Dashboard/Dashboards/Contact';
import About from '@/pages/Dashboard/Dashboards/About';
import Subscription from '@/pages/Dashboard/Dashboards/Subscription';
import Login from "@/pages/auth/Login";
import Signup from "@/pages/auth/Signup";
import Logout from "@/pages/auth/logout";
import ForgotPassword from "@/pages/auth/forgotPassword";
import Checkout from "@/lib/Checkout";
import ProtectedRoute from "@/components/ProtectedRoute/ProtectedRoute";
import DashboardCode from "@/pages/Dashboard/Dashboards/DashboardCode";
import Jarvis from "@/pages/Dashboard/Dashboards/Jarvis";
import StoreSkills from "@/pages/Dashboard/Gamestore/StoreSkills";
import StoreGun from "@/pages/Dashboard/Gamestore/StoreGun";
import StoreCar from "@/pages/Dashboard/Gamestore/StoreCar";
import CreateSkills3D from "@/pages/Dashboard/Gamestore/CreateSkills3D";
import Admin from "@/pages/Dashboard/BookNookStudio/Admin";
import AdminReporting from "@/pages/Dashboard/BookNookStudio/AdminReporting";
import Analytics from "@/pages/Dashboard/BookNookStudio/Analytics";
import BookReviews from "@/pages/Dashboard/BookNookStudio/BookReviews";
import BookNookStudioSettings from "@/pages/Dashboard/BookNookStudio/BookNookStudioSettings";
import Community from "@/pages/Dashboard/BookNookStudio/Community";
import DashboardBookNookStudio from "@/pages/Dashboard/BookNookStudio/DashboardBookNookStudio";
import Earnings from "@/pages/Dashboard/BookNookStudio/Earnings";
import Events from "@/pages/Dashboard/BookNookStudio/Events";
import Home from "@/pages/Dashboard/BookNookStudio/Home";
import Library from "@/pages/Dashboard/BookNookStudio/Library";
import ManageEvents from "@/pages/Dashboard/BookNookStudio/ManageEvents";
import Orders from "@/pages/Dashboard/BookNookStudio/Orders";
import Proile from "@/pages/Dashboard/BookNookStudio/Profile";
import Promotions from "@/pages/Dashboard/BookNookStudio/Promotions";
import ReadBook from "@/pages/Dashboard/BookNookStudio/ReadBook";
import Showcase from "@/pages/Dashboard/BookNookStudio/Showcase";
import Tools from "@/pages/Dashboard/BookNookStudio/Tools";
import Write from "@/pages/Dashboard/BookNookStudio/Write";
import NexusCodeHome from "@/pages/Dashboard/NexusCode/NexusCodeHome";
import IncidentDetail from "@/pages/Dashboard/SentinelAI/IncidentDetail";
import Incidents from "@/pages/Dashboard/SentinelAI/Incidents";
import NewIncident from "@/pages/Dashboard/SentinelAI/NewIncident";
import Register from "@/pages/Dashboard/SentinelAI/Register"
import SentinelAIChat from "@/pages/Dashboard/SentinelAI/SentinelAIChat";
import SentinelAiDashboard from "@/pages/Dashboard/SentinelAI/SentinelAiDashboard";
import SentinelAIForgotPassword from "@/pages/Dashboard/SentinelAI/SentinelAIForgotPassword";
import SentinelAILogin from "@/pages/Dashboard/SentinelAI/SentinelAILogin";
import SentinelAIResetPassword from "@/pages/Dashboard/SentinelAI/SentinelAIResetPassword";
import FilmStudio from "@/pages/Dashboard/Seth/FilmStudio";
import SETH from "@/pages/Dashboard/Seth/SETH";
import Sidebar from "@/components/sidebar/Sidebar";

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-border border-t-primary rounded-full animate-spin" />
          <p className="text-xs text-muted-foreground font-mono-code">Initializing ControlHub...</p>
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/scripts" element={<ProtectedRoute><Scripts /></ProtectedRoute>} />
        <Route path="/scripts/:id" element={<ProtectedRoute><ScriptDetail /></ProtectedRoute>} />
        <Route path="/logs" element={<ProtectedRoute><Logs /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/api-docs" element={<ProtectedRoute><ApiDocs /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/audit-logs" element={<ProtectedRoute><AuditLogs /></ProtectedRoute>} />
        <Route path="/partnerships" element={<ProtectedRoute><Partnerships /></ProtectedRoute>} />
        <Route path="/permissions" element={<ProtectedRoute><Permissions /></ProtectedRoute>} />
        <Route path="/feedback" element={<ProtectedRoute><Feedback /></ProtectedRoute>} />
        <Route path="/ai-integrations" element={<ProtectedRoute><AIIntegrations /></ProtectedRoute>} />
        <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
        <Route path="/contact" element={<ProtectedRoute><Contact /></ProtectedRoute>} />
        <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
        <Route path="/subscription" element={<ProtectedRoute><Subscription /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/jarvis" element={<ProtectedRoute><Jarvis /></ProtectedRoute>} />
        <Route path="/dashboardcode" element={<ProtectedRoute><DashboardCode /></ProtectedRoute>} />
        <Route path="/gamestore" element={<ProtectedRoute><StoreSkills /></ProtectedRoute>} />
        <Route path="/gamestore/guns" element={<ProtectedRoute><StoreGun /></ProtectedRoute>} />
        <Route path="/gamestore/cars" element={<ProtectedRoute><StoreCar /></ProtectedRoute>} />
        <Route path="/gamestore/createskills3d" element={<ProtectedRoute><CreateSkills3D /></ProtectedRoute>} />
        <Route path="/booknookstudio/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
        <Route path="/booknookstudio/adminreporting" element={<ProtectedRoute><AdminReporting /></ProtectedRoute>} />
        <Route path="/booknookstudio/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
        <Route path="/booknookstudio/book-reviews" element={<ProtectedRoute><BookReviews /></ProtectedRoute>} />
        <Route path="/booknookstudio/settings" element={<ProtectedRoute><BookNookStudioSettings /></ProtectedRoute>} />
        <Route path="/booknookstudio/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
        <Route path="/booknookstudio/dashboard" element={<ProtectedRoute><DashboardBookNookStudio /></ProtectedRoute>} />
        <Route path="/booknookstudio/earnings" element={<ProtectedRoute><Earnings /></ProtectedRoute>} />
        <Route path="/booknookstudio/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
        <Route path="/booknookstudio/manage-events" element={<ProtectedRoute><ManageEvents /></ProtectedRoute>} />
        <Route path="/booknookstudio/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/booknookstudio/library" element={<ProtectedRoute><Library /></ProtectedRoute>} />
        <Route path="/booknookstudio/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
        <Route path="/booknookstudio/profile" element={<ProtectedRoute><Proile /></ProtectedRoute>} />
        <Route path="/booknookstudio/promotions" element={<ProtectedRoute><Promotions /></ProtectedRoute>} />
        <Route path="/booknookstudio/readbook" element={<ProtectedRoute><ReadBook /></ProtectedRoute>} />
        <Route path="/booknookstudio/showcase" element={<ProtectedRoute><Showcase /></ProtectedRoute>} />
        <Route path="/booknookstudio/tools" element={<ProtectedRoute><Tools /></ProtectedRoute>} />
        <Route path="/booknookstudio/write" element={<ProtectedRoute><Write /></ProtectedRoute>} />
        <Route path="/NexusCode/NexusCodeHome" element={<ProtectedRoute><NexusCodeHome /></ProtectedRoute>} />
        <Route path="/SentinelAI/IncidentDetail" element={<ProtectedRoute><IncidentDetail /></ProtectedRoute>} />
        <Route path="/SentinelAI/Incidents" element={<ProtectedRoute><Incidents /></ProtectedRoute>} />
        <Route path="/SentinelAI/NewIncident" element={<ProtectedRoute><NewIncident /></ProtectedRoute>} />
        <Route path="/SentinelAI/Register" element={<ProtectedRoute><Register /></ProtectedRoute>} />
        <Route path="/SentinelAI/SentinelAIChat" element={<ProtectedRoute><SentinelAIChat /></ProtectedRoute>} />
        <Route path="/SentinelAI/SentinelAiDashboard" element={<ProtectedRoute><SentinelAiDashboard /></ProtectedRoute>} />
        <Route path="/SentinelAI/SentinelAIForgotPassword" element={<ProtectedRoute><SentinelAIForgotPassword /></ProtectedRoute>} />
        <Route path="/SentinelAI/SentinelAILogin" element={<ProtectedRoute><SentinelAILogin /></ProtectedRoute>} />
        <Route path="/SentinelAI/SentinelAIResetPassword"element={<ProtectedRoute><SentinelAIResetPassword /></ProtectedRoute>} />
        <Route path="/Seth/FilmStudio"element={<ProtectedRoute><FilmStudio /></ProtectedRoute>} />
        <Route path="/Seth/SETH" element={<ProtectedRoute><SETH /></ProtectedRoute>} />
        <Route path="/auth/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/signup" element={<Signup />} />
        <Route path="/auth/logout" element={<Logout />} />
        <Route path="/components/sidebar/Sidebar" element={<Sidebar />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;