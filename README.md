# PetMeds

Pet medication supply tracking with runout projections.

**Startup idea:** every pet owner finds the empty pill bottle at 11pm on a Sunday. Chronic meds don't warn you - they just run out. PetMeds counts down: dose schedule plus pills on hand gives an exact runout date, each logged dose decrements the bottle, and warnings fire at one week (order soon) and three days (critical).

## Use

Open `app.html`. Add each medication (pet, pills per dose, doses per day, pills on hand). Tap "Give dose" when you give one; the runout date updates. Refill when the new bottle arrives. Meds sort emptiest-first. Data persists in localStorage.

## Engine

`engine.js` holds the pure logic (daily-use math, runout projection, status bands, dose/refill validation) and is covered by node tests. The UI is a thin render layer over it.

Part of the hourly app factory - 60+ small tools, one per hour.
