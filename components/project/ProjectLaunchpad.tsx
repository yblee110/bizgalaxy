"use client";

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useProjectStore } from '@/stores/projectStore';
import ScaleSlider from './ScaleSlider';
import DocumentDropzone from './DocumentDropzone';
import { createUploadedDocument, truncateText } from '@/lib/document-parser';
import { extractTasksFromDocument } from '@/lib/vertex-ai';
import { getUserId } from '@/lib/auth';
import { UploadedDocument } from '@/types';

const CATEGORIES = [
  { value: 'Software', label: '소프트웨어' },
  { value: 'Business', label: '비즈니스' },
  { value: 'Design', label: '디자인' },
  { value: 'Marketing', label: '마케팅' },
  { value: 'Finance', label: '재무' },
  { value: 'General', label: '일반' },
] as const;

export default function ProjectLaunchpad() {
  const { isLaunchpadOpen, closeLaunchpad, addProject } = useProjectStore();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('General');
  const [scale, setScale] = useState(5);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [parsedDoc, setParsedDoc] = useState<UploadedDocument | null>(null);

  const isFormValid = title.trim().length > 0;

  // Debug log
  useEffect(() => {
    console.log('[ProjectLaunchpad] isLaunchpadOpen:', isLaunchpadOpen);
  }, [isLaunchpadOpen]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!isLaunchpadOpen) {
      setTitle('');
      setCategory('General');
      setScale(5);
      setSelectedFile(null);
      setParsedDoc(null);
      setIsScanning(false);
    }
  }, [isLaunchpadOpen]);

  const handleFileSelect = async (file: File) => {
    console.log('[ProjectLaunchpad] handleFileSelect called');
    setSelectedFile(file);
    setIsScanning(true);

    try {
      const uploadedDoc = await createUploadedDocument(file);
      setParsedDoc(uploadedDoc);
    } catch (error) {
      console.error('Error parsing document:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const handleFileRemove = () => {
    console.log('[ProjectLaunchpad] handleFileRemove called');
    setSelectedFile(null);
    setParsedDoc(null);
  };

  const handleLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[ProjectLaunchpad] handleLaunch called, isFormValid:', isFormValid);
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);

    try {
      let summary = '';
      let aiGeneratedTasks: any[] = [];

      if (parsedDoc && parsedDoc.text) {
        try {
          const truncatedText = truncateText(parsedDoc.text, 15000);
          const result = await extractTasksFromDocument(truncatedText);
          summary = result.summary;
          aiGeneratedTasks = result.tasks;
        } catch (error) {
          console.error('Error extracting tasks:', error);
        }
      }

      const newProject = {
        id: `project_${Date.now()}`,
        uid: getUserId(),
        title: title.trim(),
        category,
        scale,
        summary,
        created_at: new Date(),
      };

      console.log('[ProjectLaunchpad] Creating project:', newProject);
      addProject(newProject as any);

      if (aiGeneratedTasks.length > 0) {
        const tasksWithProjectId = aiGeneratedTasks.map((task, index) => ({
          ...task,
          id: `task_${Date.now()}_${index}`,
          project_id: newProject.id,
          created_at: new Date(),
        }));
        localStorage.setItem(
          `tasks_${newProject.id}`,
          JSON.stringify(tasksWithProjectId)
        );

        const { useTaskStore } = await import('@/stores/taskStore');
        const taskStore = useTaskStore.getState();
        taskStore.setTasks(newProject.id, tasksWithProjectId);
      }

      closeLaunchpad();
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = () => {
    console.log('[ProjectLaunchpad] backdrop clicked');
    closeLaunchpad();
  };

  const handleCategoryClick = (catValue: string) => {
    console.log('[ProjectLaunchpad] category clicked:', catValue);
    setCategory(catValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('[ProjectLaunchpad] input changed:', e.target.value);
    setTitle(e.target.value);
  };

  if (!isLaunchpadOpen) return null;

  console.log('[ProjectLaunchpad] Rendering modal...');

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop - clicking this closes the modal */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleBackdropClick}
      />

      {/* Modal - positioned in center */}
      <div className="relative w-full max-w-md bg-card/95 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-2xl z-10">
        {/* Close Button */}
        <button
          onClick={() => {
            console.log('[ProjectLaunchpad] close button clicked');
            closeLaunchpad();
          }}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/10 transition-colors"
          type="button"
        >
          <X className="h-5 w-5 text-white" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-tech text-white">
            새 프로젝트 시작 🚀
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            비즈니스 갤럭시에 새로운 행성을 만들어보세요
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLaunch} className="space-y-6">
          {/* Title Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white block">
              프로젝트 이름
            </label>
            <Input
              type="text"
              placeholder="프로젝트 이름을 입력하세요..."
              value={title}
              onChange={handleInputChange}
              autoComplete="off"
              autoFocus
              className="bg-white/5 border-white/20 text-white placeholder:text-muted-foreground"
            />
            <p className="text-xs text-muted-foreground">입력된 값: {title}</p>
          </div>

          {/* Category Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white block">카테고리</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => handleCategoryClick(cat.value)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${category === cat.value
                      ? 'bg-primary text-white'
                      : 'bg-white/5 text-muted-foreground hover:bg-white/10'
                    }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">선택된 카테고리: {category}</p>
          </div>

          {/* Scale Slider */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white block">
              프로젝트 규모 (행성 크기)
            </label>
            <ScaleSlider value={scale} onChange={setScale} />
          </div>

          {/* Document Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white block">
              기획서 업로드 (선택)
            </label>
            <DocumentDropzone
              onFileSelect={handleFileSelect}
              onFileRemove={handleFileRemove}
              selectedFile={selectedFile}
              isScanning={isScanning}
            />
            <p className="text-xs text-muted-foreground">
              PDF 또는 Markdown 파일을 업로드하면 AI가 자동으로 태스크를 생성합니다
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                console.log('[ProjectLaunchpad] cancel clicked');
                closeLaunchpad();
              }}
              disabled={isSubmitting}
              className="flex-1"
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid || isSubmitting || isScanning}
              className="flex-1"
            >
              {isSubmitting ? '생성 중...' : '시작하기 🚀'}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            폼 유효성: {isFormValid ? '✓' : '✗'} | 제출 중: {isSubmitting ? '✓' : '✗'}
          </p>
        </form>
      </div>
    </div>
  );
}
