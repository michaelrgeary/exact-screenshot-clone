import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { Image, X } from 'lucide-react';
import type { Diagram } from '@/hooks/useChapterDetail';

interface DiagramsTabProps {
  diagrams: Diagram[];
  loading?: boolean;
}

export function DiagramsTab({ diagrams, loading }: DiagramsTabProps) {
  const [selectedDiagram, setSelectedDiagram] = useState<Diagram | null>(null);

  const getDiagramUrl = (filePath: string | null) => {
    if (!filePath) return null;
    const { data } = supabase.storage.from('diagrams').getPublicUrl(filePath);
    return data.publicUrl;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="aspect-square" />
        ))}
      </div>
    );
  }

  if (diagrams.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No diagrams for this chapter yet.</p>
        <p className="text-sm mt-1">Diagrams will appear here once generated.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {diagrams.map((diagram) => {
          const imageUrl = getDiagramUrl(diagram.filePath);

          return (
            <Card
              key={diagram.id}
              className="cursor-pointer hover:shadow-md transition-shadow overflow-hidden"
              onClick={() => setSelectedDiagram(diagram)}
            >
              <CardContent className="p-0">
                <div className="aspect-square bg-muted flex items-center justify-center">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={diagram.captionEn || 'Diagram'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Image className="h-8 w-8" />
                      <span className="text-xs">{diagram.diagramType || 'Diagram'}</span>
                    </div>
                  )}
                </div>
                {diagram.captionEn && (
                  <div className="p-3">
                    <p className="text-sm text-center text-muted-foreground truncate">
                      {diagram.captionEn}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Diagram Modal */}
      <Dialog open={!!selectedDiagram} onOpenChange={() => setSelectedDiagram(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedDiagram?.captionEn || 'Diagram'}</DialogTitle>
          </DialogHeader>
          <div className="bg-muted rounded-lg p-4 flex items-center justify-center min-h-[300px]">
            {selectedDiagram?.filePath ? (
              <img
                src={getDiagramUrl(selectedDiagram.filePath) || ''}
                alt={selectedDiagram.captionEn || 'Diagram'}
                className="max-w-full max-h-[60vh] object-contain"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Image className="h-16 w-16" />
                <span>{selectedDiagram?.diagramType || 'Diagram preview not available'}</span>
              </div>
            )}
          </div>
          {selectedDiagram?.captionEs && (
            <p className="text-sm text-muted-foreground text-center">
              (ES) {selectedDiagram.captionEs}
            </p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
