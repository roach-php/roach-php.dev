---
title: Spiders
subtitle: Define how websites get crawled and how data is scraped from its pages.
---

Spiders are classes which define how a website will get processed. This includes both crawling for links and extracting data from specific pages (scraping).

## Example spider

It's easiest to explain all the different parts of a spider by looking at an example. Here’s a spider which extracts the title and subtitle of the very page you’re on right now. How meta.

```php
<?php

use RoachPHP\Spider\AbstractSpider;
use RoachPHP\Spider\Response;

class RoachDocsSpider extends AbstractSpider
{
    public array $startUrls = ['https://roach.dev/docs/spiders'];

    public function parse(Response $response): Generator
    {
        $title = $response->filter('h1').text();

        $subtitle = $response
            ->filter('main > div:nth-child(2) p:first-of-type')
            ->text();

        yield $this->item([
            'title' => $title,
            'subtitle' => $subtitle,
        ]);
    }
}
```

Here’s how this spider will be processed:

1. Roach starts by sending requests to all URLs defined inside the `$startUrls` property of the spider. In our case, there’s only the single URL `https://roach.dev/docs/spiders`.
1. The response of each request gets passed to the `parse` method of the spider.
1. Inside the `parse` method, we filter the response using CSS selectors to extract both the title and subtitle. Check out the page on [scraping responses](/docs/scraping-responses) for more information.
1. We then `yield` and item from our method by calling `$this->item(...)` and passing in array of our data.
1. The item will then get sent through the [item processing pipeline](/docs/processing-pipeline).
1. Since there are no further requests to be sent, the spider closes.

## Generating the initial requests

When Roach starts a run of your spider, it first generates the initial requests from the spider’s starting URLs. These URLs are often referred to as _seeds_. There are several different ways you can define the starting URLs for a spider.

### Static URLs

The most straight forward way of specifying the starting URLs for a spider is via the `$startUrls` property.

```php
class MySpider extends AbstractSpider
{
    public array $startUrls = [
        'https://roach.dev/docs/spiders',
    ];

    public function parse(Response $response) { /* ... */ }
}
```

Roach will send a request to each URL defined in this array and call the `parse` method for each respective response.

### Dynamically defining starting URLs

Sometimes we may have to dynamically define our spider’s seeds. A possible example could be that we want to start our crawl on a page that contains a date in its URL.

In these cases we can override the `getStartUrls()` method of the `AbstractSpider` class.

```php
class MySpider extends AbstractSpider
{
    public function parse(Response $response) { /* ... */ }

    protected function getStartUrls(): array
    {
        $yesterday = (new DateTime('yesterday'))->format('Y/m/d');

        return [
            "https://fussballdaten.de/kalender/{$yesterday}"
        ];
    }
}
```

## Dispatching requests

We often want to crawl additional pages based on the links we found on the current page. We can instruct Roach to do so by yielding a new request from our `parse` method.

```php
public function parse(Response $response): Generator
{
    $links = $response->filter('nav a')->links();

    foreach ($links as $link) {
        yield $this->request($link->getUrl());
    }
}
```

The `$this->request()` method takes in the URL and returns a new request object. Yielding a request object from our parse method tells Roach that we intend to crawl this URL as well.

### Defining different parse methods

By default, Roach will call the `parse` method of your spider to process a request’s response. It is often desireable, however, to use different callbacks for different requests. We can do so by passing the name of the method as the second parameter to `$this->request()`.

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
