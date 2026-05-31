# Page Override — SOS Report (`/sos-report`)

> Overrides `MASTER.md` for the highest-stakes flow. The person filling this in may be panicked, one-handed, on mobile data, standing over an injured animal. **Speed, size, forgiveness.**

## Deviations from Master
- **Primary action = Emergency variant** (`--ds-emergency` #BE123C), full-width, ≥56px tall, sticky at the bottom of the viewport on mobile so it's always reachable.
- **Touch targets ≥48px** (above the 44px global floor). Condition chips are large tap cards, min 88px wide.
- **One decision per block.** Photos → Condition → Location → Details → Contact, in that priority order. Contact is last and optional.
- **Status is always visible.** Show a slim progress/step hint and an explicit "Alert sent → redirecting" success state with a checkmark; never leave the user guessing.
- **Offline-aware.** If the network is down, show the `errors.offline` message and reassure the report will send on reconnect (PWA). Don't block the form.
- **Reduced copy.** Short labels, big inputs, no marketing language. The hero states the one promise: photo + pin = fast alert; GPS stays private.
- **Errors are loud and recoverable**: `role="alert"`, rose, with a concrete fix ("Add at least one photo").

## Keep from Master
Palette, type (Fraunces headings / Hanken body), radius, focus rings, motion (the sanctioned amber/emergency pulse lives here).
