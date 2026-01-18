import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProjectHeader } from '@/components/project/ProjectHeader';
import { PipelineVisualization } from '@/components/project/PipelineVisualization';
import { ChaptersTable } from '@/components/project/ChaptersTable';
import { LogsFeed } from '@/components/project/LogsFeed';
import { ProjectQualityTab } from '@/components/project/ProjectQualityTab';
import { OutputsTab } from '@/components/project/OutputsTab';
import {
  useProjectDetail,
  useProjectChapters,
  useProjectLogs,
  pauseProject,
  resumeProject,
  stopProject,
  restartProject,
} from '@/hooks/useProjectDetail';
import { useProjectQualityScores, useProjectOutputFiles } from '@/hooks/useQuality';
import { toast } from 'sonner';
import { FileText, Layers, Star, Download, ScrollText } from 'lucide-react';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [actionLoading, setActionLoading] = useState(false);
  const [logFilters, setLogFilters] = useState<{ phase?: number; level?: string; search?: string }>({});

  const { data: project, isLoading: projectLoading } = useProjectDetail(id!);
  const { data: chapters = [], isLoading: chaptersLoading } = useProjectChapters(id!);
  const { data: logs = [], isLoading: logsLoading, refetch: refetchLogs } = useProjectLogs(id!, logFilters);
  const { data: qualityScores = [], isLoading: qualityLoading } = useProjectQualityScores(id!);
  const { data: outputs = [], isLoading: outputsLoading } = useProjectOutputFiles(id!);

  const handleAction = async (action: () => Promise<void>, successMessage: string) => {
    setActionLoading(true);
    try {
      await action();
      queryClient.invalidateQueries({ queryKey: ['project-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['active-projects'] });
      toast.success(successMessage);
    } catch (error: any) {
      toast.error(error.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <ProjectHeader
        project={project}
        loading={projectLoading}
        onPause={() => handleAction(() => pauseProject(id!), 'Project paused')}
        onResume={() => handleAction(() => resumeProject(id!), 'Project resumed')}
        onStop={() => handleAction(() => stopProject(id!), 'Project stopped')}
        onRestart={() => handleAction(() => restartProject(id!), 'Project restarted')}
        actionLoading={actionLoading}
      />

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
          <TabsTrigger value="overview" className="gap-2">
            <Layers className="h-4 w-4 hidden sm:inline" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="chapters" className="gap-2">
            <FileText className="h-4 w-4 hidden sm:inline" />
            Chapters
          </TabsTrigger>
          <TabsTrigger value="quality" className="gap-2">
            <Star className="h-4 w-4 hidden sm:inline" />
            Quality
          </TabsTrigger>
          <TabsTrigger value="outputs" className="gap-2">
            <Download className="h-4 w-4 hidden sm:inline" />
            Outputs
          </TabsTrigger>
          <TabsTrigger value="logs" className="gap-2">
            <ScrollText className="h-4 w-4 hidden sm:inline" />
            Logs
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Pipeline Progress</CardTitle>
            </CardHeader>
            <CardContent>
              {project && (
                <PipelineVisualization
                  currentPhase={project.currentPhase}
                  status={project.status}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Chapters Tab */}
        <TabsContent value="chapters">
          <Card>
            <CardHeader>
              <CardTitle>Chapters</CardTitle>
            </CardHeader>
            <CardContent>
              <ChaptersTable
                projectId={id!}
                chapters={chapters}
                loading={chaptersLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quality Tab */}
        <TabsContent value="quality">
          <Card>
            <CardHeader>
              <CardTitle>Quality Scores</CardTitle>
            </CardHeader>
            <CardContent>
              <ProjectQualityTab
                projectId={id!}
                chapterScores={qualityScores}
                loading={qualityLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Outputs Tab */}
        <TabsContent value="outputs">
          <Card>
            <CardHeader>
              <CardTitle>Output Files</CardTitle>
            </CardHeader>
            <CardContent>
              <OutputsTab
                outputs={outputs}
                projectStatus={project?.status || 'draft'}
                loading={outputsLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Processing Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <LogsFeed
                logs={logs}
                loading={logsLoading}
                onRefresh={() => refetchLogs()}
                onFilterChange={setLogFilters}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
