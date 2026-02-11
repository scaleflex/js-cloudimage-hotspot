# UX Issues To Address

Identified during deep code review. All bugs, code quality, accessibility, and UX/CSS issues have been fixed.
Only pre-existing test gaps remain.

---

## Test Gaps

### 1. Pre-existing: `load trigger` test fails in jsdom
**File:** `tests/core.test.ts`
jsdom doesn't fire image load events, so the test expects visible popovers that never appear. Needs a mock or async test approach.

### 2. Pre-existing: React tests can't run (missing `@testing-library/dom`)
**File:** `tests/react.test.tsx`
The `@testing-library/dom` package is not installed as a dependency.
