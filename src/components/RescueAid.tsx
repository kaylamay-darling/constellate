import { useState, useEffect, useRef } from 'react';
import styles from './RescueAid.module.css';

interface BreathingPattern {
    name: string;
    phases: { label: string; duration: number }[];
}

const PRESETS: BreathingPattern[] = [
    {
        name: 'Box',
        phases: [
            { label: 'Inhale', duration: 4 },
            { label: 'Hold', duration: 4 },
            { label: 'Exhale', duration: 4 },
            { label: 'Hold', duration: 4 },
        ],
    },
    {
        name: 'Anxiety',
        phases: [
            { label: 'Inhale', duration: 4 },
            { label: 'Hold', duration: 7 },
            { label: 'Exhale', duration: 8 },
        ],
    },
    {
        name: 'HRV',
        phases: [
            { label: 'Inhale', duration: 5.5 },
            { label: 'Exhale', duration: 5.5 },
        ],
    },
    {
        name: 'Standard',
        phases: [
            { label: 'Inhale', duration: 4 },
            { label: 'Exhale', duration: 4 },
        ],
    },
];

export function RescueAid() {
    const ALL_PHASES = ['Inhale', 'Hold', 'Exhale', 'Hold'];

    const [selectedPreset, setSelectedPreset] = useState(0);
    const [phases, setPhases] = useState(
        ALL_PHASES.map((label, i) => ({
            label,
            duration: PRESETS[0].phases[i]?.duration ?? 0,
        }))
    );
    const [running, setRunning] = useState(false);
    const [phaseIndex, setPhaseIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [glowing, setGlowing] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const frameRef = useRef<ReturnType<typeof requestAnimationFrame> | null>(null);
    const startTimeRef = useRef<number>(0);

    const currentPhase = phases[phaseIndex];
    const isInhale = currentPhase.label === 'Inhale';
    const isExhale = currentPhase.label === 'Exhale';

    const scale = isInhale
        ? 0.4 + progress * 0.6
        : isExhale
            ? 1 - progress * 0.6
            : phaseIndex === 1 ? 1 : 0.4;

    const advancePhase = (currentIndex: number, currentPhases: typeof phases) => {
        let next = (currentIndex + 1) % currentPhases.length;
        while (currentPhases[next].duration === 0) {
            next = (next + 1) % currentPhases.length;
        }
        setPhaseIndex(next);
        setProgress(0);
        startTimeRef.current = performance.now();

        if (currentPhases[currentIndex].label === 'Inhale') {
            setGlowing(true);
            setTimeout(() => setGlowing(false), 600);
        }
    };

    useEffect(() => {
        if (!running) {
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
            return;
        }

        startTimeRef.current = performance.now();

        const tick = (now: number) => {
            const elapsed = (now - startTimeRef.current) / 1000;
            const duration = phases[phaseIndex].duration;
            const newProgress = Math.min(elapsed / duration, 1);
            setProgress(newProgress);

            if (newProgress >= 1) {
                advancePhase(phaseIndex, phases);
            } else {
                frameRef.current = requestAnimationFrame(tick);
            }
        };

        frameRef.current = requestAnimationFrame(tick);
        return () => {
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
        };
    }, [running, phaseIndex, phases]);

    const handlePreset = (index: number) => {
        setSelectedPreset(index);
        const presetPhases = PRESETS[index].phases;
        setPhases(ALL_PHASES.map((label, i) => ({
            label,
            duration: presetPhases[i]?.duration ?? 0,
        })));
        setPhaseIndex(0);
        setProgress(0);
        setRunning(false);
    };

    const adjustDuration = (phaseIdx: number, delta: number) => {
        setPhases(prev => prev.map((p, i) =>
            i === phaseIdx
                ? { ...p, duration: Math.max(0.5, parseFloat((p.duration + delta).toFixed(1))) }
                : p
        ));
    };

    const toggleRunning = () => {
        if (running) {
            setRunning(false);
            setPhaseIndex(0);
            setProgress(0);
        } else {
            setRunning(true);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <span className={styles.title}>Breathing Guide</span>

                <div className={styles.circleWrapper}>
                    <div
                        className={`${styles.circle} ${glowing ? styles.glow : ''}`}
                        style={{ transform: `scale(${scale})` }}
                    />
                    <span className={styles.phaseLabel}>{currentPhase.label}</span>
                    <span className={styles.phaseTimer}>
                        {Math.ceil(currentPhase.duration - progress * currentPhase.duration)}s
                    </span>
                </div>

                <button className={styles.startButton} onClick={toggleRunning}>
                    {running ? 'Stop' : 'Start'}
                </button>

                <div className={styles.phaseControls}>
                    {phases.map((phase, i) => (
                        <div key={i} className={styles.phaseRow}>
                            <span className={styles.phaseNameLabel}>{phase.label}</span>
                            <button className={styles.adjustBtn} onClick={() => adjustDuration(i, -0.5)}>−</button>
                            <span className={styles.phaseDuration}>{phase.duration}s</span>
                            <button className={styles.adjustBtn} onClick={() => adjustDuration(i, 0.5)}>+</button>
                        </div>
                    ))}
                </div>

                <div className={styles.presets}>
                    {PRESETS.map((preset, i) => (
                        <button
                            key={preset.name}
                            className={`${styles.presetBtn} ${selectedPreset === i ? styles.presetActive : ''}`}
                            onClick={() => handlePreset(i)}
                        >
                            {preset.name}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
