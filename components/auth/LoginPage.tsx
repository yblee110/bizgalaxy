"use client";

import React, { useState } from 'react';
import { useProjectStore } from '@/stores/projectStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { setUserId } from '@/lib/auth';

export default function LoginPage() {
    const { login } = useProjectStore();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (username === 'modulabs-community' && password === 'modu1234!') {
            // Set consistent user ID for this account
            setUserId('modulabs-community-user');
            login();
        } else {
            setError('아이디 또는 비밀번호가 올바르지 않습니다.');
        }
    };

    return (
        <div className="flex h-screen w-full items-center justify-center bg-black starfield text-white">
            {/* Background Effect */}
            <div className="absolute inset-0 z-0 bg-radial-gradient from-indigo-900/20 to-black pointer-events-none" />

            <div className="z-10 w-full max-w-md p-8 glass rounded-2xl border border-white/10 shadow-2xl animate-in zoom-in-95 duration-500">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary mx-auto mb-4 flex items-center justify-center shadow-lg shadow-primary/20">
                        <span className="font-bold text-2xl">BG</span>
                    </div>
                    <h1 className="text-2xl font-bold font-tech mb-2">BizGalaxy 로그인</h1>
                    <p className="text-gray-400 text-sm">시각적 생산성 플랫폼에 오신 것을 환영합니다</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="username">아이디</Label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                            <Input
                                id="username"
                                type="text"
                                placeholder="아이디를 입력하세요"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="pl-10 bg-white/5 border-white/10 text-white focus:ring-primary focus:border-primary"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">비밀번호</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                            <Input
                                id="password"
                                type="password"
                                placeholder="비밀번호를 입력하세요"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pl-10 bg-white/5 border-white/10 text-white focus:ring-primary focus:border-primary"
                            />
                        </div>
                    </div>

                    {error && <p className="text-red-400 text-xs text-center">{error}</p>}

                    <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2 rounded-lg transition-all duration-200">
                        로그인
                    </Button>
                </form>

                <div className="mt-6 text-center text-xs text-gray-500">
                    <p>© 2026 BizGalaxy. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
}
