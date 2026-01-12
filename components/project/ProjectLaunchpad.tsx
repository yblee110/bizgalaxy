"use client";

import React, { useCallback } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useProjectStore } from '@/stores/projectStore';
import ScaleSlider from './ScaleSlider';
import DocumentDropzone from './DocumentDropzone';
import { useProjectForm } from '@/hooks/useProjectForm';

export default function ProjectLaunchpad() {
  const { isLaunchpadOpen, closeLaunchpad, addProject } = useProjectStore();

  const form = useProjectForm(
    isLaunchpadOpen,
    useCallback((project) => {
      addProject(project);
    }, [addProject]),
    closeLaunchpad
  );

  const handleBackdropClick = useCallback(() => {
    closeLaunchpad();
  }, [closeLaunchpad]);

  if (!isLaunchpadOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleBackdropClick}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-card/95 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-2xl z-10">
        {/* Close Button */}
        <button
          onClick={closeLaunchpad}
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
        <form onSubmit={form.handleSubmit} className="space-y-6">
          {/* Title Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white block">
              프로젝트 이름
            </label>
            <Input
              type="text"
              placeholder="프로젝트 이름을 입력하세요..."
              value={form.formData.title}
              onChange={(e) => form.updateField('title', e.target.value)}
              autoComplete="off"
              autoFocus
              className="bg-white/5 border-white/20 text-white placeholder:text-muted-foreground"
            />
          </div>

          {/* Category Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white block">카테고리</label>
            <div className="flex flex-wrap gap-2">
              {form.CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => form.updateField('category', cat.value)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    form.formData.category === cat.value
                      ? 'bg-primary text-white'
                      : 'bg-white/5 text-muted-foreground hover:bg-white/10'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Scale Slider */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white block">
              프로젝트 규모 (행성 크기)
            </label>
            <ScaleSlider
              value={form.formData.scale}
              onChange={(value) => form.updateField('scale', value)}
            />
          </div>

          {/* Document Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white block">
              기획서 업로드 (선택)
            </label>
            <DocumentDropzone
              onFileSelect={form.handleFileSelect}
              onFileRemove={form.handleFileRemove}
              selectedFile={form.selectedFile}
              isScanning={form.isScanning}
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
              onClick={closeLaunchpad}
              disabled={form.isSubmitting}
              className="flex-1"
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={!form.isFormValid || form.isSubmitting || form.isScanning}
              className="flex-1"
            >
              {form.isSubmitting ? '생성 중...' : '시작하기 🚀'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
