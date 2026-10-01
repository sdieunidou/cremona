/**
 * Data outside a block's literal unions (JSON, MCP, CMS) renders a neutral
 * fallback instead of crashing the page or emitting `class="… undefined"`.
 */
import { describe, it, expect } from "vitest";
import type { ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Feed } from "../src/activity/feed/react.js";
import { Timeline } from "../src/activity/timeline/react.js";
import { EventList } from "../src/calendar/event-list/react.js";
import { MonthView } from "../src/calendar/month-view/react.js";
import { ProfileCard } from "../src/avatars/profile-card/react.js";
import { Logs } from "../src/api/logs/react.js";
import { Request } from "../src/api/request/react.js";
import { AiChat } from "../src/chat/ai-chat/react.js";
import { Terminal } from "../src/code/terminal/react.js";
import { Editor } from "../src/code/editor/react.js";
import { Snippet } from "../src/code/snippet/react.js";
import { SimpleFile } from "../src/files/simple/react.js";
import { Stacked } from "../src/files/stacked/react.js";
import { Upload } from "../src/files/upload/react.js";

const cases: [string, ComponentType<Record<string, unknown>>, Record<string, unknown>][] = [
  [
    "activity/feed action",
    Feed as never,
    {
      items: [
        { user: "Ana", initials: "AN", action: "comment", title: "t", detail: "d", time: "1m" },
      ],
    },
  ],
  [
    "activity/timeline status",
    Timeline as never,
    { steps: [{ title: "Blocked step", detail: "d", time: "now", status: "blocked" }] },
  ],
  [
    "calendar/event-list category",
    EventList as never,
    {
      items: [
        { category: "call", title: "t", detail: "d", time: "9:00", duration: "5m", group: "Today" },
      ],
    },
  ],
  [
    "calendar/month-view tone",
    MonthView as never,
    { month: 8, year: 2026, events: [{ day: 3, tone: "teal" }] },
  ],
  ["avatars/profile-card status", ProfileCard as never, { status: "dnd" }],
  [
    "api/logs level",
    Logs as never,
    { lines: [{ time: "12:00:00", level: "fatal", message: "disk full" }] },
  ],
  ["api/request method", Request as never, { method: "OPTIONS" }],
  ["chat/ai-chat status", AiChat as never, { statusKind: "away" }],
  ["code/terminal line kind", Terminal as never, { lines: [{ kind: "debug", text: "x" }] }],
  ["code/editor token", Editor as never, { lines: [{ tokens: [{ width: 20, color: "number" }] }] }],
  [
    "code/snippet token",
    Snippet as never,
    { lines: [{ tokens: [{ width: 20, color: "number" }] }] },
  ],
  ["files/simple extension", SimpleFile as never, { extension: "rtf" }],
  ["files/stacked category", Stacked as never, { category: "slides" }],
  ["files/upload variant", Upload as never, { variant: "font" }],
];

describe("unknown enum values", () => {
  for (const [name, Block, props] of cases) {
    it(`${name}: renders a neutral fallback`, () => {
      for (const animated of [false, true]) {
        const html = renderToStaticMarkup(<Block animated={animated} {...props} />);
        expect(html).not.toMatch(/undefined/);
      }
    });
  }

  it("keeps the given label for an unknown status or level", () => {
    expect(renderToStaticMarkup(<ProfileCard status={"dnd" as never} />)).toContain(">dnd<");
    const logs = renderToStaticMarkup(
      <Logs lines={[{ time: "12:00:00", level: "fatal" as never, message: "disk full" }]} />,
    );
    expect(logs).toContain(">FATAL<");
  });

  it("styles HTTP methods case-insensitively", () => {
    const lower = renderToStaticMarkup(<Request method="get" />);
    const upper = renderToStaticMarkup(<Request method="GET" />);
    expect(lower.replace(">get<", ">GET<")).toBe(upper);
  });
});
