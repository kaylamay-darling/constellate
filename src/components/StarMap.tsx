import { useEffect, useState, useRef } from 'react';
import { fetchStarMap, type ConstellationData, type StarData, type EdgeData } from '../lib/starMapService';
import styles from './StarMap.module.css';

const GRAVEYARD_RADIUS = 900;
const STAR_BASE_SIZE = 6;
const STAR_SIZE_SCALE = 4;

function interpolateColor(t: number): string {
    const r = Math.round(180 + t * 75);
    const g = Math.round(210 - t * 130);
    const b = Math.round(255 - t * 200);
    return `rgb(${r}, ${g}, ${b})`;
}

function twinkleDuration(anxiety: number): number {
    return 6 - anxiety * 5;
}

function starGlow(brightness: number, color: string): string {
    const intensity = 4 + brightness * 12;
    return `0 0 ${intensity}px ${color}, 0 0 ${intensity * 2}px ${color}`;
}

interface EdgeLineProps {
    from: StarData;
    to: StarData;
    opacity: number;
    offsetX: number;
    offsetY: number;
}

function EdgeLine({ from, to, opacity, offsetX, offsetY }: EdgeLineProps) {
    const x1 = from.x + offsetX;
    const y1 = from.y + offsetY;
    const x2 = to.x + offsetX;
    const y2 = to.y + offsetY;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    return (
        <div
            className={styles.edge}
            style={{
                left: x1,
                top: y1,
                width: length,
                opacity: Math.max(0.08, opacity),
                transform: `rotate(${angle}deg)`,
                transformOrigin: '0 50%',
            }}
        />
    );
}

interface StarNodeProps {
    star: StarData;
    offsetX: number;
    offsetY: number;
    onClick: (star: StarData) => void;
    dimmed?: boolean;
}

function StarNode({ star, offsetX, offsetY, onClick, dimmed = false }: StarNodeProps) {
    const color = interpolateColor(star.color);
    const size = STAR_BASE_SIZE + star.size * STAR_SIZE_SCALE;
    const duration = twinkleDuration(star.twinkle);
    const glow = starGlow(star.brightness, color);

    return (
        <div
            className={styles.star}
            style={{
                left: star.x + offsetX - size / 2,
                top: star.y + offsetY - size / 2,
                width: size,
                height: size,
                background: color,
                boxShadow: glow,
                opacity: dimmed ? 0.3 + star.brightness * 0.25 : 0.6 + star.brightness * 0.4,
                animationDuration: `${duration}s`,
            }}
            onClick={() => onClick(star)}
        />
    );
}

interface JournalModalProps {
    star: StarData;
    onClose: () => void;
}

function JournalModal({ star, onClose }: JournalModalProps) {
    const date = new Date(star.created_at).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.journalModal} onClick={e => e.stopPropagation()}>
                <div className={styles.modalDate}>{date}</div>
                <p className={styles.modalContent}>
                    {star.entry.content || <em>No entry written.</em>}
                </p>
                <button className={styles.modalClose} onClick={onClose}>✕</button>
            </div>
        </div>
    );
}

function renderConstellation(
    constellation: ConstellationData,
    offsetX: number,
    offsetY: number,
    onStarClick: (star: StarData) => void,
    dimmed: boolean
) {
    const starById = Object.fromEntries(constellation.stars.map(s => [s.id, s]));

    return (
        <div key={constellation.id} className={styles.constellation}>
            {constellation.edges.map((edge: EdgeData) => {
                const from = starById[edge.fromId];
                const to = starById[edge.toId];
                if (!from || !to) return null;
                return (
                    <EdgeLine
                        key={`${edge.fromId}-${edge.toId}`}
                        from={from}
                        to={to}
                        opacity={dimmed ? edge.opacity * 0.3 : edge.opacity}
                        offsetX={offsetX}
                        offsetY={offsetY}
                    />
                );
            })}
            {constellation.stars.map((star: StarData) => (
                <StarNode
                    key={star.id}
                    star={star}
                    offsetX={offsetX}
                    offsetY={offsetY}
                    onClick={onStarClick}
                    dimmed={dimmed}
                />
            ))}
        </div>
    );
}

export function StarMap() {
    const [constellations, setConstellations] = useState<ConstellationData[]>([]);
    const [selectedStar, setSelectedStar] = useState<StarData | null>(null);
    const [loading, setLoading] = useState(true);
    const [viewportCenter, setViewportCenter] = useState({ x: 0, y: 0 });
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    
    const containerRef = useRef<HTMLDivElement>(null);
    const lastMousePos = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const updateCenter = () => {
            if (containerRef.current) {
                setViewportCenter({
                    x: containerRef.current.clientWidth / 2,
                    y: containerRef.current.clientHeight / 2,
                });
            }
        };
        updateCenter();
        window.addEventListener('resize', updateCenter);
        return () => window.removeEventListener('resize', updateCenter);
    }, []);

    useEffect(() => {
        fetchStarMap()
            .then(setConstellations)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        lastMousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        const dx = e.clientX - lastMousePos.current.x;
        const dy = e.clientY - lastMousePos.current.y;
        setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
        lastMousePos.current = { x: e.clientX, y: e.clientY };
    };

    if (loading) {
        return (
            <div className={styles.loading}>
                <div className={styles.loadingDot} />
                <div className={styles.loadingDot} />
                <div className={styles.loadingDot} />
            </div>
        );
    }

    const active = constellations.find(c => c.isActive);
    const graveyard = constellations.filter(c => !c.isActive);

    const activeOffsetX = (active ? viewportCenter.x - active.centroid.x : viewportCenter.x) + offset.x;
    const activeOffsetY = (active ? viewportCenter.y - active.centroid.y : viewportCenter.y) + offset.y;

    const graveyardPositions = graveyard.map((c, i) => {
        const angle = (i / graveyard.length) * 360 - 90;
        const rad = (angle * Math.PI) / 180;
        const cx = viewportCenter.x + Math.cos(rad) * GRAVEYARD_RADIUS + offset.x;
        const cy = viewportCenter.y + Math.sin(rad) * GRAVEYARD_RADIUS + offset.y;
        return { constellation: c, offsetX: cx - c.centroid.x, offsetY: cy - c.centroid.y };
    });

    return (
        <div 
            className={styles.container} 
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
            <div className={styles.map}>
                {graveyardPositions.map(({ constellation, offsetX, offsetY }) =>
                    renderConstellation(constellation, offsetX, offsetY, setSelectedStar, true)
                )}

                {active && renderConstellation(active, activeOffsetX, activeOffsetY, setSelectedStar, false)}

                {!active && !loading && (
                    <div className={styles.emptyState}>
                        <p>Your constellation awaits.<br />Archive your first journal entry to begin.</p>
                    </div>
                )}
            </div>

            {selectedStar && (
                <JournalModal
                    star={selectedStar}
                    onClose={() => setSelectedStar(null)}
                />
            )}
        </div>
    );
}