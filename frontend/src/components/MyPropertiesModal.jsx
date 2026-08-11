import React, { useEffect, useState } from 'react';
import { X, Pencil, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export default function MyPropertiesModal({ onClose, onEdit, onDeleted }) {
    const { token, user } = useAuth();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const load = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/properties/mine`, { headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok) throw new Error('Failed to load your properties');
            setItems(await res.json());
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this property? This cannot be undone.')) return;
        try {
            const res = await fetch(`${API_BASE_URL}/properties/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok && res.status !== 204) throw new Error('Failed to delete');
            setItems((prev) => prev.filter((p) => p.id !== id));
            onDeleted?.(id);
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="absolute inset-0" onClick={onClose} />
            <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 max-h-[85vh] flex flex-col animate-fade-in-up">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
                    <h2 className="text-sm font-extrabold text-slate-900">
                        {user?.role === 'admin' ? 'All Properties (Admin)' : 'My Properties'}
                    </h2>
                    <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500">
                        <X className="h-4 w-4" />
                    </button>
                </div>
                <div className="overflow-y-auto p-4 space-y-3">
                    {loading && <p className="text-xs text-slate-500 text-center py-6">Loading...</p>}
                    {error && <p className="text-xs text-rose-600 text-center py-6">{error}</p>}
                    {!loading && items.length === 0 && (
                        <p className="text-xs text-slate-500 text-center py-6">You haven't listed any properties yet.</p>
                    )}
                    {items.map((p) => (
                        <div key={p.id} className="flex items-center justify-between gap-3 bg-slate-50 border border-slate-100 rounded-2xl p-3.5">
                            <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-800 truncate">{p.title}</p>
                                <p className="text-[10px] text-slate-400">{p.locality}, {p.city}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <button onClick={() => onEdit(p)} className="p-2 rounded-xl bg-white border border-slate-200 hover:border-brand-500 hover:text-brand-600 text-slate-600 transition-colors">
                                    <Pencil className="h-3.5 w-3.5" />
                                </button>
                                <button onClick={() => handleDelete(p.id)} className="p-2 rounded-xl bg-white border border-slate-200 hover:border-rose-500 hover:text-rose-600 text-slate-600 transition-colors">
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
