import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Check, Circle, Loader2, AlertCircle } from 'lucide-react';
import type { Chapter } from '@/hooks/useProjectDetail';

interface ChaptersTableProps {
  projectId: string;
  chapters: Chapter[];
  loading?: boolean;
}

const STATUS_CONFIG: Record<Chapter['status'], { label: string; icon: typeof Check; className: string; iconClass?: string }> = {
  pending: {
    label: 'Pending',
    icon: Circle,
    className: 'bg-muted text-muted-foreground',
  },
  processing: {
    label: 'Active',
    icon: Loader2,
    className: 'bg-primary/10 text-primary',
    iconClass: 'animate-spin',
  },
  completed: {
    label: 'Done',
    icon: Check,
    className: 'bg-success/10 text-success',
  },
  error: {
    label: 'Error',
    icon: AlertCircle,
    className: 'bg-destructive/10 text-destructive',
  },
};

export function ChaptersTable({ projectId, chapters, loading }: ChaptersTableProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (chapters.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No chapters yet. Chapters will appear here as processing begins.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">#</TableHead>
            <TableHead>Title</TableHead>
            <TableHead className="w-32">Status</TableHead>
            <TableHead className="w-20 text-center">Phase</TableHead>
            <TableHead className="w-24 text-right">Quality</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {chapters.map((chapter) => {
            const config = STATUS_CONFIG[chapter.status];
            const Icon = config.icon;

            return (
              <TableRow
                key={chapter.id}
                className="cursor-pointer hover:bg-accent/50"
                onClick={() => {}}
              >
                <TableCell className="font-medium">{chapter.chapterNumber}</TableCell>
                <TableCell>{chapter.title || `Chapter ${chapter.chapterNumber}`}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className={config.className}>
                    <Icon className={`h-3 w-3 mr-1 ${config.iconClass || ''}`} />
                    {config.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-center text-muted-foreground">
                  {chapter.status !== 'pending' ? chapter.currentPhase : '—'}
                </TableCell>
                <TableCell className="text-right">
                  {chapter.qualityScore !== null ? chapter.qualityScore.toFixed(2) : '—'}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
