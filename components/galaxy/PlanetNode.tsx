"use client";
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { cn } from '@/lib/utils';
import { Project } from '@/types';
import { useProjectStore } from '@/stores/projectStore';
import { Palette } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { GALAXY_CONFIG } from '@/lib/constants';

interface PlanetNodeData extends Project {
  onSelect?: (project: Project) => void;
}

interface PlanetNodeProps {
  id: string;
  data: PlanetNodeData;
  selected?: boolean;
}

const PLANET_COLORS = [
  { name: 'Red', value: '#EF4444' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Amber', value: '#F59E0B' },
  { name: 'Yellow', value: '#EAB308' },
  { name: 'Lime', value: '#84CC16' },
  { name: 'Green', value: '#22C55E' },
  { name: 'Emerald', value: '#10B981' },
  { name: 'Teal', value: '#14B8A6' },
  { name: 'Cyan', value: '#06B6D4' },
  { name: 'Sky', value: '#0EA5E9' },
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Indigo', value: '#6366F1' },
  { name: 'Violet', value: '#8B5CF6' },
  { name: 'Purple', value: '#A855F7' },
  { name: 'Fuchsia', value: '#D946EF' },
  { name: 'Pink', value: '#EC4899' },
];

export default function PlanetNode({ id, data, selected }: PlanetNodeProps) {
  const { updateProject } = useProjectStore();
  const scale = data.scale || 5;
  const { BASE_SIZE, SIZE_INCREMENT, MIN_FONT_SIZE, FONT_SCALE_FACTOR, BASE_FONT_SIZE } = GALAXY_CONFIG.PLANET;

  // Calculate size using constants
  const size = BASE_SIZE + (scale - 1) * SIZE_INCREMENT;
  const color = data.color || getCategoryColor(data.category);

  const handleClick = () => {
    if (data.onSelect) {
      data.onSelect(data);
    }
  };

  const handleColorChange = async (newColor: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening kanban

    // Update local state immediately for responsiveness
    updateProject(data.id, { color: newColor });

    // Save to server
    try {
      const response = await fetch(`/api/projects/${data.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ color: newColor }),
      });
      if (!response.ok) {
        console.error('Failed to save color to server');
      }
    } catch (error) {
      console.error('Error saving color:', error);
    }
  };

  return (
    <div
      className={cn(
        'relative rounded-full border-2 transition-all duration-300 cursor-pointer group',
        'hover:scale-110 hover:z-10',
        selected ? 'border-primary glow-primary-lg' : `border-primary/50`
      )}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        background: `radial-gradient(circle at 30% 30%, ${color}88, ${color}22)`,
        borderColor: selected ? undefined : `${color}88`,
      }}
      onClick={handleClick}
    >
      {/* Connection handles */}
      {/* Central connection handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-transparent !border-none !w-0 !h-0"
        style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
      />

      {/* Planet content */}
      <div className="absolute inset-0 flex items-center justify-center p-2">
        <div className="text-center">
          {/* Planet icon/glow */}
          <div
            className="w-2 h-2 rounded-full mx-auto mb-1 animate-pulse"
            style={{ backgroundColor: color }}
          />
          <span
            className="text-xs font-medium text-white truncate block max-w-full"
            style={{ fontSize: Math.max(MIN_FONT_SIZE, BASE_FONT_SIZE - scale * FONT_SCALE_FACTOR) }}
          >
            {data.title}
          </span>
          {scale >= 5 && (
            <span
              className="text-white/60 truncate block"
              style={{ fontSize: Math.max(MIN_FONT_SIZE - 2, BASE_FONT_SIZE - 2 - scale * FONT_SCALE_FACTOR * 0.8) }}
            >
              {data.category}
            </span>
          )}
        </div>
      </div>

      {/* Ring effect for larger planets */}
      {scale >= 7 && (
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            border: '1px solid transparent',
            boxShadow: `inset 0 0 20px ${color}33`,
          }}
        />
      )}

      {/* Color Picker Button - appears on hover */}
      <div
        className="absolute -top-2 -right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1.5 rounded-full bg-black/50 border border-white/20 hover:bg-white/20 text-white transition-colors">
              <Palette className="w-3 h-3" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="md:w-48 bg-[#1a1b26] border-white/10 p-2">
            <div className="grid grid-cols-4 gap-2">
              {PLANET_COLORS.map((c) => (
                <DropdownMenuItem
                  key={c.value}
                  className="p-0 focus:bg-transparent justify-center cursor-pointer"
                  onClick={(e) => handleColorChange(c.value, e)}
                >
                  <div
                    className="w-6 h-6 rounded-full border border-white/10 hover:scale-110 transition-transform"
                    style={{ backgroundColor: c.value }}
                    title={c.name}
                  />
                </DropdownMenuItem>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

// Get color based on category
export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    'Software': '#7C3AED', // Nebula Violet
    'Business': '#06B6D4', // Orbit Cyan
    'Design': '#EC4899', // Supernova Pink
    'Marketing': '#F59E0B', // Amber
    'Finance': '#10B981', // Emerald
    'General': '#6366F1', // Indigo
  };
  return colors[category] || colors['General'];
}
