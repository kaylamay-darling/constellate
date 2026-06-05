// src/App.tsx
import Navigation from './components/Navigation';
import Sidebar from './components/Sidebar';
import styles from './App.module.css';

function App() {
  return (
    <div className={styles.appContainer}>
      <header className={styles.header}>
        <Navigation />
      </header>

      <aside className={styles.mainLayout}>
        <Sidebar />
      </aside>
    </div>
  );
}

export default App;