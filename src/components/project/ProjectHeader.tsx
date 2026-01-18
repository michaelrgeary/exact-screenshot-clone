import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Pause, Play, Square, RotateCcw } from 'lucide-react';
import type { ProjectDetail } from '@/hooks/useProjectDetail';

interface ProjectHeaderProps {
  project: ProjectDetail | undefined;
  loading?: boolean;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onRestart: () => void;
  actionLoading?: boolean;
}

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-muted text-muted-foreground' },
  running: { label: 'Running', className: 'bg-success text-success-foreground' },
  paused: { label: 'Paused', className: 'bg-warning/10 text-warning border-warning' },
  completed: { label: 'Complete', className: 'bg-primary text-primary-foreground' },
  error: { label: 'Error', className: 'bg-destructive text-destructive-foreground' },
};

export function ProjectHeader({
  project,
  loading,
  onPause,
  onResume,
  onStop,
  onRestart,
  actionLoading,
}: ProjectHeaderProps) {
  if (loading || !project) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-6 w-20" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    );
  }

  const statusStyle = STATUS_STYLES[project.status] || STATUS_STYLES.draft;
  const showPauseStop = project.status === 'running';
  const showResumeStop = project.status === 'paused';
  const showRestart = project.status === 'completed' || project.status === 'error';

  return (
    <div className="space-y-4">
      {/* Back button */}
      <Link
        to="/projects"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Projects
      </Link>

      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {project.sourceTitle} → {project.title}
        </h1>
        <div className="flex items-center gap-3 mt-2">
          <Badge className={statusStyle.className}>{statusStyle.label}</Badge>
          {project.overallQualityScore !== null && (
            <span className="text-sm text-muted-foreground">
              Quality: {project.overallQualityScore.toFixed(2)}
            </span>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-2">
        {showPauseStop && (
          <>
            <Button variant="outline" onClick={onPause} disabled={actionLoading}>
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </Button>
            <Button variant="outline" onClick={onStop} disabled={actionLoading}>
              <Square className="h-4 w-4 mr-2" />
              Stop
            </Button>
          </>
        )}
        {showResumeStop && (
          <>
            <Button onClick={onResume} disabled={actionLoading}>
              <Play className="h-4 w-4 mr-2" />
              Resume
            </Button>
            <Button variant="outline" onClick={onStop} disabled={actionLoading}>
              <Square className="h-4 w-4 mr-2" />
              Stop
            </Button>
          </>
        )}
        {showRestart && (
          <Button onClick={onRestart} disabled={actionLoading}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Restart
          </Button>
        )}
      </div>
    </div>
  );
}
