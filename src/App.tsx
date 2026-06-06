// src/App.tsx
import Navigation from './components/Navigation';
import Sidebar, { type ModalID } from './components/Sidebar';
import ModalContainer from './components/ModalContainer';
import styles from './App.module.css';

import { useState } from 'react';

function App() {
  const [activeView, setActiveView] = useState<ModalID | null>(null);

  const handleAction = (modalId: ModalID) => {
  setActiveView(modalId);
};

  return (
    <div className={styles.appContainer}>
      <header className={styles.header}>
        <Navigation />
      </header>

      <aside className={styles.mainLayout}>
        <Sidebar
          onAction={handleAction}
          activeView={activeView} // Pass the state here
        />
      </aside>

      {activeView && (
        <ModalContainer onClose={() => setActiveView(null)}>
          <h2>{activeView}</h2>
          <button onClick={() => setActiveView(null)}>Close</button>
        </ModalContainer>
      )}
    </div>
  );
}

export default App;