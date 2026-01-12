"use client";

import React, { useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { cn } from '@/lib/utils';
import { useProjectStore } from '@/stores/projectStore';
import { Users } from 'lucide-react';

import TeamCalendar from './TeamCalendar';

export default function TeamNode({ selected }: { selected?: boolean }) {
    const { teamName, setTeamName } = useProjectStore();
    const [isEditing, setIsEditing] = useState(false);
    const [inputValue, setInputValue] = useState(teamName);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [clickTimeout, setClickTimeout] = useState<NodeJS.Timeout | null>(null);

    // Single Click -> Edit Name (with delay to wait for potential double click)
    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent React Flow selection interference if needed

        // If already editing, do nothing (click enters input)
        if (isEditing) return;

        if (clickTimeout) {
            clearTimeout(clickTimeout);
            setClickTimeout(null);
        }

        const timeout = setTimeout(() => {
            setIsEditing(true);
            setInputValue(teamName);
            setClickTimeout(null);
        }, 250);

        setClickTimeout(timeout);
    };

    // Double Click -> Open Calendar
    const handleDoubleClick = (e: React.MouseEvent) => {
        e.stopPropagation();

        if (clickTimeout) {
            clearTimeout(clickTimeout);
            setClickTimeout(null);
        }

        setIsEditing(false); // Ensure we don't enter edit mode
        setIsCalendarOpen(true);
    };

    const handleBlur = () => {
        setIsEditing(false);
        if (inputValue.trim()) {
            setTeamName(inputValue);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleBlur();
        }
    };

    return (
        <>
            <div
                className={cn(
                    'relative w-48 h-48 rounded-full flex items-center justify-center transition-all duration-300',
                    'glass-strong border-2',
                    selected ? 'shadow-[0_0_50px_rgba(247,88,92,0.6)] scale-105 border-[#F7585C]' : 'hover:scale-105 hover:shadow-[0_0_30px_rgba(247,88,92,0.4)] hover:border-[#F7585C]/80 border-[#F7585C]/60'
                )}
                onClick={handleClick}
                onDoubleClick={handleDoubleClick}
            >
                {/* Central handles */}
                <Handle
                    type="source"
                    position={Position.Right}
                    className="!bg-transparent !border-none !w-0 !h-0"
                    style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
                />

                {/* Decorative pulsed rings */}
                <div className="absolute inset-0 rounded-full border border-[#F7585C]/30 animate-pulse" style={{ animationDuration: '3s' }} />
                <div className="absolute -inset-4 rounded-full border border-[#F7585C]/10 animate-pulse" style={{ animationDuration: '4s' }} />

                <div className="text-center z-10 flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-[#F7585C]/20 flex items-center justify-center mb-1 drop-shadow-[0_0_10px_rgba(247,88,92,0.5)]">
                        <Users className="w-6 h-6 text-[#F7585C]" />
                    </div>

                    {isEditing ? (
                        <input
                            autoFocus
                            className="bg-transparent border-b border-white/50 text-center text-lg font-bold text-white focus:outline-none w-32"
                            value={inputValue}
                            onClick={(e) => e.stopPropagation()} // Allow clicking inside input without triggering node handlers
                            onChange={(e) => setInputValue(e.target.value)}
                            onBlur={handleBlur}
                            onKeyDown={handleKeyDown}
                        />
                    ) : (
                        <h2 className="text-lg font-bold text-white font-tech tracking-wider cursor-default max-w-[140px] truncate select-none">
                            {teamName}
                        </h2>
                    )}
                    <p className="text-[10px] select-none text-[#F7585C] drop-shadow-[0_0_8px_rgba(247,88,92,0.8)]">Team Center</p>
                </div>
            </div>

            <TeamCalendar isOpen={isCalendarOpen} onClose={() => setIsCalendarOpen(false)} />
        </>
    );
}
