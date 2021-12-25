---
title: Spider Middleware
section: Advanced Usage
subtitle: Intercept incoming responses to spiders as well as outgoing requests and items.
---

Spider middleware sits between Roach’s engine and our spiders. This middleware allows us to process incoming responses before they get passed to our spider as well as outgoing requests and items that were generated as part of the spider’s parsing callback.

## Writing Spider Middleware

Spider middleware are classes which implement the `SpiderMiddlewareInterface`. Here’s what this interface looks like.

<CodeBlock>

```php
interface SpiderMiddlewareInterface extends
    ResponseMiddlewareInterface,
    RequestMiddlewareInterface,
	ItemMiddlewareInterface
{
}
```

</CodeBlock>

As we can see, this interface combines three separate interfaces into one. This is because a spider middleware deals with three separate concerns:

1. Process responses that were returned by the downloader before they get passed to the spider’s parse callback.
2. Process new requests emitted by a spider before they get scheduled.
3. Process items emitted by the spider before they get passed to the [processing pipeline](/docs/item-pipeline).

Each of the individual interfaces that make up the `SpiderMiddlewareInterface` deals with one of those concerns.

It is very unlikely, that a middleware will deal with all three of these concerns at the same time, however. Most of the time, a spider middleware is only going to be interested in one, maybe two of these things. 

For this reason, Roach allows us to implement only the interfaces that are relevant to the middleware we’re writing, instead of having to implement the entire `SpiderMiddlewareInterface`. Behind the scenes, Roach will then wrap our middleware into an adapter that ensures that any missing methods are provided. This way, we can have our cake and eat it, too!

### Response Middleware

Spider middleware that implement the `ResponseMiddlewareInterface` handle responses returned by the downloader before they get passed to the spider’s parse callback.

Here’s what the interface looks like.

<CodeBlock>

```php
interface ResponseMiddlewareInterface extends ConfigurableInterface
{
    public function handleResponse(Response $response): Response;
}
```

</CodeBlock>

The `ResponseMiddlewareInterface` defines only a single `handleResponse` method that our middleware has to implement. This method accepts a `Response` object that was returned by the downloader and is supposed to return another `Response` object. Note that this `Response` has already been processed by any [downloader middleware](/docs/downloader-middleware) that was configured for the spider.

#### Dropping Responses

Since this method gets called _before_ the response gets passed to the spider’s parse callback, we can still drop the response at this point. To do so, we call the `drop()` method on the `Response` object and return it.

<CodeBlock>

````php
<?php
    
use RoachPHP\Http\Response;
use RoachPHP\Spider\Middleware\ResponseMiddlewareInterface;
use RoachPHP\Support\Configurable;

class MyResponseMiddleware implements ResponseMiddlewareInterface
{
    use Configurable;
    
    public function handleResponse(Response $response): Response
    {
        return $response->drop('Computer says no.');
    }
}
````

</CodeBlock>

