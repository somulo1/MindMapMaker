import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { WalletProvider } from "./context/WalletContext";
import { ChatProvider } from "./context/ChatContext";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import PersonalDashboardPage from "./pages/PersonalDashboardPage";
import ChamasDashboardPage from "./pages/ChamasDashboardPage";
import ChamaDetailPage from "./pages/ChamaDetailPage";
import MessagesPage from "./pages/MessagesPage";
import WalletPage from "./pages/WalletPage";
import MarketplacePage from "./pages/MarketplacePage";
import LearningHubPage from "./pages/LearningHubPage";
import SettingsPage from "./pages/SettingsPage";

function AuthenticatedRoutes() {
  return (
    <Switch>
      <Route path="/">
        <PersonalDashboardPage />
      </Route>
      <Route path="/chamas">
        <ChamasDashboardPage />
      </Route>
      <Route path="/chamas/:id">
        {(params) => <ChamaDetailPage id={params.id} />}
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
      <Route path="/learning">
        <LearningHubPage />
      </Route>
      <Route path="/settings">
        <SettingsPage />
      </Route>
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

function UnauthenticatedRoutes() {
  return (
    <Switch>
      <Route path="/">
        <HomePage />
      </Route>
      <Route path="/login">
        <LoginPage />
      </Route>
      <Route path="/register">
        <RegisterPage />
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

  return isAuthenticated ? <AuthenticatedRoutes /> : <UnauthenticatedRoutes />;
}

// Main App component with all providers
function App() {
  return (
    <AuthProvider>
      <WalletProvider>
        <ChatProvider>
          <TooltipProvider>
            <Toaster />
            <AppRoutes />
          </TooltipProvider>
        </ChatProvider>
      </WalletProvider>
    </AuthProvider>
  );
}

export default App;
