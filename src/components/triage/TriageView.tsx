"use client";

import { useState } from "react";
import { TopBar } from "@/components/ui/TopBar";
import { Button } from "@/components/ui/Button";
import { Icons } from "@/components/ui/Icons";
import { TriageSidebar } from "./TriageSidebar";
import { InboxRow } from "./InboxRow";
import { DetailPane } from "./DetailPane";
import { INBOX_ITEMS } from "./inbox-data";
import { tokens } from "@/lib/tokens";

type Props = { onViewChange: (v: string) => void };

export function TriageView({ onViewChange }: Props) {
  const [selectedId, setSelectedId] = useState(INBOX_ITEMS[0].id);
  const selectedItem = INBOX_ITEMS.find((i) => i.id === selectedId) ?? INBOX_ITEMS[0];

  return (
    <div className="w-full h-full flex flex-col" style={{ background: tokens.bg0, color: tokens.fg0 }}>
      <TopBar
        view="Stream"
        onView={onViewChange}
        right={
          <>
            <Button variant="ghost" size="sm">Mark all read</Button>
            <Button variant="primary" size="sm">
              <Icons.plus size={12} /> New
            </Button>
          </>
        }
      />

      <div className="flex flex-1 min-h-0">
        <TriageSidebar />

        {/* Inbox list */}
        <div
          className="flex flex-col overflow-hidden flex-shrink-0"
          style={{ width: 380, borderRight: `1px solid ${tokens.line}` }}
        >
          <div
            className="px-4 py-3.5 flex items-baseline justify-between flex-shrink-0"
            style={{ borderBottom: `1px solid ${tokens.line}` }}
          >
            <div>
              <h2>Inbox</h2>
              <div className="font-mono-do text-[10.5px] text-fg-3 mt-0.5">23 OPEN · 5 NEED REPLY</div>
            </div>
            <Button variant="ghost" size="xs">Sort ▾</Button>
          </div>
          <div className="flex-1 overflow-auto">
            {INBOX_ITEMS.map((item) => (
              <InboxRow
                key={item.id}
                item={item}
                active={item.id === selectedId}
                onClick={() => setSelectedId(item.id)}
              />
            ))}
          </div>
        </div>

        {/* Detail pane */}
        <DetailPane item={selectedItem} />
      </div>
    </div>
  );
}
