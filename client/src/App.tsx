import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "./pages/user/not-found"; // Correct path;
import NotificationPanel from "./pages/user/NotificationPanel";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { WalletProvider } from "./context/WalletContext";
import { ChatProvider } from "./context/ChatContext";
import { NotificationProvider } from "./context/NotificationContext";
import HomePage from "./pages/user/HomePage";
import LoginPage from "./pages/user/LoginPage";
import RegisterPage from "./pages/user/RegisterPage";
import PersonalDashboardPage from "./pages/user/PersonalDashboardPage";
import ChamasDashboardPage from "./pages/user/ChamasDashboardPage";
import ChamaDetailPage from "./pages/user/ChamaDetailPage";
import MessagesPage from "./pages/user/MessagesPage";
import WalletPage from "./pages/user/WalletPage";
import MarketplacePage from "./pages/user/MarketplacePage";
import ProductDetailPage from "./pages/user/ProductDetailPage";
import LearningHubPage from "./pages/user/LearningHubPage";
import SettingsPage from "./pages/user/SettingsPage";
import MindMapPage from "./pages/MindMapPage";
// Chama Dashboard Pages
import ChamaDashboard from "@/pages/chama/Dashboard";
import ChamaMembers from "@/pages/chama/Members";
import ChamaContributions from "@/pages/chama/Contributions";
import ChamaMeetings from "@/pages/chama/Meetings";
import ChamaDocuments from "@/pages/chama/Documents";
import ChamaSettings from "@/pages/chama/Settings";

// Admin Dashboard Pages
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminUsers from "@/pages/admin/Users";
import AdminChamas from "@/pages/admin/Chamas";
import AdminReports from "@/pages/admin/Reports";
import AdminTransactions from "@/pages/admin/Transactions";
import AdminAIConsole from "@/pages/admin/AIConsole";
import AdminBackup from "@/pages/admin/Backup";
import AdminSecurity from "@/pages/admin/Security";
import AdminSettings from "@/pages/admin/Settings";
import ApiSettings from "@/pages/admin/ApiSettings";
import AdminMarketplace from "@/pages/admin/Marketplace";
import Messages from "@/pages/admin/Messages";
import AIAssistant from "@/components/dashboard/AIAssistant";
import UserLayout from "@/components/layout/UserLayout";
import MyCartPage from "./pages/user/MyCartPage";
import MyWishlistPage from "./pages/user/MyWishlistPage";
import EditItemPage from "./pages/marketplace/EditItemPage";

function AuthenticatedRoutes() {
  return (
    <Switch>
      <Route path="/mindmap">
        <MindMapPage />
      </Route>
      <Route path="/chamas">
        <ChamasDashboardPage />
      </Route>
      {/* Chama Routes */}
      <Route path="/chamas/:id">
        {(params) => <ChamaDashboard chamaId={params.id} />}
      </Route>
      <Route path="/chamas/:id/members">
        {(params) => <ChamaMembers chamaId={params.id} />}
      </Route>
      <Route path="/chamas/:id/contributions">
        {(params) => <ChamaContributions chamaId={params.id} />}
      </Route>
      <Route path="/chamas/:id/meetings">
        {(params) => <ChamaMeetings chamaId={params.id} />}
      </Route>
      <Route path="/chamas/:id/documents">
        {(params) => <ChamaDocuments chamaId={params.id} />}
      </Route>
      <Route path="/chamas/:id/settings">
        {(params) => <ChamaSettings chamaId={params.id} />}
      </Route>
      <Route path="/messages">
        <MessagesPage />
      </Route>
      <Route path="/wallet">
        <WalletPage />
      </Route>
      <Route path="/marketplace">
        <MarketplacePage />
      </Route>
      <Route path="/marketplace/cart">
        <MyCartPage />
      </Route>
      <Route path="/marketplace/wishlist">
        <MyWishlistPage />
      </Route>
      <Route path="/marketplace/:id">
        {(params) => <ProductDetailPage id={params.id} />}
      </Route>
      <Route path="/marketplace/:id/edit">
        {(params) => <EditItemPage id={params.id} />}
      </Route>
      <Route path="/learning">
        <LearningHubPage />
      </Route>
      <Route path="/ai-assistant">
        <div className="h-screen">
          <UserLayout title="AI Assistant">
            <div className="max-w-4xl mx-auto">
              <AIAssistant />
            </div>
          </UserLayout>
        </div>
      </Route>
      <Route path="/settings">
        <SettingsPage />
      </Route>
      <Route path="/NotificationPanel">
        <NotificationPanel />
      </Route>
      <Route path="/">
        <PersonalDashboardPage />
      </Route>
        {/* Admin Routes */}
        
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/admin/users" component={AdminUsers} />
        <Route path="/admin/chamas" component={AdminChamas} />
        <Route path="/admin/reports" component={AdminReports} />
        <Route path="/admin/transactions" component={AdminTransactions} />
        <Route path="/admin/marketplace" component={AdminMarketplace} />
        <Route path="/admin/messages" component={Messages} />
        <Route path="/admin/ai-console" component={AdminAIConsole} />
        <Route path="/admin/backup" component={AdminBackup} />
        <Route path="/admin/security" component={AdminSecurity} />
        <Route path="/admin/settings" component={AdminSettings} />
        <Route path="/admin/api-settings" component={ApiSettings} />
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

function UnauthenticatedRoutes() {
  return (
    <Switch>
      <Route path="/login">
        <LoginPage />
      </Route>
      <Route path="/register">
        <RegisterPage />
      </Route>
      <Route path="/">
        <HomePage />
      </Route>
      <Route>
        <LoginPage redirectTo="/" />
      </Route>
    </Switch>
  );
}

// This component handles routing based on authentication state
function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex h-screen w-full items-center justify-center">Loading...</div>;
  }

  return (
    <>
      {isAuthenticated && <NotificationPanel />}
      {isAuthenticated ? <AuthenticatedRoutes /> : <UnauthenticatedRoutes />}
    </>
  );
}

// Main App component with all providers
function App() {
  return (
    <AuthProvider>
      <WalletProvider>
        <ChatProvider>
          <NotificationProvider>
            <TooltipProvider>
              <Toaster />
              <AppRoutes />
            </TooltipProvider>
          </NotificationProvider>
        </ChatProvider>
      </WalletProvider>
    </AuthProvider>
  );
}

export default App;
