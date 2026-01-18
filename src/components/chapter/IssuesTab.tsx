import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react';
import type { Issue } from '@/hooks/useChapterDetail';

interface IssuesTabProps {
  issues: Issue[];
  loading?: boolean;
  onResolve: (issueId: string, resolution: string) => Promise<void>;
  onIgnore: (issueId: string) => Promise<void>;
}

const SEVERITY_CONFIG: Record<Issue['severity'], { label: string; className: string }> = {
  critical: { label: 'Critical', className: 'bg-destructive text-destructive-foreground' },
  high: { label: 'High', className: 'bg-orange-500 text-white' },
  medium: { label: 'Medium', className: 'bg-warning text-warning-foreground' },
  low: { label: 'Low', className: 'bg-muted text-muted-foreground' },
};

const STATUS_ICONS = {
  open: AlertCircle,
  resolved: CheckCircle,
  ignored: XCircle,
};

export function IssuesTab({ issues, loading, onResolve, onIgnore }: IssuesTabProps) {
  const [showResolved, setShowResolved] = useState(false);
  const [resolveTarget, setResolveTarget] = useState<Issue | null>(null);
  const [resolution, setResolution] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const openIssues = issues.filter(i => i.status === 'open');
  const resolvedIssues = issues.filter(i => i.status !== 'open');

  const handleResolve = async () => {
    if (!resolveTarget) return;
    setActionLoading(resolveTarget.id);
    try {
      await onResolve(resolveTarget.id, resolution);
      setResolveTarget(null);
      setResolution('');
    } finally {
      setActionLoading(null);
    }
  };

  const handleIgnore = async (issueId: string) => {
    setActionLoading(issueId);
    try {
      await onIgnore(issueId);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (issues.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No issues found.</p>
        <p className="text-sm mt-1">Great! This chapter has no detected issues.</p>
      </div>
    );
  }

  const IssueCard = ({ issue }: { issue: Issue }) => {
    const severityConfig = SEVERITY_CONFIG[issue.severity];
    const StatusIcon = STATUS_ICONS[issue.status];
    const isLoading = actionLoading === issue.id;

    return (
      <Card className={issue.status !== 'open' ? 'opacity-60' : ''}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <StatusIcon className={`h-5 w-5 mt-0.5 ${
              issue.status === 'open' ? 'text-destructive' :
              issue.status === 'resolved' ? 'text-success' : 'text-muted-foreground'
            }`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <Badge className={severityConfig.className}>
                  {severityConfig.label}
                </Badge>
                <Badge variant="outline">
                  {issue.status.charAt(0).toUpperCase() + issue.status.slice(1)}
                </Badge>
              </div>
              <p className="text-sm text-foreground mb-1">{issue.description}</p>
              {issue.location && (
                <p className="text-xs text-muted-foreground">Location: {issue.location}</p>
              )}
              {issue.resolution && (
                <p className="text-xs text-success mt-2">Resolution: {issue.resolution}</p>
              )}
            </div>
            {issue.status === 'open' && (
              <div className="flex gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setResolveTarget(issue)}
                  disabled={isLoading}
                >
                  Resolve
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleIgnore(issue.id)}
                  disabled={isLoading}
                >
                  Ignore
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {openIssues.length} open, {resolvedIssues.length} resolved
          </p>
          <div className="flex items-center gap-2">
            <Switch
              id="show-resolved"
              checked={showResolved}
              onCheckedChange={setShowResolved}
            />
            <Label htmlFor="show-resolved" className="text-sm cursor-pointer">
              {showResolved ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Label>
          </div>
        </div>

        <div className="space-y-3">
          {openIssues.map(issue => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
          {showResolved && resolvedIssues.map(issue => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </div>
      </div>

      {/* Resolve Modal */}
      <Dialog open={!!resolveTarget} onOpenChange={() => setResolveTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Issue</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{resolveTarget?.description}</p>
            <div className="space-y-2">
              <Label>How was this issue resolved?</Label>
              <Textarea
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                placeholder="Describe the resolution..."
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResolveTarget(null)}>
              Cancel
            </Button>
            <Button onClick={handleResolve} disabled={!resolution.trim() || !!actionLoading}>
              {actionLoading ? 'Saving...' : 'Save Resolution'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
