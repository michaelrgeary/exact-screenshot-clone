import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, XCircle, RefreshCw, Star } from 'lucide-react';
import type { QualityScore } from '@/hooks/useQuality';

interface ChapterQualityTabProps {
  qualityScore: QualityScore | null;
  loading?: boolean;
  onRequestRevalidation: () => void;
  revalidating?: boolean;
}

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
  if (score >= 0.85) return 'text-success';
  if (score >= 0.70) return 'text-warning';
  return 'text-destructive';
};

const getProgressColor = (score: number): string => {
  if (score >= 0.85) return 'bg-success';
  if (score >= 0.70) return 'bg-warning';
  return 'bg-destructive';
};

export function ChapterQualityTab({
  qualityScore,
  loading,
  onRequestRevalidation,
  revalidating,
}: ChapterQualityTabProps) {
  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <div className="space-y-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!qualityScore) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No quality score available yet.</p>
        <p className="text-sm mt-1">Quality scoring will be performed during processing.</p>
      </div>
    );
  }

  const radarData = DIMENSIONS.map(dim => ({
    dimension: dim.label,
    score: qualityScore[dim.key as keyof QualityScore] as number,
    fullMark: 1,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold">{qualityScore.overallScore.toFixed(2)}</span>
          {qualityScore.passesThreshold ? (
            <Badge className="bg-success/10 text-success">
              <CheckCircle className="h-3 w-3 mr-1" />
              Passes Threshold
            </Badge>
          ) : (
            <Badge className="bg-destructive/10 text-destructive">
              <XCircle className="h-3 w-3 mr-1" />
              Below Threshold
            </Badge>
          )}
        </div>
        <Button variant="outline" onClick={onRequestRevalidation} disabled={revalidating}>
          <RefreshCw className={`h-4 w-4 mr-2 ${revalidating ? 'animate-spin' : ''}`} />
          Request Re-evaluation
        </Button>
      </div>

      {/* Radar Chart */}
      <Card>
        <CardContent className="pt-6">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis 
                  dataKey="dimension" 
                  tick={{ fontSize: 11 }}
                  className="text-muted-foreground"
                />
                <PolarRadiusAxis 
                  angle={30} 
                  domain={[0, 1]} 
                  tick={{ fontSize: 10 }}
                />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Dimension Scores */}
      <Card>
        <CardHeader>
          <CardTitle>Dimension Scores</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {DIMENSIONS.map(dim => {
            const score = qualityScore[dim.key as keyof QualityScore] as number;
            return (
              <div key={dim.key} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{dim.label}</span>
                  <span className={`font-medium ${getScoreColor(score)}`}>
                    {score.toFixed(2)}
                  </span>
                </div>
                <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`absolute left-0 top-0 h-full rounded-full transition-all ${getProgressColor(score)}`}
                    style={{ width: `${score * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Feedback */}
      {qualityScore.feedback && qualityScore.feedback.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {qualityScore.feedback.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-muted-foreground">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
