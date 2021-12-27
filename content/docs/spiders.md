---
title: Spiders
section: Basic Concepts
subtitle: Define how websites get crawled and how data is scraped from its pages.
---

Spiders are classes which define how a website will get processed. This includes both crawling for links and extracting data from specific pages (scraping).

## Example spider

It's easiest to explain all the different parts of a spider by looking at an example. Here's a spider that extracts the title and subtitle of all pages of this very documentation.

<CodeBlock>

```php
<?php

use RoachPHP\Http\Response;
use RoachPHP\Spider\BasicSpider;

class RoachDocsSpider extends BasicSpider
{
    /**
     * @var string[]
     */
  	public array $startUrls = [
        'https://roach-php.dev/docs/spiders'
    ];

    public function parse(Response $response): \Generator
    {
        $title = $response->filter('h1')->text();

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

</CodeBlock>

Here’s how this spider will be processed:

1. Roach starts by sending requests to all URLs defined inside the `$startUrls` property of the spider. In our case, there’s only the single URL `https://roach-php.dev/docs/spiders`.
1. The response of each request gets passed to the `parse` method of the spider.
1. Inside the `parse` method, we filter the response using CSS selectors to extract both the title and subtitle. Check out the page on [scraping responses](/docs/processing-responses) for more information.
1. We then `yield` and item from our method by calling `$this->item(...)` and passing in array of our data.
1. The item will then get sent through the [item processing pipeline](/docs/item-pipeline).
1. Since there are no further requests to be sent, the spider closes.

## Generating the initial requests

When Roach starts a run of your spider, it first generates the initial requests from the spider’s starting URLs. These URLs are often referred to as _seeds_. There are several different ways you can define the starting URLs for a spider.

### Static URLs

The most straight forward way of specifying the starting URLs for a spider is via the `$startUrls` property.

<CodeBlock>

```php
<?php

use RoachPHP\Http\Response;
use RoachPHP\Spider\BasicSpider;

class MySpider extends BasicSpider
{
    /**
     * @var string[]
     */
    public array $startUrls = [
        'https://roach-php.dev/docs/spiders',
    ];

    public function parse(Response $response): \Generator
    { /* ... */ }
}
```

</CodeBlock>

Roach will send a request to each URL defined in this array and call the `parse` method for each respective response.

### Manually Creating the Request Objects

While using the `$startUrls` property is very convenient, it makes a few assumptions:

- it assumes that all requests are to be sent as `GET` requests,
- it assumes that the initial requests will get processed by the `parse` method of our spider

Since `$startUrls` is a property, we can only define static values in it. We can’t add dynamic parts to the URLs like the current date, for example.

If we need complete control over the requests that get created, we can override the `initialRequests` method on the spider, instead.

<CodeBlock>

```php
<?php

use Datetime;
use RoachPHP\Http\Request;
use RoachPHP\Http\Response;
use RoachPHP\Spider\BasicSpider;

class MySpider extends BasicSpider
{
    public function parse(Response $response): \Generator
    { /* ... */ }

    /** @return Request[] */
    protected function initialRequests(): array
    {
        $yesterday = (new DateTime('yesterday'))->format('Y/m/d');

        return [
            new Request(
                'GET',
                "https://fussballdaten.de/kalender/{$yesterday}",
                [$this, 'parse']
            ),
        ];
    }
}
```

</CodeBlock>

The `initialRequests` method needs to return an array of `Request` objects. Since we can now directly instantiate `Request` objects, we are free to configure these requests however we want. In the example above, we’re setting the start URL to a dynamic value based on the current date.

The `Request` class has the following constructor:

<CodeBlock>

```php
Request::__construct(
    string $method,
    string $uri,
    callable $parseMethod,
    array $options = [],
);
```

</CodeBlock>

