# Atlas Sanctum: Covenant Runtime Demo Script

## 90-Second Demo Flow

### Part 1: The Problem (15 seconds)
"Emergency systems often fail because risk is detected too late, funds are not transparently released, and real-world outcomes are not verified."

**Show:** Empty dashboard or chaotic emergency response system

---

### Part 2: The Solution (15 seconds)
"Atlas Sanctum creates covenant-based response infrastructure. It ingests real-world data, evaluates conditions, executes a transparent payout, and verifies whether impact happened."

**Show:** Atlas Sanctum Mission Control Dashboard

---

### Part 3: The Flow (45 seconds)

#### Step 1: Risk Spike (10 seconds)
- Open Dashboard
- See Nairobi East Basin at **Critical Risk (78)**
- Point out the risk trend chart showing escalation

**Say:** "Real-time risk intelligence shows flood risk exceeding threshold."

#### Step 2: Covenant Eligible (10 seconds)
- Click on "Flood Response Covenant - Nairobi East"
- Show all eligibility checks turning green:
  - ✅ Risk Threshold Met (78 ≥ 70)
  - ✅ Reserve Verified
  - ✅ Sufficient Balance ($25,000 available)
  - ✅ Covenant Armed
  - ✅ Cooldown Passed

**Say:** "Covenant conditions are evaluated automatically. All checks pass."

#### Step 3: Reserve Verified (5 seconds)
- Show Treasury page
- Highlight $25,000 available balance
- Show proof status: "Verified"

**Say:** "Reserve integrity is verified onchain."

#### Step 4: Payout Executed (10 seconds)
- Click "Execute Covenant"
- Show transaction submitted
- Show txHash confirmation
- Show intervention record created

**Say:** "Covenant executes automatically. Funds are released with full audit trail."

#### Step 5: Evidence Verified (10 seconds)
- Navigate to Verification Console
- Show evidence upload (preloaded)
- Show confidence score: 91%
- Click "Finalize Verification"

**Say:** "Field evidence is collected and verified. Impact is confirmed onchain."

---

### Part 4: The Deeper Frame (15 seconds)
"We are not just moving money onchain. We are aligning action with truth."

**Show:** Covenant status changes to "Verified"
**Show:** Impact report with households reached: 340

---

## Key Talking Points

### For Judges
1. **Real Problem**: Flood response in vulnerable communities
2. **Real Data**: Weather, hydrology, vulnerability indices
3. **Real Automation**: Covenant conditions evaluated automatically
4. **Real Accountability**: Onchain proof of impact

### Technical Highlights
- Smart contracts for covenant lifecycle
- Risk scoring engine with weighted factors
- Reserve integrity verification
- Evidence-based impact verification
- Full audit trail from risk to verified impact

### Differentiators
- Not just DeFi - this is **covenant infrastructure**
- Not just automation - this is **moral automation**
- Not just transactions - this is **verified impact**

---

## Demo Data

### Region
- **ID**: reg_nairobi_east
- **Name**: Nairobi East Basin
- **Country**: Kenya
- **Vulnerability Index**: 0.82 (High)

### Risk Snapshot
- **Rainfall 24h**: 88mm
- **Forecast 48h**: 120mm
- **River Level**: 4.2m
- **Risk Score**: 78 (Critical)

### Covenant
- **ID**: cov_001
- **Title**: Flood Response Covenant - Nairobi East
- **Threshold**: Risk ≥ 70
- **Reserve Required**: $10,000
- **Payout**: $5,000
- **Status**: Armed

### Reserve
- **ID**: res_001
- **Name**: Emergency Response Reserve
- **Balance**: $25,000 USDC
- **Proof Status**: Verified

---

## Technical Architecture Shown

```
[Weather Data] → [Risk Engine] → [Covenant Engine]
                                      ↓
[Reserve Vault] → [Payout Router] → [Smart Contract]
                                      ↓
[Field Evidence] → [Impact Verifier] → [Onchain Record]
```

---

## Q&A Preparation

### "How is this different from other DeFi protocols?"
"We're not building a lending protocol or DEX. We're building **covenant infrastructure** for high-stakes decisions. The question isn't 'can we automate' but 'what should be automated, under what moral and evidentiary conditions.'"

### "What about real-world data feeds?"
"For MVP, we use trusted data sources with manual verification. In production, we integrate Chainlink oracles for weather data, satellite imagery, and IoT sensors."

### "How do you prevent false triggers?"
"Multiple safeguards: cooldown periods, reserve verification, multi-sig steward approval, and evidence-based verification before finalization."

### "What's the business model?"
"Infrastructure fees for covenant execution, verification services, and institutional licensing for humanitarian organizations."

---

## Success Metrics for Demo

- [ ] Judges understand the problem in 10 seconds
- [ ] Judges see the full flow in 60 seconds
- [ ] Judges understand the technical architecture
- [ ] Judges see the moral/ethical framing
- [ ] Judges can articulate the differentiator

---

## Backup Slides (If Time Permits)

### Slide 1: System Architecture
Show the full architecture diagram

### Slide 2: Smart Contracts
Show the 4 contracts and their purposes

### Slide 3: Risk Engine Formula
```
riskScore = (0.35 * rainfall24h) +
            (0.30 * forecast48h) +
            (0.20 * riverLevel) +
            (0.15 * vulnerabilityIndex)
```

### Slide 4: Covenant Lifecycle
```
Draft → Armed → Triggered → Executed → Verified
```

### Slide 5: Trust Model
- Risk computation: Offchain
- Reserve verification: Onchain
- Evidence verification: Human-assisted
- Final verification: Onchain
