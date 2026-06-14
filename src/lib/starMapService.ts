import { supabase } from "./supabaseClient";
import type { JournalEntry } from "../types/journal";

export interface StarData {
    id: string;
    created_at: string;
    entry: JournalEntry;
    x: number;
    y: number;
    size: number;
    brightness: number;
    color: number;
    twinkle: number;
    wellness: number;
    constellationId: number;
}

export interface EdgeData {
    fromId: string;
    toId: string;
    opacity: number;
}

export interface ConstellationData {
    id: number;
    stars: StarData[];
    edges: EdgeData[];
    isActive: boolean;
    centroid: { x: number; y: number };
}

const MIN_STEP            = 80;
const MAX_STEP            = 200;
const BACKTRACK_THRESHOLD = 135;
const DELAUNAY_PRUNE      = 0.8;
const MAX_DELAUNAY_EDGE   = MAX_STEP * 3;

function normalize(value: number, min: number, max: number): number {
    return (value - min) / (max - min);
}

function computeWellness(mood: number, energy: number, anxiety: number): number {
    const mood_n    = normalize(mood,    1, 5);
    const energy_n  = normalize(energy,  1, 10);
    const anxiety_n = normalize(anxiety, 1, 10);
    return (mood_n * 0.5) + (energy_n * 0.3) - (anxiety_n * 0.2);
}

function computeAngle(
    delta: number,
    mood_n: number,
    energy_n: number,
    anxiety_n: number
): number {
    const mood_energy     = (mood_n * 0.5) + (energy_n * 0.3);
    const anxiety_contrib = anxiety_n * 0.2;
    const flank           = anxiety_contrib > mood_energy ? 1 : -1;
    return 45 + (flank * delta * 90);
}

function smoothDelta(current: number, previous: number | null): number {
    if (previous === null) return current;
    return current * 0.7 + previous * 0.3;
}

function computeStep(angleDeg: number, delta: number): { dx: number; dy: number } {
    const stepSize = MIN_STEP + Math.abs(delta) * (MAX_STEP - MIN_STEP);
    const rad = (angleDeg * Math.PI) / 180;
    return {
        dx:  Math.cos(rad) * stepSize,
        dy: -Math.sin(rad) * stepSize,
    };
}

function shouldBacktrack(angle: number): boolean {
    const normalized = ((angle + 180) % 360) - 180;
    return Math.abs(normalized - 45) >= BACKTRACK_THRESHOLD;
}

function computeCentroid(stars: StarData[]): { x: number; y: number } {
    if (stars.length === 0) return { x: 0, y: 0 };
    const x = stars.reduce((sum, s) => sum + s.x, 0) / stars.length;
    const y = stars.reduce((sum, s) => sum + s.y, 0) / stars.length;
    return { x, y };
}

function seededRandom(seed: number) {
    return function() {
        seed |= 0; seed = seed + 0x9e3779b9 | 0;
        let t = seed ^ seed >>> 16; t = Math.imul(t, 0x21f0aaad);
        t = t ^ t >>> 15; t = Math.imul(t, 0x735a2d97);
        return ((t = t ^ t >>> 15) >>> 0) / 4294967296;
    };
}

// --- Delaunay Triangulation (Bowyer-Watson) ---

interface Triangle {
    a: number; b: number; c: number;
}

function circumscribes(triangle: Triangle, stars: StarData[], px: number, py: number): boolean {
    const ax = stars[triangle.a].x, ay = stars[triangle.a].y;
    const bx = stars[triangle.b].x, by = stars[triangle.b].y;
    const cx = stars[triangle.c].x, cy = stars[triangle.c].y;

    const d = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by));
    if (Math.abs(d) < 1e-10) return false;

    const ux = ((ax * ax + ay * ay) * (by - cy) + (bx * bx + by * by) * (cy - ay) + (cx * cx + cy * cy) * (ay - by)) / d;
    const uy = ((ax * ax + ay * ay) * (cx - bx) + (bx * bx + by * by) * (ax - cx) + (cx * cx + cy * cy) * (bx - ax)) / d;

    const dx = ax - ux, dy = ay - uy;
    const r2 = dx * dx + dy * dy;
    const ex = px - ux, ey = py - uy;
    return ex * ex + ey * ey <= r2;
}

function delaunayTriangulate(stars: StarData[]): Triangle[] {
    if (stars.length < 3) return [];

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const s of stars) {
        minX = Math.min(minX, s.x); minY = Math.min(minY, s.y);
        maxX = Math.max(maxX, s.x); maxY = Math.max(maxY, s.y);
    }

    const dx = maxX - minX, dy = maxY - minY;
    const delta = Math.max(dx, dy) * 10;
    const n = stars.length;

    const superStars: StarData[] = [
        ...stars,
        { ...stars[0], x: minX - delta,            y: minY - delta,            id: '__s0' },
        { ...stars[0], x: minX + 2 * delta + dx,   y: minY - delta,            id: '__s1' },
        { ...stars[0], x: minX,                     y: minY + 2 * delta + dy,   id: '__s2' },
    ];

    let triangles: Triangle[] = [{ a: n, b: n + 1, c: n + 2 }];

    for (let i = 0; i < n; i++) {
        const px = stars[i].x, py = stars[i].y;
        const badTriangles: Triangle[] = [];

        for (const t of triangles) {
            if (circumscribes(t, superStars, px, py)) {
                badTriangles.push(t);
            }
        }

        const polygon: [number, number][] = [];
        for (const t of badTriangles) {
            const edges: [number, number][] = [[t.a, t.b], [t.b, t.c], [t.c, t.a]];
            for (const [ea, eb] of edges) {
                const shared = badTriangles.some(other =>
                    other !== t &&
                    ((other.a === ea && other.b === eb) || (other.b === ea && other.a === eb) ||
                     (other.b === ea && other.c === eb) || (other.c === ea && other.b === eb) ||
                     (other.c === ea && other.a === eb) || (other.a === ea && other.c === eb))
                );
                if (!shared) polygon.push([ea, eb]);
            }
        }

        triangles = triangles.filter(t => !badTriangles.includes(t));
        for (const [ea, eb] of polygon) {
            triangles.push({ a: ea, b: eb, c: i });
        }
    }

    return triangles.filter(t => t.a < n && t.b < n && t.c < n);
}

