---
title: Downloader Middleware
section: Advanced Usage
subtitle: Learn how to write custom middleware to hook into Roach’s request/response cycle.
---

Downloader middleware sits between the Roach engine and the **Downloader**. The Downloader is in charge of handling the HTTP side of things, i.e. sending requests and retrieving responses. Every outgoing request and incoming response will get passed through the **downloader middleware**.

## Writing Middleware



## Built-in Middleware

Roach ships with various built-in downloader middleware for common tasks when dealing with HTTP requests and responses.

### Setting the User-Agent Header

In order to attach the same `User-Agent` header to every outgoing request, we can use the `RoachPHP\Downloader\Middleware\UserAgentMiddleware` middleware.

| Name        | Default     | Description                                              |
| ----------- | ----------- | -------------------------------------------------------- |
| `userAgent` | `roach-php` | The user agent to attach to every outgoing HTTP request. |

### Request Deduplication

To avoid sending duplicate requests, we can register the `RoachPHP\Downloader\Middleware\RequestDeduplicationMiddleware` for our spider. Any request to a URL that has already been crawled or scheduled during the same run will be dropped.

| Name                      | Default | Description                                                  |
| ------------------------- | ------- | ------------------------------------------------------------ |
| `ignore_url_fragments`    | `false` | Whether or not URL fragments should be ignored when comparing URLs. If set to `false`,  `https://url.com/foo#bar` will be considered a duplicate of `https://url.com/foo`. |
| `ignore_trailing_slashes` | `true`  | Whether or not trailing slashes should be ignored when comparing URLs. |
| `ignore_query_string`     | `false` | Whether or not the query string should be ignored when comparing URLs. When set to `true` it will completely ignore the query string, so it will consider two URLs to be identical if they contain all the same key-value pairs in the query, regardless of order. |

Using this middleware is recommended for most use-cases as it allows you to write your spider in a very naive way without having to worry about bombarding the server with duplicate requests.
