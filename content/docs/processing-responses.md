---
title: Processing responses
subtitle: Learn how to extract data from web documents and send them through the processing pipeline.
---

After getting back a response, it’s time to extract whatever information we care about from it. In other words: **scraping**.

Roach uses the Symfony [DomCrawler](https://symfony.com/doc/current/components/dom_crawler.html) component under to hood to allow us to extract useful information from HTML and XML documents. Check out the DomCrawler’s documentation for the full list of features.

Nevertheless, this page will provide you with enough information to get you started.

## The `Response` Object

Roach comes with it’s own `Response` object which acts as a convenient facade for both accessing the actual HTTP response as well as the underlying `DomCrawler`. As such, you can call all methods of the `DomCrawler` component directly on the `Response` object itself.

This response object is what gets passed to parse method we specified when dispatching a request (`parse`, by default).

```php
use RoachPHP\Http\Response;
use RoachPHP\Spider\AbstractSpider;

class MyNeatSpider extends AbstractSpider
{
    public function parse(Response $response): Generator
    {
        // Do neat stuff with the response...
    }
}
```

### Storing Meta Data

Both the `Response` as well as the `Request` object allow us to store and retrieve arbitrary meta data on them by using the `withMeta` and `getMeta` methods, respectively.

```php
$responseWithMeta = $response->withMeta('depth', 1);

$responseWithMeta->getMeta('depth');
// => 1
```

Note that `withMeta` does _not_ mutate the original object, but returns a new instance with the additional meta data instead.

```php
// The original object remains unchanged
$response->getMeta('depth');
// => NULL
```

### Accessing the Request

Every response also contains a reference to its corresponding `Request` object. We can access the request via the `getRequest` method.

```php
$response->getRequest();
// => RoachPHP\Http\Request {#2666}
```

This can be useful because it allows us to access data from the request that triggered this response. Together with the ability to add meta data to these objects, this enables many cool use cases such as keeping track of the current crawl depth across the entire spider.

## Using Selectors

We can use both CSS as well as XPath selectors for extracting data from the response body. We do so by calling either the `filter()` or `filterXPath` methods directly on the `Response` object.

```php
$response->filter('h1')->text();
// => "Such wow!"

$response->filterXPath('//span[contains(@id, "such-wow")]')->text();
// => "Wowzers!"
```

Under the hood, Roach creates a `DomCrawler` object from the response body and proxies all method calls to it. Check out the full [DomCrawler documentation](https://symfony.com/doc/current/components/dom_crawler.html#usage) for a more thorough explanation.

## Parse Results

- result of `parse` tells Roach what to do next
- two options: dispatch additional requests (continue crawl); produce items
- can even do both for same response!

### Dispatching Requests

### Extracting Items
