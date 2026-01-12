"use client";

import React, { useState, useCallback } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Task, TaskStatus } from '@/types';
import { apiClient } from '@/lib/api/client';
import { useToast } from '@/components/ui/toast';

interface TaskCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onTaskCreated: (task: Task) => void;
  tasksInTodo: number;
}

export default function TaskCreationModal({
  isOpen,
  onClose,
  projectId,
  onTaskCreated,
  tasksInTodo,
}: TaskCreationModalProps) {
  const [content, setContent] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);

    const newTask: Omit<Task, 'id' | 'created_at'> = {
      project_id: projectId,
      status: 'TODO' as TaskStatus,
      content: content.trim(),
      desc: description.trim(),
      is_ai_generated: false,
      order: tasksInTodo,
    };

    try {
      const response = await apiClient.post<{ task: Task }>('/api/tasks', newTask);

      if (response.task) {
        onTaskCreated(response.task);
        showToast('태스크가 추가되었습니다', 'success');
        setContent('');
        setDescription('');
      }
    } catch (error) {
      console.error('Error creating task:', error);
      showToast('태스크 추가에 실패했습니다', 'error');
    } finally {
      setIsSubmitting(false);
    }
  }, [content, description, isSubmitting, projectId, tasksInTodo, onTaskCreated, showToast]);

  const handleClose = useCallback(() => {
    setContent('');
    setDescription('');
    onClose();
  }, [onClose]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  }, [handleClose]);

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-2xl">
      <div className="bg-card glass-strong p-6 rounded-xl w-full max-w-lg border border-white/10 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">새 태스크 추가</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="h-6 w-6"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 태스크 제목 */}
          <div>
            <label className="text-sm font-medium text-white mb-2 block">
              제목 *
            </label>
            <input
              autoFocus
              type="text"
              placeholder="할 일을 입력하세요..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isSubmitting}
              className="w-full bg-white/5 border border-white/20 rounded-md px-3 py-2 text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary disabled:opacity-50"
            />
          </div>

          {/* 상세 설명 */}
          <div>
            <label className="text-sm font-medium text-white mb-2 block">
              상세 설명
            </label>
            <textarea
              placeholder="상세 내용을 입력하세요... (선택)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSubmitting}
              rows={4}
              className="w-full bg-white/5 border border-white/20 rounded-md px-3 py-2 text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary resize-y disabled:opacity-50"
            />
          </div>

          {/* 버튼 */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button type="submit" disabled={!content.trim() || isSubmitting}>
              {isSubmitting ? '추가 중...' : '추가하기'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
