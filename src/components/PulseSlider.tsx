import styles from './PulseSlider.module.css';
import { useId } from 'react';

interface PulseSliderProps {
    value: number | null;
    onChange: (val: number) => void;
    min?: number;
    max?: number;
    gradient?: string;
}

function hexToRgb(hex: string): [number, number, number] {
    const h = hex.replace('#', '');
    return [
        parseInt(h.substring(0, 2), 16),
        parseInt(h.substring(2, 4), 16),
        parseInt(h.substring(4, 6), 16),
    ];
}

function interpolateGradient(gradient: string, t: number): string {
    const stops = gradient.split(',').map(s => s.trim());
    if (stops.length < 2) return stops[0];

    const segment = 1 / (stops.length - 1);
    const index = Math.min(Math.floor(t / segment), stops.length - 2);
    const localT = (t - index * segment) / segment;

    const [r1, g1, b1] = hexToRgb(stops[index]);
    const [r2, g2, b2] = hexToRgb(stops[index + 1]);

    return `rgb(${Math.round(r1 + (r2 - r1) * localT)}, ${Math.round(g1 + (g2 - g1) * localT)}, ${Math.round(b1 + (b2 - b1) * localT)})`;
}

export function PulseSlider({ value, onChange, min = 1, max = 10, gradient = "#8B5CF6, #EC4899" }: PulseSliderProps) {
    const val = value ?? min;
    const t = (val - min) / (max - min);
    const percentage = t * 100;
    const thumbColor = interpolateGradient(gradient, t);
    const uid = useId().replace(/:/g, '');

    return (
        <div className={styles.sliderWrapper}>
            <style>{`
                .thumb-${uid}::-webkit-slider-thumb {
                    appearance: none;
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    background: ${thumbColor} !important;
                    box-shadow: inset 0 0 0 2px rgba(0, 0, 0, 0.4) !important;
                    cursor: pointer;
                }
                .thumb-${uid}::-moz-range-thumb {
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    background: ${thumbColor} !important;
                    box-shadow: inset 0 0 0 2px rgba(0, 0, 0, 0.4) !important;
                    cursor: pointer;
                }
            `}</style>
            <div
                className={styles.gradientTrack}
                style={{ background: `linear-gradient(to right, ${gradient})` }}
            />
            <div
                className={styles.mask}
                style={{ left: `${percentage}%` }}
            />
            <input
                type="range"
                min={min}
                max={max}
                step={0.01}
                value={val}
                onChange={(e) => onChange(Number(e.target.value))}
                className={`${styles.sliderInput} thumb-${uid}`}
            />
        </div>
    );
}