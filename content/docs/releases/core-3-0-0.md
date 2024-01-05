---
title: core@3.0.0
section: Releases
subtitle: Released on January 5, 2024
---

**Note:** The 3.0.0 release contains some breaking changes. Please read the [upgrade guide](/docs/upgrade-guide) on how to upgrade your application to this version.

- Added namespace to run and scheduler.
- Added PHP 8.3 support
- Added `ProxyMiddleware` to configure request proxies
- Added `ResponseReceiving` and `ResponseReceived` events
- Allow request middleware to set a response to bypass downloader
- Fixed bug where integration tests wouldn't get run

