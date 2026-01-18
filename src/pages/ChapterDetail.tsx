import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ContentTab } from '@/components/chapter/ContentTab';
import { AnalysisTab } from '@/components/chapter/AnalysisTab';
import { DiagramsTab } from '@/components/chapter/DiagramsTab';
import { IssuesTab } from '@/components/chapter/IssuesTab';
import {
  useChapterDetail,
  useChapterTactics,
  useChapterDiagrams,
  useChapterIssues,
  updateChapterContent,
  resolveIssue,
  ignoreIssue,
} from '@/hooks/useChapterDetail';
import { useProjectDetail } from '@/hooks/useProjectDetail';
import {
  ArrowLeft,
  Pencil,
  X,
  FileText,
  FileSearch,
  Image,
  Star,
  AlertTriangle,
  Circle,
  Loader2,
  Check,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

const STATUS_CONFIG = {
  pending: { label: 'Pending', icon: Circle, className: 'bg-muted text-muted-foreground' },
  processing: { label: 'Processing', icon: Loader2, className: 'bg-primary/10 text-primary', iconClass: 'animate-spin' },
  completed: { label: 'Completed', icon: Check, className: 'bg-success/10 text-success' },
  error: { label: 'Error', icon: AlertCircle, className: 'bg-destructive/10 text-destructive' },
};

export default function ChapterDetail() {
  const { id: projectId, num } = useParams<{ id: string; num: string }>();
  const chapterNumber = parseInt(num || '1', 10);
  const queryClient = useQueryClient();
  
  const [isEditing, setIsEditing] = useState(false);

  const { data: project } = useProjectDetail(projectId!);
  const { data: chapter, isLoading: chapterLoading } = useChapterDetail(projectId!, chapterNumber);
  const { data: tactics = [], isLoading: tacticsLoading } = useChapterTactics(chapter?.id);
  const { data: diagrams = [], isLoading: diagramsLoading } = useChapterDiagrams(chapter?.id);
  const { data: issues = [], isLoading: issuesLoading } = useChapterIssues(chapter?.id);

  const handleSaveContent = async (content: string) => {
    if (!chapter) return;
    try {
      await updateChapterContent(chapter.id, content);
      queryClient.invalidateQueries({ queryKey: ['chapter-detail', projectId, chapterNumber] });
      setIsEditing(false);
      toast.success('Content saved successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save content');
    }
  };

  const handleResolveIssue = async (issueId: string, resolution: string) => {
    try {
      await resolveIssue(issueId, resolution);
      queryClient.invalidateQueries({ queryKey: ['chapter-issues', chapter?.id] });
      toast.success('Issue resolved');
    } catch (error: any) {
      toast.error(error.message || 'Failed to resolve issue');
    }
  };

  const handleIgnoreIssue = async (issueId: string) => {
    try {
      await ignoreIssue(issueId);
      queryClient.invalidateQueries({ queryKey: ['chapter-issues', chapter?.id] });
      toast.success('Issue ignored');
    } catch (error: any) {
      toast.error(error.message || 'Failed to ignore issue');
    }
  };

  const statusConfig = chapter ? STATUS_CONFIG[chapter.status] : STATUS_CONFIG.pending;
  const StatusIcon = statusConfig.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <Link
          to={`/projects/${projectId}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Project
        </Link>

        {chapterLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-5 w-32" />
          </div>
        ) : chapter ? (
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Chapter {chapter.chapterNumber}: {chapter.title || 'Untitled'}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <Badge className={statusConfig.className}>
                  <StatusIcon className={`h-3 w-3 mr-1 ${(statusConfig as any).iconClass || ''}`} />
                  {statusConfig.label}
                  {chapter.status !== 'pending' && ` Phase ${chapter.currentPhase}`}
                </Badge>
                {chapter.qualityScore !== null && (
                  <span className="text-sm text-muted-foreground">
                    Quality: {chapter.qualityScore.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
            <Button
              variant={isEditing ? 'destructive' : 'outline'}
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Cancel Edit
                </>
              ) : (
                <>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Chapter not found</p>
          </div>
        )}
      </div>

      {/* Tabs */}
      {chapter && (
        <Tabs defaultValue="content" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="content" className="gap-2">
              <FileText className="h-4 w-4 hidden sm:inline" />
              Content
            </TabsTrigger>
            <TabsTrigger value="analysis" className="gap-2">
              <FileSearch className="h-4 w-4 hidden sm:inline" />
              Analysis
            </TabsTrigger>
            <TabsTrigger value="diagrams" className="gap-2">
              <Image className="h-4 w-4 hidden sm:inline" />
              Diagrams
            </TabsTrigger>
            <TabsTrigger value="quality" className="gap-2">
              <Star className="h-4 w-4 hidden sm:inline" />
              Quality
            </TabsTrigger>
            <TabsTrigger value="issues" className="gap-2">
              <AlertTriangle className="h-4 w-4 hidden sm:inline" />
              Issues
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content">
            <Card>
              <CardHeader>
                <CardTitle>Content</CardTitle>
              </CardHeader>
              <CardContent>
                <ContentTab
                  content={chapter.draftText || chapter.transformedText || chapter.originalText}
                  editedContent={chapter.editedText}
                  isEditing={isEditing}
                  loading={chapterLoading}
                  onSave={handleSaveContent}
                  onCancel={() => setIsEditing(false)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis">
            <Card>
              <CardHeader>
                <CardTitle>Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <AnalysisTab tactics={tactics} loading={tacticsLoading} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="diagrams">
            <Card>
              <CardHeader>
                <CardTitle>Diagrams</CardTitle>
              </CardHeader>
              <CardContent>
                <DiagramsTab diagrams={diagrams} loading={diagramsLoading} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quality">
            <Card>
              <CardHeader>
                <CardTitle>
                  Quality Score: {chapter.qualityScore !== null ? chapter.qualityScore.toFixed(2) : '—'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Detailed quality breakdown coming in Phase 6</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="issues">
            <Card>
              <CardHeader>
                <CardTitle>Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <IssuesTab
                  issues={issues}
                  loading={issuesLoading}
                  onResolve={handleResolveIssue}
                  onIgnore={handleIgnoreIssue}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
