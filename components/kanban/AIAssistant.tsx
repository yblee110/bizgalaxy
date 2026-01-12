"use client";

import React, { useState, useCallback } from 'react';
import { Sparkles, TrendingUp, Clock, Lightbulb, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Task, TaskPriority } from '@/types';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/toast';

interface AIRecommendation {
  type: 'priority' | 'categorization' | 'time_estimate' | 'next_action';
  title: string;
  description: string;
  taskId?: string;
  suggestedValue?: string | TaskPriority | number;
}

interface AIReport {
  summary: string;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  averageCompletionTime: number;
  recommendations: string[];
  nextActions: Array<{ task: string; priority: string }>;
}

interface AIAssistantProps {
  tasks: Task[];
  onCategorizeTask?: (taskId: string, category: string) => Promise<void>;
  onSetPriority?: (taskId: string, priority: TaskPriority) => Promise<void>;
  onEstimateTime?: (taskId: string, hours: number) => Promise<void>;
  projectTitle: string;
}

export function useAIAssistant(tasks: Task[]) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeTasks = useCallback(async (): Promise<AIReport> => {
    setIsAnalyzing(true);

    // Simulate AI analysis - in real app, this would call Vertex AI
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'DONE').length;
    const inProgressTasks = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
    const overdueTasks = tasks.filter((t) => {
      if (!t.due_date) return false;
      const dueDate = t.due_date instanceof Date
        ? t.due_date
        : new Date(t.due_date.toDate?.() || t.due_date.seconds * 1000);
      return dueDate < new Date() && t.status !== 'DONE';
    }).length;

    // Calculate average completion time (simulated)
    const averageCompletionTime = completedTasks > 0 ? 2.5 : 0;

    // Generate recommendations
    const recommendations: string[] = [];
    if (inProgressTasks > 5) {
      recommendations.push('진행 중인 작업이 많습니다. 완료하기 쉬운 작업부터 처리해보세요.');
    }
    if (overdueTasks > 0) {
      recommendations.push(`${overdueTasks}개의 마감이 지난 작업이 있습니다. 우선순위를 높이세요.`);
    }
    if (completedTasks / totalTasks < 0.3 && totalTasks > 5) {
      recommendations.push('완료율이 낮습니다. 목표를 더 작게 나누어보세요.');
    }
    if (recommendations.length === 0) {
      recommendations.push('잘하고 계십니다! 현재 속도를 유지해주세요.');
    }

    // Suggest next actions
    const nextActions = tasks
      .filter((t) => t.status === 'TODO')
      .slice(0, 3)
      .map((t) => ({
        task: t.content,
        priority: t.priority || 'MEDIUM',
      }));

    const report: AIReport = {
      summary: `프로젝트 진행률은 ${Math.round((completedTasks / totalTasks) * 100)}%입니다.`,
      totalTasks,
      completedTasks,
      inProgressTasks,
      overdueTasks,
      averageCompletionTime,
      recommendations,
      nextActions,
    };

    setIsAnalyzing(false);
    return report;
  }, [tasks]);

  const suggestPriorities = useCallback((): AIRecommendation[] => {
    // AI-powered priority suggestions based on task content
    const suggestions: AIRecommendation[] = [];

    tasks.forEach((task) => {
      if (task.status === 'DONE' || task.priority) return;

      const contentLower = task.content.toLowerCase();
      let suggestedPriority: TaskPriority = 'MEDIUM';

      // Keyword-based priority detection
      const urgentKeywords = ['긴급', '중요', 'asap', '지금', '즉시', '우선'];
      const highKeywords = ['빨리', '신속', '尽快', 'hurry'];
      const lowKeywords = ['나중에', '여유', '추후', 'optional'];

      if (urgentKeywords.some((kw) => contentLower.includes(kw))) {
        suggestedPriority = 'URGENT';
      } else if (highKeywords.some((kw) => contentLower.includes(kw))) {
        suggestedPriority = 'HIGH';
      } else if (lowKeywords.some((kw) => contentLower.includes(kw))) {
        suggestedPriority = 'LOW';
      }

      if (suggestedPriority !== 'MEDIUM' || !task.priority) {
        suggestions.push({
          type: 'priority',
          title: '우선순위 제안',
          description: `'${task.content}'에 ${getPriorityLabel(suggestedPriority)} 우선순위를 추천합니다.`,
          taskId: task.id,
          suggestedValue: suggestedPriority,
        });
      }
    });

    return suggestions;
  }, [tasks]);

  const suggestCategories = useCallback((): AIRecommendation[] => {
    const suggestions: AIRecommendation[] = [];

    const categoryMap: Record<string, string[]> = {
      '개발': ['코딩', '구현', '개발', 'API', '프론트', '백엔드', '버그', 'fix'],
      '디자인': ['UI', 'UX', '디자인', '화면', '시안', 'Figma', '목업'],
      '기획': ['기획', '요구사항', 'PRD', '명세', '회의', '미팅'],
      '마케팅': ['마케팅', '홍보', 'SNS', '광고', '콘텐츠'],
      '테스트': ['테스트', '검수', 'QA', '확인', '검증'],
    };

    tasks.forEach((task) => {
      if (task.tags && task.tags.length > 0) return;

      const contentLower = task.content.toLowerCase();
      for (const [category, keywords] of Object.entries(categoryMap)) {
        if (keywords.some((kw) => contentLower.includes(kw))) {
          suggestions.push({
            type: 'categorization',
            title: '태그 추천',
            description: `'${task.content}'에 '${category}' 태그를 추천합니다.`,
            taskId: task.id,
            suggestedValue: category,
          });
          break;
        }
      }
    });

    return suggestions;
  }, [tasks]);

  const suggestTimeEstimates = useCallback((): AIRecommendation[] => {
    const suggestions: AIRecommendation[] = [];

    tasks.forEach((task) => {
      if (task.estimated_hours) return;

      // Estimate based on task length and complexity
      const words = task.content.length;
      let estimatedHours = 1;

      if (task.desc) {
        estimatedHours += Math.ceil(task.desc.length / 50);
      }

      if (words > 20) estimatedHours += 1;
      if (task.dependencies && task.dependencies.length > 0) estimatedHours += 1;
      if (task.status === 'GOAL') estimatedHours = Math.max(estimatedHours, 4);

      suggestions.push({
        type: 'time_estimate',
        title: '시간 추정',
        description: `'${task.content}'는 약 ${estimatedHours}시간이 소요될 것으로 예상됩니다.`,
        taskId: task.id,
        suggestedValue: estimatedHours,
      });
    });

    return suggestions.slice(0, 5); // Limit suggestions
  }, [tasks]);

  return {
    isAnalyzing,
    analyzeTasks,
    suggestPriorities,
    suggestCategories,
    suggestTimeEstimates,
  };
}

