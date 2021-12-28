---
title: Roach PHP
section: Getting Started
subtitle: The complete webscraping toolkit for PHP
---

Roach is a complete web scraping toolkit for PHP. It is ~~a shameless clone~~ heavily inspired by the popular [Scrapy](https://docs.scrapy.org) package for Python.

Roach allows us to define spiders that crawl and scrape web documents. But wait, there’s more. Roach isn’t just a simple crawler, but includes an entire pipeline to clean, persist and otherwise process extracted data as well. It’s your all-in-one resource for web scraping in PHP.

## Framework Agnostic

Roach doesn’t depend on a specific framework. Instead, you can use the core package on its own or install one of the framework-specific adapters. Currently there’s a first-party adapter available to [use Roach in your Laravel](/docs/laravel) projects with more coming.

## Built With Extensibility in Mind

Roach is built from the ground up with extensibility in mind. In fact, most of Roach’s built-in behavior works the exact same way that any custom extensions or middleware works.

Want to store the scraped information in your persistence of choice? Roach has got you covered, just write an appropriate [item processor](/docs/item-pipeline).

Want to add custom HTTP headers to every outgoing request based on some condition? Sure thing, sounds like a job for a [downloader middleware](/docs/downloader-middleware).

Post a message into the company Slack after a run was finished to gloat about how great your spider works? I... guess you could write an [extension](/docs/extension) for that and listen on the corresponding event.

Crush your enemys and hear the lamentations of their women? Sir, this is a Wendy’s.
