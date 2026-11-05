// Checks the settings shape the tools expect, against an example we keep in the repo
// and, when it is there, a copy of what our own platform returned when we built this.
// The recording is not committed (see .gitignore), so CI checks the example only.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

for (const name of ["settings-example.json", "local-settings.json"]) {
  const file = new URL(`./fixtures/${name}`, import.meta.url);
  test(`${name} has the shape the tools expect`, { skip: !existsSync(file) && `${name} is not in this checkout` }, () => {
    const settings = JSON.parse(readFileSync(file, "utf8"));
    assert.ok(Array.isArray(settings.access));
    assert.ok(settings.access.every((a: { group: string; apps: string[] }) => typeof a.group === "string" && Array.isArray(a.apps)));
    assert.ok(settings.policies.every((p: { id: string }) => typeof p.id === "string"));
  });
}
