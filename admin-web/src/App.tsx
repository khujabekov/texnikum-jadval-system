import { useState, useEffect } from 'react';
import { Sidebar, type PageId } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardPage } from './pages/DashboardPage';
import { GroupsPage } from './pages/GroupsPage';
import { SchedulePage } from './pages/SchedulePage';
import { StudentsPage } from './pages/StudentsPage';
import { LoginPage } from './pages/LoginPage';
import { adminService } from './services/adminService';

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setIsAuthenticated(adminService.isAuthenticated());
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    adminService.logout();
    setIsAuthenticated(false);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setRefreshKey((prev) => prev + 1);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  const pageTitles: Record<PageId, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Boshqaruv Paneli',
      subtitle: "Texnikum o'quv jarayoni va dars jadvali statistikasi",
    },
    groups: {
      title: 'Guruhlar Boshqaruvi',
      subtitle: 'Akademik guruhlar, kurslar va yo\'nalishlar ro\'yxati',
    },
    schedule: {
      title: 'Haftalik Dars Jadvali',
      subtitle: 'Haftaning 6 kuni bo\'yicha darslar va xonalar taqsimoti',
    },
    students: {
      title: 'Talabalar & JSHSHIR',
      subtitle: 'Guruhlar kesimida 14 xonali JSHSHIR biriktirish va ro\'yxatdan yuklash',
    },
  };

  const currentMeta = pageTitles[currentPage];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 antialiased font-sans">
      {/* Left Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          title={currentMeta.title}
          subtitle={currentMeta.subtitle}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />

        <main key={refreshKey} className="flex-1 flex flex-col min-h-0 bg-slate-50 overflow-hidden">
          {currentPage === 'dashboard' && <DashboardPage onNavigate={setCurrentPage} />}
          {currentPage === 'groups' && <GroupsPage />}
          {currentPage === 'schedule' && <SchedulePage />}
          {currentPage === 'students' && <StudentsPage />}
        </main>
      </div>
    </div>
  );
}

export default App;
