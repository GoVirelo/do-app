import type { Source } from "@/types";

export type InboxItem = {
  id: string;
  src: Source;
  from: string;
  title: string;
  preview: string;
  time: string;
  priority?: "hot";
};

export const INBOX_ITEMS: InboxItem[] = [
  { id: "i1", src: "slack",    from: "Sara Chen",              title: "Q2 budget numbers for Thursday sync",     preview: "Hi M, could you share the rolling Q2 figures before 3? Especially margin breakdown by product line.",         time: "2h",   priority: "hot" },
  { id: "i2", src: "outlook",  from: "Marcus (self)",          title: "Send design deck to Marcus",               preview: "Reminder: deck export due 5:00 PM today. Attachments already queued.",                                    time: "3h",   priority: "hot" },
  { id: "i3", src: "granola",  from: "Product sync · Granola", title: "Confirm launch date with marketing",       preview: "Marcus: …can you loop in marketing by Fri? We need to lock the comms timeline.",                         time: "11:32" },
  { id: "i4", src: "granola",  from: "Product sync · Granola", title: "Review API spec — section 3",              preview: "Jen: …need your eyes on section 3 before Tue. Especially the rate-limit policy.",                         time: "11:32" },
  { id: "i5", src: "slack",    from: "Jen · #eng",             title: "Review PR #842 — Auth refactor",           preview: "Dropped the refactor in #eng. Wanted a second set of eyes before merge Friday.",                         time: "Wed"  },
  { id: "i6", src: "outlook",  from: "HR",                     title: "Approve Q1 expense report",                preview: "Your Q1 report is awaiting approval. 14 line items, $3,247.20 total.",                                   time: "Wed"  },
  { id: "i7", src: "personal", from: "You",                    title: "Follow up on vendor contract",             preview: "Self-note: 3 days no reply from vendor on MSA redline. Escalate or move on.",                           time: "Mon"  },
  { id: "i8", src: "granola",  from: "1:1 w/ David",           title: "Draft hiring rubric — Sr. PM",             preview: "David committed to drafting the rubric. Target review end of week.",                                     time: "Tue"  },
  { id: "i9", src: "outlook",  from: "Legal",                  title: "Review MSA draft",                         preview: "New redline attached. Your comments requested by Fri.",                                                 time: "Mon"  },
];
