# Plan

- [x] Speak MCP over stdio
- [x] get_settings and who_can_reach
- [x] preview_change and apply_change
- [x] The token check on every tool
- [x] set_session_length: IT asked for a quick way
- [x] copy_group_access: IT asked for a way to line one group up with another
- [x] Fix the two high findings from the security judge: copy_group_access needs requireAdmin, and nothing but apply_change applies a change (the tools preview and return an id, with no confirm flag)
- [x] Make the settings-shape test pass in CI, where the local recording isn't (it's gitignored): check a committed example, and the recording when it's there
