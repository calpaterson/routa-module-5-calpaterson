---
name: verify
description: Check whether the MCP server is done. Use after each build step, and before saying the work is done. Takes an optional path to a security criteria file, default client/security-criteria.md.
---

Run the checks below. Report each failing check with its error, or say that every check passed. Don't fix anything here, and don't reset anything.

## The checks

1. **The tests pass:** `npm test`.
2. **A live run, as IT would:** `npm run live-check`, with the test environment running. It takes the two tokens from `ROUTA_TOKEN` and `ROUTA_READONLY_TOKEN`, which are already in the environment. Don't read the token files.
3. **The security judge passes:** see below.

## The security judge

The judge is a fresh agent that did not build the server. Its independence is the point, so give it none of the build context.

**The criteria are an input.** Use the path given when verify was invoked (for example `/verify client/hiidenkivi-criteria.md`). With none, use `client/security-criteria.md`. Check that the file exists before starting; if it doesn't, the check fails with that error. Don't summarise or reinterpret the criteria yourself: the judge reads the file.

**Start the judge** with the Agent tool, as a new agent of type `Explore` (read-only, so it can't fix what it finds). Don't fork, and don't continue an earlier judge. Tell it only this, with `<criteria>` replaced by the path:

> You are a security reviewer. You did not build this server and know nothing about how it was built.
> Read `<criteria>` in full, then read the MCP server in `mcp/src` (and `mcp/test` if it helps) against each of its rules. Do not read token files or anything under `~/.routa`. Do not change any file.
> For every finding, give: the rating (low, medium, high or critical, as the criteria define them), a one-sentence description, and the file and line you saw it at with the line quoted exactly. Don't report a finding you can't point to a line for. If a rule is satisfied, say which rule and where you checked, in one line.
> Rate by the criteria's own definitions, not your own scale. If a finding fits none, say so and rate it low.
> End with one line: `Highest rating: <none|low|medium|high|critical>`.

**Judge the result.** Check that each finding has a file, a line and a quote, and spot-check one or two by reading the line. Drop or send back any that doesn't hold up. The check **fails if any finding is high or critical**. Low and medium findings don't fail it: list them in the report as notes.

**Report:** the criteria file used, every finding with its rating, file:line and quote, and pass or fail. Don't fix anything.
