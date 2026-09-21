import { vi } from "vitest";

/**
 * Stub for `astro:content`, which only exists inside an Astro build.
 * Tests that care about specific entries override these per-case.
 */
export const getCollection = vi.fn().mockResolvedValue([]);
export const getEntry = vi.fn().mockResolvedValue(null);
export const render = vi.fn().mockResolvedValue({ Content: () => null });
