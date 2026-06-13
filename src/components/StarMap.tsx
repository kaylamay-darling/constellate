import { useEffect, useState, useRef, useCallback, useLayoutEffect } from 'react';
import {
    fetchStarMap,
    deleteStar,
    buildEdges,
    type ConstellationData,
    type StarData,
    type EdgeData
} from '../lib/starMapService';
import styles from './StarMap.module.css';
import { ConfirmationModal } from './ConfirmationModal';


const GRAVEYARD_RADIUS = 900;
const STAR_BASE_SIZE = 6;
const STAR_SIZE_SCALE = 4;
const MIN_ZOOM = 0.3;
const MAX_ZOOM = 3;
const ZOOM_SENSITIVITY = 0.001;
const PADDING_LEFT = 100;
const PADDING_TOP = 30;

function interpolateColor(t: number): string {
    const r = Math.round(180 + t * 75);
    const g = Math.round(210 - t * 130);
    const b = Math.round(255 - t * 200);
    return `rgb(${r}, ${g}, ${b})`;
}

function twinkleDuration(anxiety: number): number {
    return - anxiety * 4;
}

function starGlow(brightness: number, color: string): string {
    const intensity = 3 + brightness * 7;
    return `0 0 ${intensity}px ${color}, 0 0 ${intensity * 2.5}px ${color}`;
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
                opacity: Math.max(0.25, opacity),
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
                opacity: dimmed ? 0.15 + star.brightness * 0.15 : 0.3 + star.brightness * 0.5,
                animationDuration: `${duration}s`,
            }}
            onClick={() => onClick(star)}
        />
    );
}

interface JournalModalProps {
    star: StarData;
    onClose: () => void;
    onDelete: (id: string) => void;
}