Dropping a response will prevent any further spider middleware from being called and the response will not get passed to the spider for processing .Roach will also fire a [`ResponseDropped`](/docs/extensions#responsedropped) event which we can subscribe on in an [extension](/docs/extensions#writing-extensions).

### Request Middleware

Spider middleware that deal with requests emitted by the spider during processing are response have to implement the `RequestMiddlewareInterface`.

<CodeBlock>

```php
interface RequestMiddlewareInterface extends ConfigurableInterface
{
    public function handleRequest(Request $request, Response $response): Request;
}
```

</CodeBlock>

This interface specifies a single method `handleRequest` our middleware has to implement. This method takes two parameters:

1. The `Request` object emitted by the spider
2. A `Response` object which represents the response the spider was processing when it emitted the request. In other words, this the response of the _previous_ request.

Having access to the previous response object is useful because it allows us to have access to context of the parent request. 

To give an example how of this is useful, the built-in [`MaximumCrawlDepthMiddleware`](/docs/spider-middleware#limiting-the-maximum-crawl-depth) uses this request to determine the crawl depth of new requests by checking the crawl depth of its parent request.

<CodeBlock>

```php
<?php
    
namespace RoachPHP\Spider\Middleware;

use RoachPHP\Http\Request;
use RoachPHP\Http\Response;

final class MaximumCrawlDepthMiddleware implements RequestMiddlewareInterface
{
    use Configurable;

    public function handleRequest(Request $request, Response $response): Request
    {
        // Get the `depth` of the parent request, or default
        // to 1 if no depth has been set.
        $currentDepth = (int) $response->getRequest()->getMeta('depth', 1);
        $newDepth = $currentDepth + 1;

        // Compare the depth of the new request against the configured
        // threshold and drop it if necessary.
        if ($this->option('maxCrawlDepth') < $newDepth) {
            return $request->drop('Maximum crawl depth reached');
        }

        // Otherwise, add the new `depth` to the request so we can
        // access it again parsing child requests.
        return $request->withMeta('depth', $currentDepth + 1);
    }

    private function defaultOptions(): array
    {
        return [
            'maxCrawlDepth' => 10,
        ];
    }
}
```

</CodeBlock>

#### Dropping Requests

To drop requests, we can call the `drop` method on the `Request` object and returning it.

<CodeBlock>

```php
<?php
    
use RoachPHP\Http\Request;    
use RoachPHP\Http\Response;
use RoachPHP\Spider\Middleware\RequestMiddlewareInterface;
use RoachPHP\Support\Configurable;

class MyRequestMiddleware implements RequestMiddlewareInterface
{
    use Configurable;
    
    public function handleRequest(Request $request, Response $response): Request
    {
        return $request->drop('Enough with the requests already!');
    }
}
```

</CodeBlock>

Dropping a request will prevent any further spider middleware from running and the request will not get scheduled. Roach will also fire a [`RequestDropped`](/docs/extensions#requestdropped) event which we can subscribe on in an [extension](/docs/extensions#writing-extensions).

### Item Middleware

Spider middleware that deal with items emitted by the spider’s parse callback have to implement the `ItemMiddlewareInterface`. Item middleware gets called _before_ the item gets sent through the [processing pipeline](/docs/processing-responses).

<CodeBlock>

```php
interface ItemMiddlewareInterface extends ConfigurableInterface
{
    public function handleItem(ItemInterface $item, Response $response): ItemInterface;
}
```

</CodeBlock>

This interface defines a single method `handleItem`. This method takes two parameters:

1. The item emitted by the spider
2. The `Response` object the spider was processing when it emitted the item

Examples of item middleware are adding additional meta data to items or dropping unwanted items.

#### Dropping Items

To drop an item, we can call the `drop` method on the item and then returning it.

<CodeBlock>

```php
<?php
    
use RoachPHP\Http\Response;
use RoachPHP\ItemPipeline\ItemInterface;
use RoachPHP\Spider\Middleware\ItemMiddlewareInterface;
use RoachPHP\Support\Configurable;

class MyItemMiddleware implements ItemMiddlewareInterface
{
    use Configurable;
    
    public function handleItem(ItemInterface $item, Response $response): ItemInterface
    {
        return $item->drop('Attitude problem');
    }
}
```

</CodeBlock>

Dropping an item will prevent any further spider middleware from running and the item will not get passed through the [processing pipeline](/docs/item-pipeline). Roach will also fire an [`ItemDropped`](/docs/extensions#itemdropped) event which we can subscribe on in an [extension](/docs/extensions#writing-extensions).

## Built-in Middleware

### Limiting the Maximum Crawl Depth

If we want to limit how many pages deep we want our spider to crawl, we can use the `MaximumCrawlDepthMiddleware`. This middleware prevents any further requests from being scheduled that would go above the configured threshold.

This middleware works by adding a `depth` key to every outgoing request’s meta data. The `depth` of a request is equal to the previous request’s depth + 1, or default to 1, in case of the initial requests.

Any request with a `depth` greater than the configured threshold will be dropped before it gets scheduled. This means that no [`RequestScheduling`](/docs/extensions#request-scheduling) event will get fired for this request.

#### Configuration

| Name            | Default | Description                                                  |
| --------------- | ------- | ------------------------------------------------------------ |
| `maxCrawlDepth` | 10      | The maximum depth our spider is allowed to crawl during a run. Initial requests have a depth of 1. |

