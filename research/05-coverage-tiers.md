# Coverage Tier Glossary

Standardized tiers used across the database (`coverage_tiers` table). Real provider plan
names vary wildly; this glossary **normalizes** them so quotes are comparable. The
`tier_key` column is what the engine and seed data reference.

| `tier_key` | Name | Coverage model | What's covered | Relative price | Typical $/yr |
|------------|------|----------------|----------------|----------------|--------------|
| `powertrain` | Powertrain | Stated-component | Engine, transmission, drivetrain only | $ | $600–$750 |
| `powertrain_plus` | Powertrain Plus | Stated-component | Powertrain + a few major systems (A/C, some electrical) | $$ | $750–$1,000 |
| `stated_component` | Stated Component | Stated-component | A defined list of covered parts/systems | $$ | $900–$1,300 |
| `high_tech` | High-Tech / Electrical | Stated-component | Electronics, sensors, infotainment, advanced electrical | $$$ | $1,000–$1,500 |
| `comprehensive` | Comprehensive | Stated-component (broad) | Most major systems; just short of exclusionary | $$$ | $1,100–$1,800 |
| `exclusionary` | Exclusionary (Bumper-to-Bumper) | **Exclusionary** | Everything **except** a short exclusions list | $$$$ | $1,000–$4,000+ |
| `ev_hybrid` | EV / Hybrid Specific | Stated-component | High-voltage battery, inverter, e-motor, EV systems | $$$$ | $1,500–$5,400+ |
| `wrap` | Wrap | Supplemental | Fills gaps while factory powertrain warranty remains | $ | $400–$700 |
| `cpo` | Certified Pre-Owned | OEM extension | Manufacturer CPO coverage extension | $$ | $800–$1,400 |
| `maintenance` | Maintenance Bundle | Add-on | Scheduled maintenance (oil, filters, etc.) | $ | varies |
| `tire_wheel` | Tire & Wheel | Add-on | Road-hazard tire/wheel damage | $ | $100–$400 |
| `gap` | GAP / Add-on | Add-on | Loan/lease gap, key, dent, etc. | $ | $300–$700 |

## Stated-component vs. exclusionary — the key distinction

- **Stated-component ("named-component")** contracts cover **only the parts explicitly
  listed.** If it isn't on the list, it isn't covered. Cheaper, but the burden is on the
  buyer to confirm a failed part is listed.
- **Exclusionary ("bumper-to-bumper")** contracts cover **everything except** a short
  exclusions list (wear items, maintenance, cosmetics). Closest to factory warranty;
  most expensive; best for the buyer when affordable.

> Rule of thumb the tool surfaces: *"For an exclusionary contract, ask for the **exclusions
> list**. For a stated-component contract, ask for the **inclusions list**."*

## Tier guidance by vehicle situation

| Situation | Suggested tier |
|-----------|----------------|
| Reliable mainstream car, moderate mileage | `powertrain` or `powertrain_plus` (or decline) |
| Tech-heavy or luxury vehicle | `exclusionary` (electronics dominate claims) |
| EV / hybrid | `ev_hybrid` or exclusionary with HV-battery coverage |
| High-mileage vehicle (100k+) | `powertrain`/`stated_component` (exclusionary often unavailable or pricey) |
| Still under factory powertrain warranty | `wrap` |