export default function AIAssistant({
  tasks,
  onCategorizeTask,
  onSetPriority,
  onEstimateTime,
  projectTitle,
}: AIAssistantProps) {
  const [activeTab, setActiveTab] = useState<'report' | 'recommendations'>('report');
  const [report, setReport] = useState<AIReport | null>(null);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const { showToast } = useToast();

  const {
    isAnalyzing,
    analyzeTasks,
    suggestPriorities,
    suggestCategories,
    suggestTimeEstimates,
  } = useAIAssistant(tasks);

  const handleGenerateReport = async () => {
    const generatedReport = await analyzeTasks();
    setReport(generatedReport);
    setActiveTab('report');
  };

  const handleGetRecommendations = () => {
    const allRecommendations = [
      ...suggestPriorities(),
      ...suggestCategories(),
      ...suggestTimeEstimates(),
    ];
    setRecommendations(allRecommendations.slice(0, 10));
    setActiveTab('recommendations');
  };

  const handleApplyRecommendation = async (recommendation: AIRecommendation) => {
    try {
      if (recommendation.type === 'priority' && onSetPriority && recommendation.taskId) {
        await onSetPriority(recommendation.taskId, recommendation.suggestedValue as TaskPriority);
        showToast('우선순위가 업데이트되었습니다', 'success');
      } else if (
        recommendation.type === 'categorization' &&
        onCategorizeTask &&
        recommendation.taskId
      ) {
        await onCategorizeTask(recommendation.taskId, recommendation.suggestedValue as string);
        showToast('태그가 추가되었습니다', 'success');
      } else if (
        recommendation.type === 'time_estimate' &&
        onEstimateTime &&
        recommendation.taskId
      ) {
        await onEstimateTime(recommendation.taskId, recommendation.suggestedValue as number);
        showToast('시간 추정이 추가되었습니다', 'success');
      }

      // Remove applied recommendation
      setRecommendations((prev) =>
        prev.filter((r) => r.taskId !== recommendation.taskId || r.type !== recommendation.type)
      );
    } catch (error) {
      showToast('적용 중 오류가 발생했습니다', 'error');
    }
  };

  return (
    <div className="glass rounded-xl p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-white">AI 어시스턴트</h3>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="glass"
          onClick={handleGenerateReport}
          disabled={isAnalyzing || tasks.length === 0}
          className="h-20 flex-col gap-1"
        >
          <TrendingUp className="h-5 w-5" />
          <span className="text-xs">진행률 리포트</span>
        </Button>
        <Button
          variant="glass"
          onClick={handleGetRecommendations}
          disabled={isAnalyzing || tasks.length === 0}
          className="h-20 flex-col gap-1"
        >
          <Wand2 className="h-5 w-5" />
          <span className="text-xs">스마트 추천</span>
        </Button>
      </div>

      {/* Content */}
      {isAnalyzing ? (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Sparkles className="h-4 w-4 animate-pulse" />
            <span className="text-sm">AI 분석 중...</span>
          </div>
        </div>
      ) : (
        <>
          {activeTab === 'report' && report && <AIReportView report={report} />}
          {activeTab === 'recommendations' && recommendations.length > 0 && (
            <AIRecommendationsView
              recommendations={recommendations}
              onApply={handleApplyRecommendation}
            />
          )}
        </>
      )}

      {/* Quick Insights */}
      {tasks.length > 0 && !report && recommendations.length === 0 && (
        <QuickInsights tasks={tasks} />
      )}
    </div>
  );
}

