import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, Star } from 'lucide-react';
import type { QualityScore } from '@/hooks/useQuality';

interface ProjectQualityTabProps {
  projectId: string;
  chapterScores: { chapterId: string; chapterNumber: number; title: string | null; score: QualityScore }[];
  loading?: boolean;
}

const THRESHOLD = 0.80;

const DIMENSIONS = [
  { key: 'contentFidelity', label: 'Content Fidelity' },
  { key: 'roofingRelevance', label: 'Roofing Relevance' },
  { key: 'clarity', label: 'Clarity' },
  { key: 'actionability', label: 'Actionability' },
  { key: 'engagement', label: 'Engagement' },
  { key: 'flow', label: 'Flow' },
  { key: 'visualIntegration', label: 'Visual Integration' },
  { key: 'consistency', label: 'Consistency' },
] as const;

const getScoreColor = (score: number): string => {
  if (score >= 0.85) return 'hsl(var(--success))';
  if (score >= 0.70) return 'hsl(var(--warning))';
  return 'hsl(var(--destructive))';
};

const getProgressColor = (score: number): string => {
  if (score >= 0.85) return 'bg-success';
  if (score >= 0.70) return 'bg-warning';
  return 'bg-destructive';
};

export function ProjectQualityTab({ projectId, chapterScores, loading }: ProjectQualityTabProps) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (chapterScores.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No quality scores available yet.</p>
        <p className="text-sm mt-1">Quality scoring will be performed as chapters are processed.</p>
      </div>
    );
  }

  // Calculate overall average
  const overallAverage = chapterScores.reduce((sum, cs) => sum + cs.score.overallScore, 0) / chapterScores.length;

  // Chart data
  const chartData = chapterScores.map(cs => ({
    name: `Ch ${cs.chapterNumber}`,
    score: cs.score.overallScore,
    chapterNumber: cs.chapterNumber,
  }));

  // Chapters below threshold
  const belowThreshold = chapterScores.filter(cs => cs.score.overallScore < THRESHOLD);

  // Calculate dimension averages
  const dimensionAverages = DIMENSIONS.map(dim => {
    const avg = chapterScores.reduce((sum, cs) => 
      sum + (cs.score[dim.key as keyof QualityScore] as number), 0
    ) / chapterScores.length;
    return { ...dim, average: avg };
  });

  // Find weakest dimension for below-threshold chapters
  const getWeakestDimension = (score: QualityScore): string => {
    let weakestLabel: string = DIMENSIONS[0].label;
    let lowestScore = score[DIMENSIONS[0].key as keyof QualityScore] as number;
    
    for (const dim of DIMENSIONS) {
      const dimScore = score[dim.key as keyof QualityScore] as number;
      if (dimScore < lowestScore) {
        lowestScore = dimScore;
        weakestLabel = dim.label;
      }
    }
    
    return weakestLabel;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-foreground">Quality Overview</h3>
        <div className="text-lg">
          Overall: <span className="font-bold">{overallAverage.toFixed(2)}</span>
        </div>
      </div>

      {/* Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Chapter Scores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 1]} tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value: number) => [value.toFixed(2), 'Score']}
                  labelFormatter={(label) => `Chapter ${label.replace('Ch ', '')}`}
                />
                <ReferenceLine y={THRESHOLD} stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" />
                <Bar
                  dataKey="score"
                  cursor="pointer"
                  onClick={(data) => {
                    if (data && data.chapterNumber) {
                      navigate(`/projects/${projectId}/chapters/${data.chapterNumber}`);
                    }
                  }}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={getScoreColor(entry.score)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Below Threshold Alert */}
      {belowThreshold.length > 0 && (
        <Card className="border-warning">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <AlertTriangle className="h-5 w-5" />
              Chapters Below Threshold ({THRESHOLD})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {belowThreshold.map(cs => (
                <li
                  key={cs.chapterId}
                  className="flex items-center justify-between text-sm cursor-pointer hover:bg-accent/50 p-2 rounded-md -mx-2"
                  onClick={() => navigate(`/projects/${projectId}/chapters/${cs.chapterNumber}`)}
                >
                  <span>
                    Chapter {cs.chapterNumber}: {cs.title || 'Untitled'}{' '}
                    <span className="text-destructive font-medium">({cs.score.overallScore.toFixed(2)})</span>
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {getWeakestDimension(cs.score)} issue
                  </Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Dimension Averages */}
      <Card>
        <CardHeader>
          <CardTitle>Dimension Averages</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {dimensionAverages.map(dim => (
            <div key={dim.key} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{dim.label}</span>
                <span className={`font-medium ${dim.average >= 0.85 ? 'text-success' : dim.average >= 0.70 ? 'text-warning' : 'text-destructive'}`}>
                  {dim.average.toFixed(2)}
                </span>
              </div>
              <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`absolute left-0 top-0 h-full rounded-full transition-all ${getProgressColor(dim.average)}`}
                  style={{ width: `${dim.average * 100}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
