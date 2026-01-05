"use client";

import React from 'react';
import { Slider } from '@/components/ui/slider';

interface ScaleSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export default function ScaleSlider({ value, onChange }: ScaleSliderProps) {
  // Calculate size: scale 1 = 60px, scale 10 = 240px
  const size = 60 + (value - 1) * 20;

  return (
    <div className="space-y-4">
      {/* Preview */}
      <div className="flex justify-center py-6">
        <div
          className="relative rounded-full border-2 border-primary/50 transition-all duration-300"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            background: `radial-gradient(circle at 30% 30%, #7C3AED88, #7C3AED22)`,
            boxShadow: '0 0 15px rgba(124, 58, 237, 0.5)',
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          </div>
        </div>
      </div>

      {/* Slider */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>소규모</span>
          <span className="text-primary font-semibold">레벨 {value}</span>
          <span>대규모</span>
        </div>
        <Slider
          value={[value]}
          onValueChange={(v) => onChange(v[0])}
          min={1}
          max={10}
          step={1}
          className="w-full"
        />
      </div>

      {/* Scale description */}
      <p className="text-center text-sm text-muted-foreground">
        {getScaleDescription(value)}
      </p>
    </div>
  );
}

function getScaleDescription(scale: number): string {
  const descriptions: Record<number, string> = {
    1: '작은 사이드 프로젝트',
    2: '소규모 개인 프로젝트',
    3: '보통 이니셔티브',
    4: '중간 규모 프로젝트',
    5: '표준 비즈니스 벤처',
    6: '상당한 운영 규모',
    7: '주요 비즈니스 유닛',
    8: '대규모 기업',
    9: '핵심 회사 사업부',
    10: '메인 법인 / 대표 사업',
  };
  return descriptions[scale] || descriptions[5];
}
