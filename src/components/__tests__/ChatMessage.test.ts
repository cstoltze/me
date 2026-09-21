import { render, screen } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import ChatMessage from "../ChatMessage.svelte";
import type { UIMessage } from "@ai-sdk/svelte";

// Markdown rendering is async and Shiki-backed; it has its own test.
vi.mock("../Markdown.svelte", async () => ({
  default: (await import("./markdown-stub.svelte")).default,
}));

function message(role: "user" | "assistant", ...texts: string[]): UIMessage {
  return {
    id: role,
    role,
    parts: texts.map((text) => ({ type: "text" as const, text })),
  } as UIMessage;
}

/** The flex row that decides which side of the transcript a message sits on. */
function alignmentRow(text: string): HTMLElement | null {
  return screen
    .getByText(text)
    .closest("div.flex.justify-end, div.flex.justify-start");
}

describe("ChatMessage", () => {
  it("aligns a user message to the right", () => {
    render(ChatMessage, { message: message("user", "Hello") });
    expect(screen.getByText("Hello")).toBeInTheDocument();
    expect(alignmentRow("Hello")).toHaveClass("justify-end");
  });

  it("aligns an assistant message to the left", () => {
    render(ChatMessage, { message: message("assistant", "Hi there") });
    expect(screen.getByText("Hi there")).toBeInTheDocument();
    expect(alignmentRow("Hi there")).toHaveClass("justify-start");
  });

  it("renders every text part of a message", () => {
    render(ChatMessage, { message: message("assistant", "Part 1", "Part 2") });
    expect(screen.getByText("Part 1")).toBeInTheDocument();
    expect(screen.getByText("Part 2")).toBeInTheDocument();
  });

  it("ignores non-text parts", () => {
    const withTool = {
      id: "tool",
      role: "assistant",
      parts: [{ type: "step-start" }, { type: "text", text: "Visible" }],
    } as unknown as UIMessage;
    render(ChatMessage, { message: withTool });
    expect(screen.getByText("Visible")).toBeInTheDocument();
  });
});
