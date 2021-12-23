---
title: Spider Middleware
section: Advanced Usage
subtitle: Intercept incoming responses to spiders as well as outgoing requests and items.
---

Spider middleware sits between Roach’s engine and our spiders. This middleware allows us to process incoming responses before they get passed to our spider as well as outgoing requests and items that were generated as part of the spider’s parsing callback.

## Writing Spider Middleware

_todo_

## Built-in Middleware

### Limiting the Maximum Crawl Depth

If we want to limit how many pages deep we want our spider to crawl, we can use the `MaximumCrawlDepthMiddleware`. This middleware prevents any further requests from being scheduled that would go above the configured threshold.

This middleware works by adding a `depth` key to every outgoing request’s meta data. The `depth` of a request is equal to the previous request’s depth + 1, or default to 1, in case of the initial requests.

Any request with a `depth` greater than the configured threshold will be dropped before it gets scheduled. This means that no [`RequestScheduling`](/docs/extensions#request-scheduling) event will get fired for this request.

#### Configuration

| Name            | Default | Description                                                  |
| --------------- | ------- | ------------------------------------------------------------ |
| `maxCrawlDepth` | 10      | The maximum depth our spider is allowed to crawl during a run. Initital requests have a depth of 1. |

