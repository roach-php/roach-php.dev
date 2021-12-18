---
title: Spider Middleware
section: Advanced Usage
subtitle: Intercept incoming responses to spiders as well as outgoing requests and items.
---

Spider middleware sits between Roach’s engine and our spiders. This middleware allows us to process incoming responses before they get passed to our spider as well as outgoing requests and items that were generated as part of the spider’s parsing callback.

## Built-in Middleware