function AIReportView({ report }: { report: AIReport }) {
  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="p-3 bg-primary/20 border border-primary/30 rounded-lg">
        <p className="text-sm text-white">{report.summary}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2">
        <StatItem label="완료" value={report.completedTasks} total={report.totalTasks} color="#22C55E" />
        <StatItem label="진행 중" value={report.inProgressTasks} total={report.totalTasks} color="#EAB308" />
        {report.overdueTasks > 0 && (
          <StatItem label="마감 초과" value={report.overdueTasks} color="#EF4444" />
        )}
        <StatItem label="평균 소요시간" value={`${report.averageCompletionTime}h`} />
      </div>

      {/* Recommendations */}
      {report.recommendations.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-white flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-yellow-400" />
            제안사항
          </h4>
          {report.recommendations.map((rec, i) => (
            <div key={i} className="p-2 bg-white/5 rounded-lg text-xs text-muted-foreground">
              {rec}
            </div>
          ))}
        </div>
      )}

      {/* Next Actions */}
      {report.nextActions.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-white flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-400" />
            다음 작업
          </h4>
          {report.nextActions.map((action, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-2 bg-white/5 rounded-lg"
            >
              <span className="text-xs text-white truncate flex-1">{action.task}</span>
              <span
                className={cn(
                  'ml-2 px-2 py-0.5 rounded text-[10px]',
                  action.priority === 'HIGH' || action.priority === 'URGENT'
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-blue-500/20 text-blue-400'
                )}
              >
                {getPriorityLabel(action.priority as TaskPriority)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AIRecommendationsView({
  recommendations,
  onApply,
}: {
  recommendations: AIRecommendation[];
  onApply: (rec: AIRecommendation) => void;
}) {
  return (
    <div className="space-y-2 max-h-60 overflow-y-auto">
      {recommendations.map((rec, i) => (
        <div
          key={i}
          className="p-3 bg-white/5 border border-white/10 rounded-lg space-y-2"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className="text-sm font-medium text-white">{rec.title}</p>
              <p className="text-xs text-muted-foreground">{rec.description}</p>
            </div>
            <Button
              size="sm"
              onClick={() => onApply(rec)}
              className="h-7 text-xs shrink-0"
            >
              적용
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

function QuickInsights({ tasks }: { tasks: Task[] }) {
  const insights = React.useMemo(() => {
    const insights = [];
    const completedToday = tasks.filter((t) => {
      if (t.status !== 'DONE') return false;
      const createdDate =
        t.created_at instanceof Date
          ? t.created_at
          : new Date(t.created_at.seconds * 1000);
      return createdDate.toDateString() === new Date().toDateString();
    }).length;

    if (completedToday > 0) {
      insights.push(`오늘 ${completedToday}개의 작업을 완료했습니다! 🎉`);
    }

    const highPriorityIncomplete = tasks.filter(
      (t) => (t.priority === 'HIGH' || t.priority === 'URGENT') && t.status !== 'DONE'
    ).length;

    if (highPriorityIncomplete > 0) {
      insights.push(`${highPriorityIncomplete}개의 높은 우선순위 작업이 남았습니다.`);
    }

    if (insights.length === 0) {
      insights.push('태스크를 추가하면 AI가 인사이트를 제공합니다.');
    }

    return insights;
  }, [tasks]);

  return (
    <div className="space-y-2">
      {insights.map((insight, i) => (
        <div key={i} className="p-3 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-lg">
          <p className="text-xs text-white">{insight}</p>
        </div>
      ))}
    </div>
  );
}

function StatItem({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number | string;
  total?: number;
  color?: string;
}) {
  return (
    <div className="p-3 bg-white/5 rounded-lg">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold" style={{ color }}>
        {typeof value === 'number' && total ? `${value}/${total}` : value}
      </p>
    </div>
  );
}

function getPriorityLabel(priority: TaskPriority): string {
  const labels = {
    LOW: '낮음',
    MEDIUM: '보통',
    HIGH: '높음',
    URGENT: '긴급',
  };
  return labels[priority];
}
