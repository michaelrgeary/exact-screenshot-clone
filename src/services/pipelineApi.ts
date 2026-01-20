/**
 * Pipeline API Service
 *
 * Wraps calls to the Python backend API that runs the Book Maker pipeline.
 *
 * The backend API must be running at the configured URL for these calls to work.
 * Default: http://localhost:8000
 */

// Configure the backend API URL
const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:8000';

interface PipelineStatusResponse {
  project_id: string;
  status: string;
  current_phase: number;
  total_chapters: number;
  completed_chapters: number;
  is_running: boolean;
}

interface StartPipelineRequest {
  start_phase?: number;
  end_phase?: number;
  model?: string;
}

interface AgentResult {
  success: boolean;
  agent_name: string;
  duration_ms: number;
  input_tokens: number;
  output_tokens: number;
  tool_calls: number;
  output: string | null;
  error: string | null;
}

interface PhaseInfo {
  phase: number;
  agents: Array<{
    name: string;
    phase: number;
    is_chapter_level: boolean;
    depends_on: string[];
  }>;
}

/**
 * Get the pipeline status for a project.
 */
export async function getPipelineStatus(projectId: string): Promise<PipelineStatusResponse> {
  const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/status`);
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }
  return response.json();
}

/**
 * Start the pipeline for a project.
 */
export async function startPipeline(
  projectId: string,
  options: StartPipelineRequest = {}
): Promise<{ status: string; project_id: string; start_phase: number; end_phase: number }> {
  const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      start_phase: options.start_phase ?? 1,
      end_phase: options.end_phase ?? 11,
      model: options.model ?? 'claude-sonnet-4-20250514',
    }),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }
  return response.json();
}

/**
 * Pause the pipeline for a project.
 */
export async function pausePipeline(projectId: string): Promise<{ status: string; project_id: string }> {
  const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/pause`, {
    method: 'POST',
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }
  return response.json();
}

/**
 * Resume the pipeline for a project.
 */
export async function resumePipeline(projectId: string): Promise<{ status: string; project_id: string }> {
  const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/resume`, {
    method: 'POST',
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }
  return response.json();
}

/**
 * Stop the pipeline for a project.
 */
export async function stopPipeline(projectId: string): Promise<{ status: string; project_id: string }> {
  const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/stop`, {
    method: 'POST',
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }
  return response.json();
}

/**
 * Run a single phase for a project.
 */
export async function runPhase(
  projectId: string,
  phase: number,
  model?: string
): Promise<{ status: string; project_id: string; phase: number }> {
  const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/phases/${phase}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phase, model: model ?? 'claude-sonnet-4-20250514' }),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }
  return response.json();
}

/**
 * Run a single agent for a project.
 */
export async function runAgent(
  projectId: string,
  agentName: string,
  phase: number,
  chapterId?: string,
  model?: string
): Promise<AgentResult> {
  const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/agents/${agentName}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      agent_name: agentName,
      phase,
      chapter_id: chapterId,
      model: model ?? 'claude-sonnet-4-20250514',
    }),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }
  return response.json();
}

/**
 * Get all phases and their agents.
 */
export async function getPhases(): Promise<PhaseInfo[]> {
  const response = await fetch(`${API_BASE_URL}/api/phases`);
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }
  return response.json();
}

/**
 * Check if the backend API is healthy.
 */
export async function checkHealth(): Promise<{ status: string; timestamp: string; config_loaded: boolean }> {
  const response = await fetch(`${API_BASE_URL}/health`);
  if (!response.ok) {
    throw new Error(`Backend API not available at ${API_BASE_URL}`);
  }
  return response.json();
}
