# Driveway Advocate — Compliance Briefing

**Prepared:** 2026-06-20 · **Audience:** founding team · **Status:** research draft

> ⚠️ **Informational only — not legal advice.** This briefing summarizes federal and
> state law as found in public sources to inform product and go-to-market decisions. It is
> **not legal advice** and may be incomplete or out of date. Engage a **licensed attorney**
> (ideally one versed in consumer-finance/CROA and your operating states' auto and
> credit-services laws) before launch, before drafting any consumer contract or disclosure,
> and before making marketing claims.

**Sourcing note:** Many government pages (law.cornell.edu, ftc.gov, cfpb.gov, ecfr.gov,
state legislature sites) blocked automated fetching (HTTP 403) during research. Statutory
citations and figures below were cross-verified across multiple sources (official press
releases + statute mirrors such as Justia/FindLaw/public.law). Items resting on secondary
sources or interpretation are **flagged** — pull the primary text before relying on them.

---

## TL;DR — what shapes the product

1. **Credit repair is the regulated half.** Federal **CROA** bans collecting any fee before
   work is performed, mandates a specific written disclosure + contract + 3-day cancellation,
   and bans guaranteed-results claims. Build billing **in arrears** and consent/disclosure
   screens into the product. The deck's "$149 setup charged only after first review + $99/mo
   in arrears" model is the right instinct — keep it.
2. **Selling credit repair by phone is the single highest-risk pattern.** The **Telemarketing
   Sales Rule (TSR)** is stricter than CROA and is what produced the **$2.7B** Lexington
   Law / CreditRepair.com judgment. Prefer non-telemarketing enrollment.
3. **State credit-services laws stack on top of CROA** — registration + **surety bonds**
   (e.g., CA **$100k**, TX/FL **$10k**), stricter contracts, and a few states (e.g.,
   **Georgia**) effectively **ban for-profit credit repair**. Compliance is state-by-state.
4. **The car side is mostly fine *as advisory*, risky *as brokering*.** Reviewing the buyer's
   own quote and coaching them is generally outside auto-broker licensing. Negotiating with
   the dealer on the buyer's behalf, taking title, or taking any dealer fee can trigger
   **auto-broker/dealer licensing** (CA endorsement; **TX prohibits brokering**; NY **$100k**
   bond). This directly constrains how you frame "we handle the deal to signature."
5. **Never take dealer money; never guarantee results; never advise a client to lie.** These
   are the bright lines behind essentially every enforcement action in this space.

---

## 1. Federal CROA (15 U.S.C. §1679 et seq.)

CROA governs any "credit repair organization" — a for-profit entity that helps improve a
consumer's credit record/score for payment. It is a **floor**, not a ceiling; states may be
stricter.

