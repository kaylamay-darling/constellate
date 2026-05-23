import Navigation from './components/Navigation';
import Sidebar from './components/Sidebar';

function App() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh'
    }}>
      <Navigation />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />
        <main style={{ flex: 1, padding: 'var(--spacing-lg)' }}>
          <h1>Explore your stars</h1>
        </main>
      </div>
    </div>
  );
}

export default App;