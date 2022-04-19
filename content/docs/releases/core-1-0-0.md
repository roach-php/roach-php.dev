---
title: core@1.0.0
section: Releases
subtitle: Released on April 19, 2022
---

**Note:** The 1.0.0 release contains some breaking changes. Please read the [upgrade guide ](/upgrade-guide) on how to upgrade your application to this version.

- Added `Roach::collectSpider` method to start a spider run and return all scraped items.
- Added `array $context` parameter to `Roach::startSpider` and `Roach::collectSpider` to pass arbitrary
  context data to a spider when starting a run.
- Added `roach run <spider>` command to start a spider through the CLI.
- Added `Roach::fake()` method to test that a run for a given spider was started

- Requests dropped by downloader middleware are no longer affected by `requestDelay` (fixes [#27](https://github.com/roach-php/core/issues/27))
- Renamed REPL command from `roach:shell` to `shell`. Use `./roach shell <url>` to invoke it.
- Move `spatie/browsershot` from a `require` to `suggest` as it's only necessary if the `ExecuteJavascriptMiddleware` is used.
  Remove `ext-exif` as a dependency for the same reason.

- Removed default command from CLI. To start the REPL, you now need to explicitly invoke the `roach shell <url>` command, instead.