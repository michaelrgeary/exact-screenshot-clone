import { Check, Circle, X, Loader2 } from 'lucide-react';

interface PipelineVisualizationProps {
  currentPhase: number;
  status: 'draft' | 'running' | 'paused' | 'completed' | 'error';
}

const PHASES = [
  { number: 1, name: 'Prep', fullName: 'Preparation' },
  { number: 2, name: 'Analysis', fullName: 'Analysis' },
  { number: 3, name: 'Transform', fullName: 'Transformation' },
  { number: 4, name: 'Writing', fullName: 'Writing' },
  { number: 5, name: 'Visual', fullName: 'Visual' },
  { number: 6, name: 'Editing', fullName: 'Editing' },
  { number: 7, name: 'Quality', fullName: 'Quality Check' },
  { number: 8, name: 'Translation', fullName: 'Translation' },
  { number: 9, name: 'Assembly', fullName: 'Assembly' },
  { number: 10, name: 'Output', fullName: 'Output Generation' },
  { number: 11, name: 'Final QA', fullName: 'Final Quality Assurance' },
];

type PhaseStatus = 'completed' | 'current' | 'pending' | 'error';

export function PipelineVisualization({ currentPhase, status }: PipelineVisualizationProps) {
  const getPhaseStatus = (phaseNumber: number): PhaseStatus => {
    if (status === 'error' && phaseNumber === currentPhase) return 'error';
    if (phaseNumber < currentPhase) return 'completed';
    if (phaseNumber === currentPhase) return 'current';
    return 'pending';
  };

  const PhaseIcon = ({ phaseStatus, isRunning }: { phaseStatus: PhaseStatus; isRunning: boolean }) => {
    switch (phaseStatus) {
      case 'completed':
        return <Check className="h-3 w-3" />;
      case 'current':
        return isRunning ? <Loader2 className="h-3 w-3 animate-spin" /> : <Circle className="h-3 w-3 fill-current" />;
      case 'error':
        return <X className="h-3 w-3" />;
      default:
        return <Circle className="h-3 w-3" />;
    }
  };

  const getPhaseClasses = (phaseStatus: PhaseStatus) => {
    switch (phaseStatus) {
      case 'completed':
        return 'bg-success text-success-foreground';
      case 'current':
        return 'bg-primary text-primary-foreground';
      case 'error':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const currentPhaseInfo = PHASES.find(p => p.number === currentPhase);
  const isRunning = status === 'running';

  return (
    <div className="space-y-6">
      {/* Phase Stepper */}
      <div className="flex items-center justify-between overflow-x-auto pb-2">
        {PHASES.map((phase, index) => {
          const phaseStatus = getPhaseStatus(phase.number);
          const isLast = index === PHASES.length - 1;

          return (
            <div key={phase.number} className="flex items-center">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium ${getPhaseClasses(phaseStatus)}`}
                >
                  <PhaseIcon phaseStatus={phaseStatus} isRunning={isRunning} />
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {phase.name}
                </span>
              </div>
              {!isLast && (
                <div
                  className={`h-0.5 w-4 sm:w-6 mx-1 ${
                    phaseStatus === 'completed' ? 'bg-success' : 'bg-muted'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Current Phase Info */}
      {currentPhaseInfo && currentPhase > 0 && (
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-medium text-foreground mb-1">
            Phase {currentPhase}: {currentPhaseInfo.fullName}
          </h4>
          <p className="text-sm text-muted-foreground">
            {status === 'running' && 'Currently processing...'}
            {status === 'paused' && 'Processing paused'}
            {status === 'completed' && 'All phases completed'}
            {status === 'error' && 'Error occurred in this phase'}
            {status === 'draft' && 'Waiting to start'}
          </p>
        </div>
      )}
    </div>
  );
}
