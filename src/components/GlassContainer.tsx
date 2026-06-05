import type { ReactNode } from 'react';

interface GlassContainerProps {
    children: ReactNode;
    className?: string;
    style?: React.CSSProperties;
}

export default function GlassContainer({ children, className = '', style }: GlassContainerProps) {
    return (
        <div
            className={`glass-panel ${className}`}
            style={style}
        >
            {children}
        </div>
    );
}