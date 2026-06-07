import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Addiction } from '../types/journal';
import { supabase } from '../lib/supabaseClient';

interface AddictionContextType {
    addictions: Addiction[];
    addAddiction: (name: string) => Promise<void>;
    removeAddiction: (name: string) => Promise<void>;
    updateStartDate: (name: string, date: string) => Promise<void>;
    logEvent: (name: string, type: 'urge' | 'relapse') => Promise<void>;
}

const AddictionContext = createContext<AddictionContextType | undefined>(undefined);

export function AddictionProvider({ children }: { children: ReactNode }) {
    const [addictions, setAddictions] = useState<Addiction[]>([]);

    useEffect(() => {
        const fetchAddictions = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('addictions')
                .select('*')
                .eq('user_id', user.id);

            if (error) { console.error(error); return; }

            setAddictions(data.map(row => ({
                name: row.name,
                startDate: row.start_date,
                urges: row.urges ?? [],
                relapses: row.relapses ?? [],
            })));
        };

        fetchAddictions();
    }, []);

    const addAddiction = async (name: string) => {
        if (addictions.find(a => a.name === name)) return;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const startDate = new Date().toISOString();

        const { error } = await supabase
            .from('addictions')
            .insert({ user_id: user.id, name, start_date: startDate, urges: [], relapses: [] });

        if (error) { console.error(error); return; }

        setAddictions(prev => [...prev, { name, startDate, urges: [], relapses: [] }]);
    };

    const removeAddiction = async (name: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
            .from('addictions')
            .delete()
            .eq('user_id', user.id)
            .eq('name', name);

        if (error) { console.error(error); return; }

        setAddictions(prev => prev.filter(a => a.name !== name));
    };

    const updateStartDate = async (name: string, date: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const startDate = new Date(date).toISOString();

        const { error } = await supabase
            .from('addictions')
            .update({ start_date: startDate })
            .eq('user_id', user.id)
            .eq('name', name);

        if (error) { console.error(error); return; }

        setAddictions(prev =>
            prev.map(a => a.name === name ? { ...a, startDate } : a)
        );
    };

    const logEvent = async (name: string, type: 'urge' | 'relapse') => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const addiction = addictions.find(a => a.name === name);
        if (!addiction) return;

        const timestamp = new Date().toISOString();
        const column = type === 'urge' ? 'urges' : 'relapses';
        const updated = [...addiction[column === 'urges' ? 'urges' : 'relapses'], timestamp];

        const { error } = await supabase
            .from('addictions')
            .update({ [column]: updated })
            .eq('user_id', user.id)
            .eq('name', name);

        if (error) { console.error(error); return; }

        setAddictions(prev =>
            prev.map(a => a.name === name ? { ...a, [column]: updated } : a)
        );
    };

    return (
        <AddictionContext.Provider value={{ addictions, addAddiction, removeAddiction, updateStartDate, logEvent }}>
            {children}
        </AddictionContext.Provider>
    );
}

export function useAddiction() {
    const context = useContext(AddictionContext);
    if (!context) throw new Error("useAddiction must be used within an AddictionProvider");
    return context;
}