function JournalModal({ star, onClose, onDelete }: JournalModalProps) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const date = new Date(star.created_at).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    return (
        <>
            <div className={styles.modalOverlay} onClick={onClose}>
                <div className={styles.journalModal} onClick={e => e.stopPropagation()}>
                    <div className={styles.modalDate}>{date}</div>
                    <p className={styles.modalContent}>
                        {star.entry.content || <em>No entry written.</em>}
                    </p>
                    <button className={styles.deleteButton} onClick={() => setShowDeleteConfirm(true)}>
                        Delete Entry
                    </button>
                    <button className={styles.modalClose} onClick={onClose}>✕</button>
                </div>
            </div>

            {showDeleteConfirm && (
                <ConfirmationModal
                    title="Delete Entry?"
                    message="This star will be removed from your constellation permanently."
                    confirmLabel="Delete"
                    onConfirm={() => onDelete(star.id)}
                    onCancel={() => setShowDeleteConfirm(false)}
                />
            )}
        </>
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
                        opacity={dimmed ? edge.opacity * 0.15 : edge.opacity}
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
    const [zoom, setZoom] = useState(1);
    const [zoomOrigin, setZoomOrigin] = useState({ x: 0, y: 0 });
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);
    const [viewportCenter, setViewportCenter] = useState({ x: 0, y: 0 });
    const pinchStartDistRef = useRef<number | null>(null);
    const pinchStartZoomRef = useRef<number>(1);
    const zoomRef = useRef(zoom);
    const panRef = useRef(pan);
    const isDraggingRef = useRef(false);
    const dragStartRef = useRef({ x: 0, y: 0 });

    useEffect(() => { zoomRef.current = zoom; }, [zoom]);
    useEffect(() => { panRef.current = pan; }, [pan]);

    const updateViewportCenter = useCallback(() => {
        const container = containerRef.current;
        if (!container) return;

        const header = document.querySelector('header');
        const sidebar = document.querySelector('aside');
        const headerHeight = header?.getBoundingClientRect().height ?? 0;
        const sidebarWidth = sidebar?.getBoundingClientRect().width ?? 0;
        const availableWidth = container.clientWidth - sidebarWidth;
        const availableHeight = container.clientHeight - headerHeight;
        const nextCenter = {
            x: sidebarWidth + availableWidth / 2,
            y: headerHeight + availableHeight / 2,
        };

        setViewportCenter(current =>
            current.x === nextCenter.x && current.y === nextCenter.y ? current : nextCenter
        );
    }, []);

    useLayoutEffect(() => {
        const frameId = requestAnimationFrame(updateViewportCenter);
        const timeoutId: ReturnType<typeof setTimeout> = setTimeout(updateViewportCenter, 150);

        updateViewportCenter();
        window.addEventListener('resize', updateViewportCenter);
        return () => {
            window.removeEventListener('resize', updateViewportCenter);
            cancelAnimationFrame(frameId);
            clearTimeout(timeoutId);
        };
    }, [updateViewportCenter]);

    const isOverUI = (e: MouseEvent | WheelEvent) =>
        !!(e.target as Element).closest(
            '[class*="modal"], [class*="Modal"], [class*="menu"], [class*="Menu"], [class*="addButton"], [class*="list"], aside, header'
        );

    useEffect(() => {
        fetchStarMap()
            .then(data => {
                setConstellations(data);
                setZoom(1);
                setZoomOrigin({ x: 0, y: 0 });
                setPan({ x: 0, y: 0 });
                updateViewportCenter();
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [updateViewportCenter]);

    useEffect(() => {
        const handleWheel = (e: WheelEvent) => {
            if (isOverUI(e)) return;
            e.preventDefault();
            const rect = containerRef.current?.getBoundingClientRect();
            if (!rect) return;
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            setZoomOrigin({ x: mouseX, y: mouseY });
            setZoom(prev => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prev - e.deltaY * ZOOM_SENSITIVITY)));
        };

        window.addEventListener('wheel', handleWheel, { passive: false });
        return () => window.removeEventListener('wheel', handleWheel);
    }, []);

    useEffect(() => {
        const handleMouseDown = (e: MouseEvent) => {
            if (isOverUI(e)) return;
            isDraggingRef.current = true;
            dragStartRef.current = { x: e.clientX - panRef.current.x, y: e.clientY - panRef.current.y };
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (!isDraggingRef.current) return;
            setPan({
                x: e.clientX - dragStartRef.current.x,
                y: e.clientY - dragStartRef.current.y,
            });
        };

        const handleMouseUp = () => {
            isDraggingRef.current = false;
        };

        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    const handleTouchStart = useCallback((e: TouchEvent) => {
        if (e.touches.length === 2) {
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            pinchStartDistRef.current = Math.sqrt(dx * dx + dy * dy);
            pinchStartZoomRef.current = zoomRef.current;
            const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
            const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
            const rect = containerRef.current?.getBoundingClientRect();
            if (rect) setZoomOrigin({ x: midX - rect.left, y: midY - rect.top });
        }
    }, []);

    const handleTouchMove = useCallback((e: TouchEvent) => {
        if (e.touches.length === 2 && pinchStartDistRef.current !== null) {
            e.preventDefault();
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const scale = dist / pinchStartDistRef.current;
            setZoom(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, pinchStartZoomRef.current * scale)));
        }
    }, []);

    const handleTouchEnd = useCallback(() => {
        pinchStartDistRef.current = null;
    }, []);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        el.addEventListener('touchstart', handleTouchStart, { passive: false });
        el.addEventListener('touchmove', handleTouchMove, { passive: false });
        el.addEventListener('touchend', handleTouchEnd);
        return () => {
            el.removeEventListener('touchstart', handleTouchStart);
            el.removeEventListener('touchmove', handleTouchMove);
            el.removeEventListener('touchend', handleTouchEnd);
        };
    }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

    if (loading) {
        return (
            <div className={styles.container} ref={containerRef}>
                <div className={styles.loading}>
                    <div className={styles.loadingDot} />
                    <div className={styles.loadingDot} />
                    <div className={styles.loadingDot} />
                </div>
            </div>
        );
    }

    const active = constellations.find(c => c.isActive);
    const graveyard = constellations.filter(c => !c.isActive);

    const activeOffsetX = active ? viewportCenter.x - active.centroid.x + PADDING_LEFT : viewportCenter.x;
    const activeOffsetY = active ? viewportCenter.y - active.centroid.y + PADDING_TOP : viewportCenter.y;

    const graveyardPositions = graveyard.map((c, i) => {
        const angle = (i / Math.max(graveyard.length, 1)) * 360 - 90;
        const rad = (angle * Math.PI) / 180;
        const cx = viewportCenter.x + Math.cos(rad) * GRAVEYARD_RADIUS;
        const cy = viewportCenter.y + Math.sin(rad) * GRAVEYARD_RADIUS;
        return {
            constellation: c,
            offsetX: cx - c.centroid.x,
            offsetY: cy - c.centroid.y,
        };
    });

    const handleDeleteStar = async (starId: string) => {
        try {
            await deleteStar(starId);
            setConstellations(prev => {
                const updated = prev.map(c => {
                    const nextStars = c.stars.filter(s => s.id !== starId);
                    if (nextStars.length === 0) return null;
                    const wellnessById: Record<string, number> = {};
                    nextStars.forEach(s => wellnessById[s.id] = s.wellness);
                    return {
                        ...c,
                        stars: nextStars,
                        edges: buildEdges(nextStars, wellnessById),
                        centroid: {
                            x: nextStars.reduce((s, st) => s + st.x, 0) / nextStars.length,
                            y: nextStars.reduce((s, st) => s + st.y, 0) / nextStars.length
                        }
                    };
                }).filter(c => c !== null) as ConstellationData[];
                return updated;
            });
            setSelectedStar(null);
        } catch {
            alert("Failed to remove star.");
        }
    };


    return (
        <div className={styles.container} ref={containerRef}>
            <div
                className={styles.map}
                style={{
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                    transformOrigin: `${zoomOrigin.x}px ${zoomOrigin.y}px`,
                }}
            >
                {graveyardPositions.map(({ constellation, offsetX, offsetY }) =>
                    renderConstellation(constellation, offsetX, offsetY, setSelectedStar, true)
                )}
                {active && renderConstellation(active, activeOffsetX, activeOffsetY, setSelectedStar, false)}
            </div>
            {selectedStar && (
                <JournalModal
                    star={selectedStar}
                    onClose={() => setSelectedStar(null)}
                    onDelete={handleDeleteStar}
                />
            )}
        </div>
    );
};
