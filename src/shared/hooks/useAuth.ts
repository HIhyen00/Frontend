import { useState, useEffect } from 'react';

interface User {
    accountId: number;
    username: string;
    email: string;
}

export const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = () => {
        // userToken 또는 accessToken 확인 (userToken 우선)
        const token = localStorage.getItem('userToken') || localStorage.getItem('accessToken');
        const userStr = localStorage.getItem('user');
        
        if (token && userStr) {
            try {
                const userData = JSON.parse(userStr);
                setUser(userData);
                setIsAuthenticated(true);
            } catch (error) {
                console.error('사용자 정보 파싱 실패:', error);
                logout();
            }
        } else if (token) {
            // 토큰은 있지만 user 정보가 없는 경우에도 인증된 것으로 간주
            setIsAuthenticated(true);
        }
        setLoading(false);
    };

    const login = (token: string, userData: User) => {
        localStorage.setItem('userToken', token);
        localStorage.setItem('accessToken', token); // 하위 호환성
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);
    };

    const logout = () => {
        localStorage.removeItem('userToken');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
    };

    return {
        isAuthenticated,
        user,
        loading,
        login,
        logout,
        checkAuth,
    };
};
