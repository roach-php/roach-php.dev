---
title: Interactive Shell
section: Basic Concepts
subtitle: Quickly prototype spiders with Roach’s interactive shell.
---

Writing crawlers can be a slow and error-prone process. For this reason, Roach ships with an interactive REPL (read-evaluate-print-loop) to help us quickly prototype our spiders.

## Starting the Shell

To enter the shell, run the following command from the terminal.

<CodeBlock>

```bash
php vendor/bin/roach <url>
```

</CodeBlock>

`<url>` is the URL that Roach will crawl when booting up the shell for the first time. Let’s take a look at how we might use the REPL to crawl this page of the documentation.

<CodeBlock>

```bash
$ php vendor/bin/roach https://roach-php.dev/docs/repl

Available variables:
    $response:      <200 'https://roach-php.dev/docs/repl'>
    $html:          Raw HTML contents of response
Commands:
    fetch <url>     Fetch URL and update the $response and $html objects

Psy Shell v0.10.12 (PHP 8.0.12 — cli) by Justin Hileman
>>>
```

</CodeBlock>

Sweet, we’re now inside a shell session. Let’s take a look at what’s available to us.

### Available Variables

After starting the shell, Roach will make an HTTP request to the URL we specified and make two variables available to us.

`$response` contains  `Response` object we got back from our request. This is the same object that gets passed to your spider’s [parse callback](/docs/processing-responses). This means that we can now use this object inside our shell to test our selectors.

<CodeBlock>

```php
>>> $response->filter('h1')->text()
=> "Interactive Shell"
>>> $response->filter('h1')->ancestors()->siblings()->text()
=> "Quickly prototype spiders with Roach’s interactive shell."
```

</CodeBlock>

What, how did you _think_ I wrote the examples for this documentation?!

`$html` contains the entire HTML body of the response as a string. While this often is too noisy to be of much use, it can be useful for quick sanity checks if our selectors aren’t working like we expect them to.

<CodeBlock>

```php
>>> $html
=> """
   <!doctype html>\n
   <html data-n-head-ssr lang="en" class="h-full [--scroll-mt:9rem]" data-n-head="%7B%22lang%22:%7B%22ssr%22:%22en%22%7D,%22class%22:%7B%22ssr%22:%22h-full%20%5B--scroll-mt:9rem%5D%22%7D%7D">\n
     <head>\n ..."""
```

</CodeBlock>

### Available Commands

The shell also makes a `fetch` command available to us. The `fetch` command takes a URL as a parameter, sends a request to it, and updates the `$response` and `$html` variables in the shell accordingly.

<CodeBlock>

```php
>>> fetch https://roach-php.dev/docs/installation

Available variables:
    $response:      <200 'https://roach-php.dev/docs/installation'>
    $html:          Raw HTML contents of response
Commands:
    fetch <url>     Fetch URL and update the $response and $html objects
        
>>> $response->filter('h1')->text()
=> "Installation"
```

</CodeBlock>