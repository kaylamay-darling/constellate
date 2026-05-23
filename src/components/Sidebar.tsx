export default function Sidebar() {
    return (
        <aside style={{ 
            width: '250px', 
            background: 'var(--backgroud-surface)', 
            borderRight: 'var(--border-subtle)',
            padding: 'var(--spacing-md)'
        }}>
            <nav>Journal Entry</nav>
            {/* You will add more nav items here */}
        </aside>
    );
}