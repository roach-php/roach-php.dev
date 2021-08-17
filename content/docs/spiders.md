---
title: Spiders
subtitle: Define how websites get crawled and how data is scraped from its pages.
---

Spiders are classes which define how a website will get processed. This includes both crawling for links and extracting data from specific pages (scraping).

## Your first spider

It's easiest to explain all the different parts of a spider by looking at an example.

```php
<?php

use RoachPHP\Spider\AbstractSpider;
use RoachPHP\Spider\Response;

class RoachDocsSpider extends AbstractSpider
{
    public array $startUrls = ['https://example.com'];

    public function parse(Response $response): Generator
    {
        yield $this->item([
            'title' => $response->filter('h1').text(),
        ]);

        foreach ($response->filter('#navigation a')->links() as $link) {
            yield $this->request($link->getUri());
        }
    }
}
```

Here’s how this spider will be processed:

1. Roach starts by sending requests to all URLs defined inside the `$startUrls` property of the spider. In our case, there’s only the single URL `https://example.com`.
2. The response of each request gets passed to the `parse` method of the spider. Check out the section on >AAAAAAAA< to learn how to define different callback methods for a request.
3. Inside the `parse` method, we first extract the main headline of the page by yielding the result of `$this->item()`. This piece of information will then be handed off to the [processing pipeline](/docs/processing-pipeline) to be processed.
4. Next, we find all navigation links and `yield` new requests for each of them so they, too, can be scraped. The responses will get passed to the `parse` method too.
