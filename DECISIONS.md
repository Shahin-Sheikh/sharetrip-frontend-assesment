# Candidate Decisions & Notes

## 1. State Management & Architecture

**Approach: Custom hooks with built-in resilience patterns, no external state management library.**

- **`useProducts` hook** — Encapsulates all data fetching, caching, and retry logic in a single custom hook. Params are memoized in App.tsx and passed in, so the hook re-fetches only when filters/page actually change.
- **Automatic retry with exponential backoff** — The flaky API (20% failure rate) is handled with up to 3 automatic retries at 1s, 2s, and 4s delays. Users see a "Retrying..." indicator in the header so they know the app is still working. If all retries fail, a clear error state with a manual "Try Again" button appears.
- **In-memory cache (30s TTL)** — Successful API responses are cached so that navigating back to a previously-viewed page/filter is instant and avoids unnecessary re-exposure to the flaky API. Cache is invalidated after 30 seconds to balance freshness vs resilience.
- **Debounced search (400ms)** — Prevents firing API calls on every keystroke, reducing the chance of hitting the flaky endpoint unnecessarily.
- **Why no external library (React Query/SWR)?** — The scope of this assignment is a single data source with one endpoint. A custom hook avoids adding ~30KB to the bundle for features we don't need. The retry, caching, and loading patterns are straightforward enough to implement correctly in ~100 lines. For a production app with multiple endpoints, React Query would be the better choice.

**State shape:** Simple `useState` in App.tsx for UI state (page, category, searchInput), and the hook manages async state internally (data, loading, error, retrying). No global state store is needed since all state lives in a single page.

## 2. Trade-offs and Omissions

**Intentional omissions given assignment scope:**

- **No routing** — Single-page listing doesn't need it. Would add React Router for product detail pages.
- **No "Add to Cart" functionality** — The button is present in the UI for visual completeness but doesn't wire to any cart state, as cart management isn't part of the requirements.
- **No skeleton loaders** — Used a centered loading spinner with retry status instead. Skeletons would be a polish improvement for subsequent work.
- **No server-side rendering** — Vite SPA is sufficient for this demo. For SEO-critical product pages, would use Next.js.
- **No unit/integration tests** — Would add Vitest + React Testing Library for the hook retry logic and component rendering.

**If I had more time, I'd prioritize:**
1. Skeleton loading states for a smoother perceived performance
2. URL-synced filters (search params) so users can share filtered views
3. Optimistic page transitions (prefetch next page on hover)
4. Comprehensive test coverage for the retry/cache logic

## 3. AI Usage

I used **Claude Code (Claude Opus 4.6)** as a coding assistant throughout this assignment. Specifically:

- **Scaffolding & boilerplate** — Generated initial component structures and the CSS layout, which I then refined.
- **Architecture decisions** — Discussed the retry/cache pattern design. The exponential backoff delays, cache TTL, and max retry count were chosen by me based on the API's known 20% failure rate and 500-2500ms latency.
- **Bug fixing** — Used it to identify and fix TypeScript strict mode issues (e.g., React 19's `useRef` requiring explicit initial values).

All architectural trade-offs (no external state library, cache TTL value, debounce timing, retry strategy) were my decisions informed by the specific constraints of this assignment.

## 4. Edge Cases Identified

1. **Mock data regenerates on page refresh** — The API uses `Math.random()` at module scope, so product prices, categories, and stock values change on every page refresh. In a real app, this wouldn't happen since data comes from a persistent backend. Noted but not "fixed" since it's by design of the mock.
2. **Race conditions on rapid filter changes** — Handled via an abort ref that short-circuits stale responses when params change before a fetch completes.
3. **Stock = 0 edge case** — Products with `stock: 0` are visually marked "Out of Stock" with a disabled "Unavailable" button.
4. **Low stock (1-5) edge case** — Highlighted with an amber "Only X left" badge on the card.
5. **Empty search results** — Displays a friendly empty state with contextual messaging based on active filters.
6. **Concurrent retry + param change** — If the user changes filters while retries are in-flight, previous retry timeouts are cleared via the cleanup function to prevent stale updates.
