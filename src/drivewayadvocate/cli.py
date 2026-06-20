"""Command-line interface for Driveway Advocate.

    python -m drivewayadvocate.cli quote --year 2021 --make BMW --model "3 Series" \\
        --mileage 45000 --term-months 36 --term-mileage 45000 --deductible 100 \\
        --tier exclusionary --dealer-offer 4200
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Optional

from . import db as db_module
from . import ingest as ingest_module
from .pricing import QuoteRequest, QuoteResult, price_quote


def _get_connection(db_path: Optional[str]):
    """Return a connection to an existing DB, building an in-memory one if missing."""
    path = Path(db_path) if db_path else db_module.DEFAULT_DB_PATH
    if path.exists():
        return db_module.connect(path)
    # No on-disk DB yet: build a seeded in-memory database so the tool still works.
    print(
        f"(note: {path} not found — using an in-memory database. "
        "Run `python -m drivewayadvocate.db --build` to persist it.)",
        file=sys.stderr,
    )
    return db_module.build_in_memory()


def _print_report(result: QuoteResult) -> None:
    req = result.request
    name = " ".join(str(p) for p in [req.year, req.make, req.model, req.trim] if p)
    bar = "=" * 68
    print(bar)
    print(f"  DRIVEWAY ADVOCATE — VSC ADVOCACY REPORT")
    print(bar)
    print(f"  Vehicle      : {name}")
    print(f"  Mileage/Age  : {req.mileage:,} mi  |  ~{req.age_years} yr")
    print(f"  Coverage     : {req.tier}  |  {req.term_months} mo / "
          f"{req.term_mileage or 'n/a'} mi  |  ${req.deductible} deductible")
    print("-" * 68)
    print(f"  Risk score   : {result.score.full_score}/100 "
          f"({result.score.risk_label()})   [intrinsic {result.score.intrinsic_score}/100]")
    print(f"  Fair market  : ${result.fair_low:,} – ${result.fair_high:,}  "
          f"(mid ${result.fair_mid:,})")
    print(f"  Per year     : ~${result.per_year_fair:,}/yr")
    print(f"  Dealer cost  : ~${result.dealer_cost_est:,} (estimated wholesale)")
    print(f"  Target price : ${result.negotiation_target:,} (cost-plus)")
    if req.dealer_offer is not None:
        print("-" * 68)
        print(f"  Dealer offer : ${req.dealer_offer:,}")
        print(f"  Verdict      : {result.verdict}  "
              f"({result.offer_vs_fair_pct:+d}% vs fair mid)")
        if result.markup_warning:
            print(f"  ⚠  {result.markup_warning}")
    print("-" * 68)
    print(f"  RECOMMENDATION:\n    {result.recommendation}")
    print("\n  Why:")
    for line in result.explanation:
        print(f"    - {line}")
    print("\n  Alternatives / next steps:")
    for line in result.alternatives:
        print(f"    - {line}")
    print(bar)
    print("  Estimates only — not a quote or financial advice. Confidence: "
          f"{result.confidence}.")
    print(bar)


def _add_quote_args(p: argparse.ArgumentParser) -> None:
    p.add_argument("--make", required=True)
    p.add_argument("--model", required=True)
    p.add_argument("--year", type=int)
    p.add_argument("--trim")
    p.add_argument("--mileage", type=int, required=True)
    p.add_argument("--term-months", type=int, required=True, dest="term_months")
    p.add_argument("--term-mileage", type=int, dest="term_mileage")
    p.add_argument("--deductible", type=int, default=100)
    p.add_argument("--tier", required=True, help="coverage tier_key (see research/05-coverage-tiers.md)")
    p.add_argument("--dealer-offer", type=int, dest="dealer_offer")
    p.add_argument("--state")
    p.add_argument("--current-warranty", action="store_true", dest="current_warranty",
                   help="factory warranty still active")
    # fallback attributes for vehicles not in the DB
    p.add_argument("--segment", default="mainstream",
                   choices=["economy", "mainstream", "performance", "luxury"])
    p.add_argument("--luxury", action="store_true")
    p.add_argument("--powertrain", default="ice", choices=["ice", "hybrid", "phev", "ev"])
    p.add_argument("--turbo", action="store_true")
    p.add_argument("--drivetrain", default="fwd", choices=["fwd", "rwd", "awd", "4wd"])
    p.add_argument("--db", help="path to the SQLite database")
    p.add_argument("--json", action="store_true", help="emit JSON instead of a report")


def _handle_ingest(args) -> int:
    report = ingest_module.ingest(args.file, dry_run=args.dry_run)
    print(("[dry-run] " if args.dry_run else "") + report.summary())
    for row_no, errors in report.rejected:
        print(f"  row {row_no} REJECTED: {'; '.join(errors)}", file=sys.stderr)
    if report.duplicates:
        print(f"  duplicate rows skipped: {report.duplicates}")
    if report.accepted and not args.dry_run:
        ids = [r["submission_id"] for r in report.accepted]
        print(f"  added submissions (pending review): {ids}")
    return 0


def _handle_review(args) -> int:
    if args.approve or args.reject:
        changed = ingest_module.review(approve_ids=args.approve or [],
                                       reject_ids=args.reject or [])
        print(f"approved {changed['approved']}, rejected {changed['rejected']}")
        return 0
    pending = ingest_module.list_submissions(status="pending")
    if not pending:
        print("No pending submissions.")
        return 0
    print(f"{len(pending)} pending submission(s):")
    for s in pending:
        print(f"  #{s['submission_id']}: {s['model_year']} {s['make']} {s['model']} | "
              f"{s['mileage_at_purchase']} mi | {s['term_months']}mo {s['coverage_tier']} | "
              f"${s['price']} ({s['offer_type']}/{s['source_type']})")
    print("Approve with: review --approve <ids...>   Reject with: review --reject <ids...>")
    return 0


def _handle_promote(args) -> int:
    conn = _get_connection(args.db)
    try:
        result = ingest_module.promote(conn, ids=args.id or None)
    finally:
        conn.close()
    print(f"promoted {result['promoted']} approved submission(s) into pricing_observations")
    if result["promoted"]:
        print("  rebuild the DB to load them: python -m drivewayadvocate.db --build")
    return 0


def main(argv: Optional[list[str]] = None) -> int:
    parser = argparse.ArgumentParser(prog="drivewayadvocate")
    sub = parser.add_subparsers(dest="command", required=True)

    quote_p = sub.add_parser("quote", help="price a VSC offer for a vehicle")
    _add_quote_args(quote_p)

    ingest_p = sub.add_parser("ingest", help="validate + queue crowdsourced offers")
    ingest_p.add_argument("--file", required=True, help="intake CSV (see templates/)")
    ingest_p.add_argument("--dry-run", action="store_true",
                          help="validate and report without changing anything")

    review_p = sub.add_parser("review", help="list/approve/reject pending submissions")
    review_p.add_argument("--approve", nargs="*", type=int, help="submission ids to approve")
    review_p.add_argument("--reject", nargs="*", type=int, help="submission ids to reject")

    promote_p = sub.add_parser(
        "promote", help="copy approved submissions into pricing_observations")
    promote_p.add_argument("--id", nargs="*", type=int, help="only promote these ids")
    promote_p.add_argument("--db", help="path to the SQLite database")

    args = parser.parse_args(argv)

    if args.command == "ingest":
        return _handle_ingest(args)
    if args.command == "review":
        return _handle_review(args)
    if args.command == "promote":
        return _handle_promote(args)

    if args.command == "quote":
        try:
            req = QuoteRequest(
                make=args.make, model=args.model, year=args.year, trim=args.trim,
                mileage=args.mileage, term_months=args.term_months,
                term_mileage=args.term_mileage, deductible=args.deductible, tier=args.tier,
                dealer_offer=args.dealer_offer, state=args.state,
                current_warranty_active=args.current_warranty,
                segment=args.segment, luxury=args.luxury, powertrain=args.powertrain,
                turbo=args.turbo, drivetrain=args.drivetrain,
            )
        except ValueError as exc:
            print(f"error: {exc}", file=sys.stderr)
            return 2
        conn = _get_connection(args.db)
        try:
            result = price_quote(req, conn)
        finally:
            conn.close()

        if args.json:
            print(json.dumps(result.to_dict(), indent=2))
        else:
            _print_report(result)
        return 0

    parser.print_help()
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
