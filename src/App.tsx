import Navigation from './components/Navigation';
import Sidebar, { type ModalID } from './components/Sidebar';
import ModalContainer from './components/ModalContainer';
import ToolWrapper from './components/ToolWrapper';
import WelcomeSection from './components/WelcomeSection';

import { StarMap } from './components/StarMap';

import Journal from './components/Journal';
import { AddictionManager } from './components/AddictionManager';

import styles from './App.module.css';

import { useState, useEffect, type ReactNode } from 'react';

import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/auth';
import { LoginModal } from './components/LoginModal';
import { LogoutModal } from './components/LogoutModal';

const TOOL_LABELS: Record<ModalID, string> = {
  'journal': 'Journal',
  'sobriety-manage': 'Manage Addictions',
  'sobriety-track': 'Sobriety Tracking',
  'rescue-aid': 'Rescue Aid',
};


const SobrietyTracking = () => (
  <div>
    <p>Track your sobriety progress here.</p>
  </div>
);

const RescueAid = () => (
  <div>
    <p>Open rescue resources here.</p>
  </div>
);

interface AuthenticatedSidebarProps {
  activeView: ModalID | null;
  onAction: (modalId: ModalID) => void;
  onLogout: () => void;
}

function AuthenticatedSidebar({ activeView, onAction, onLogout }: AuthenticatedSidebarProps) {
  const { session } = useAuth();

  useEffect(() => {
    if (!session) {
      onLogout();
    }
  }, [session, onLogout]);

  if (!session) {
    return null;
  }

  return (
    <Sidebar
      onAction={onAction}
      activeView={activeView}
    />
  );
}

function App() {
  const [activeView, setActiveView] = useState<ModalID | null>(null);

  const handleAction = (modalId: ModalID) => {
    setActiveView(modalId);
  };

  const renderTool = (): ReactNode => {
    switch (activeView) {
      case 'journal': return <Journal
        onClose={() => setActiveView(null)}
        onEntrySaved={() => setStarMapKey(k => k + 1)}
      />;
      case 'sobriety-manage': return <AddictionManager />;
      case 'sobriety-track': return <SobrietyTracking />;
      case 'rescue-aid': return <RescueAid />;
      default: return null;
    }
  };

  const toolLabel = activeView ? TOOL_LABELS[activeView] : '';

  const [starMapKey, setStarMapKey] = useState(0);

  return (
    <AuthProvider>
      <div className={styles.appContainer}>
        <StarMap key={starMapKey} />
        <header className={styles.header}>
          <Navigation />
        </header>

        <div className={styles.mainLayout}>
          <aside>
            <AuthenticatedSidebar
              activeView={activeView}
              onAction={handleAction}
              onLogout={() => setActiveView(null)}
            />
          </aside>
          <main>
            <WelcomeSection />
            {activeView && (
              <ModalContainer onClose={() => setActiveView(null)}>
                <ToolWrapper
                  label={toolLabel}
                  onClose={() => setActiveView(null)}
                >
                  {renderTool()}
                </ToolWrapper>
              </ModalContainer>
            )}
          </main>
        </div>
        <LoginModal />
        <LogoutModal />
      </div>
    </AuthProvider>
  );
}

export default App;