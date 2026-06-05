import Navigation from './components/Navigation';
import Sidebar from './components/Sidebar';

function App() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden'
    }}>

      <header style={{ padding: 'var(--spacing-md)' }}>
        <Navigation />
      </header>

      <aside style={{
        padding: '0 var(--spacing-md) var(--spacing-md) var(--spacing-md)',
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Sidebar />
      </aside>
    </div>
  );
}

export default App;