import { Card, CardContent } from '@/components/ui/card';
import { useParams } from 'react-router-dom';

export default function ProjectDetail() {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Project Detail</h1>
        <p className="text-muted-foreground mt-1">
          Project ID: {id}
        </p>
      </div>

      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <h3 className="text-lg font-medium text-foreground">Project details coming in Phase 4</h3>
          <p className="text-muted-foreground mt-1 max-w-sm">
            This page will show the pipeline visualization, chapters list, and project controls.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
