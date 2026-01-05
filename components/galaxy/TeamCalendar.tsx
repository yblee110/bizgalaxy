"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X, Briefcase, Sun, Clock, Plus, Trash2, Calendar as CalendarIcon, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useProjectStore } from '@/stores/projectStore';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const HOLIDAYS: Record<string, string> = {
    '2026-01-01': '신정',
    '2026-02-16': '설날 연휴',
    '2026-02-17': '설날',
    '2026-02-18': '설날 연휴',
    '2026-03-01': '삼일절',
    '2026-03-02': '대체공휴일',
    '2026-05-01': '근로자의 날',
    '2026-05-05': '어린이날',
    '2026-05-06': '대체공휴일',
    '2026-05-24': '부처님오신날',
    '2026-05-25': '대체공휴일',
    '2026-06-06': '현충일',
    '2026-08-15': '광복절',
    '2026-09-24': '추석 연휴',
    '2026-09-25': '추석',
    '2026-09-26': '추석 연휴',
    '2026-10-03': '개천절',
    '2026-10-09': '한글날',
    '2026-12-25': '성탄절',
};

const DAYS = ['일', '월', '화', '수', '목', '금', '토'];

const WORK_TYPES = {
    'WORK': { label: '정상근무', color: 'bg-green-500', text: 'text-green-500', border: 'border-green-500' },
    'FLEX': { label: '유연근무', color: 'bg-blue-500', text: 'text-blue-500', border: 'border-blue-500' },
    'AFTERNOON': { label: '오후근무', color: 'bg-orange-500', text: 'text-orange-500', border: 'border-orange-500' },
    'VACATION': { label: '휴가', color: 'bg-purple-500', text: 'text-purple-500', border: 'border-purple-500' },
} as const;

interface TeamCalendarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function TeamCalendar({ isOpen, onClose }: TeamCalendarProps) {
    const {
        members,
        teamSchedules,
        addMember,
        removeMember,
        setMemberSchedule,
        setMonthSchedule
    } = useProjectStore();

