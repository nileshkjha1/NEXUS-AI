import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { EmployeeDashboard } from './pages/EmployeeDashboard';
import { AgentDashboard } from './pages/AgentDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { CreateIncidentPage } from './pages/CreateIncidentPage';
import { IncidentDetailPage } from './pages/IncidentDetailPage';
import { AIResolutionDesk } from './pages/AIResolutionDesk';
import { UserManagementPage } from './pages/UserManagementPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';

const MainApplication = () => {
  const { isAuthenticated, loading, isEmployee, isAgent, isAdmin } = useAuth();
  const [authView, setAuthView] = useState('login'); // 'login' or 'register'
  const [currentView, setCurrentView] = useState('');
  const [selectedTicketId, setSelectedTicketId] = useState(null);

  // Set default view on login based on user role
  useEffect(() => {
    if (isAuthenticated) {
      if (isEmployee) {
        setCurrentView('employee-dashboard');
      } else if (isAgent) {
        setCurrentView('agent-dashboard');
      } else if (isAdmin) {
        setCurrentView('admin-dashboard');
      }
    }
  }, [isAuthenticated, isEmployee, isAgent, isAdmin]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-primary)',
      }}>
        <div className="spinner" />
      </div>
    );
  }

  // Unauthenticated screen
  if (!isAuthenticated) {
    if (authView === 'register') {
      return <RegisterPage onNavigateLogin={() => setAuthView('login')} />;
    }
    return <LoginPage onNavigateRegister={() => setAuthView('register')} />;
  }

  // Handle ticket selection
  const handleSelectTicket = (id) => {
    setSelectedTicketId(id);
    setCurrentView('ticket-detail');
  };

  const handleIncidentCreated = (newTicketId) => {
    setSelectedTicketId(newTicketId);
    setCurrentView('ticket-detail');
  };

  // Render view
  const renderView = () => {
    switch (currentView) {
      case 'employee-dashboard':
      case 'my-tickets':
        return (
          <EmployeeDashboard
            onNavigateCreate={() => setCurrentView('create-ticket')}
            onSelectTicket={handleSelectTicket}
          />
        );

      case 'agent-dashboard':
      case 'all-tickets':
        return isAgent || isAdmin ? (
          <AgentDashboard
            onSelectTicket={handleSelectTicket}
            onNavigateCreate={() => setCurrentView('create-ticket')}
          />
        ) : (
          <EmployeeDashboard
            onNavigateCreate={() => setCurrentView('create-ticket')}
            onSelectTicket={handleSelectTicket}
          />
        );

      case 'admin-dashboard':
        return isAdmin ? (
          <AdminDashboard
            onSelectTicket={handleSelectTicket}
            onNavigateCreate={() => setCurrentView('create-ticket')}
          />
        ) : (
          <AgentDashboard
            onSelectTicket={handleSelectTicket}
            onNavigateCreate={() => setCurrentView('create-ticket')}
          />
        );

      case 'create-ticket':
        return (
          <CreateIncidentPage
            onIncidentCreated={handleIncidentCreated}
            onCancel={() => {
              if (isEmployee) setCurrentView('employee-dashboard');
              else if (isAgent) setCurrentView('agent-dashboard');
              else setCurrentView('admin-dashboard');
            }}
          />
        );

      case 'ticket-detail':
        return (
          <IncidentDetailPage
            ticketId={selectedTicketId}
            onBack={() => {
              if (isEmployee) setCurrentView('employee-dashboard');
              else if (isAgent) setCurrentView('agent-dashboard');
              else setCurrentView('admin-dashboard');
            }}
          />
        );

      case 'ai-assistant':
        return <AIResolutionDesk />;

      case 'users':
        return isAdmin ? <UserManagementPage /> : <div>Unauthorized</div>;

      case 'analytics':
        return isAdmin ? <AnalyticsPage /> : <div>Unauthorized</div>;

      case 'settings':
        return <SettingsPage />;

      default:
        return (
          <EmployeeDashboard
            onNavigateCreate={() => setCurrentView('create-ticket')}
            onSelectTicket={handleSelectTicket}
          />
        );
    }
  };

  return (
    <div className="app-container">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      <main className="main-content">{renderView()}</main>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <MainApplication />
    </AuthProvider>
  );
}

export default App;
