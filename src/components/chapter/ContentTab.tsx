import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Save, X, FileText } from 'lucide-react';

interface ContentTabProps {
  content: string | null;
  editedContent: string | null;
  isEditing: boolean;
  loading?: boolean;
  onSave: (content: string) => Promise<void>;
  onCancel: () => void;
}

export function ContentTab({
  content,
  editedContent,
  isEditing,
  loading,
  onSave,
  onCancel,
}: ContentTabProps) {
  const [editValue, setEditValue] = useState(editedContent || content || '');
  const [saving, setSaving] = useState(false);

  const displayContent = editedContent || content;
  const wordCount = editValue.trim().split(/\s+/).filter(Boolean).length;

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(editValue);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    );
  }

  if (!displayContent && !isEditing) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No content available yet.</p>
        <p className="text-sm mt-1">Content will appear here once processing begins.</p>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" onClick={onCancel} disabled={saving}>
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-1" />
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
        <Textarea
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="min-h-[500px] font-mono text-sm"
          placeholder="Enter markdown content..."
        />
        <p className="text-sm text-muted-foreground">
          Word count: {wordCount.toLocaleString()}
        </p>
      </div>
    );
  }

  return (
    <div className="prose prose-sm max-w-none dark:prose-invert">
      <ReactMarkdown>{displayContent || ''}</ReactMarkdown>
    </div>
  );
}
