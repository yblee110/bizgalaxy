"use client";

import React, { useState } from 'react';
import { X, Target, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProjectStore } from '@/stores/projectStore';
import { useTaskStore } from '@/stores/taskStore';
import { Task, TaskStatus } from '@/types';

interface QuickTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const STATUS_OPTIONS: Array<{ value: TaskStatus; label: string; icon: React.ReactNode; color: string }> = [
    { value: 'GOAL', label: '사업 목표', icon: <Target className="w-4 h-4" />, color: 'bg-purple-500' },
    { value: 'TODO', label: '할 일', icon: <Clock className="w-4 h-4" />, color: 'bg-red-500' },
    { value: 'IN_PROGRESS', label: '진행 중', icon: <Clock className="w-4 h-4" />, color: 'bg-yellow-500' },
];

export default function QuickTaskModal({ isOpen, onClose }: QuickTaskModalProps) {
    const { projects } = useProjectStore();
    const { addTask } = useTaskStore();
    const [selectedProjectId, setSelectedProjectId] = useState<string>('');
    const [content, setContent] = useState('');
    const [desc, setDesc] = useState('');
    const [status, setStatus] = useState<TaskStatus>('TODO');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Auto-select first project when modal opens
    React.useEffect(() => {
        if (isOpen && projects.length > 0 && !selectedProjectId) {
            setSelectedProjectId(projects[0].id);
        }
    }, [isOpen, projects, selectedProjectId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || !selectedProjectId) return;

        setIsSubmitting(true);
        try {
            const newTask: Task = {
                id: `task_${Date.now()}`,
                project_id: selectedProjectId,
                status,
                content: content.trim(),
                desc: desc.trim(),
                is_ai_generated: false,
                order: 0,
                created_at: new Date(),
            };

            // Add to local store
            addTask(selectedProjectId, newTask);

            // Sync with Firestore
            await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTask),
            });

            // Reset and close
            setContent('');
            setDesc('');
            setStatus('TODO');
            onClose();
        } catch (error) {
            console.error('Error creating task:', error);
            alert('태스크 생성 중 오류가 발생했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md glass-strong rounded-2xl p-6 border border-white/10 shadow-2xl animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-white font-tech">빠른 태스크 추가</h3>
                        <p className="text-xs text-muted-foreground mt-1">프로젝트에 새로운 태스크를 추가하세요</p>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="hover:bg-white/10"
                    >
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Project Selection */}
                    <div>
                        <label className="text-sm text-muted-foreground mb-2 block">프로젝트</label>
                        <div className="grid grid-cols-2 gap-2">
                            {projects.map((project) => (
                                <button
                                    key={project.id}
                                    type="button"
                                    onClick={() => setSelectedProjectId(project.id)}
                                    className={`
                                        p-3 rounded-lg border text-left transition-all
                                        ${selectedProjectId === project.id
                                            ? 'border-primary bg-primary/20 text-white'
                                            : 'border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10'
                                        }
                                    `}
                                >
                                    <div className="font-medium truncate text-sm">{project.title}</div>
                                    <div className="text-[10px] opacity-70 truncate">{project.category}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Status Selection */}
                    <div>
                        <label className="text-sm text-muted-foreground mb-2 block">상태</label>
                        <div className="flex gap-2">
                            {STATUS_OPTIONS.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setStatus(option.value)}
                                    className={`
                                        flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-all
                                        ${status === option.value
                                            ? `${option.color} text-white border-transparent`
                                            : 'border-white/10 text-muted-foreground hover:bg-white/10'
                                        }
                                    `}
                                >
                                    {option.icon}
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Task Content */}
                    <div>
                        <label className="text-sm text-muted-foreground mb-2 block">태스크 제목</label>
                        <input
                            autoFocus
                            type="text"
                            placeholder="예: UI 디자인 시스템 구축"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                        />
                    </div>

                    {/* Task Description */}
                    <div>
                        <label className="text-sm text-muted-foreground mb-2 block">설명 (선택)</label>
                        <textarea
                            placeholder="구체적인 실행 가이드를 입력하세요..."
                            value={desc}
                            onChange={(e) => setDesc(e.target.value)}
                            rows={3}
                            className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            className="flex-1"
                        >
                            취소
                        </Button>
                        <Button
                            type="submit"
                            disabled={!content.trim() || !selectedProjectId || isSubmitting}
                            className="flex-1"
                        >
                            {isSubmitting ? '추가 중...' : '추가하기'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
