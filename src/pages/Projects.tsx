import { Card, CardContent } from '@/components/ui/card';
import { FolderOpen } from 'lucide-react';

export default function Projects() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Projects</h1>
        <p className="text-muted-foreground mt-1">
          View and manage all your book transformation projects
        </p>
      </div>

      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <FolderOpen className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground">Projects page coming soon</h3>
          <p className="text-muted-foreground mt-1 max-w-sm">
            This page will display all your projects with detailed views and management options.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
