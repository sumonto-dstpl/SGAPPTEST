import { useState } from 'react';
import { Building2, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SnackbarProvider } from './contexts/SnackbarContext';
import { DataProvider, useData } from './store/DataContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Markets from './pages/Markets';
import MarketDetail from './pages/MarketDetail';
import Garages from './pages/Garages';
import Shops from './pages/Shops';
import Backup from './pages/Backup';
import Settings from './pages/Settings';
import { Market, Page } from './types';

// ─── Loading / Error screens ──────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
      <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
        <Building2 size={28} className="text-white" />
      </div>
      <div className="text-center">
        <h1 className="text-lg font-bold text-gray-800">Property &amp; Garage Management</h1>
        <p className="text-sm text-gray-500 mt-1">Loading your data...</p>
      </div>
      <Loader2 size={24} className="text-blue-600 animate-spin mt-2" />
    </div>
  );
}

function ErrorScreen({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
      <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center">
        <AlertTriangle size={28} className="text-red-500" />
      </div>
      <div className="text-center max-w-sm">
        <h1 className="text-lg font-bold text-gray-800">Error Loading Data</h1>
        <p className="text-sm text-gray-500 mt-1">{message}</p>
      </div>
      <button onClick={onRetry}
        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
        <RefreshCw size={15} /> Retry
      </button>
    </div>
  );
}

// ─── Main app (authenticated) ─────────────────────────────────────────────────

function AppInner() {
  const { loading, error, refresh } = useData();
  const [page, setPage]               = useState<Page>('dashboard');
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);

  if (loading) return <LoadingScreen />;
  if (error)   return <ErrorScreen message={error} onRetry={refresh} />;

  const navigate = (p: Page) => {
    setPage(p);
    if (p !== 'market-detail') setSelectedMarket(null);
  };

  const viewMarket = (market: Market) => {
    setSelectedMarket(market);
    setPage('market-detail');
  };

  const renderPage = () => {
    switch (page) {
      case 'dashboard':    return <Dashboard onNavigate={navigate} />;
      case 'markets':      return <Markets onViewMarket={viewMarket} />;
      case 'market-detail': return selectedMarket
        ? <MarketDetail market={selectedMarket} onBack={() => navigate('markets')} />
        : <Markets onViewMarket={viewMarket} />;
      case 'garages':      return <Garages />;
      case 'shops':        return <Shops />;
      case 'backup':       return <Backup />;
      case 'settings':     return <Settings />;
      default:             return <Dashboard onNavigate={navigate} />;
    }
  };

  return (
    <Layout currentPage={page} onNavigate={navigate}>
      {renderPage()}
    </Layout>
  );
}

// ─── Auth gate ────────────────────────────────────────────────────────────────

function AuthGate() {
  const { user } = useAuth();
  if (!user) return <Login />;
  return (
    <DataProvider>
      <AppInner />
    </DataProvider>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <AuthProvider>
      <SnackbarProvider>
        <AuthGate />
      </SnackbarProvider>
    </AuthProvider>
  );
}
