# Dealer Markup Analysis

This is the heart of Driveway Advocate's value: the gap between what a dealer **pays** for
a VSC and what they **charge** the customer.

## What the research shows

| Claim | Figure | Source | Confidence |
|-------|--------|--------|------------|
| Dealer markup share of retail | **≥ 50%** of the VSC retail price | [dealerre.com](https://feeds.dealerre.com/blog/profit-margin-dealer-warranties) | Medium |
| Typical markup over wholesale | **50%–200%** | [dealerre.com](https://feeds.dealerre.com/blog/profit-margin-dealer-warranties) | Medium |
| Extreme markup spread | **40%–400%** (e.g., $1,000 cost → $5,000 offer) | [ConsumerAffairs](https://www.consumeraffairs.com/automotive/what-is-a-dealership-warranty.html) | Medium |
| Gross profit per contract | **$1,000+** pure profit on a $2,500 plan | [ConsumerAffairs](https://www.consumeraffairs.com/automotive/what-is-a-dealership-warranty.html) | Medium |
| Fair dealer profit when negotiating | **$200–$500 over cost** | [Edmunds](https://www.edmunds.com/auto-warranty/how-to-get-the-best-price-on-an-extended-car-warranty.html) | High |
| F&I incentive structure | Staff commissioned on VSC sales | [dealerre.com](https://feeds.dealerre.com/blog/profit-margin-dealer-warranties) | High |

## The cost/retail/offer relationship

Three numbers a buyer should distinguish:

1. **Dealer (wholesale) cost** — what the dealer pays the administrator. Often roughly
   **half** of the first offer.
2. **Fair retail** — dealer cost **+ a reasonable margin ($200–$500)**. This is the
   buyer's target.
3. **Dealer's opening offer** — frequently **1.8×–3×** the fair retail. This is the
   anchor the buyer must negotiate down.

### Model used by the engine

```
dealer_cost_est   ≈ fair_mid × 0.55        # administrator wholesale ~55% of typical retail
negotiation_target ≈ dealer_cost_est + $400 # "cost-plus" fair margin (Edmunds $200-500)
markup_vs_cost     = (dealer_offer − dealer_cost_est) / dealer_cost_est
```

Here `fair_mid` is the **typical market retail** (what most buyers pay, markup included),
so the negotiation target lands **below** it — that gap is the buyer's savings.

Interpretation bands the engine applies to a dealer offer:

| Offer vs fair-market high | Verdict | Action |
|---------------------------|---------|--------|
| ≤ fair-market **high** | **FAIR** | Buy if you want coverage; little room left. |
| fair-high → 1.5× fair-high | **NEGOTIATE** | Above market; counter toward the target. |
| > 1.5× fair-high | **OVERPRICED** | Strongly negotiate or walk; consider DTC/CU. |

A separate **markup warning** fires when `dealer_offer > 2 × dealer_cost_est`.

## Negotiation playbook (consumer-facing)

1. **Decouple it from the monthly payment.** Dealers bury VSC cost in the loan; always ask
   for the **cash price** of the contract.
2. **Anchor on cost-plus.** Offer dealer cost + ~$300–$400
   ([Edmunds](https://www.edmunds.com/auto-warranty/how-to-get-the-best-price-on-an-extended-car-warranty.html)).
3. **Bring an outside quote.** A DTC (Endurance/olive) or **credit-union** quote is the
   strongest lever — CU pricing is often the floor.
4. **You can buy later.** OEM/most plans can be purchased before factory warranty expires;
   you are not forced to decide at signing.
5. **You can cancel.** VSCs are cancelable (pro-rata refund, minus fees) per state law —
   useful if pressured into one at signing.

## Why this matters

Because the buyer has no reference point, the **opening offer is an anchor, not a price.**
Driveway Advocate's database converts that anchor into a defensible fair range + target,
which is exactly the information asymmetry the dealer relies on.
