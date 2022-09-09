---
title: Scraping Responses
section: Basic Concepts
subtitle: Learn how to extract data from web documents and send them through the processing pipeline.
---

After getting back a response, it’s time to extract whatever information we care about from it. In other words: **scraping**.

Roach uses the Symfony [DomCrawler](https://symfony.com/doc/current/components/dom_crawler.html) component under to hood to allow us to extract useful information from HTML and XML documents. Check out the DomCrawler’s documentation for the full list of features.

Nevertheless, this page will provide you with enough information to get you started.

## The `Response` Object

Roach comes with it’s own `Response` object which acts as a convenient facade for both accessing the actual HTTP response as well as the underlying `DomCrawler`. As such, you can call all methods of the `DomCrawler` component directly on the `Response` object itself.

This response object is what gets passed to the parse method we specified when dispatching a request (`parse`, by default).

```php
use RoachPHP\Http\Response;
use RoachPHP\Spider\BasicSpider;

class MyNeatSpider extends BasicSpider
{
    public function parse(Response $response): \Generator
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

The return value of our parsing callback tells Roach what to do next. There are two options:

- we have extracted one or more URIs that we want to crawl next
- we have extracted one or more pieces of information that we want to send through the [item processing pipeline](/docs/item-pipeline)

Roach represents both of these possibilities with a `ParseResult` object. This object can either represent a request that should be dispatched next or an item to processed. The result of our parse callback needs to be a `Generator<ParseResult>`, i.e. a `Generator` that produces instances of `ParseResult` objects. 

Using a generator instead of just returning a value allows us to produce multiple `ParseResults` from the same callback. This might not sound like a big deal on the surface but is actually a really powerful feature. For example, we could extract the headline from a page first and send it through the item pipeline and then dispatch a request to continue crawling a detail page.

```php
<?php

use RoachPHP\Http\Response;
use RoachPHP\ResponseProcessing\ParseResult;
use RoachPHP\Spider\BasicSpider;

class MySpider extends BasicSpider
{
    /**
     * @return Generator<ParseResult>
     */
    public function parse(Response $response): \Generator
    {
        // Extract the headline from the page and send it
        // through the item pipeline.
        $headline = $response->filter('h1')->text();
        yield $this->item(['headline' => $headline]);

        // Find the link to the detail page and dispatch a
        // request to crawl it, too.
        $detailPageLink = $response->filter('a#details')->link();
        yield $this->request(
            $detailPageLink->getUri(),
            'parseDetailPage'
        );
    }

    public function parseDetailPage(Response $response): \Generator
    {
        // parse detail page...
    }
}
```

Using generators allows us to both extract information from a page as well as dispatch additional requests to continue the crawl.

Note how there is no mention of a `ParseResult` class in the example above. Most of the heavy lifting is done by two method calls that we’re going to look at next: `$this->item()` and `$this->request()`.

## Dispatching requests

We often want to crawl additional pages based on the links we found on the current page. We can instruct Roach to do so by yielding a new request from our `parse` method.

```php
public function parse(Response $response): \Generator
{
    $links = $response->filter('nav a')->links();

    foreach ($links as $link) {
        yield $this->request('GET', $link->getUrl());
    }
}
```

The `$this->request()` method takes in the HTTP method and URL and returns a new `ParseResult` object representing a request to a page that should be crawled next.

```php
BasicSpider::request(
    string $method,
    string $uri,
    string $parseMethod = 'parse'
): ParseResult
```

Yielding a request object from our parse method tells Roach that we intend to crawl this URL as well. This won’t immediately send the request, however, but instead schedule it to run after the current batch of requests has been processed.

### Defining Different Parse Methods

By default, Roach will call the `parse` method of your spider to process a request’s response. However, it can often be desirable to use different callbacks for different requests. We can do so by passing the name of the method as the second parameter to `$this->request()`.

```php
<?php
    
use Generator;
use RoachPHP\Http\Response;
use RoachPHP\Spider\BasicSpider;

class BlogSpider extends BasicSpider
{
    public array $startUrls = [
        'https://kai-sassnowski.com'
    ];

    public function parse(Response $response): Generator
    {
        $links = $response->filter('header + div a')->links();

        foreach ($links as $link) {
            yield $this->request('GET', $link->getUri(), 'parseBlogPage');
        }
    }

    public function parseBlogPage(Response $response): Generator
    {
        $title = $response->filter('h1')->text();
        $publishDate = $response
            ->filter('time')
            ->attr('datetime');
        $excerpt = $response
            ->filter('.blog-content div > p:first-of-type')
            ->text();

        yield $this->item(compact('title', 'publishDate', 'excerpt'));
    }
}
```

In this example, Roach will send an initial request to `https://kai-sassnowski.com` since that’s the only URL defined in `$startUrls`. The response of this request will get passed to the `parse` method which in turn dispatches several new request. The responses of these requests will then get passed to the `parseBlogPage` method, since that’s the method we specified when yielding the requests.

### Returning Custom Requests

While the `request()` method is convenient, it makes a few assumptions about the kind of request that gets created. For instance, it will always return a `GET` request. We also cannot pass any options to the underlying Guzzle request.

If we need complete control over the kind of request that gets created, we can instead return a `ParseResult` object ourselves using the `ParseResult::fromValue` constructor.

```php
ParseResult::fromValue(Request|ItemInterface $value): ParseResult;
```

This method accepts either a `Request` object or an object implementing the `ItemInterface`. Using this, we can create a completely custom request from our parse callback.

```php
public function parse(Response $response): Generator
{
    $request = new Request(
        'POST',
        'https://example.com',
        [$this, 'parsePostRequest'],
        [
            'json' => [
                'foo' => 'bar',
            ],
            'headers' => [
                'Accept' => 'application/json',
            ],
        ],
    );
    
    yield ParseResult::fromValue($request);
}
```

## Extracting Items

Ultimately, the goal of a spider is to extract information from a document. We can do so by [filtering the response](#using-selectors) using either CSS or XPath selectors as described in an earlier section. Once we have extracted the data, we want to send it through the [item pipeline](/docs/item-pipeline) so it may be processed further.

To send an item through the item pipeline, we can use the `$this->item()` method on the base class.

```php
BasicSpider::item(array $item): ParseResult
```

This method produces a `ParseResult` representing an item to be sent through the [processing pipeline](/docs/item-pipeline). Items are simply bags of data, represented by an associative array. Behind the scenes, this array will get wrapped in an [`Item`](/docs/items) object so it can be worked with more easily than a plain array.

Items can have as many entries as we want. Here’s an example of how we can produce an item containing the main headline of the page.

```php
<?php
  
use RoachPHP\Http\Response;
use RoachPHP\Spider\BasicSpider;

class MySpider extends BasicSpider
{
    public function parse(Response $response): \Generator
    {
      	$headline = $response->filter('h1')->text();
      
      	yield $this->item([
          	'headline' => $headline,
        ]);
    }
}
```

Items aren’t limited to a single piece of information. We can just as easily yield an item that contains the headline, subtitle and excerpt, for example.

```php
<?php
  
use RoachPHP\Spider\BasicSpider;

class MySpider extends BasicSpider
{
    public function parse(Response $response): \Generator
    {
      	$headline = $response->filter('h1')->text();
        $subTitle = $response->filter('h2#subtitle')->text();
        $excerpt = $response->filter('p#excerpt')->text();
      
      	yield $this->item([
          	'headline' => $headline,
            'subtitle' => $subTitle,
          	'excerpt' => $excerpt,
        ]);
    }
}
```

See the section about the [item processing pipeline](/docs/item-pipeline) to learn about what happens to items yielded from a spider.
