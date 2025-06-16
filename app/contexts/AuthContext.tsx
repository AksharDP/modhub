"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from "react";
import { useRouter } from "next/navigation";

interface User {
    id: number;
    username: string;
    email: string;
    profilePicture: string | null;
    role: string;
    bio: string | null;
    createdAt: Date;
    updatedAt: Date;
    suspendedUntil: Date | null;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (userData: User) => void;
    logout: () => void;
    refreshUser: () => Promise<void>;
    handleAuthError: (error: { status?: number; message?: string }) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [initialized, setInitialized] = useState(false);
    const initializingRef = useRef(false);
    const router = useRouter();

    // Initialize auth state on app start - only once
    useEffect(() => {
        if (!initialized) {
            initializeAuth();
        }
    }, [initialized]);    const initializeAuth = async () => {
        // Prevent multiple simultaneous initialization calls
        if (initializingRef.current) return;
        initializingRef.current = true;
        
        try {
            // Check if we have cached user data in localStorage first
            const cachedUser = localStorage.getItem('auth_user');
            if (cachedUser) {                try {
                    const userData = JSON.parse(cachedUser);
                    setUser(userData);
                    setLoading(false);
                    setInitialized(true);
                    return; // Don't make API call if we have cached data
                } catch {
                    // Invalid cached data, remove it
                    localStorage.removeItem('auth_user');
                }
            }

            const response = await fetch("/api/auth/status", {
                credentials: "include",
            });
            
            if (response.ok) {
                const userData = await response.json();
                setUser(userData.user);
                // Cache the user data
                localStorage.setItem('auth_user', JSON.stringify(userData.user));
            } else {
                // Clear any stale cached data
                localStorage.removeItem('auth_user');
            }
        } catch (error) {
            console.error("Error initializing auth:", error);
            localStorage.removeItem('auth_user');
        } finally {
            setLoading(false);
            setInitialized(true);
        }
    };

    const login = useCallback((userData: User) => {
        setUser(userData);
        setLoading(false);
        // Cache the user data
        localStorage.setItem('auth_user', JSON.stringify(userData));
    }, []);

    const logout = useCallback(async () => {
        try {
            await fetch("/api/auth/logout", {
                method: "POST",
                credentials: "include",
            });
        } catch (error) {
            console.error("Error during logout:", error);        } finally {
            setUser(null);
            localStorage.removeItem('auth_user');
            initializingRef.current = false; // Reset flag for re-login
            router.push("/login");
        }
    }, [router]);

    const refreshUser = useCallback(async () => {
        try {
            const response = await fetch("/api/auth/status", {
                credentials: "include",
            });
            
            if (response.ok) {
                const userData = await response.json();
                setUser(userData.user);
                localStorage.setItem('auth_user', JSON.stringify(userData.user));
            } else if (response.status === 401) {
                setUser(null);
                localStorage.removeItem('auth_user');
                router.push("/login");
            }
        } catch (error) {
            console.error("Error refreshing user:", error);
        }
    }, [router]);

    // Handle authentication errors globally
    const handleAuthError = useCallback((error: { status?: number; message?: string }) => {
        if (error?.status === 401 || error?.message?.includes("Unauthorized")) {
            setUser(null);
            localStorage.removeItem('auth_user');
            router.push("/login");
        }
    }, [router]);

    const value: AuthContextType = {
        user,
        loading,
        login,
        logout,
        refreshUser,
        handleAuthError,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}