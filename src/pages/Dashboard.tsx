import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, FolderOpen } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back, {user?.email}
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your book transformation projects
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <FolderOpen className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground">No projects yet</h3>
          <p className="text-muted-foreground mt-1 max-w-sm">
            Your projects will appear here. Click "New Project" to create your first book transformation.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