| Requirement | Statute | What it forces in the product |
|---|---|---|
| **Advance-fee ban** — no money may be charged/received before services are "fully performed" | [§1679b(b)](https://www.law.cornell.edu/uscode/text/15/1679b) | System-enforce that the **first charge cannot post until after** the first review/dispute cycle. Bill monthly **in arrears**. |
| **Written disclosure** "Consumer Credit File Rights Under State and Federal Law," signed/dated **before** any contract | [§1679c](https://law.justia.com/codes/us/2011/title-15/chapter-41/subchapter-ii-a/section-1679d/) | A mandatory **disclosure + e-signature screen** in onboarding, before the contract step. Use the exact statutory text. |
| **Written contract** — detailed service description, total cost, payment terms, performance timeframe, guarantees | [§1679d(b)](https://codes.findlaw.com/us/title-15-commerce-and-trade/15-usc-sect-1679d.html) | A contract screen capturing scope, total cost, and expected duration (the deck's "4–9 months"). |
| **3-business-day cancellation** without penalty, with a "Notice of Cancellation" form; no services before the period ends | [§1679e](https://www.law.cornell.edu/uscode/text/15/1679) | A visible **cancel-within-3-days** notice + delivered cancellation form; don't start billable work until the window passes. |
| **Prohibited practices** — no untrue/misleading statements about creditworthiness; no advising consumers to misrepresent to bureaus/creditors | [§1679b(a)](https://www.law.cornell.edu/uscode/text/15/1679b) | Constrain advocate scripts/templates; no "dispute-everything" coaching. |
| **No fraud/deception** in offering services (basis for the **no-guaranteed-results** rule) | [§1679b(a)(3)-(4)](https://www.ftc.gov/legal-library/browse/statutes/credit-repair-organizations-act) | Ban guarantee language in all marketing/UI copy and templates. |

Enforced by the **FTC** (as an FTC Act violation) and the **CFPB**
([FTC](https://www.ftc.gov/legal-library/browse/statutes/credit-repair-organizations-act),
[CFPB](https://www.consumerfinance.gov/enforcement/actions/pgx-holdings-inc/)).

> **Flag:** the *verbatim* §1679c disclosure block and §1679e cancellation-form text could not
> be machine-fetched (gov 403). Pull exact wording from
> [uscode.house.gov](https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title15-chapter41-subchapterII-A&num=0&edition=prelim)
> before putting it in a consumer-facing screen.

## 2. Telemarketing Sales Rule (TSR) — the highest-risk trap

If credit repair is **sold over the phone**, the TSR (16 CFR Part 310) is **stricter than
CROA**: you may not collect a fee until you give the consumer documentation that the promised
result was achieved — and that documentation can't be provided until **more than six months**
after the result appears on the report
([FTC TSR guidance](https://www.ftc.gov/business-guidance/resources/complying-telemarketing-sales-rule),
[16 CFR 310.4](https://www.ecfr.gov/current/title-16/chapter-I/subchapter-C/part-310)).

- **Implication:** prefer **non-telemarketing** enrollment (web sign-up, inbound, async).
  Any outbound phone sale that takes an upfront/monthly fee risks the exact violation that
  produced the $2.7B judgment below.
- **Flag:** confirm 310.4(a)(2) wording against eCFR before building payment-timing logic.

## 3. State credit-services (CSO) laws

States add registration, **surety bonds**, stricter contracts, and cancellation rules on top
of CROA, and amounts/agencies vary widely
([overview](https://surety1.com/state-by-state-guide-to-credit-services-bonds/), secondary).

| State | Statute | Bond / registration | Notes |
|---|---|---|---|
| **California** | Credit Services Act of 1984, [Civ. Code §§1789.10–.26](https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CIV&sectionNum=1789.16.) | **$100,000** surety bond; register before operating; **5-day** cancellation (longer than CROA) ([§1789.16](https://codes.findlaw.com/ca/civil-code/civ-sect-1789-16/)) | Bond figure via surety summary of §1789.18 — verify. |
| **Texas** | [Fin. Code Ch. 393](https://statutes.capitol.texas.gov/Docs/FI/htm/FI.393.htm) | **$10,000** bond per location, filed before charging advance fees ([§393.401](https://law.justia.com/codes/texas/2022/finance-code/title-5/chapter-393/subchapter-e/section-393-401/)); written contract + 3-day cancel ([§393.201–.202](https://texas.public.law/statutes/tex._fin._code_section_393.201)) | Register with Secretary of State. |
| **Florida** | Credit Service Organizations Act, [Fla. Stat. §§817.7001–.706](https://www.flsenate.gov/Laws/Statutes/2018/Chapter817/Part_III) | **$10,000** bond (§817.701) | Filing agency moved to **FDACS** — confirm current agency. |
| **New York** | [GBL Art. 28-BB §§458-a–k](https://www.nysenate.gov/legislation/laws/GBS/A28-BB) | Pre-contract info statement, advance-fee ban, 3-day cancel ([§458-c/-f](https://newyork.public.law/laws/n.y._general_business_law_section_458-c)) | Appears to have **no state CSO bond** (verify); AG-enforced. |
| **Georgia** | [O.C.G.A. §16-9-59](https://law.justia.com/codes/georgia/title-16/chapter-9/article-4/section-16-9-59/) | **Effectively prohibits for-profit credit repair** (misdemeanor unless nonprofit/attorney) | Do **not** sell the credit program to GA residents without counsel. |

> **Action:** maintain a **state-eligibility gate** in onboarding for the credit program
> (block/again-flag states like GA; ensure registration + bond where required before
> enrolling residents). Bond dollar amounts and filing agencies above lean on secondary
> sources in places — **confirm each against the live statute** before filing.

## 4. Buyer-side auto purchasing — advisory vs. brokering

The licensing trigger is **acting for compensation to negotiate/arrange/effectuate a sale**,
not giving advice.

- **California:** a "dealer" includes anyone who for compensation "negotiates or attempts to
  negotiate" a sale ([Veh. Code §285](https://codes.findlaw.com/ca/vehicle-code/veh-sect-285/));
  an **autobroker** must hold a **dealer license + autobroker's endorsement**
  ([§11700.2](https://california.public.law/codes/ca_veh_code_section_11700.2),
  [§11735](https://california.public.law/codes/vehicle_code_section_11735)) and use a
  prescribed **Autobroker Agreement** with a bold fee-source disclosure
  ([§11738](https://california.public.law/codes/vehicle_code_section_11738)).
- **Texas:** **flatly prohibits** acting as a broker of motor vehicles — including fee-charging
  buyer referral services ([Occ. Code §2301.006](https://statutes.capitol.texas.gov/SOTWDocs/OC/htm/OC.2301.htm),
  [43 TAC §215.84](https://regulations.justia.com/states/texas/title-43/part-10/chapter-215/subchapter-b/section-215-84)).
- **New York:** "Automobile Broker Business" requires registration + a **$100,000** bond
  ([NY DOS](https://dos.ny.gov/automobile-broker-business)); excludes those effecting ≤3
  purchases/year (verify figures — DOS page 403'd).

**The practical line.** Activities that convert *advisory* into *regulated brokering*:
(a) contacting/negotiating with the **selling dealer** on the buyer's behalf; (b) arranging/
assisting/effectuating the purchase (e.g., getting the buyer's signature on the dealer's order,
coordinating delivery); (c) taking **title/possession**; (d) accepting **any fee from the
dealer**. Staying advisory = review the buyer's **own** quote, coach/educate, and let the
consumer personally execute — never transacting, negotiating with the dealer, taking title,
or being paid by the dealer.

> **Product/positioning implication.** "Deal Check" and "Deal Rescue" (audit the quote, coach
> the buyer, scripts) read as **advisory** and are the safe core. But deck language like
> *"protect the buyer all the way to signature"* and *"we handle the deal, start to signature"*
> risks reading as **brokering**. Either (a) keep the service strictly advisory and word it as
> "we prepare you to negotiate" (not "we negotiate for you"), or (b) get dealer-license +
> autobroker endorsement in states that require it and **avoid TX-style prohibition states**.
> **Flag:** the "advice-only is exempt" conclusion is an interpretive reading of the statutes,
> not an explicit regulator safe harbor — confirm per state with counsel.

## 5. FTC backdrop — UDAP and the (now-withdrawn) CARS Rule

- **FTC Act Section 5 (15 U.S.C. §45)** bans "unfair or deceptive acts or practices" — the
  durable catch-all ([CRS](https://www.congress.gov/crs-product/IF12244)).
- **CARS Rule (16 CFR Part 463)** would have required dealers to show a truthful offering
  price + total-of-payments, banned no-benefit add-ons, and required express consent for
  charges ([FTC](https://www.ftc.gov/news-events/news/press-releases/2023/12/ftc-announces-cars-rule-fight-scams-vehicle-shopping)).
  **But its status changed:** effective date paused Jan 2024
  ([FTC](https://www.ftc.gov/news-events/news/press-releases/2024/01/ftc-pauses-cars-rule-effective-date)),
  **vacated by the 5th Circuit Jan 27, 2025**
  ([NADA](https://www.nada.org/nada/press-releases/nada-and-tada-win-court-challenge-ftc-vehicle-shopping-rule-rule-vacated)),
  and **formally withdrawn by the FTC effective Feb 12, 2026**
  ([Fed. Register](https://www.federalregister.gov/documents/2026/02/12/2026-02866/revision-of-the-negative-option-rule-withdrawal-of-the-cars-rule-removal-of-the-non-compete-rule-to)).

> **Tailwind, not obligation.** The junk-fee/add-on/non-transparent-pricing conduct CARS
> targeted is **still actionable under Section 5 UDAP**, so a buyer-protection brand is aligned
> with durable priorities — but **do not market the CARS Rule as a live dealer obligation.**

## 6. Enforcement themes (the cautionary record)

- **Lexington Law / CreditRepair.com (PGX Holdings):** court found **TSR advance-fee**
  violations (partial SJ Mar 2023); stipulated judgment ~**$2.7B** redress + civil penalties
  + a **10-year telemarketing ban**; company filed **Chapter 11**; CFPB returning **$1.8B** to
  **4.3M** consumers
  ([CFPB settlement](https://www.consumerfinance.gov/about-us/newsroom/cfpb-reaches-multibillion-dollar-settlement-with-credit-repair-conglomerate/),
  [refunds](https://www.consumerfinance.gov/about-us/newsroom/cfpb-announces-return-of-1-8-billion-in-illegal-junk-fees-to-4-3-million-americans-harmed-in-massive-credit-repair-scheme/)).
- **FTC actions** (BoostMyScore, Growth Cave/Apex Mind) follow the same pattern: **illegal
  upfront fees + unsubstantiated score guarantees**
  ([FTC](https://www.ftc.gov/business-guidance/blog/2020/03/croa-case-shows-why-piggybacking-isnt-answer-consumers-shouldering-bad-credit)).
- **Bright-line illegal conduct** to keep out of scripts/marketing entirely: disputing
  information known to be **accurate** ("credit washing"); advising clients to **lie** or file
  **false identity-theft reports**; **CPN / "new credit identity"** schemes
  ([FTC alert](https://consumer.ftc.gov/consumer-alerts/2026/01/influencers-are-pushing-illegal-trick-fix-your-credit-report),
  [FCRA §611 30-day reinvestigation](https://www.consumerfinance.gov/compliance/circulars/consumer-financial-protection-circular-2022-07-reasonable-investigation-of-consumer-reporting-disputes/)).

## 7. Concrete requirements for the Driveway Advocate product

**Credit engine (build into onboarding + billing):**
- [ ] CROA **disclosure screen** ("Consumer Credit File Rights…") with signed acknowledgment **before** the contract step.
- [ ] **Written contract** screen: service description, total cost, duration, guarantees (none), business name/address.
- [ ] **3-day cancellation** notice + delivered Notice-of-Cancellation; no billable work until the window passes.
- [ ] **Billing in arrears** enforced in code: first charge only **after** first review/dispute cycle (matches the deck's $149-after-first-work + $99/mo model).
- [ ] **State-eligibility gate**: block/flag states that ban or require registration+bond (e.g., GA ban; CA/TX/FL bonds) until compliant.
- [ ] **No-guarantee copy lint**: no "guaranteed," "remove any negative item," or specific point-gain promises anywhere in UI, ads, or templates.
- [ ] **Script guardrails**: advocate templates must not advise disputing accurate items, lying, or CPNs.
- [ ] Avoid **telemarketing** sales of the credit program (or build the TSR 6-month documentation rule in — much harder).

**Auto engine (positioning + scope):**
- [ ] Keep Deal Check / Deal Rescue **advisory**: review the buyer's **own** quote, coach, provide scripts — buyer executes the deal themselves.
- [ ] Reword "we handle the deal to signature" → "we prepare you to walk in and sign a clean deal," unless you obtain dealer-license/autobroker endorsement per state.
- [ ] **Never** accept dealer/lender commissions (already the brand promise — keep it ironclad; it's also what keeps you out of "broker paid by seller" framing).
- [ ] If you ever negotiate **with the dealer** for the buyer or take title, treat it as **brokering** and get licensed state-by-state (and avoid prohibition states like TX).

## Open questions to take to counsel
1. Is the credit program sold **anywhere by phone**? If so, full TSR analysis before launch.
2. Which **states** will you enroll credit clients in first? Confirm registration + bond + any bans for each.
3. Does the auto service ever **negotiate with the dealer** or only prepare the buyer? This determines auto-broker licensing exposure.
4. Exact **verbatim** CROA §1679c disclosure + §1679e cancellation form text for the UI.
5. Confirm current **bond amounts and filing agencies** (CA §1789.18, FL/FDACS, NY) against live statutes.

---

### Sources
Primary statutes/agencies (verify directly): CROA [15 U.S.C. §§1679–1679d](https://www.law.cornell.edu/uscode/text/15/1679) ·
TSR [16 CFR Part 310](https://www.ecfr.gov/current/title-16/chapter-I/subchapter-C/part-310) ·
FTC Act §5 [15 U.S.C. §45](https://www.congress.gov/crs-product/IF12244) ·
CARS Rule withdrawal [Fed. Register 2026](https://www.federalregister.gov/documents/2026/02/12/2026-02866/revision-of-the-negative-option-rule-withdrawal-of-the-cars-rule-removal-of-the-non-compete-rule-to) ·
CA [Civ. Code §§1789.10–.26](https://codes.findlaw.com/ca/civil-code/civ-sect-1789-16/) / [Veh. Code §§285, 11700.2, 11735, 11738](https://california.public.law/codes/vehicle_code_section_11735) ·
TX [Fin. Code Ch. 393](https://statutes.capitol.texas.gov/Docs/FI/htm/FI.393.htm) / [Occ. Code §2301.006](https://statutes.capitol.texas.gov/SOTWDocs/OC/htm/OC.2301.htm) ·
FL [§§817.7001–.706](https://www.flsenate.gov/Laws/Statutes/2018/Chapter817/Part_III) ·
NY [GBL Art. 28-BB](https://www.nysenate.gov/legislation/laws/GBS/A28-BB) / [auto broker](https://dos.ny.gov/automobile-broker-business) ·
GA [O.C.G.A. §16-9-59](https://law.justia.com/codes/georgia/title-16/chapter-9/article-4/section-16-9-59/) ·
CFPB [PGX/Lexington Law](https://www.consumerfinance.gov/about-us/newsroom/cfpb-reaches-multibillion-dollar-settlement-with-credit-repair-conglomerate/).

*Several government URLs above blocked automated fetching during research; treat figures/dates
as verified-against-secondary and confirm against primary text before relying on them.*
