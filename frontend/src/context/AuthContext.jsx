import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem('auth_token'));
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchMe = useCallback(async (activeToken) => {
        if (!activeToken) {
            setUser(null);
            setLoading(false);
            return;
        }
        try {
            const res = await fetch(`${API_BASE_URL}/auth/me`, {
                headers: { Authorization: `Bearer ${activeToken}` },
            });
            if (!res.ok) throw new Error('Session expired');
            setUser(await res.json());
        } catch {
            setUser(null);
            setToken(null);
            localStorage.removeItem('auth_token');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchMe(token); }, [token, fetchMe]);

    const login = async (email, password) => {
        const res = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.detail || 'Login failed');
        }
        const data = await res.json();
        localStorage.setItem('auth_token', data.access_token);
        setToken(data.access_token);
        setUser(data.user);
        return data.user;
    };

    const register = async (name, email, password) => {
        const res = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.detail || 'Registration failed');
        }
        const data = await res.json();
        localStorage.setItem('auth_token', data.access_token);
        setToken(data.access_token);
        setUser(data.user);
        return data.user;
    };

    const logout = () => {
        localStorage.removeItem('auth_token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
