"""Shared pytest fixtures."""
import sys
from pathlib import Path

import pytest

# Make the package importable without installing (mirrors pyproject pythonpath).
SRC = Path(__file__).resolve().parents[1] / "src"
if str(SRC) not in sys.path:
    sys.path.insert(0, str(SRC))

from drivewayadvocate import db as db_module  # noqa: E402


@pytest.fixture(scope="session")
def conn():
    """A fully-seeded in-memory database shared across the test session."""
    connection = db_module.build_in_memory()
    yield connection
    connection.close()
