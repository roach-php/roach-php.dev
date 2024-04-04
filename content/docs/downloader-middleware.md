---
title: Downloader Middleware
section: Advanced Usage
subtitle: Learn how to write custom middleware to hook into Roach’s request/response cycle.
---

Downloader middleware sits between the Roach engine and the **Downloader**. The Downloader is in charge of handling the HTTP side of things, i.e. sending requests and retrieving responses. Every outgoing request and incoming response will get passed through the **downloader middleware**.

## Writing Middleware

Downloader middleware are classes which implement `DownloaderMiddlewareInterface`.

```php
interface DownloaderMiddlewareInterface extends
    RequestMiddlewareInterface,
	ResponseMiddlewareInterface
{
}
```

A downloader middleware deals with both outgoing requests as well as incoming responses. When writing downloader middleware, we often are interested in only one of these things, not both of them. For this reason, Roach splits these two concerns into two separate interfaces, `RequestMiddlewareInterface` and `ResponseMiddlewareInterface`, respectively.

The main `DownloaderMiddlewareInterface` is the combination of these two interfaces. This separation allows us to only implement the interface we care about, instead of always having to satisfy both interfaces. Behind the scenes, Roach will wrap our middleware in an adapter class that will provide the missing methods to that our middleware always satisfies the full interface.

### Request Middleware

Downloader middleware that process outgoing requests before they get sent need to implement `RequestMiddlewareInterface`.

```php
interface RequestMiddlewareInterface extends ConfigurableInterface
{
    public function handleRequest(Request $request): Request;
}
```

This interface defines a single method, `handleRequest`. This method will get called with the `Request` that’s about to be sent and is supposed to return another `Request` object.