The `$options` parameter takes an array of [Guzzle request options](https://docs.guzzlephp.org/en/latest/request-options.html) which allows us to configure the underlying Guzzle request directly, if that’s the flexibility we need.

Using the `initialRequests` method, we could also provide a different parse method for the initial requests as well. 

<CodeBlock>

```php
<?php

use RoachPHP\Http\Request;
use RoachPHP\Spider\BasicSpider;

class RoachDocsSpider extends BasicSpider
{
	public function parseOverview(Response $response): \Generator
    {
        // We’re only interested in the overview page 
        // because we can extract the links we’re 
        // actually interested in from it.
        $pages = $response
            ->filter('main > div:first-child a')
            ->links();
        
        foreach ($pages as $page) {
            // Since we’re not specifying the second parameter, 
            // all article pages will get handled by the 
            // spider’s `parse` method.
            yield $this->request('GET', $article->getUri());
        }
    }
    
    public function parse(Response $response): \Generator
    {
        // Akshually parse the subpages...
    }

    /** @return Request[] */
    protected function initialRequests(): array
    {
        return [
            new Request(
                'GET',
                'https://roach-php.dev',
                // Specify a different parse method for 
                // the intial request.
                [$this, 'parseOverview']
            ),
        ];
    }
}
```

</CodeBlock>

This pattern can be useful when we don’t know the URLs we want to crawl ahead of time. Think of a news site with the current stories on the front page. We could define the initial request of our spider to crawl the front page and extract the URLs to the actual stories from it. Then, we send requests to each of these pages to scrape them.

What makes this so clean is that we’re able to define a different parsing method for both kinds of requests. The logic to extract URLs from the front page is completely different than scraping an actual article. Imagine having to do both of these things in a single method. It would be madness! Madness, I say!

## Configuring Spiders

The way to change the behavior of Roach is by registering **middleware** and **extensions** for our spider. By doing so, we can add default headers to each requests, deal with cookies, collect metrics for our runs and much more. 

There are three different kinds of middleware.

- [Downloader Middleware](/docs/downloader-middleware) — This middleware sits between the Roach engine and the **Downloader**, the component in charge of dealing with the HTTP side of things. Every outgoing request and incoming response gets passed through this middleware stack.
- [Spider Middleware](/docs/spider-middleware) — The spider middleware sits between the engine and your spider. It handles responses before they get passed to your spider’s parse callback, as well as [items](/docs/items) and new requests that get emitted by our spiders.
- [Item Processors](/docs/item-pipeline) — Every [item](/docs/items) that ours spiders emit get passed through the item processing pipeline. This pipeline consists of multiple item processors which, well, process the items. “Processing” can mean many different things of course. Anything from cleaning up data, filtering duplicates, storing things in a database or even sending notification mails.

Extensions, on the other hand don’t live in a specific context, but listen on **events** that get fired at various points during a run instead. Don’t worry if this difference seems a little too esoteric at this point. It will be explained in more detail in the section about [extending Roach](/docs/writing-spider-middleware).

### Defining Spider Configuration

There is no definitive way to load a spider’s configuration. You might prefer defining all configuration in separate config files or leading it dynamically from the database. To help you get started, Roach provides a `BasicSpider` base class that you can extend from. This class allows you to provide your spider’s configuration as class properties.

<CodeBlock>

```php
<?php
  
use RoachPHP\Spider\BasicSpider;

class MySpider extends BasicSpider
{
    /**
     * The spider middleware that should be used for runs
     * of this spider.
     */
  	public array $spiderMiddleware = [];
    
    /**
     * The downloader middleware that should be used for
     * runs of this spider.
     */
    public array $downloaderMiddleware = [];
  
  	/**
  	 * The item processors that emitted items will be send
  	 * through.
  	 */
  	public array $itemProcessors = [];
  
  	/**
  	 * The extensions that should be used for runs of this
  	 * spider.
  	 */
  	public array $extensions = [];
  
  	/**
  	 * How many requests are allowed to be sent concurrently.
  	 */
  	public int $concurrency = 2;
  
    /**
     * The delay (in seconds) between requests. Note that there
     * is no delay between concurrent requests. Instead, Roach
     * will wait for the `$requestDelay` before sending the
     * next "batch" of concurrent requests.
     */
  	public int $requestDelay = 2;
}
```

</CodeBlock>

To register the `RequestDeduplicationMiddleware` that ships with Roach, we would add its fully qualified class-name (FQCN) to the `$downloaderMiddleware` array.

<CodeBlock>

```php
public array $downloaderMiddleware = [
  	RoachPHP\Downloader\Middleware\RequestDeduplication::class,
];
```

</CodeBlock>

### Passing Options to Middleware

Some middleware or extensions might allow you to pass options to them. For example, the built-in `UserAgentMiddleware` allows us to define a custom `userAgent` that will be attached to every request. In these cases, we use a slightly different syntax when registering the middleware.

<CodeBlock>

```php
public array $downloaderMiddleware = [
  	[
      RoachPHP\Downloader\Middleware\UserAgentMiddleware::class, 
      ['userAgent' => 'Mozilla/5.0 (compatible; RoachPHP/0.1.0)'],
    ]
];
```

</CodeBlock>

Instead of passing the FQCN of the middleware directly, we pass an array instead. The first entry of the array is the FQCN of the middleware. The second entry is an array of options that will be passed to the middleware. In the example above, we’re setting the `userAgent` option of the middleware to `Mozilla/5.0 (compatible; RoachPHP/0.1.0)`.

The exact options we can specify are defined by each handler individually. These options are explained on the respective sub-pages where we take a look at the built-in middleware and extensions.

This process is identical for `$spiderMiddleware`, `$itemProcessors` and `$extensions` .

## Running Spiders

After we have set up our spider, it’s finally time to run it. Luckily, Roach makes this super easy. All we have to do is pass the class name of our spider to the static `Roach::run()` method and Roach will take care of the rest.

<CodeBlock>

```php
<?php
    
use App\Spiders\MySpider;
use RoachPHP\Roach;

Roach::run(MySpider::class);
```

</CodeBlock>

If that’s not the coolest thing you’ve ever seen, your life is probably not nearly as boring as mine!
