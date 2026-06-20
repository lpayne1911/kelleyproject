// VIN decoding via NHTSA vPIC (free, public, no API key). Runs in the browser
// from the user's device, so it isn't subject to any build-time network policy.
// Docs: https://vpic.nhtsa.dot.gov/api/
import type { Powertrain, Drivetrain } from "@drivewayadvocate/warranty-engine";

export interface DecodedVin {
  vin: string;
  make?: string;
  model?: string;
  year?: number;
  trim?: string;
  powertrain?: Powertrain;
  drivetrain?: Drivetrain;
  turbo?: boolean;
}

// 17 chars, excluding I, O, Q (never used in VINs).
const VIN_RE = /^[A-HJ-NPR-Z0-9]{17}$/i;

export function isValidVin(vin: string): boolean {
  return VIN_RE.test(vin.trim());
}

/** Title-case NHTSA's all-caps makes (e.g. "TOYOTA" -> "Toyota"). */
function titleCase(s: string): string {
  return s
    .toLowerCase()
    .replace(/\b([a-z])/g, (m) => m.toUpperCase())
    .replace(/\bBmw\b/i, "BMW")
    .replace(/\bGmc\b/i, "GMC");
}

function mapPowertrain(fuel?: string, elec?: string): Powertrain | undefined {
  const e = (elec ?? "").toUpperCase();
  if (e.includes("PHEV") || e.includes("PLUG")) return "phev";
  if (e.includes("BEV") || e.includes("FCEV")) return "ev";
  if (e.includes("HEV") || e.includes("HYBRID") || e.includes("MILD") || e.includes("STRONG"))
    return "hybrid";
  const f = (fuel ?? "").toUpperCase();
  if (f.includes("ELECTRIC")) return "ev";
  if (f.includes("GAS") || f.includes("DIESEL") || f.includes("FLEX") || f.includes("E85"))
    return "ice";
  return undefined;
}

function mapDrivetrain(d?: string): Drivetrain | undefined {
  const s = (d ?? "").toUpperCase();
  if (s.includes("FWD") || s.includes("FRONT")) return "fwd";
  if (s.includes("RWD") || s.includes("REAR")) return "rwd";
  if (s.includes("AWD") || s.includes("ALL")) return "awd";
  if (s.includes("4WD") || s.includes("4X4") || s.includes("4-WHEEL") || s.includes("FOUR"))
    return "4wd";
  return undefined;
}

interface VpicRow {
  Make?: string;
  Model?: string;
  ModelYear?: string;
  Trim?: string;
  FuelTypePrimary?: string;
  ElectrificationLevel?: string;
  DriveType?: string;
  Turbo?: string;
  ErrorText?: string;
}

export async function decodeVin(raw: string): Promise<DecodedVin> {
  const vin = raw.trim().toUpperCase();
  if (!isValidVin(vin)) {
    throw new Error("Enter a valid 17-character VIN (letters I, O, Q aren't used).");
  }

  const url = `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${encodeURIComponent(
    vin,
  )}?format=json`;

  let res: Response;
  try {
    res = await fetch(url);
  } catch {
    throw new Error("Couldn't reach the VIN service. Check your connection and retry.");
  }
  if (!res.ok) throw new Error(`VIN service error (${res.status}). Try again in a moment.`);

  const data = (await res.json()) as { Results?: VpicRow[] };
  const row = data.Results?.[0];
  if (!row || (!row.Make && !row.Model)) {
    throw new Error("Couldn't decode that VIN — double-check the digits or enter details manually.");
  }

  const year = row.ModelYear ? Number(row.ModelYear) : undefined;
  return {
    vin,
    make: row.Make ? titleCase(row.Make) : undefined,
    model: row.Model?.trim() || undefined,
    year: Number.isFinite(year) ? year : undefined,
    trim: row.Trim?.trim() || undefined,
    powertrain: mapPowertrain(row.FuelTypePrimary, row.ElectrificationLevel),
    drivetrain: mapDrivetrain(row.DriveType),
    turbo: row.Turbo?.toUpperCase() === "YES" || undefined,
  };
}
