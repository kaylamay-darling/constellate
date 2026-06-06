import Navigation from './components/Navigation';
import Sidebar, { type ModalID } from './components/Sidebar';
import ModalContainer from './components/ModalContainer';
import ToolWrapper from './components/ToolWrapper';

import Journal from './components/Journal';

import styles from './App.module.css';

import { useState, type ReactNode } from 'react';

const TOOL_LABELS: Record<ModalID, string> = {
  'journal': 'Journal',
  'sobriety-manage': 'Manage Addictions',
  'sobriety-track': 'Sobriety Tracking',
  'rescue-aid': 'Rescue Aid',
};

const ManageSobriety = () => (
  <div>
    <p>Manage your sobriety plans here.</p>
  </div>
);

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

function App() {
  const [activeView, setActiveView] = useState<ModalID | null>(null);

  const handleAction = (modalId: ModalID) => {
    setActiveView(modalId);
  };

  const renderTool = (): ReactNode => {
    switch (activeView) {
      case 'journal': return <Journal />;
      case 'sobriety-manage': return <ManageSobriety />;
      case 'sobriety-track': return <SobrietyTracking />;
      case 'rescue-aid': return <RescueAid />;
      default: return null;
    }
  };

  const toolLabel = activeView ? TOOL_LABELS[activeView] : '';

  return (
    <div className={styles.appContainer}>
      <header className={styles.header}>
        <Navigation />
      </header>

      <aside className={styles.mainLayout}>
        <Sidebar
          onAction={handleAction}
          activeView={activeView}
        />
      </aside>

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
    </div>
  );
}

export default App;