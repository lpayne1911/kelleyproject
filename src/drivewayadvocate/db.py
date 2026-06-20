"""Build and connect to the VSC SQLite database.

The database is built from ``database/schema.sql`` and seeded from every CSV in
``database/seed/``.  CSV file names map to table names (e.g. ``providers.csv`` ->
``providers``).  Empty CSV cells are loaded as SQL NULL.

Usage:
    python -m drivewayadvocate.db --build
    python -m drivewayadvocate.db --build --db /tmp/vsc.db
"""
from __future__ import annotations

import argparse
import csv
import sqlite3
from pathlib import Path
from typing import Iterable, Optional

# Repo layout: src/drivewayadvocate/db.py -> repo root is parents[2]
REPO_ROOT = Path(__file__).resolve().parents[2]
DATABASE_DIR = REPO_ROOT / "database"
SCHEMA_PATH = DATABASE_DIR / "schema.sql"
SEED_DIR = DATABASE_DIR / "seed"
DEFAULT_DB_PATH = DATABASE_DIR / "vsc.db"

# Load order respects foreign-key dependencies.
SEED_LOAD_ORDER = [
    "coverage_tiers",
    "mileage_bands",
    "age_bands",
    "providers",
    "vehicles",
    "vehicle_risk_scores",
    "pricing_observations",
]


def _rows_from_csv(path: Path) -> tuple[list[str], list[list[Optional[str]]]]:
    """Return (header, rows) with empty strings converted to None (SQL NULL)."""
    with path.open(newline="", encoding="utf-8") as fh:
        reader = csv.reader(fh)
        header = next(reader)
        rows = [[(cell if cell != "" else None) for cell in row] for row in reader]
    return header, rows


def _load_table(conn: sqlite3.Connection, table: str) -> int:
    path = SEED_DIR / f"{table}.csv"
    if not path.exists():
        raise FileNotFoundError(f"Seed file not found: {path}")
    header, rows = _rows_from_csv(path)
    placeholders = ", ".join("?" for _ in header)
    columns = ", ".join(header)
    sql = f"INSERT INTO {table} ({columns}) VALUES ({placeholders})"
    conn.executemany(sql, rows)
    return len(rows)


def build_database(
    db_path: Path | str = DEFAULT_DB_PATH,
    *,
    seed_tables: Iterable[str] = SEED_LOAD_ORDER,
    verbose: bool = False,
) -> Path:
    """Create the database at ``db_path`` from schema.sql and seed CSVs.

    Any existing file at ``db_path`` is overwritten (schema.sql drops tables first).
    Pass ``":memory:"`` to build an in-memory database (returns the path unchanged).
    """
    db_path = Path(db_path) if db_path != ":memory:" else db_path
    if isinstance(db_path, Path) and db_path.exists():
        db_path.unlink()

    conn = connect(db_path)
    try:
        conn.executescript(SCHEMA_PATH.read_text(encoding="utf-8"))
        for table in seed_tables:
            count = _load_table(conn, table)
            if verbose:
                print(f"  loaded {count:>4} rows -> {table}")
        conn.commit()
    finally:
        conn.close()
    return db_path if isinstance(db_path, Path) else Path(":memory:")


def build_in_memory() -> sqlite3.Connection:
    """Build a fully-seeded in-memory database and return the open connection.

    Useful for tests and the engine when no on-disk DB is desired.
    """
    conn = connect(":memory:")
    conn.executescript(SCHEMA_PATH.read_text(encoding="utf-8"))
    for table in SEED_LOAD_ORDER:
        _load_table(conn, table)
    conn.commit()
    return conn


def connect(db_path: Path | str = DEFAULT_DB_PATH) -> sqlite3.Connection:
    """Open a connection with foreign keys on and row access by column name."""
    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def _count_rows(conn: sqlite3.Connection) -> dict[str, int]:
    counts = {}
    for table in SEED_LOAD_ORDER:
        counts[table] = conn.execute(f"SELECT COUNT(*) FROM {table}").fetchone()[0]
    return counts


def main(argv: Optional[list[str]] = None) -> int:
    parser = argparse.ArgumentParser(description="Build the VSC pricing database.")
    parser.add_argument("--build", action="store_true", help="(re)build the database")
    parser.add_argument(
        "--db", default=str(DEFAULT_DB_PATH), help="output database path"
    )
    args = parser.parse_args(argv)

    if not args.build:
        parser.print_help()
        return 0

    print(f"Building database at {args.db}")
    print(f"  schema: {SCHEMA_PATH}")
    build_database(args.db, verbose=True)

    conn = connect(args.db)
    try:
        counts = _count_rows(conn)
        n_fair = conn.execute(
            "SELECT COUNT(*) FROM v_fair_price_by_class_tier"
        ).fetchone()[0]
    finally:
        conn.close()

    print("\nRow counts:")
    for table, count in counts.items():
        print(f"  {table:<22} {count}")
    print(f"  {'v_fair_price (groups)':<22} {n_fair}")
    print("\nDone.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
