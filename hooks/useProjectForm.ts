"use client";

import { useState, useCallback, useEffect } from 'react';
import { UploadedDocument } from '@/types';
import { createUploadedDocument, truncateText } from '@/lib/document-parser';
import { getUserId } from '@/lib/auth';
import { apiClient } from '@/lib/api/client';
import { useToast } from '@/components/ui/toast';

export interface ProjectFormData {
  title: string;
  category: string;
  scale: number;
}

const CATEGORIES = [
  { value: 'Software', label: '소프트웨어' },
  { value: 'Business', label: '비즈니스' },
  { value: 'Design', label: '디자인' },
  { value: 'Marketing', label: '마케팅' },
  { value: 'Finance', label: '재무' },
  { value: 'General', label: '일반' },
] as const;

const DEFAULT_FORM_DATA: ProjectFormData = {
  title: '',
  category: 'General',
  scale: 5,
};

export function useProjectForm(
  isOpen: boolean,
  onSuccess: (project: any) => void,
  onClose: () => void
) {
  const [formData, setFormData] = useState<ProjectFormData>(DEFAULT_FORM_DATA);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [parsedDoc, setParsedDoc] = useState<UploadedDocument | null>(null);
  const { showToast } = useToast();

  // Reset form when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setFormData(DEFAULT_FORM_DATA);
      setSelectedFile(null);
      setParsedDoc(null);
      setIsScanning(false);
    }
  }, [isOpen]);

  const isFormValid = formData.title.trim().length > 0;

  const updateField = useCallback(<K extends keyof ProjectFormData>(
    field: K,
    value: ProjectFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleFileSelect = useCallback(async (file: File) => {
    setSelectedFile(file);
    setIsScanning(true);

    try {
      const uploadedDoc = await createUploadedDocument(file);
      setParsedDoc(uploadedDoc);
    } catch (error) {
      console.error('Error parsing document:', error);
      showToast('문서 파싱에 실패했습니다', 'error');
    } finally {
      setIsScanning(false);
    }
  }, [showToast]);

  const handleFileRemove = useCallback(() => {
    setSelectedFile(null);
    setParsedDoc(null);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const documentText = parsedDoc?.text ? truncateText(parsedDoc.text, 15000) : '';

      const response = await apiClient.post<{ project: any }>('/api/projects', {
        uid: getUserId(),
        title: formData.title.trim(),
        category: formData.category,
        scale: formData.scale,
        documentText,
      });

      if (response.project) {
        onSuccess(response.project);
        showToast('프로젝트가 생성되었습니다', 'success');
        onClose();
      }
    } catch (error) {
      console.error('Error creating project:', error);
      showToast('프로젝트 생성 중 오류가 발생했습니다', 'error');
    } finally {
      setIsSubmitting(false);
    }
  }, [isFormValid, isSubmitting, parsedDoc, formData, onSuccess, onClose, showToast]);

  return {
    formData,
    updateField,
    selectedFile,
    isSubmitting,
    isScanning,
    parsedDoc,
    isFormValid,
    handleFileSelect,
    handleFileRemove,
    handleSubmit,
    CATEGORIES,
  };
}
