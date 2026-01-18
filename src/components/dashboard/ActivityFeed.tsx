import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { Activity, AlertCircle, AlertTriangle, Info } from 'lucide-react';

type LogLevel = 'info' | 'warning' | 'error';

interface ActivityItem {
  id: string;
  projectId: string;
  projectTitle: string;
  logLevel: LogLevel;
  message: string;
  createdAt: string;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  loading?: boolean;
}

const LOG_STYLES: Record<LogLevel, { icon: typeof Info; className: string }> = {
  info: { icon: Info, className: 'text-muted-foreground' },
  warning: { icon: AlertTriangle, className: 'text-warning' },
  error: { icon: AlertCircle, className: 'text-destructive' },
};

export function ActivityFeed({ activities, loading }: ActivityFeedProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="h-4 w-4 mt-1 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">
            No recent activity
          </p>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => {
              const style = LOG_STYLES[activity.logLevel] || LOG_STYLES.info;
              const Icon = style.icon;
              
              return (
                <Link
                  key={activity.id}
                  to={`/projects/${activity.projectId}`}
                  className="flex items-start gap-3 group hover:bg-accent/50 -mx-2 px-2 py-1 rounded-md transition-colors"
                >
                  <Icon className={`h-4 w-4 mt-0.5 ${style.className}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${style.className}`}>
                      {activity.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                      <span className="mx-1">•</span>
                      <span className="group-hover:underline">{activity.projectTitle}</span>
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
