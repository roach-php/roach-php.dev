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

### Dynamically defining starting URLs

Sometimes we may have to dynamically define our spider’s seeds. A possible example could be that we want to start our crawl on a page that contains today’s date in its URL. Since we can’t hardcode this date, we have to determine it at runtime.

In these cases we can override the `getStartUrls()` method of the `AbstractSpider` class.

<CodeBlock>

```php
<?php

use RoachPHP\Http\Response;
use RoachPHP\Spider\BasicSpider;

class MySpider extends BasicSpider
{
    public function parse(Response $response): \Generator
    { /* ... */ }

    /**
     * @return string[]
     */
    protected function getStartUrls(): array
    {
        $yesterday = (new DateTime('yesterday'))->format('Y/m/d');

        return [
            "https://fussballdaten.de/kalender/{$yesterday}"
        ];
    }
}
```

</CodeBlock>