Request middleware can be used to apply some transformation to all outgoing requests, like the built-in [`UserAgentMiddleware`](/docs/downloader-middleware#setting-the-user-agent-header).

Note that downloader request middleware gets run _after_ [spider request middleware](/docs/spider-middleware#request-middleware). The exception to this are the [initial requests](/docs/spiders#generating-the-initial-requests), which don’t get sent through the spider middleware at all.

#### Dropping Requests

If we don’t want the request to get sent, we can drop it by calling the `Request` class’`drop` method and returning the result.

```php
<?php

use RoachPHP\Downloader\Middleware\RequestMiddlewareInterface;
use RoachPHP\Http\Request;
use RoachPHP\Support\Configurable;

class MyRequestMiddleware implements RequestMiddlewareInterface
{
    use Configurable;

    public function handleRequest(Request $request): Request
    {
        // Make sure to provide a useful reason for this
        // request got dropped.
        return $request->drop('Whoops, did I do that?');
    }
}
```

Dropping a request prevents any further downloader middleware from running and the request will not get send. It will also fire a [`RequestDropped`](/docs/extensions#requestdropped) event which you can subscribe to in an [extension](/docs/extensions).

#### Short-Circuiting a Request

Sometimes you may want to simply set the response of a request without the
request actually getting sent, i.e. in a caching middleware. In this case you
may use the `Request::withResponse()` method inside you middleware.

```php
class CachingMiddleware implements RequestMiddlewareInterface
{
    use Configurable;

    public function handleRequest(Request $request): Request
    {
        return $request->withResponse(
            $this->cache->forRequest($request)
        );
    }
}
```

All request and response middleware will still get run for this request.
However, the request will not actually get sent and will instead immediately be
sent through the processing pipeline. All events still get fired as usual.

#### Defining Configuration Options

Check out the dedicated page about [configuring middleware and extensions](/docs/configuring-middleware-and-extensions) to learn how to define configuration options for our middleware.

### Response Middleware

Downloader middleware that deal with responses need to implement `ResponseMiddlewareInterface`.

```php
interface ResponseMiddlewareInterface extends ConfigurableInterface
{
    public function handleResponse(Response $response): Response;
}
```

This interface defines a single method `handleResponse` which takes the `Response` object as a parameter and is supposed to return another `Response` object.

Downloader response middleware gets run immediately after a response was received. This means it gets run _before_ any [spider response middleware](/docs/spider-middleware#response-middleware).

#### Dropping Responses

To drop a response, we can call the `Response` class’`drop` method and return the result.

```php
<?php

use RoachPHP\Http\Response;
use RoachPHP\Spider\Middleware\ResponseMiddlewareInterface;
use RoachPHP\Support\Configurable;

class MyResponseMiddleware implements ResponseMiddlewareInterface
{
    use Configurable;

    public function handleResponse(Response $response): Response
    {
        return $response->drop('Responses only get processed during working hours');
    }
}
```

Dropping a response prevents any further downloader middleware from being run and the response will not get passed to the spider. Roach will fire a [`ResponseDropped`](/docs/extensions#responsedropped) event which we can subscribe on in an [extension](/docs/extensions#writing-extensions).

#### Accessing the Request

Every `Response` stores a reference to it’s corresponding `Request`. This allows us to keep track of information across the HTTP boundary. We can access the request through the `getRequest` method on the `Response`.

```php
$response->getRequest();
// => RoachPHP\Http\Request {#2666}
```

#### Defining Configuration Options

Check out the dedicated page about [configuring middleware and extensions](/docs/configuring-middleware-and-extensions) to learn how to define configuration options for our middleware.

## Built-in Middleware

Roach ships with various built-in downloader middleware for common tasks when dealing with HTTP requests and responses.

### Handling HTTP Errors

The built-in `RoachPHP\Downloader\Middleware\HttpErrorMiddleware` automatically
drops requests with a non-successful HTTP status. According to the HTTP standard,
responses with a status in the 200-300 range are considered successful.

This middleware is enabled by default if your spider extends from `BasicSpider`.

### Configuration Options

| Name           | Default | Description                                                                                                                                                                               |
| -------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `handleStatus` | `[]`    | A list of HTTP statuses outside the 200-300 range that should be handled by your spider. For instance, setting this option to `[404]` would allow your spider to process `404` responses. |

### Setting the User-Agent Header

In order to attach the same `User-Agent` header to every outgoing request, we can use the `RoachPHP\Downloader\Middleware\UserAgentMiddleware` middleware.

#### Configuration Options

| Name        | Default     | Description                                              |
| ----------- | ----------- | -------------------------------------------------------- |
| `userAgent` | `roach-php` | The user agent to attach to every outgoing HTTP request. |

### Request Deduplication

To avoid sending duplicate requests, we can register the `RoachPHP\Downloader\Middleware\RequestDeduplicationMiddleware` for our spider. Any request to a URL that has already been crawled or scheduled during the same run will be dropped.

#### Configuration Options

| Name                      | Default | Description                                                                                                                                                                                                                                                        |
| ------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ignore_url_fragments`    | `false` | Whether or not URL fragments should be ignored when comparing URLs. If set to `false`, `https://url.com/foo#bar` will be considered a duplicate of `https://url.com/foo`.                                                                                          |
| `ignore_trailing_slashes` | `true`  | Whether or not trailing slashes should be ignored when comparing URLs.                                                                                                                                                                                             |
| `ignore_query_string`     | `false` | Whether or not the query string should be ignored when comparing URLs. When set to `true` it will completely ignore the query string, so it will consider two URLs to be identical if they contain all the same key-value pairs in the query, regardless of order. |

Using this middleware is recommended for most use-cases as it allows you to write your spider in a very naive way without having to worry about bombarding the server with duplicate requests.

### Managing Cookies

Roach can automatically keep track of cookies for us if we register the built-in `RoachPHP\Downloader\Middleware\CookieMiddleware`. This middleware extracts the `Set-Cookie` header from every response and sends them back in subsequent requests, just like a browser does.

Be aware that Roach currently uses a shared cookie jar for all requests and responses of a run. This means having multiple session cookies for the same domain is currently unsupported.

### Respecting Robots.txt

If we want to write a good spider, it’s a good idea to respect the `robots.txt` directives of the sites we’re crawling. Roach comes with a `RoachPHP\Downloader\Middleware\RobotsTxtMiddleware` which compares every request against the site’s `robots.txt` (if there is one) and drops the request if we’re not allowed to index the page.

Since this middleware uses [`spatie/robots-txt`](https://github.com/spatie/robots-txt) beind the scenes, it will also inspect the page’s meta tags as well as response headers.

### Executing Javascript

Many sites don’t directly return the final HTML but depend on some Javascript being run first. To deal with this, Roach includes a `RoachPHP\Downloader\Middleware\ExecuteJavascriptMiddleware` we can use in our spider.

This middleware will intercept every response and swap out its body with the body returned after executing Javascript. This means that in our spider, we don’t have to care about whether or not Javascript needed to be run or not. We can simply writing our scraper as if we’re dealing with static HTML.

#### Prerequisites

In order to use this middleware, we first need to require the [`spatie/browsershot`](https://github.com/spatie/browsershot) package in our application.

```bash
composer require spatie/browsershot
```

The middleware uses this package behind the scenes to execute Javascript. This package, in turn, uses [Puppeteer](https://github.com/GoogleChrome/puppeteer) which controls a headless Chrome instance. This means that we need to ensure that `puppeteer` is installed on our system.

Check out the [requirements](https://spatie.be/docs/browsershot/v2/requirements) section of `spatie/browsershot` for more information on how to install Puppeteer for your system.

#### Configuration Options

Most of the middleware’s configuration options will configure the underlying Browsershot instance. Check out the [Browsershot documentation](https://github.com/spatie/browsershot#custom-node-and-npm-binaries) for a more complete description of what each of the configuration values do.

| Name                | Default | Description                                                                                                                                                                                                                                                                    |
| ------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `chromiumArguments` | `[]`    | Custom arguments which will get passed to Chromium. Corresponds to [`Browsershot::addChromiumArguments`](https://github.com/spatie/browsershot#pass-custom-arguments-to-chromium).                                                                                             |
| `chromePath`        | `null`  | Custom path to a Chrome or Chromium executable. Will default to the executable installed by Puppeteer. Corresponds to [`Browsershot::setCromePath`](https://github.com/spatie/browsershot#custom-chromechromium-executable-path).                                              |
| `binPath`           | `null`  | Custom script path which get executed instead of Browsershot’s default script. Corresponds to [`Browsershot::setBinPath`](https://github.com/spatie/browsershot#custom-binary-path).                                                                                           |
| `nodeModulePath`    | `null`  | Path to an alternative `node_modules` folder to use. Corresponds to [`Browsershot::setNodeModulePath`](https://github.com/spatie/browsershot#custom-node-module-path).                                                                                                         |
| `includePath`       | `null`  | Overrides the `PATH` environment variable Browsershot uses to find executables. This is an alternative to specifying paths to the various executables individually. Corresponds to [`Browsershot::setIncludePath`](https://github.com/spatie/browsershot#custom-include-path). |
| `nodeBinary`        | `null`  | Custom path to the `node` executable. Corresponds to [`Browsershot::setNodeBinary`](https://github.com/spatie/browsershot#custom-node-and-npm-binaries).                                                                                                                       |
| `npmBinary`         | `null`  | Custom path to the `npm` executable. Corresponds to [`Browsershot::setNpmBinary`](https://github.com/spatie/browsershot#custom-node-and-npm-binaries).                                                                                                                         |

### Proxy Middleware

The `ProxyMiddleware` allows you to configure HTTP proxies that Roach will use
when crawling specific hosts. Under the hood, this will configure the
[`proxy`](https://docs.guzzlephp.org/en/stable/request-options.html#proxy)
option on the underlying Guzzle request, so see their documentation for a more
detailed description of the parameters.

#### Configuration Options

| Name     | Default | Description                                                                                                                                                                                                                                                                                                                                                                                         |
| -------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `loader` | `null`  | The class that is used to load the proxy configuration. By default, this will load the configuration from the array specified in the `proxy` option. You can implement your own configuration loader by implementing the `ConfigurationLoaderInterface`, e.g. to load the proxy configurations from a database.                                                                                     |
| `proxy`  | `[]`    | A string or dictionary of hosts and proxy options (see [Proxy Options](#proxy-options). If a string is provided, the same proxy settings are used for every host. Otherwise, the downloader will check if a proxy was configured for the host of the current request. If no proxy settings exist for the host and no wildcard proxy was configured, the request will be sent without using a proxy. |

#### Proxy Options

Proxy options simply get passed through to the underlying Guzzle request. See
the [`Guzzle documentation`](https://docs.guzzlephp.org/en/stable/request-options.html#proxy)
for more detailed information.

```php
use RoachPHP\Downloader\ProxyMiddleware;

class MySpider extends BasicSpider
{
    public array $downloaderMiddleware = [
        [ProxyMiddleware::class, [
            'proxy' => [
                'example.com' => [
                    'http' => 'http://localhost:8125', // Use this proxy with "http"
                    'https' => 'http://localhost:9124', // Use this proxy with "https"
                    'no' => ['.mit.edu'], // Don't use a proxy with these
                ],
            ],
        ]],
    ];
}
```

If the `proxy` option is set to a string, the same proxy URL will be used for
all hosts and protocols.

So this

```php
public array $downloaderMiddleware = [
  [ProxyMiddleware::class, ['proxy' => 'http://localhost:8125']],
];
```

is equivalent to this.

```php
public array $downloaderMiddleware = [
  [ProxyMiddleware::class, [
      'proxy' => [
         '*' => [
            'http' => 'http://localhost:8125',
            'https' => 'http://localhost:8125',
            'no' => [],
         ],
      ],
  ]],
];
```

This also works on a per-host basis. This

```php
public array $downloaderMiddleware = [
  [ProxyMiddleware::class, [
      'proxy' => [
         'example.com' => 'http://localhost:8125',
      ],
  ]],
];
```

is equivalent to this.

```php
public array $downloaderMiddleware = [
  [ProxyMiddleware::class, [
      'proxy' => [
         'example.com' => [
            'http' => 'http://localhost:8125',
            'https' => 'http://localhost:8125',
            'no' => [],
         ]
      ],
  ]],
];
```
