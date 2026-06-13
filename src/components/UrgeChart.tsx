import { useState } from 'react';
import type { AdictionTrackingData } from '../lib/sobrietyTrackingService';
import styles from './UrgeChart.module.css';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const GRIDLINES = 4;
const PADDING = { top: 20, right: 20, bottom: 40, left: 40 };

interface TooltipState {
    x: number;
    y: number;
    value: number;
    label: string;
}

interface UrgeChartProps {
    data: AdictionTrackingData[];
}

export function UrgeChart({ data }: UrgeChartProps) {
    const [checked, setChecked] = useState<Record<string, boolean>>({});
    const [tooltip, setTooltip] = useState<TooltipState | null>(null);

    const toggleAddiction = (name: string) => {
        setChecked(prev => ({ ...prev, [name]: !prev[name] }));
    };

    const visibleData = data.filter(d => checked[d.name]);

    const allValues = visibleData.flatMap(d => [
        ...d.averageUrgesPerWeekday,
        ...d.currentWeekUrges,
    ]);
    const maxY = Math.max(...allValues, 1);

    return (
        <div className={styles.container}>
            <span className={styles.title}>Urge Frequency</span>

            <div className={styles.chartWrapper}>
                <svg
                    className={styles.svg}
                    viewBox={`0 0 700 260`}
                    preserveAspectRatio="xMidYMid meet"
                >
                    {Array.from({ length: GRIDLINES + 1 }).map((_, i) => {
                        const y = PADDING.top + (i / GRIDLINES) * (260 - PADDING.top - PADDING.bottom);
                        const value = Math.round(maxY - (i / GRIDLINES) * maxY);
                        return (
                            <g key={i}>
                                <line
                                    x1={PADDING.left}
                                    y1={y}
                                    x2={700 - PADDING.right}
                                    y2={y}
                                    className={styles.gridline}
                                />
                                <text
                                    x={PADDING.left - 8}
                                    y={y + 4}
                                    className={styles.yLabel}
                                >
                                    {value}
                                </text>
                            </g>
                        );
                    })}

                    {DAYS.map((day, i) => {
                        const x = PADDING.left + (i / 6) * (700 - PADDING.left - PADDING.right);
                        return (
                            <text
                                key={day}
                                x={x}
                                y={260 - PADDING.bottom + 16}
                                className={styles.xLabel}
                            >
                                {day}
                            </text>
                        );
                    })}

                    {visibleData.map(addiction => {
                        const chartW = 700 - PADDING.left - PADDING.right;
                        const chartH = 260 - PADDING.top - PADDING.bottom;

                        const toPoint = (value: number, i: number) => ({
                            x: PADDING.left + (i / 6) * chartW,
                            y: PADDING.top + (1 - value / maxY) * chartH,
                        });

                        const avgPoints = addiction.averageUrgesPerWeekday.map(toPoint);
                        const weekPoints = addiction.currentWeekUrges.map(toPoint);

                        const toPolyline = (points: { x: number; y: number }[]) =>
                            points.map(p => `${p.x},${p.y}`).join(' ');

                        return (
                            <g key={addiction.name}>
                                <polyline
                                    points={toPolyline(avgPoints)}
                                    fill="none"
                                    stroke={addiction.color}
                                    strokeWidth={2}
                                    opacity={0.7}
                                />

                                <polyline
                                    points={toPolyline(weekPoints)}
                                    fill="none"
                                    stroke={addiction.color}
                                    strokeWidth={2}
                                    strokeDasharray="5 3"
                                    opacity={1}
                                />

                                {avgPoints.map((p, i) => (
                                    <circle
                                        key={`avg-${i}`}
                                        cx={p.x}
                                        cy={p.y}
                                        r={4}
                                        fill={addiction.color}
                                        opacity={0.7}
                                        className={styles.dataPoint}
                                        onMouseEnter={() => setTooltip({
                                            x: p.x,
                                            y: p.y,
                                            value: parseFloat(addiction.averageUrgesPerWeekday[i].toFixed(2)),
                                            label: `${addiction.name} avg — ${DAYS[i]}`,
                                        })}
                                        onMouseLeave={() => setTooltip(null)}
                                    />
                                ))}

                                {weekPoints.map((p, i) => (
                                    <circle
                                        key={`week-${i}`}
                                        cx={p.x}
                                        cy={p.y}
                                        r={4}
                                        fill={addiction.color}
                                        className={styles.dataPoint}
                                        onMouseEnter={() => setTooltip({
                                            x: p.x,
                                            y: p.y,
                                            value: addiction.currentWeekUrges[i],
                                            label: `${addiction.name} this week — ${DAYS[i]}`,
                                        })}
                                        onMouseLeave={() => setTooltip(null)}
                                    />
                                ))}
                            </g>
                        );
                    })}

                    {tooltip && (
                        <g>
                            <rect
                                x={tooltip.x - 60}
                                y={tooltip.y - 36}
                                width={120}
                                height={28}
                                rx={4}
                                className={styles.tooltipBg}
                            />
                            <text
                                x={tooltip.x}
                                y={tooltip.y - 16}
                                className={styles.tooltipText}
                            >
                                {tooltip.label}: {tooltip.value}
                            </text>
                        </g>
                    )}
                </svg>
            </div>
            <div className={styles.legend}>
                {data.map(addiction => (
                    <label key={addiction.name} className={styles.legendItem}>
                        <input
                            type="checkbox"
                            checked={!!checked[addiction.name]}
                            onChange={() => toggleAddiction(addiction.name)}
                            className={styles.checkbox}
                        />
                        <span
                            className={styles.swatch}
                            style={{ background: addiction.color }}
                        />
                        <span className={styles.legendLabel}>{addiction.name}</span>
                    </label>
                ))}
            </div>
        </div>
    );
}
