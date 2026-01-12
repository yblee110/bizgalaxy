"use client";

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, AtSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TaskComment } from '@/types';
import { cn } from '@/lib/utils';

interface TaskCommentsProps {
  comments: TaskComment[];
  onAddComment: (content: string, mentions?: string[]) => Promise<void>;
  onDeleteComment?: (commentId: string) => Promise<void>;
  currentUserId?: string;
  currentUserName: string;
  readOnly?: boolean;
}

interface Mention {
  id: string;
  name: string;
}

export default function TaskComments({
  comments,
  onAddComment,
  onDeleteComment,
  currentUserId,
  currentUserName,
  readOnly = false,
}: TaskCommentsProps) {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMentionPicker, setShowMentionPicker] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mentionListRef = useRef<HTMLDivElement>(null);

  // Sample team members - in real app, this would come from props or API
  const teamMembers: Mention[] = [
    { id: 'user1', name: '김개발' },
    { id: 'user2', name: '이디자인' },
    { id: 'user3', name: '박PM' },
    { id: 'user4', name: '최기획' },
  ];

  // Filter members based on mention query
  const filteredMembers = teamMembers.filter(
    (member) =>
      member.name.toLowerCase().includes(mentionQuery.toLowerCase()) &&
      member.name !== currentUserName
  );

  const handleSubmit = async () => {
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Extract mentions from comment
      const mentions = extractMentions(newComment);
      await onAddComment(newComment.trim(), mentions);
      setNewComment('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const extractMentions = (text: string): string[] => {
    const mentionRegex = /@(\w+)/g;
    const mentions: string[] = [];
    let match: RegExpExecArray | null;
    while ((match = mentionRegex.exec(text)) !== null) {
      if (match) {
        const userName = match[1];
        if (userName) {
          const member = teamMembers.find((m) => m.name === userName);
          if (member) {
            mentions.push(member.id);
          }
        }
      }
    }
    return mentions;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === 'Escape') {
      setShowMentionPicker(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const selectionStart = e.target.selectionStart;
    setCursorPosition(selectionStart);
    setNewComment(value);

    // Check if we should show mention picker
    const textBeforeCursor = value.slice(0, selectionStart);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1) {
      const textAfterLastAt = textBeforeCursor.slice(lastAtIndex + 1);
      const hasSpaceAfterAt = /\s/.test(textAfterLastAt);

      if (!hasSpaceAfterAt && textAfterLastAt.length <= 20) {
        setMentionQuery(textAfterLastAt);
        setShowMentionPicker(true);
      } else {
        setShowMentionPicker(false);
      }
    } else {
      setShowMentionPicker(false);
    }
  };

  const insertMention = (member: Mention) => {
    const textBeforeCursor = newComment.slice(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    const beforeMention = newComment.slice(0, lastAtIndex);
    const afterCursor = newComment.slice(cursorPosition);

    setNewComment(`${beforeMention}@${member.name} ${afterCursor}`);
    setShowMentionPicker(false);
    textareaRef.current?.focus();
  };

  // Scroll mention list into view
  useEffect(() => {
    if (showMentionPicker && mentionListRef.current) {
      mentionListRef.current.scrollIntoView({ block: 'nearest' });
    }
  }, [showMentionPicker]);

  const formatCommentContent = (content: string): React.ReactNode[] => {
    const parts = content.split(/(@(\w+))/g);
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        const userName = part.slice(1);
        const member = teamMembers.find((m) => m.name === userName);
        if (member) {
          return (
            <span key={index} className="text-primary font-medium">
              @{userName}
            </span>
          );
        }
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <MessageSquare className="h-4 w-4" />
        <span>댓글 ({comments.length})</span>
      </div>

      {/* Comments List */}
      <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
        {comments.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">
            댓글이 없습니다. 첫 번째 댓글을 작성해보세요!
          </p>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              isOwner={comment.author_id === currentUserId}
              onDelete={onDeleteComment}
            />
          ))
        )}
      </div>

      {/* Comment Input */}
      {!readOnly && (
        <div className="relative">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={newComment}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="댓글을 입력하세요... (@멘션 가능)"
              className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 pr-10 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary resize-none"
              rows={2}
              disabled={isSubmitting}
            />
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={!newComment.trim() || isSubmitting}
              className="absolute bottom-2 right-2 h-6 w-6 p-0"
            >
              <Send className="h-3 w-3" />
            </Button>
          </div>

          {/* Mention Picker */}
          {showMentionPicker && filteredMembers.length > 0 && (
            <div
              ref={mentionListRef}
              className="absolute bottom-full left-0 mb-2 w-full bg-card border border-white/10 rounded-lg shadow-xl overflow-hidden z-10"
            >
              <div className="p-2 border-b border-white/10 flex items-center gap-2 text-xs text-muted-foreground">
                <AtSign className="h-3 w-3" />
                <span>멘션할 팀원 선택</span>
              </div>
              {filteredMembers.map((member) => (
                <button
                  key={member.id}
                  onClick={() => insertMention(member)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-white/10 transition-colors flex items-center gap-2"
                >
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-xs text-primary font-medium">
                      {member.name[0]}
                    </span>
                  </div>
                  <span className="text-white">{member.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface CommentItemProps {
  comment: TaskComment;
  isOwner?: boolean;
  onDelete?: (commentId: string) => Promise<void>;
}

function CommentItem({ comment, isOwner, onDelete }: CommentItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(comment.id);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (date: Date | { seconds: number; nanoseconds: number }): string => {
    const dateObj =
      date instanceof Date
        ? date
        : new Date(date.seconds * 1000 + date.nanoseconds / 1000000);
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return '방금 전';
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;
    return dateObj.toLocaleDateString('ko-KR');
  };

  const formatCommentContent = (content: string): React.ReactNode => {
    const parts = content.split(/(@[\w가-힣]+)/g);
    return (
      <>
        {parts.map((part, index) => {
          if (part.startsWith('@')) {
            return (
              <span key={index} className="text-primary font-medium">
                {part}
              </span>
            );
          }
          return <span key={index}>{part}</span>;
        })}
      </>
    );
  };

  return (
    <div
      className={cn(
        "flex gap-3 p-3 rounded-lg bg-white/5 border border-white/10",
        isDeleting && "opacity-50"
      )}
    >
      {/* Avatar */}
      <div className="shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
        <span className="text-xs text-primary font-medium">
          {comment.author[0]}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-white">{comment.author}</span>
          <span className="text-xs text-muted-foreground">
            {formatDate(comment.created_at)}
          </span>
          {isOwner && (
            <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded">
              작성자
            </span>
          )}
        </div>
        <p className="text-sm text-white break-words">
          {formatCommentContent(comment.content)}
        </p>
      </div>

      {/* Delete Button */}
      {isOwner && onDelete && (
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="shrink-0 p-1 hover:bg-white/10 rounded transition-colors opacity-0 hover:opacity-100 group-hover:opacity-100"
        >
          <X className="h-4 w-4 text-muted-foreground hover:text-red-400" />
        </button>
      )}
    </div>
  );
}
