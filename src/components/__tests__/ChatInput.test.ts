import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import ChatInput from "../ChatInput.svelte";

const PLACEHOLDER = "Ask about my work…";

function setup(
  props: Partial<{ value: string; busy: boolean; onSubmit: () => void }> = {},
) {
  const onSubmit = vi.fn();
  render(ChatInput, { value: "", busy: false, onSubmit, ...props });
  return {
    onSubmit: props.onSubmit ?? onSubmit,
    textarea: screen.getByPlaceholderText(PLACEHOLDER),
    button: screen.getByRole("button", { name: "Send message" }),
  };
}

describe("ChatInput", () => {
  it("renders the prompt", () => {
    const { textarea } = setup();
    expect(textarea).toBeInTheDocument();
  });

  it("reflects typed input", async () => {
    const { textarea } = setup();
    await fireEvent.input(textarea, { target: { value: "Hello" } });
    expect(textarea).toHaveValue("Hello");
  });

  it("submits when the send button is clicked", async () => {
    const onSubmit = vi.fn();
    const { button } = setup({ value: "Hello", onSubmit });
    await fireEvent.click(button);
    expect(onSubmit).toHaveBeenCalled();
  });

  it("disables sending when the input is empty", () => {
    expect(setup({ value: "" }).button).toBeDisabled();
  });

  it("disables sending when the input is only whitespace", () => {
    expect(setup({ value: "   " }).button).toBeDisabled();
  });

  it("disables sending while a reply is pending", () => {
    expect(setup({ value: "Hello", busy: true }).button).toBeDisabled();
  });

  it("submits on Enter", async () => {
    const onSubmit = vi.fn();
    const { textarea } = setup({ value: "Hello", onSubmit });
    await fireEvent.keyDown(textarea, { key: "Enter" });
    expect(onSubmit).toHaveBeenCalled();
  });

  it("inserts a newline on Shift+Enter instead of submitting", async () => {
    const onSubmit = vi.fn();
    const { textarea } = setup({ value: "Hello", onSubmit });
    await fireEvent.keyDown(textarea, { key: "Enter", shiftKey: true });
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
