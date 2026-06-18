# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: flight-search.spec.ts >> Flight Search Aggregator >> disables confirm booking until form is valid
- Location: tests/playwright/flight-search.spec.ts:46:7

# Error details

```
Error: browserType.launch: Executable doesn't exist at /var/folders/6c/zp3sz_m13b19gq5kbwl0jqkh0000gn/T/cursor-sandbox-cache/6f07b30fbee68658cc06eced9d1091aa/playwright/chromium_headless_shell-1228/chrome-headless-shell-mac-arm64/chrome-headless-shell
╔════════════════════════════════════════════════════════════╗
║ Looks like Playwright was just installed or updated.       ║
║ Please run the following command to download new browsers: ║
║                                                            ║
║     pnpm exec playwright install                           ║
║                                                            ║
║ <3 Playwright Team                                         ║
╚════════════════════════════════════════════════════════════╝
```