// --- Edge Building ---

export function buildEdges(
    stars: StarData[],
    wellnessById: Record<string, number>
): EdgeData[] {
    const edges: EdgeData[] = [];
    const added = new Set<string>();
    const random = seededRandom(stars.length * 1000);

    // Pass 1 — sequential path edges (always kept, no pruning)
    for (let i = 0; i < stars.length - 1; i++) {
        const key = [stars[i].id, stars[i + 1].id].sort().join('-');
        if (added.has(key)) continue;
        added.add(key);
        const deltaW = Math.abs(
            (wellnessById[stars[i].id] ?? 0) - (wellnessById[stars[i + 1].id] ?? 0)
        );
        edges.push({
            fromId: stars[i].id,
            toId: stars[i + 1].id,
            opacity: Math.min(1, deltaW * 2),
        });
    }

    // Pass 2 — Delaunay triangulation edges with pruning
    const triangles = delaunayTriangulate(stars);

    for (const tri of triangles) {
        const triEdges: [number, number][] = [
            [tri.a, tri.b],
            [tri.b, tri.c],
            [tri.c, tri.a],
        ];

        for (const [ia, ib] of triEdges) {
            const key = [stars[ia].id, stars[ib].id].sort().join('-');

            // Skip if already a path edge
            if (added.has(key)) continue;

            // Skip if too far apart
            const dx = stars[ia].x - stars[ib].x;
            const dy = stars[ia].y - stars[ib].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > MAX_DELAUNAY_EDGE) continue;

            // Prune probabilistically
            if (random() < DELAUNAY_PRUNE) continue;

            added.add(key);
            const deltaW = Math.abs(
                (wellnessById[stars[ia].id] ?? 0) - (wellnessById[stars[ib].id] ?? 0)
            );
            edges.push({
                fromId: stars[ia].id,
                toId: stars[ib].id,
                opacity: Math.min(1, deltaW * 2),
            });
        }
    }

    return edges;
}

// --- Main Fetch ---

export async function fetchStarMap(): Promise<ConstellationData[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

    if (error) throw error;
    if (!data || data.length === 0) return [];

    const entries = data as JournalEntry[];
    const constellations: ConstellationData[] = [];
    const wellnessById: Record<string, number> = {};

    let constellationId     = 0;
    let currentStars: StarData[] = [];
    let prevWellness: number | null = null;
    let prevDelta:    number | null = null;
    let x = 0;
    let y = 0;
    let lastStrongStarIndex = 0;

    const finalizeConstellation = (isActive: boolean) => {
        if (currentStars.length === 0) return;
        constellations.push({
            id: constellationId,
            stars: currentStars,
            edges: buildEdges(currentStars, wellnessById),
            isActive,
            centroid: computeCentroid(currentStars),
        });
        constellationId++;
        currentStars        = [];
        prevWellness        = null;
        prevDelta           = null;
        x                   = 0;
        y                   = 0;
        lastStrongStarIndex = 0;
    };

    for (const entry of entries) {
        const pulse   = entry.daily_pulse;
        const mood    = pulse.mood    ?? 3;
        const energy  = pulse.energy  ?? 5;
        const anxiety = pulse.anxiety ?? 5;
        const affect  = pulse.affect  ?? 5;

        const mood_n    = normalize(mood,    1, 5);
        const energy_n  = normalize(energy,  1, 10);
        const anxiety_n = normalize(anxiety, 1, 10);
        const affect_n  = normalize(affect,  1, 10);

        const wellness = computeWellness(mood, energy, anxiety);
        const rawDelta = prevWellness !== null ? wellness - prevWellness : 0;
        const delta    = smoothDelta(rawDelta, prevDelta);
        const angle    = computeAngle(delta, mood_n, energy_n, anxiety_n);

        const hasRelapse = entry.addictions &&
            Object.values(entry.addictions as Record<string, { urge: boolean; relapse: boolean }>)
                .some(a => a.relapse);

        if (hasRelapse && currentStars.length > 0) {
            finalizeConstellation(false);
        }

        if (shouldBacktrack(angle) && currentStars.length > 1) {
            const anchor = currentStars[lastStrongStarIndex];
            x = anchor.x;
            y = anchor.y;
        } else {
            const step = computeStep(angle, delta);
            x += step.dx;
            y += step.dy;
            if (delta > 0.1) lastStrongStarIndex = currentStars.length;
        }

        const star: StarData = {
            id:          entry.id,
            created_at:  entry.created_at,
            entry,
            x,
            y,
            size:        mood,
            brightness:  energy_n,
            color:       affect_n,
            twinkle:     anxiety_n,
            wellness,
            constellationId,
        };

        wellnessById[entry.id] = wellness;
        currentStars.push(star);
        prevWellness = wellness;
        prevDelta    = delta;
    }

    finalizeConstellation(true);
    return constellations;
}

export async function deleteStar(starId: string): Promise<void> {
    const { error } = await supabase
        .from("journal_entries")
        .delete()
        .eq("id", starId);

    if (error) throw error;
}