"use client";

import React, { useState } from 'react';
import { X, Calendar, Flag, Clock, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Task, TaskComment, TaskAttachment, TaskPriority } from '@/types';
import { cn } from '@/lib/utils';
import TaskComments from './TaskComments';
import TaskAttachments from './TaskAttachments';
import TaskDependencies from './TaskDependencies';
import { useToast } from '@/components/ui/toast';

interface TaskDetailModalProps {
  task: Task;
  allTasks: Task[];
  isOpen: boolean;
  onClose: () => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  onDeleteTask?: (taskId: string) => Promise<void>;
}

const PRIORITY_OPTIONS: Array<{ value: TaskPriority; label: string; color: string }> = [
  { value: 'LOW', label: '낮음', color: '#6B7280' },
  { value: 'MEDIUM', label: '보통', color: '#3B82F6' },
  { value: 'HIGH', label: '높음', color: '#F97316' },
  { value: 'URGENT', label: '긴급', color: '#EF4444' },
];

export default function TaskDetailModal({
  task,
  allTasks,
  isOpen,
  onClose,
  onUpdateTask,
  onDeleteTask,
}: TaskDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'attachments' | 'dependencies'>('details');
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(task.content);
  const [editedDesc, setEditedDesc] = useState(task.desc || '');
  const { showToast } = useToast();

  // Sample data - in real app, fetch from API
  const [comments] = useState<TaskComment[]>([]);
  const [attachments] = useState<TaskAttachment[]>([]);

  if (!isOpen) return null;

  const handleSave = async () => {
    try {
      await onUpdateTask(task.id, {
        content: editedContent,
        desc: editedDesc,
      });
      setIsEditing(false);
      showToast('태스크가 업데이트되었습니다', 'success');
    } catch (error) {
      showToast('업데이트 중 오류가 발생했습니다', 'error');
    }
  };

  const handleSetPriority = async (priority: TaskPriority) => {
    try {
      await onUpdateTask(task.id, { priority });
      showToast('우선순위가 업데이트되었습니다', 'success');
    } catch (error) {
      showToast('업데이트 중 오류가 발생했습니다', 'error');
    }
  };

  const handleSetDueDate = async (dueDate: string) => {
    try {
      await onUpdateTask(task.id, { due_date: new Date(dueDate) });
      showToast('마감일이 설정되었습니다', 'success');
    } catch (error) {
      showToast('업데이트 중 오류가 발생했습니다', 'error');
    }
  };

  const handleAddDependency = async (taskId: string) => {
    const currentDeps = task.dependencies || [];
    await onUpdateTask(task.id, {
      dependencies: [...currentDeps, taskId],
    });
  };

  const handleRemoveDependency = async (taskId: string) => {
    const currentDeps = task.dependencies || [];
    await onUpdateTask(task.id, {
      dependencies: currentDeps.filter((id) => id !== taskId),
    });
  };

  const handleDelete = async () => {
    if (confirm('이 태스크를 삭제하시겠습니까?')) {
      if (onDeleteTask) {
        await onDeleteTask(task.id);
        onClose();
        showToast('태스크가 삭제되었습니다', 'success');
      }
    }
  };

  const tabs = [
    { id: 'details' as const, label: '상세', icon: null },
    { id: 'comments' as const, label: '댓글', icon: null, count: comments.length },
    { id: 'attachments' as const, label: '파일', icon: null, count: attachments.length },
    {
      id: 'dependencies' as const,
      label: '의존성',
      icon: null,
      count: task.dependencies?.length || 0,
    },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-card/95 backdrop-blur-lg border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex-1">
            {isEditing ? (
              <Input
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="bg-white/5 border-white/20 text-white"
                autoFocus
              />
            ) : (
              <h2 className="text-xl font-semibold text-white">{task.content}</h2>
            )}
            <div className="flex items-center gap-2 mt-1">
              <span
                className={cn(
                  'text-xs px-2 py-0.5 rounded-full',
                  task.status === 'DONE'
                    ? 'bg-green-500/20 text-green-400'
                    : task.status === 'IN_PROGRESS'
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-red-500/20 text-red-400'
                )}
              >
                {task.status === 'DONE' ? '완료' : task.status === 'IN_PROGRESS' ? '진행 중' : '할 일'}
              </span>
              {task.priority && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: PRIORITY_OPTIONS.find((p) => p.value === task.priority)?.color + '33',
                    color: PRIORITY_OPTIONS.find((p) => p.value === task.priority)?.color,
                  }}
                >
                  {PRIORITY_OPTIONS.find((p) => p.value === task.priority)?.label}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button size="sm" onClick={handleSave}>
                  저장
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
                  취소
                </Button>
              </>
            ) : (
              <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)}>
                편집
              </Button>
            )}
            {onDeleteTask && (
              <Button size="sm" variant="ghost" onClick={handleDelete} className="text-red-400">
                삭제
              </Button>
            )}
            <Button size="icon" variant="ghost" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10 px-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-4 py-3 text-sm font-medium transition-colors relative',
                activeTab === tab.id
                  ? 'text-white'
                  : 'text-muted-foreground hover:text-white'
              )}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="ml-1 text-xs bg-primary/20 text-primary px-1.5 rounded-full">
                  {tab.count}
                </span>
              )}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'details' && (
            <div className="space-y-4">
              {/* Description */}
              <div>
                <label className="text-sm font-medium text-white mb-2 block">설명</label>
                {isEditing ? (
                  <textarea
                    value={editedDesc}
                    onChange={(e) => setEditedDesc(e.target.value)}
                    className="w-full bg-white/5 border border-white/20 rounded-lg p-3 text-white text-sm min-h-[100px] resize-y"
                    placeholder="설명을 입력하세요..."
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {task.desc || '설명이 없습니다.'}
                  </p>
                )}
              </div>

              {/* Priority Selector */}
              <div>
                <label className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                  <Flag className="h-4 w-4" />
                  우선순위
                </label>
                <div className="flex flex-wrap gap-2">
                  {PRIORITY_OPTIONS.map((priority) => (
                    <button
                      key={priority.value}
                      onClick={() => handleSetPriority(priority.value)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                        task.priority === priority.value
                          ? 'text-white border-2'
                          : 'bg-white/5 text-muted-foreground hover:bg-white/10 border border-transparent'
                      )}
                      style={
                        task.priority === priority.value
                          ? { backgroundColor: priority.color, borderColor: priority.color }
                          : {}
                      }
                    >
                      {priority.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Due Date */}
              <div>
                <label className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  마감일
                </label>
                <Input
                  type="date"
                  value={
                    task.due_date
                      ? new Date(
                          task.due_date instanceof Date
                            ? task.due_date
                            : task.due_date.seconds * 1000
                        )
                          .toISOString()
                          .split('T')[0]
                      : ''
                  }
                  onChange={(e) => handleSetDueDate(e.target.value)}
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>

              {/* Tags */}
              {task.tags && task.tags.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    태그
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {task.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-primary/20 text-primary rounded text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Time Estimates */}
              {(task.estimated_hours || task.actual_hours) && (
                <div>
                  <label className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    시간 추정
                  </label>
                  <div className="flex gap-4 text-sm">
                    {task.estimated_hours && (
                      <div>
                        <span className="text-muted-foreground">예상: </span>
                        <span className="text-white">{task.estimated_hours}h</span>
                      </div>
                    )}
                    {task.actual_hours && (
                      <div>
                        <span className="text-muted-foreground">실제: </span>
                        <span className="text-white">{task.actual_hours}h</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="pt-4 border-t border-white/10 text-xs text-muted-foreground">
                <p>생성일: {new Date(task.created_at instanceof Date ? task.created_at : task.created_at.seconds * 1000).toLocaleDateString('ko-KR')}</p>
                {task.is_ai_generated && (
                  <p className="text-primary mt-1">AI에 의해 생성된 태스크</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'comments' && (
            <TaskComments
              comments={comments}
              onAddComment={async () => {}}
              currentUserName="현재 사용자"
            />
          )}

          {activeTab === 'attachments' && (
            <TaskAttachments
              attachments={attachments}
              onUpload={async () => {}}
              onRemove={async () => {}}
            />
          )}

          {activeTab === 'dependencies' && (
            <TaskDependencies
              task={task}
              allTasks={allTasks}
              onAddDependency={handleAddDependency}
              onRemoveDependency={handleRemoveDependency}
            />
          )}
        </div>
      </div>
    </div>
  );
}
