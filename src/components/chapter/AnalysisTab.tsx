import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Target, MessageSquare, Grid, Brain, Lightbulb, FileSearch } from 'lucide-react';
import type { Tactic } from '@/hooks/useChapterDetail';

interface AnalysisTabProps {
  tactics: Tactic[];
  loading?: boolean;
}

const TYPE_CONFIG: Record<Tactic['type'], { icon: typeof Target; label: string; className: string }> = {
  technique: { icon: Target, label: 'Technique', className: 'bg-primary/10 text-primary' },
  script: { icon: MessageSquare, label: 'Script', className: 'bg-success/10 text-success' },
  framework: { icon: Grid, label: 'Framework', className: 'bg-warning/10 text-warning' },
  mindset: { icon: Brain, label: 'Mindset', className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  tip: { icon: Lightbulb, label: 'Tip', className: 'bg-muted text-muted-foreground' },
};

export function AnalysisTab({ tactics, loading }: AnalysisTabProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  if (tactics.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <FileSearch className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No tactics extracted yet.</p>
        <p className="text-sm mt-1">Tactics will appear here once analysis is complete.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium text-foreground mb-4">
          Extracted Tactics ({tactics.length})
        </h3>
        <div className="space-y-3">
          {tactics.map((tactic) => {
            const config = TYPE_CONFIG[tactic.type] || TYPE_CONFIG.tip;
            const Icon = config.icon;

            return (
              <Card key={tactic.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${config.className}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-foreground">{tactic.name}</h4>
                        <Badge variant="secondary" className={config.className}>
                          {config.label}
                        </Badge>
                      </div>
                      {tactic.description && (
                        <p className="text-sm text-muted-foreground mb-2">{tactic.description}</p>
                      )}
                      <div className="grid gap-2 text-sm">
                        {tactic.originalContext && (
                          <div>
                            <span className="text-muted-foreground">Original: </span>
                            <span className="text-foreground">{tactic.originalContext}</span>
                          </div>
                        )}
                        {tactic.roofingContext && (
                          <div>
                            <span className="text-muted-foreground">Roofing: </span>
                            <span className="text-foreground">{tactic.roofingContext}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
