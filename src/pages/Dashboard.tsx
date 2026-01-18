import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { ProjectCard, ProjectCardSkeleton } from '@/components/dashboard/ProjectCard';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { useDashboardStats, useActiveProjects, useRecentActivity } from '@/hooks/useDashboardData';
import { useDashboardRealtime } from '@/hooks/useRealtimeSubscription';
import { Plus, FolderOpen, BookOpen, Layers, CheckCircle, Star } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: projects, isLoading: projectsLoading } = useActiveProjects();
  const { data: activities, isLoading: activitiesLoading } = useRecentActivity();
  
  // Enable real-time updates
  useDashboardRealtime();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back, {user?.email}
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your book transformation projects
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          label="Active Projects"
          value={stats?.activeProjects ?? 0}
          icon={FolderOpen}
          loading={statsLoading}
        />
        <StatsCard
          label="Chapters in Progress"
          value={stats?.chaptersInProgress ?? 0}
          icon={Layers}
          loading={statsLoading}
        />
        <StatsCard
          label="Completed Books"
          value={stats?.completedBooks ?? 0}
          icon={CheckCircle}
          loading={statsLoading}
        />
        <StatsCard
          label="Avg Quality Score"
          value={stats?.averageQuality != null ? stats.averageQuality.toFixed(2) : '—'}
          icon={Star}
          loading={statsLoading}
        />
      </div>

      {/* Active Projects Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Active Projects</h2>
          <Button asChild>
            <Link to="/projects/new">
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Link>
          </Button>
        </div>

        {projectsLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <ProjectCardSkeleton key={i} />
            ))}
          </div>
        ) : projects && projects.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                id={project.id}
                title={project.title}
                status={project.status}
                currentPhase={project.current_phase}
                completedChapters={project.completedChapters}
                totalChapters={project.totalChapters}
              />
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <BookOpen className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground">No active projects</h3>
              <p className="text-muted-foreground mt-1 max-w-sm mb-4">
                Create your first book transformation to get started.
              </p>
              <Button asChild>
                <Link to="/projects/new">
                  <Plus className="h-4 w-4 mr-2" />
                  New Project
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Recent Activity */}
      <ActivityFeed activities={activities || []} loading={activitiesLoading} />
    </div>
  );
}
