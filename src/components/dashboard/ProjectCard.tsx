import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye } from 'lucide-react';

type ProjectStatus = 'draft' | 'running' | 'paused' | 'completed' | 'error';

interface ProjectCardProps {
  id: string;
  title: string;
  status: ProjectStatus;
  currentPhase: number;
  completedChapters: number;
  totalChapters: number;
}

const PHASE_NAMES: Record<number, string> = {
  0: 'Setup',
  1: 'Extraction',
  2: 'Analysis',
  3: 'Research',
  4: 'Writing',
  5: 'Quality Check',
  6: 'Finalization',
  7: 'Complete',
};

const STATUS_STYLES: Record<ProjectStatus, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }> = {
  draft: { variant: 'secondary', className: 'bg-muted text-muted-foreground' },
  running: { variant: 'default', className: 'bg-success text-success-foreground' },
  paused: { variant: 'outline', className: 'bg-warning/10 text-warning border-warning' },
  completed: { variant: 'default', className: 'bg-primary text-primary-foreground' },
  error: { variant: 'destructive', className: '' },
};

export function ProjectCard({ id, title, status, currentPhase, completedChapters, totalChapters }: ProjectCardProps) {
  const progress = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;
  const phaseName = PHASE_NAMES[currentPhase] || `Phase ${currentPhase}`;
  const statusStyle = STATUS_STYLES[status] || STATUS_STYLES.draft;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-foreground line-clamp-1">{title}</h3>
          <Badge className={statusStyle.className}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{phaseName}</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {completedChapters} of {totalChapters} chapters
          </span>
          <Button variant="outline" size="sm" asChild>
            <Link to={`/projects/${id}`}>
              <Eye className="h-4 w-4 mr-1" />
              View
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function ProjectCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-16" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-8" />
          </div>
          <Skeleton className="h-2 w-full" />
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-8 w-16" />
        </div>
      </CardContent>
    </Card>
  );
}
