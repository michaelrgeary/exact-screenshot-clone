import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Download, FileText, Printer, Monitor, Loader2 } from 'lucide-react';
import { downloadOutputFile, type OutputFile } from '@/hooks/useQuality';
import { toast } from 'sonner';

interface OutputsTabProps {
  outputs: OutputFile[];
  projectStatus: string;
  loading?: boolean;
}

const FORMAT_CONFIG: Record<string, { icon: typeof FileText; label: string }> = {
  kindle: { icon: FileText, label: 'Kindle (EPUB)' },
  pdf_print: { icon: Printer, label: 'PDF (Print)' },
  pdf_screen: { icon: Monitor, label: 'PDF (Screen)' },
};

const formatFileSize = (bytes: number | null): string => {
  if (!bytes) return 'Unknown size';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export function OutputsTab({ outputs, projectStatus, loading }: OutputsTabProps) {
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownload = async (output: OutputFile) => {
    if (!output.filePath) {
      toast.error('File not available');
      return;
    }

    setDownloading(output.id);
    try {
      const formatConfig = FORMAT_CONFIG[output.format];
      const extension = output.format === 'kindle' ? 'epub' : 'pdf';
      const fileName = `book-${output.language}.${extension}`;
      
      await downloadOutputFile(output.filePath, fileName);
      toast.success('Download started');
    } catch (error: any) {
      toast.error(error.message || 'Failed to download file');
    } finally {
      setDownloading(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-32" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (projectStatus !== 'completed') {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Download className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Outputs will be available when processing completes.</p>
        <p className="text-sm mt-1">Current status: {projectStatus}</p>
      </div>
    );
  }

  if (outputs.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Download className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No output files generated yet.</p>
        <p className="text-sm mt-1">Output files will appear here once generated.</p>
      </div>
    );
  }

  // Group by language
  const groupedOutputs = outputs.reduce((acc, output) => {
    const lang = output.language.charAt(0).toUpperCase() + output.language.slice(1);
    if (!acc[lang]) acc[lang] = [];
    acc[lang].push(output);
    return acc;
  }, {} as Record<string, OutputFile[]>);

  return (
    <div className="space-y-8">
      {Object.entries(groupedOutputs).map(([language, langOutputs]) => (
        <div key={language}>
          <h3 className="font-medium text-foreground mb-4">{language}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {langOutputs.map((output) => {
              const config = FORMAT_CONFIG[output.format] || { icon: FileText, label: output.format };
              const Icon = config.icon;
              const isDownloading = downloading === output.id;

              return (
                <Card key={output.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center text-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                        <Icon className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{config.label}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(output.fileSize)}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => handleDownload(output)}
                        disabled={isDownloading || !output.filePath}
                      >
                        {isDownloading ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4 mr-2" />
                        )}
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
