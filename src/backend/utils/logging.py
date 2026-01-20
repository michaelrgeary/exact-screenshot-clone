import logging
import os
from datetime import datetime
from pathlib import Path


def setup_logging():
    """Configure logging for the backend."""
    # Ensure logs directory exists
    logs_dir = Path(__file__).parent.parent.parent.parent / "logs"
    logs_dir.mkdir(exist_ok=True)

    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler(),
            logging.FileHandler(logs_dir / f'bookmaker_{datetime.now().strftime("%Y%m%d")}.log')
        ]
    )
    return logging.getLogger('bookmaker')


logger = setup_logging()
