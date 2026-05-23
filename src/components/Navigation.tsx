export default function TopNav() {
    return (
        <header style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 'var(--spacing-md)',
            padding: 'var(--spacing-sm)',
            borderBottom: 'var(--border-subtle)',
            background: 'var(--background-surface)'
        }}>
            <div>
                <h3>CONSTELLATE</h3>
            </div>
            <nav style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                <span>Insights</span>
                <span>Settings</span>
                <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'var(--accent-hightlight)'
                }}>KM</div>
            </nav>
        </header>
    );
}