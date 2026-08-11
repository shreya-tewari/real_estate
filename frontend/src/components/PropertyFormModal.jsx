import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const emptyForm = {
    title: '', city: 'Bangalore', locality: '', price: '', type: 'rent', property_type: 'flat',
    bhk: 1, bathrooms: 1, area: '', image_filename: '', image_url: '',
    description: '', amenities: '', agent_name: '', agent_phone: '', agent_email: '',
};

export default function PropertyFormModal({ property, onClose, onSaved }) {
    const { token } = useAuth();
    const isEdit = Boolean(property);
    const [form, setForm] = useState(() => (property ? { ...property } : { ...emptyForm }));
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setError('');
        setUploading(true);
        try {
            const body = new FormData();
            body.append('file', file);
            const res = await fetch(`${API_BASE_URL}/upload-image`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body,
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.detail || 'Image upload failed');
            }
            const data = await res.json();
            setForm((f) => ({ ...f, image_url: data.url, image_filename: '' }));
        } catch (err) {
            setError(err.message);
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!form.image_url && !form.image_filename) {
            setError('Please upload a property image before submitting.');
            return;
        }
        setSubmitting(true);
        try {
            const payload = {
                ...form,
                price: Number(form.price),
                bhk: Number(form.bhk),
                bathrooms: Number(form.bathrooms),
                area: Number(form.area),
                image_filename: form.image_filename || null,
                image_url: form.image_url || null,
            };
            const url = isEdit ? `${API_BASE_URL}/properties/${property.id}` : `${API_BASE_URL}/properties`;
            const method = isEdit ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                const detail = Array.isArray(err.detail)
                    ? err.detail.map((d) => d.msg).join(', ')
                    : err.detail;
                throw new Error(detail || 'Failed to save property');
            }
            onSaved(await res.json());
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="absolute inset-0" onClick={onClose} />
            <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col animate-fade-in-up">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
                    <h2 className="text-sm font-extrabold text-slate-900">{isEdit ? 'Edit Property' : 'List a New Property'}</h2>
                    <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-slate-500 mb-1.5">Title</label>
                            <input name="title" value={form.title} onChange={handleChange} required
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-brand-400" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1.5">City</label>
                            <select name="city" value={form.city} onChange={handleChange}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none">
                                {['Bangalore', 'Mumbai', 'Chennai', 'Hyderabad'].map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1.5">Locality</label>
                            <input name="locality" value={form.locality} onChange={handleChange} required
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-brand-400" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1.5">Purpose</label>
                            <select name="type" value={form.type} onChange={handleChange}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none">
                                <option value="rent">Rent</option>
                                <option value="buy">Buy</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1.5">Property Type</label>
                            <select name="property_type" value={form.property_type} onChange={handleChange}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none">
                                <option value="flat">Flat</option>
                                <option value="house">House</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1.5">Price (INR)</label>
                            <input
                                type="number" name="price" value={form.price} onChange={handleChange} required
                                min={form.type === 'rent' ? 1000 : 100000}
                                max={form.type === 'rent' ? 10000000 : 5000000000}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-brand-400"
                            />
                            <p className="text-[10px] text-slate-400 mt-1">
                                {form.type === 'rent' ? '₹1,000 – ₹1 Cr per month' : '₹1 Lakh – ₹500 Cr'}
                            </p>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1.5">Area (sqft)</label>
                            <input type="number" name="area" value={form.area} onChange={handleChange} required min="0"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-brand-400" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1.5">BHK</label>
                            <input type="number" name="bhk" value={form.bhk} onChange={handleChange} required min="1" max="10"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-brand-400" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1.5">Bathrooms</label>
                            <input type="number" name="bathrooms" value={form.bathrooms} onChange={handleChange} required min="1" max="10"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-brand-400" />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-slate-500 mb-1.5">Property Image</label>
                            <div className="flex items-center gap-3">
                                <label className={`cursor-pointer px-4 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                                    uploading ? 'bg-slate-100 text-slate-400' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                }`}>
                                    {uploading ? 'Uploading...' : 'Choose Image'}
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp,image/gif"
                                        className="hidden"
                                        onChange={handleImageUpload}
                                        disabled={uploading}
                                    />
                                </label>
                                {(form.image_url || form.image_filename) ? (
                                    <img
                                        src={form.image_url || `/images/${form.image_filename}`}
                                        alt="Preview"
                                        className="h-14 w-14 rounded-lg object-cover border border-slate-200"
                                    />
                                ) : (
                                    <span className="text-[10px] text-rose-500 font-medium">No image selected yet</span>
                                )}
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1.5">JPEG, PNG, WEBP or GIF — up to 5MB.</p>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-slate-500 mb-1.5">Description</label>
                            <textarea name="description" value={form.description} onChange={handleChange} required rows={3}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-brand-400" />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-slate-500 mb-1.5">Amenities (comma-separated)</label>
                            <input name="amenities" value={form.amenities} onChange={handleChange} required placeholder="Parking, Security, Gym"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-brand-400" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1.5">Agent Name</label>
                            <input name="agent_name" value={form.agent_name} onChange={handleChange} required
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-brand-400" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1.5">Agent Phone</label>
                            <input
                                name="agent_phone" value={form.agent_phone} onChange={handleChange} required
                                pattern="^\+?\d{0,3}[\s-]?\d{4,5}[\s-]?\d{4,6}$"
                                title="Enter a valid phone number, e.g. +91 98765 43210"
                                placeholder="+91 98765 43210"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-brand-400"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-slate-500 mb-1.5">Agent Email</label>
                            <input type="email" name="agent_email" value={form.agent_email} onChange={handleChange} required
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-brand-400" />
                        </div>
                    </div>

                    {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}

                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={submitting}
                            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-colors disabled:opacity-60">
                            {submitting ? 'Saving...' : isEdit ? 'Save Changes' : 'List Property'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
