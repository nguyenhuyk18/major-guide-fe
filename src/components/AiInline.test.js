import "@testing-library/jest-dom";
import React from "react";
import { render, screen } from "@testing-library/react";
import { isInternalHref, renderAiInline } from "./AiInline";

jest.mock(
  "react-router-dom",
  () => ({ Link: ({ to, children, ...rest }) => <a href={to} {...rest}>{children}</a> }),
  { virtual: true }
);

const show = (text) => render(<div data-testid="out">{renderAiInline(text)}</div>);

test("accepts only same-site paths", () => {
  expect(isInternalHref("/hold-slot?slot_id=a")).toBe(true);
  for (const bad of ["https://evil.example", "//evil.example", "javascript:alert(1)", "/\\evil", "my-bookings"]) {
    expect(isInternalHref(bad)).toBe(false);
  }
});

test("renders bold text and internal links", () => {
  show("Bấm [Thứ Sáu 13/11](/hold-slot?slot_id=x) để **giữ chỗ**");
  expect(screen.getByRole("link", { name: "Thứ Sáu 13/11" })).toHaveAttribute("href", "/hold-slot?slot_id=x");
  expect(screen.getByText("giữ chỗ").tagName).toBe("STRONG");
});

test("external links become plain text", () => {
  show("Xem [trang này](https://evil.example/login) nhé");
  expect(screen.queryByRole("link")).toBeNull();
  expect(screen.getByTestId("out")).toHaveTextContent("Xem trang này nhé");
});
