import GlassContainer from './GlassContainer';

export default function Navigation() {
    return (
        <GlassContainer
            className="glass-nav"
            style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto 1fr',
                alignItems: 'center',
                padding: 'var(--spacing-sm) var(--spacing-lg)',
                position: 'sticky',
                top: 0,
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                <div style={{
                    width: '20px',
                    height: '20px',
                    background: 'var(--accent-highlight)',
                    borderRadius: '2px'
                }} />
                <h3 style={{ margin: 0 }}>CONSTELLATE</h3>
            </div>

            <nav style={{
                display: 'flex',
                gap: 'var(--spacing-lg)',
                color: 'var(--text-muted)'
            }}>
                <span>Asterism</span>
                <span>Support</span>
            </nav>

            <div style={{
                justifySelf: 'end',
                color: 'var(--text-primary)',
                fontWeight: 600,
                cursor: 'pointer'
            }}>
                Sign In
            </div>
        </GlassContainer>
    );
}