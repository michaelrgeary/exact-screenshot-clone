import { Card, CardContent } from '@/components/ui/card';
import { Library } from 'lucide-react';

export default function LibraryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Library</h1>
        <p className="text-muted-foreground mt-1">
          Access your completed books and resources
        </p>
      </div>

      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Library className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground">Library page coming soon</h3>
          <p className="text-muted-foreground mt-1 max-w-sm">
            Your completed book transformations and resources will be available here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
