import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, Trash2, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Project, ProjectStatus } from '@/hooks/useProjects';

const STATUS_STYLES: Record<ProjectStatus, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-muted text-muted-foreground' },
  running: { label: 'Running', className: 'bg-success text-success-foreground' },
  paused: { label: 'Paused', className: 'bg-warning/10 text-warning border-warning' },
  completed: { label: 'Complete', className: 'bg-primary text-primary-foreground' },
  error: { label: 'Error', className: 'bg-destructive text-destructive-foreground' },
};

interface ProjectListItemProps {
  project: Project;
  onDelete: (project: Project) => void;
}

export function ProjectListItem({ project, onDelete }: ProjectListItemProps) {
  const statusStyle = STATUS_STYLES[project.status];
  const hasScore = project.status === 'completed' && project.overallQualityScore !== null;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Title & Transformation */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <span className="truncate">{project.sourceTitle}</span>
              <ArrowRight className="h-3 w-3 shrink-0" />
              <span className="truncate font-medium text-foreground">{project.title}</span>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <Badge className={statusStyle.className}>
                {statusStyle.label}
              </Badge>
              <span className="text-muted-foreground">
                {project.completedChapters} of {project.totalChapters} chapters
              </span>
              <span className="text-muted-foreground">
                Score: {hasScore ? project.overallQualityScore?.toFixed(2) : '—'}
              </span>
            </div>

            <p className="text-xs text-muted-foreground mt-2">
              Updated {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" asChild>
              <Link to={`/projects/${project.id}`}>
                <Eye className="h-4 w-4 mr-1" />
                View
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => onDelete(project)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ProjectListItemSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-64" />
            <div className="flex gap-3">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="h-3 w-32" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
