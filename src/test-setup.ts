import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// happy-dom has no Web Animations API, which Svelte's transitions call into.
if (typeof Element !== "undefined") {
  Element.prototype.animate = vi.fn().mockReturnValue({
    finished: Promise.resolve(),
    cancel: vi.fn(),
    pause: vi.fn(),
    play: vi.fn(),
    reverse: vi.fn(),
    finish: vi.fn(),
  }) as unknown as Element["animate"];
}
