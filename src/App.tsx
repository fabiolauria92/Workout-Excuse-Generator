import React, { useEffect, useState } from 'react';
import { LayoutGrid, Dumbbell, Calendar, Target, Clock, Settings, Search, Bell } from 'lucide-react';
import { useUserPreferences } from './contexts/UserPreferencesContext';
import { useLocalStorage } from './contexts/LocalStorageContext';
import { useSearch } from './contexts/SearchContext';
import { useNotifications } from './contexts/NotificationsContext';
import { Overview } from './components/Overview';
import { GenerateExcuse } from './components/GenerateExcuse';
import { StatsDashboard } from './components/StatsDashboard';
import { AchievementsPanel } from './components/AchievementsPanel';
import { History } from './components/History';
import { SearchResults } from './components/SearchResults';
import { NotificationsPanel } from './components/NotificationsPanel';
import { SettingsPanel } from './components/SettingsPanel';
import { UserProfileForm } from './components/UserProfileForm';

type Tab = 'overview' | 'generate' | 'history' | 'stats' | 'achievements';

const SidebarItem = ({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) => (
  <button
    onClick={onClick}
    aria-current={active ? 'page' : undefined}
    className={`flex items-center space-x-3 w-full p-3 rounded-xl transition-colors ${
      active ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-orange-100 dark:text-gray-300 dark:hover:bg-gray-700'
    }`}
  >
    <Icon className="h-5 w-5" />
    <span className="font-medium">{label}</span>
  </button>
);

const readDarkMode = () => {
  try {
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) return JSON.parse(saved) as boolean;
  } catch {
    // fall through to the system preference
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

function App() {
  const { preferences } = useUserPreferences();
  const { streak } = useLocalStorage();
  const { searchQuery, setSearchQuery } = useSearch();
  const { unreadCount } = useNotifications();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [darkMode, setDarkMode] = useState(readDarkMode);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const renderContent = () => {
    switch (activeTab) {
      case 'generate':
        return <GenerateExcuse />;
      case 'history':
        return <History />;
      case 'stats':
        return <StatsDashboard />;
      case 'achievements':
        return <AchievementsPanel />;
      default:
        return (
          <Overview
            onViewAll={() => setActiveTab('history')}
            onEditProfile={() => setShowProfileForm(true)}
            onOpenSettings={() => setShowSettings(true)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex">
        <aside className="w-64 bg-white dark:bg-gray-800 min-h-screen p-4 flex flex-col">
          <div className="flex items-center space-x-2 mb-8">
            <Dumbbell className="h-8 w-8 text-orange-500" />
            <span className="text-xl font-bold dark:text-white">Excuse Generator</span>
          </div>

          <nav className="space-y-2 flex-1">
            <SidebarItem icon={LayoutGrid} label="Home" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
            <SidebarItem icon={Dumbbell} label="Generate Excuse" active={activeTab === 'generate'} onClick={() => setActiveTab('generate')} />
            <SidebarItem icon={Calendar} label="History" active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
            <SidebarItem icon={Target} label="Achievements" active={activeTab === 'achievements'} onClick={() => setActiveTab('achievements')} />
            <SidebarItem icon={Clock} label="Stats" active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} />
          </nav>

          <div className="space-y-2 pt-4 border-t dark:border-gray-700">
            <SidebarItem icon={Settings} label="Settings" onClick={() => setShowSettings(true)} />
          </div>
        </aside>

        <main className="flex-1 p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold dark:text-white">
                {preferences.nickname ? `Welcome back, ${preferences.nickname}!` : 'Welcome to Excuse Generator!'}
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                Current Streak: {streak} {streak === 1 ? 'day' : 'days'} of creative avoidance
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search excuses..."
                  aria-label="Search excuses"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="pl-10 pr-4 py-2 rounded-xl border dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 w-64"
                />
                <SearchResults />
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowNotifications((open) => !open)}
                  aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 relative"
                >
                  <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {showNotifications && <NotificationsPanel onClose={() => setShowNotifications(false)} />}
              </div>
            </div>
          </div>

          {renderContent()}
        </main>
      </div>

      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} darkMode={darkMode} onDarkModeChange={setDarkMode} />}

      {showProfileForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="max-w-2xl w-full">
            <UserProfileForm onClose={() => setShowProfileForm(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
