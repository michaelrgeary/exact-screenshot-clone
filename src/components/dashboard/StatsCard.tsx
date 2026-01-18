import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  loading?: boolean;
}

export function StatsCard({ label, value, icon: Icon, loading }: StatsCardProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-6">
          <Skeleton className="h-10 w-16 mb-2" />
          <Skeleton className="h-4 w-24" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-6">
        <div className="flex items-center gap-2 mb-1">
          <Icon className="h-5 w-5 text-primary" />
          <span className="text-3xl font-bold text-foreground">{value}</span>
        </div>
        <span className="text-sm text-muted-foreground">{label}</span>
      </CardContent>
    </Card>
  );
}
