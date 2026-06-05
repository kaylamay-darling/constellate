// src/components/Sidebar.tsx
import GlassContainer from './GlassContainer';

export default function Sidebar() {
    return (
        <GlassContainer
            style={{
                width: '240px',
                height: '100%',
                padding: 'var(--spacing-md)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--spacing-md)',
            }}
        >
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Constellations</a>
                <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Journal</a>
                <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Analytics</a>
            </nav>
        </GlassContainer>
    );
}