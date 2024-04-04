---
title: core@3.1.0
section: Releases
subtitle: Released on April 4, 2024
---

- Add `HttpErrorMiddleware` to drop unsuccessful responses so they don't get
  passed to the spider.
- Enable `HttpErrorMiddleware` by default in `BasicSpider`
