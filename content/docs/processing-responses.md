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

<CodeBlock>

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

</CodeBlock>

### Storing Meta Data

Both the `Response` as well as the `Request` object allow us to store and retrieve arbitrary meta data on them by using the `withMeta` and `getMeta` methods, respectively.

<CodeBlock>

```php
$responseWithMeta = $response->withMeta('depth', 1);

$responseWithMeta->getMeta('depth');
// => 1
```

</CodeBlock>

Note that `withMeta` does _not_ mutate the original object, but returns a new instance with the additional meta data instead.

<CodeBlock>

```php
// The original object remains unchanged
$response->getMeta('depth');
// => NULL
```

</CodeBlock>

### Accessing the Request

Every response also contains a reference to its corresponding `Request` object. We can access the request via the `getRequest` method.

<CodeBlock>

```php
$response->getRequest();
// => RoachPHP\Http\Request {#2666}
```

</CodeBlock>

This can be useful because it allows us to access data from the request that triggered this response. Together with the ability to add meta data to these objects, this enables many cool use cases such as keeping track of the current crawl depth across the entire spider.

## Using Selectors

We can use both CSS as well as XPath selectors for extracting data from the response body. We do so by calling either the `filter()` or `filterXPath` methods directly on the `Response` object.

<CodeBlock>

```php
$response->filter('h1')->text();
// => "Such wow!"

$response->filterXPath('//span[contains(@id, "such-wow")]')->text();
// => "Wowzers!"
```

</CodeBlock>

Under the hood, Roach creates a `DomCrawler` object from the response body and proxies all method calls to it. Check out the full [DomCrawler documentation](https://symfony.com/doc/current/components/dom_crawler.html#usage) for a more thorough explanation.

## Parse Results

The return value of our parsing callback tells Roach what to do next. There are two options:

- we have extracted one or more URIs that we want to crawl next
- we have extracted one or more pieces of information that we want to send through the [item processing pipeline](/docs/item-pipeline)

Roach represents both of these possibilities with a `ParseResult` object. This object can either represent a request that should be dispatched next or an item to processed. The result of our parse callback needs to be a `Generator<ParseResult>`, i.e. a `Generator` that produces instances of `ParseResult` objects. 

Using a generator instead of just returning a value allows us to produce multiple `ParseResults` from the same callback. This might not sound like a big deal on the surface but is actually a really powerful feature. For example, we could extract the headline from a page first and send it through the item pipeline and then dispatch a request to continue crawling a detail page.

<CodeBlock>

```php
<?php

use RoachPHP\Http\Response;
use RoachPHP\ResponseProcessing\ParseResult;
use RoachPHP\Spider\AbstractSpider;

class MySpider extends AbstractSpider
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

</CodeBlock>

Using generators allows us to both extract information from a page as well as dispatch additional requests to continue the crawl.

Note how there is no mention of a `ParseResult` class in the example above. Most of the heavy lifting is down by two method calls that we’re going to look at next: `$this->item()` and `$this->request()`.

## Dispatching requests

We often want to crawl additional pages based on the links we found on the current page. We can instruct Roach to do so by yielding a new request from our `parse` method.

<CodeBlock>

```php
public function parse(Response $response): Generator
{
    $links = $response->filter('nav a')->links();

    foreach ($links as $link) {
        yield $this->request($link->getUrl());
    }
}
```

</CodeBlock>

The `$this->request()` method takes in the URL and returns a new `ParseResult` object representing a request to a page that should be crawled next.

<CodeBlock>

```php
AbstractSpider::request(
    string $uri,
    string $parseMethod = 'parse'
): ParseResult
```

</CodeBlock>

Yielding a request object from our parse method tells Roach that we intend to crawl this URL as well. This won’t immediately send the request, however, but instead schedule it to run after the current batch of requests has been processed.

### Defining different parse methods

By default, Roach will call the `parse` method of your spider to process a request’s response. However, it can often be desireable, to use different callbacks for different requests. We can do so by passing the name of the method as the second parameter to `$this->request()`.

<CodeBlock>

```php
class BlogSpider extends AbstractSpider
{
    public array $startUrls = [
        'https://kai-sassnowski.com'
    ];

    public function parse(Response $response): Generator
    {
        $links = $response->filter('header + div a')->links();

        foreach ($links as $link) {
            yield $this->request($link->getUri(), 'parseBlogPage');
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

</CodeBlock>

In this example, Roach will send an initial request to `https://kai-sassnowski.com` since that’s the only URL defined in `$startUrls`. The response of this request will get passed to the `parse` method which in turn dispatches several new request. The responses of these requests will then get passed to the `parseBlogPage` method, since that’s the method we specified when yielding the requests.

## Extracting Items

More often than not, the goal of a spider is to extract certain bits of information from a document. We can do so by [filtering the response](#using-selectors) using either CSS or XPath selectors as described in an earlier section. Once we have extracted the data, we want to send it through the [item pipeline](/docs/item-pipeline) so it may be processed further.

In order to tell Roach to do that, we can use the `$this->item()` method on the base class.

<CodeBlock>

```php
AbstractSpider::item(array $item): ParseResult
```

</CodeBlock>

This method produces a `ParseResult` representing an item to be sent through the [processing pipeline](/docs/item-pipeline). Items are simply bags of data, represented by an associative array. Behind the scenes, this array will get wrapped in an [`Item`](/docs/items) object so it can be worked with more easily than a plain array.

Items can have as many entries as we want. Here’s an example of how we can produce an item containing only the main headline of the page.

<CodeBlock>

```php
<?php
  
use RoachPHP\Spider\AbstractSpider;

class MySpider extends AbstractSpider
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

</CodeBlock>

We could just as easily extract the excerpt and subtitle from this page as well, however.

<CodeBlock>

```php
<?php
  
use RoachPHP\Spider\AbstractSpider;

class MySpider extends AbstractSpider
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

</CodeBlock>