    const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1)); // Start at Jan 2026
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [newMemberName, setNewMemberName] = useState('');
    const [mounted, setMounted] = useState(false);
    const [hiddenMemberIds, setHiddenMemberIds] = useState<Set<string>>(new Set());

    const toggleMemberVisibility = (memberId: string) => {
        const newHidden = new Set(hiddenMemberIds);
        if (newHidden.has(memberId)) {
            newHidden.delete(memberId);
        } else {
            newHidden.add(memberId);
        }
        setHiddenMemberIds(newHidden);
    };

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!isOpen || !mounted) return null;

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    // Helper to get schedule safely
    const getSchedule = (dateStr: string, memberId: string) => {
        return teamSchedules[dateStr]?.[memberId];
    };

    const renderDays = () => {
        const cells = [];

        // Padding
        for (let i = 0; i < firstDayOfMonth; i++) {
            cells.push(<div key={`empty-${i}`} className="min-h-[8rem] bg-black/20 border-r border-b border-white/5" />);
        }

        // Days
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const holidayName = HOLIDAYS[dateStr];
            const dayOfWeek = new Date(year, month, day).getDay();

            // Visual: Sun(0) is Red, Mon(1) is Blue (Weekend), Sat(6) is Normal
            const isWeekend = dayOfWeek === 1; // Monday is the new 'Saturday' (Blue)
            const isRedDay = dayOfWeek === 0 || holidayName; // Sunday is Red

            cells.push(
                <div
                    key={dateStr}
                    onClick={() => setSelectedDate(dateStr)}
                    className={cn(
                        "min-h-[8rem] p-2 border-r border-b border-white/5 relative cursor-pointer hover:bg-white/5 transition-colors group flex flex-col gap-1",
                        selectedDate === dateStr ? "bg-white/10 ring-1 ring-inset ring-primary z-10" : ""
                    )}
                >
                    <div className="flex justify-between items-start mb-1">
                        <span className={cn(
                            "text-sm font-medium",
                            isRedDay ? "text-red-400" : isWeekend ? "text-blue-400" : "text-white/80"
                        )}>
                            {day}
                        </span>
                        {holidayName && (
                            <span className="text-[10px] text-red-300 truncate max-w-[60px]">{holidayName}</span>
                        )}
                    </div>

                    {/* Member Schedules visualization */}
                    <div className="flex flex-col gap-1 overflow-hidden">
                        {members.filter(m => !hiddenMemberIds.has(m.id)).map(member => {
                            const type = getSchedule(dateStr, member.id);
                            if (!type) return null;
                            const style = WORK_TYPES[type as keyof typeof WORK_TYPES] || WORK_TYPES.WORK;

                            return (
                                <div key={member.id} className={cn("text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1", style.color.replace('bg-', 'bg-opacity-20 bg-'), style.text)}>
                                    <div className={cn("w-1.5 h-1.5 rounded-full", member.color)} />
                                    <span className="truncate flex-1 font-medium">{member.name}</span>
                                    <span className="opacity-70 text-[9px]">{style.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        }
        return cells;
    };

    const handleAddMember = () => {
        if (!newMemberName.trim()) return;
        addMember(newMemberName);
        setNewMemberName('');
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-[95vw] h-[90vh] bg-[#1a1b26] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex animate-in zoom-in-95 duration-200">

                {/* Sidebar: Member Management */}
                <div className="w-64 bg-black/20 border-r border-white/10 flex flex-col p-4 shrink-0">
                    <h3 className="text-lg font-bold text-white mb-4 font-tech">팀원 관리</h3>

                    <div className="flex gap-2 mb-6">
                        <Input
                            value={newMemberName}
                            onChange={(e) => setNewMemberName(e.target.value)}
                            placeholder="이름 입력"
                            className="h-9 bg-white/5 border-white/10 text-white text-sm"
                            onKeyDown={(e) => e.key === 'Enter' && handleAddMember()}
                        />
                        <Button size="icon" variant="secondary" className="h-9 w-9 shrink-0" onClick={handleAddMember}>
                            <Plus className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="flex-1 overflow-auto space-y-2">
                        {members.map(member => {
                            const isHidden = hiddenMemberIds.has(member.id);
                            return (
                                <div
                                    key={member.id}
                                    onClick={() => toggleMemberVisibility(member.id)}
                                    className={cn(
                                        "flex items-center justify-between p-2 rounded-lg group border transition-all cursor-pointer",
                                        isHidden
                                            ? "bg-transparent border-transparent opacity-50 hover:bg-white/5"
                                            : "bg-white/5 hover:bg-white/10 border-transparent hover:border-white/10"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-3 h-3 rounded-full shadow-[0_0_8px]",
                                            member.color,
                                            isHidden && "shadow-none bg-gray-500"
                                        )} />
                                        <span className={cn(
                                            "text-sm font-medium transition-colors",
                                            isHidden ? "text-muted-foreground line-through" : "text-white"
                                        )}>{member.name}</span>
                                    </div>

                                    {/* Member Actions Menu */}
                                    <div onClick={(e) => e.stopPropagation()}>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <MoreHorizontal className="w-3 h-3" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48 bg-[#1a1b26] border-white/10 text-white z-[10000]">
                                                <DropdownMenuLabel>일괄 설정 ({month + 1}월)</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => setMonthSchedule(year, month, member.id, 'WORK')}>
                                                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2" /> 정상근무 채우기
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => setMonthSchedule(year, month, member.id, 'FLEX')}>
                                                    <div className="w-2 h-2 rounded-full bg-blue-500 mr-2" /> 유연근무 채우기
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="bg-white/10" />
                                                <DropdownMenuItem className="text-red-400 focus:text-red-400" onClick={() => removeMember(member.id)}>
                                                    <Trash2 className="w-3 h-3 mr-2" /> 팀원 삭제
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">
                        <p>💡 팀원별 메뉴를 통해<br />한 달 일정을 일괄 설정해보세요.</p>
                    </div>
                </div>

                {/* Main Calendar Area */}
                <div className="flex-1 flex flex-col h-full overflow-hidden bg-gradient-to-br from-pink-950/40 via-[#1a1b26] to-purple-950/40">
                    {/* Header */}
                    <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20 shrink-0">
                        <div className="flex items-center gap-6">
                            <h2 className="text-3xl font-bold text-white font-tech">
                                {year}년 {month + 1}월
                            </h2>
                            <div className="flex gap-2">
                                <Button variant="outline" size="icon" onClick={handlePrevMonth} className="hover:bg-white/10 border-white/20">
                                    <ChevronLeft className="w-5 h-5" />
                                </Button>
                                <Button variant="outline" size="icon" onClick={handleNextMonth} className="hover:bg-white/10 border-white/20">
                                    <ChevronRight className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            {/* Legend */}
                            <div className="flex gap-3 mr-4">
                                {Object.entries(WORK_TYPES).map(([key, info]) => (
                                    <div key={key} className="flex items-center gap-1.5">
                                        <div className={cn("w-2 h-2 rounded-full", info.color)} />
                                        <span className="text-xs text-muted-foreground">{info.label}</span>
                                    </div>
                                ))}
                            </div>
                            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full w-10 h-10 hover:bg-red-500/20 hover:text-red-400">
                                <X className="w-6 h-6" />
                            </Button>
                        </div>
                    </div>

                    {/* Grid */}
                    <div className="flex-1 overflow-auto p-6">
                        <div className="grid grid-cols-7 mb-2 text-center text-base font-medium text-muted-foreground">
                            {DAYS.map((d, i) => (
                                <div key={d} className={cn("py-3 border-b border-white/5", i === 0 && "text-red-400", i === 6 && "text-blue-400")}>{d}</div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 border-t border-l border-white/5 bg-white/5 rounded-lg overflow-hidden shadow-inner">
                            {renderDays()}
                        </div>
                    </div>
                </div>

                {/* Selected Date Detail & Edit View */}
                {selectedDate && (
                    <div className="w-80 border-l border-white/10 bg-black/40 backdrop-blur-xl flex flex-col shrink-0 animate-in slide-in-from-right duration-300">
                        <div className="p-6 border-b border-white/10 flex items-center justify-between">
                            <div>
                                <h4 className="text-xl font-bold text-white font-tech">{selectedDate}</h4>
                                <p className="text-xs text-muted-foreground">개별 일정 설정</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setSelectedDate(null)}>
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        <div className="flex-1 overflow-auto p-4 space-y-4">
                            {members.map(member => {
                                const currentType = getSchedule(selectedDate, member.id);
                                return (
                                    <div key={member.id} className="p-3 bg-white/5 rounded-lg border border-white/5">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className={cn("w-3 h-3 rounded-full", member.color)} />
                                            <span className="font-medium text-white">{member.name}</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            {Object.entries(WORK_TYPES).map(([typeKey, info]) => (
                                                <button
                                                    key={typeKey}
                                                    onClick={() => setMemberSchedule(selectedDate, member.id, typeKey as any)}
                                                    className={cn(
                                                        "text-xs px-2 py-1.5 rounded-md border transition-all text-left flex items-center gap-2",
                                                        currentType === typeKey
                                                            ? `${info.color.replace('bg-', 'bg-opacity-20 bg-')} ${info.border} ${info.text}`
                                                            : "border-white/10 text-muted-foreground hover:bg-white/5"
                                                    )}
                                                >
                                                    {currentType === typeKey && <div className={cn("w-1.5 h-1.5 rounded-full", info.color)} />}
                                                    {info.label}
                                                </button>
                                            ))}
                                            <button
                                                onClick={() => setMemberSchedule(selectedDate, member.id, null)}
                                                className={cn(
                                                    "text-xs px-2 py-1.5 rounded-md border border-white/10 text-muted-foreground hover:bg-white/5 hover:text-white transition-all text-center col-span-2",
                                                    !currentType && "bg-white/5"
                                                )}
                                            >
                                                설정 안 함
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
}
