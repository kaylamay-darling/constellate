import type { ReactNode } from 'react';

interface GlassContainerProps {
    children: ReactNode;
    className?: string;
    style?: React.CSSProperties;onClick?: () => void;
}

export default function GlassContainer({ children, className = '', style, onClick }: GlassContainerProps) {
    return (
        <div
            className={`glass-panel ${className}`}
            style={style}
            onClick={onClick}
        >
            {children}
        </div>
    );
}