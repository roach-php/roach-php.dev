---
title: Downloader Middleware
section: Advanced Usage
subtitle: Learn how to write custom middleware to hook into Roach’s request/response cycle.
---

Downloader middleware sits between the Roach engine and the **Downloader**. The Downloader is in charge of handling the HTTP side of things, i.e. sending requests and retrieving responses. Every outgoing request and incoming response will get passed through the **downloader middleware**.

## Writing Middleware

Downloader middleware are classes which implement `DownloaderMiddlewareInterface`. 

<CodeBlock>

```php
interface DownloaderMiddlewareInterface extends
    RequestMiddlewareInterface,
	ResponseMiddlewareInterface
{
}
```

</CodeBlock>

A downloader middleware deals with both outgoing requests as well as incoming responses. When writing downloader middleware, we often are interested in only one of these things, not both of them. For this reason, Roach splits these two concerns into two separate interfaces, `RequestMiddlewareInterface` and `ResponseMiddlewareInterface`, respectively.

The main `DownloaderMiddlewareInterface` is the combination of these two interfaces. This separation allows us to only implement the interface we care about, instead of always having to satisfy both interfaces. Behind the scenes, Roach will wrap our middleware in an adapter class that will provide the missing methods to that our middleware always satisfies the full interface.

### Request Middleware

Downloader middleware that process outgoing requests before they get sent need to implement `RequestMiddlewareInterface`.

<CodeBlock>

```php
interface RequestMiddlewareInterface extends ConfigurableInterface
{
    public function handleRequest(Request $request): Request;
}
```

</CodeBlock>

This interface defines a single method, `handleRequest`. This method will get called with the `Request` that’s about to be sent and is supposed to return another `Request` object.

Request middleware can be used to apply some transformation to all outgoing requests, like the built-in [`UserAgentMiddleware`](/docs/downloader-middleware#setting-the-user-agent-header).

Note that downloader request middleware gets run _after_ [spider request middleware](/docs/spider-middleware#request-middleware). The exception to this are the [initial requests](/docs/spiders#generating-the-initial-requests), which don’t get sent through the spider middleware at all.

#### Dropping Requests

If we don’t want the request to get sent, we can drop it by calling the `Request` class’`drop` method and returning the result.

<CodeBlock>

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

</CodeBlock>

Dropping a request prevents any further downloader middleware from running and the request will not get send. It will also fire a [`RequestDropped`](/docs/extensions#requestdropped) event which you can subscribe to in an [extension](/docs/extensions).

#### Defining Configuration Options

Check out the dedicated page about [configuring middleware and extensions](/docs/configuring-middleware-and-extensions) to learn how to define configuration options for our middleware.

### Response Middleware

Downloader middleware that deal with responses need to implement `ResponseMiddlewareInterface`.

<CodeBlock>

```php
interface ResponseMiddlewareInterface extends ConfigurableInterface
{
    public function handleResponse(Response $response): Response;
}
```

</CodeBlock>

This interface defines a single method `handleResponse` which takes the `Response` object as a parameter and is supposed to return another `Response` object.

Downloader response middleware gets run immediately after a response was received. This means it gets run _before_ any [spider response middleware](/docs/spider-middleware#response-middleware).

#### Dropping Responses

To drop a response, we can call the `Response` class’`drop` method and return the result.

<CodeBlock>

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

</CodeBlock>

Dropping a response prevents any further downloader middleware from being run and the response will not get passed to the spider. Roach will fire a [`ResponseDropped`](/docs/extensions#responsedropped) event which we can subscribe on in an [extension](/docs/extensions#writing-extensions).

#### Accessing the Request

Every `Response` stores a reference to it’s corresponding `Request`. This allows us to keep track of information across the HTTP boundary. We can access the request through the `getRequest` method on the `Response`.

<CodeBlock>

```php
$response->getRequest();
// => RoachPHP\Http\Request {#2666}
```

</CodeBlock>

#### Defining Configuration Options

Check out the dedicated page about [configuring middleware and extensions](/docs/configuring-middleware-and-extensions) to learn how to define configuration options for our middleware.

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

### Managing Cookies

Roach can automatically keep track of cookies for us if we register the built-in `RoachPHP\Downloader\Middleware\CookieMiddleware`. This middleware extracts the `Set-Cookie` header from every response and sends them back in subsequent requests, just like a browser does.

Be aware that Roach currently uses a shared cookie jar for all requests and responses of a run. This means having multiple session cookies for the same domain is currently unsupported.
