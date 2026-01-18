import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Info, AlertTriangle, AlertCircle, RefreshCw, Download, Search } from 'lucide-react';
import { format } from 'date-fns';
import type { PipelineLog } from '@/hooks/useProjectDetail';

interface LogsFeedProps {
  logs: PipelineLog[];
  loading?: boolean;
  onRefresh: () => void;
  onFilterChange: (filters: { phase?: number; level?: string; search?: string }) => void;
}

const LOG_ICONS = {
  info: { icon: Info, className: 'text-muted-foreground' },
  warning: { icon: AlertTriangle, className: 'text-warning' },
  error: { icon: AlertCircle, className: 'text-destructive' },
};

export function LogsFeed({ logs, loading, onRefresh, onFilterChange }: LogsFeedProps) {
  const [phase, setPhase] = useState<string>('all');
  const [level, setLevel] = useState<string>('all');
  const [search, setSearch] = useState('');

  const handlePhaseChange = (value: string) => {
    setPhase(value);
    onFilterChange({
      phase: value === 'all' ? undefined : parseInt(value),
      level: level === 'all' ? undefined : level,
      search: search || undefined,
    });
  };

  const handleLevelChange = (value: string) => {
    setLevel(value);
    onFilterChange({
      phase: phase === 'all' ? undefined : parseInt(phase),
      level: value === 'all' ? undefined : value,
      search: search || undefined,
    });
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    onFilterChange({
      phase: phase === 'all' ? undefined : parseInt(phase),
      level: level === 'all' ? undefined : level,
      search: value || undefined,
    });
  };

  const handleExport = () => {
    const content = logs
      .map(log => `[${format(new Date(log.createdAt), 'HH:mm:ss')}] Phase ${log.phase || '?'} - ${log.agentName || 'System'}: ${log.message}`)
      .join('\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={phase} onValueChange={handlePhaseChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All Phases" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Phases</SelectItem>
            {[...Array(11)].map((_, i) => (
              <SelectItem key={i + 1} value={String(i + 1)}>
                Phase {i + 1}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={level} onValueChange={handleLevelChange}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="All Levels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="error">Error</SelectItem>
          </SelectContent>
        </Select>

        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search logs..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleExport}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Logs List */}
      <div className="border rounded-lg divide-y max-h-[500px] overflow-y-auto">
        {loading ? (
          <div className="p-4 space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No logs found
          </div>
        ) : (
          logs.map((log) => {
            const config = LOG_ICONS[log.logLevel] || LOG_ICONS.info;
            const Icon = config.icon;

            return (
              <div key={log.id} className="p-3 hover:bg-accent/30 transition-colors">
                <div className="flex items-start gap-3">
                  <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${config.className}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <span className="font-mono">
                        {format(new Date(log.createdAt), 'HH:mm:ss')}
                      </span>
                      <span>•</span>
                      <span>Phase {log.phase || '?'}</span>
                      <span>•</span>
                      <span>{log.agentName || 'System'}</span>
                    </div>
                    <p className={`text-sm ${config.className === 'text-muted-foreground' ? 'text-foreground' : config.className}`}>
                      {log.message}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
