import { getSettings } from "../platform.ts";
import type { Change } from "../platform.ts";
import { showChange } from "../preview.ts";
import { requireAdmin } from "../token-check.ts";

export const setSessionLengthTool = {
  name: "set_session_length",
  description: "Set how many hours a session lasts. Needs an admin token. Shows the change and returns an id; nothing changes until apply_change is called with that id.",
  inputSchema: { type: "object", properties: { hours: { type: "number" } }, required: ["hours"] },
  async handler({ hours }: { hours: number }) {
    await requireAdmin();
    const changes: Change[] = [{ type: "policy", id: "session-length-hours", value: hours }];
    return showChange(changes, await getSettings());
  },
};
