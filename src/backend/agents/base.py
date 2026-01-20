import json
import re
from typing import Dict, Any, Optional
from anthropic import Anthropic
from ..config import config
from ..memory import queries, mutations
from .loader import load_prompt, load_learnings, load_global_learnings, parse_prompt_sections


class BaseAgent:
    """Base class for all Book Maker agents."""

    def __init__(
        self,
        agent_name: str,
        phase: str,
        project_id: str,
        chapter_id: Optional[str] = None
    ):
        self.agent_name = agent_name
        self.phase = phase
        self.project_id = project_id
        self.chapter_id = chapter_id

        # Load prompt and learnings
        self.prompt_text = load_prompt(phase, agent_name)
        self.prompt_sections = parse_prompt_sections(self.prompt_text)
        self.learnings = load_learnings(agent_name)
        self.global_learnings = load_global_learnings()

        # Claude client
        self.client = Anthropic(api_key=config.claude_api_key)

    def get_memory_context(self) -> Dict[str, Any]:
        """
        Override in subclasses to fetch relevant data from memory.
        Returns a dict that will be included in the prompt.
        """
        return {}

    def build_system_prompt(self) -> str:
        """Build the full system prompt including learnings."""
        parts = [
            self.prompt_sections.get('system_prompt', self.prompt_text),
            "\n\n## LEARNINGS\n",
            "### Global Best Practices\n",
            self.global_learnings,
            f"\n### {self.agent_name} Specific Learnings\n",
            self.learnings
        ]
        return ''.join(parts)

    def build_user_message(self, input_data: Dict[str, Any]) -> str:
        """Build the user message with input data and memory context."""
        memory_context = self.get_memory_context()

        message_parts = ["## INPUT DATA\n"]
        message_parts.append(json.dumps(input_data, indent=2))

        if memory_context:
            message_parts.append("\n\n## CONTEXT FROM MEMORY\n")
            message_parts.append(json.dumps(memory_context, indent=2))

        if 'output' in self.prompt_sections:
            message_parts.append("\n\n## EXPECTED OUTPUT FORMAT\n")
            message_parts.append(self.prompt_sections['output'])

        return ''.join(message_parts)

    def run(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute the agent and return results."""
        # Log start
        self.log("info", f"Starting {self.agent_name}")

        try:
            # Build prompts
            system_prompt = self.build_system_prompt()
            user_message = self.build_user_message(input_data)

            # Call Claude
            response = self.client.messages.create(
                model=config.claude_model,
                max_tokens=8192,
                system=system_prompt,
                messages=[{"role": "user", "content": user_message}]
            )

            # Extract response text
            response_text = response.content[0].text

            # Parse JSON response
            result = self.parse_response(response_text)

            # Validate
            if not self.validate_output(result):
                raise ValueError("Output validation failed")

            # Save to memory
            self.save_to_memory(result)

            # Log success
            self.log("info", f"Completed {self.agent_name}")

            return result

        except Exception as e:
            self.log("error", f"Error in {self.agent_name}: {str(e)}")
            raise

    def parse_response(self, response_text: str) -> Dict[str, Any]:
        """Parse Claude's response, extracting JSON if present."""
        # Try to find JSON in the response
        json_match = re.search(r'```json\s*(.*?)\s*```', response_text, re.DOTALL)
        if json_match:
            return json.loads(json_match.group(1))

        # Try parsing the whole response as JSON
        try:
            return json.loads(response_text)
        except json.JSONDecodeError:
            # Return as plain text result
            return {"text": response_text}

    def validate_output(self, output: Dict[str, Any]) -> bool:
        """
        Override in subclasses to add validation logic.
        Returns True if output is valid.
        """
        return True

    def save_to_memory(self, output: Dict[str, Any]) -> None:
        """
        Override in subclasses to save results to the database.
        """
        pass

    def log(self, level: str, message: str, details: Optional[Dict] = None) -> None:
        """Log a message to the pipeline_logs table."""
        phase_num = int(self.phase.split('_')[1]) if '_' in self.phase else 0
        mutations.log_pipeline_event(
            project_id=self.project_id,
            phase=phase_num,
            agent_name=self.agent_name,
            log_level=level,
            message=message,
            chapter_id=self.chapter_id,
            details=details
        )
