---
title: Scraping versus Crawling
section: Getting Started
subtitle: Familiarize yourself with the concepts of scraping and crawling as they will be used a lot in this documentation.
---

The terms _web scraping_ and _web crawling_ — mostly shortened to just _scraping_ and _crawling_, respectively — often get used interchangeably. Colloquially, both words are used to loosely mean “programmatically visiting and/or extracting data from websites”. This definition works well enough for most cases. However, while these concepts are very closely related, they are in fact two different things.

Roach deals with both crawling _and_ scraping web sites. As such, we should familiarize ourselves with the differences between these concepts as they will be used throughout this documentation to refer to different things.

## Scraping

Web scraping, or simply scraping, is the process of extracting data from a web document. Examples of scraping could be:

- extracting the author, publish date, title and excerpt from a news article
- extracting the home and away team as well as the final score from a match page
- extracting the five most recent blog posts from a blog’s archive page

In each of these cases, we’re extracting specific bits of information from the contents of the document.

The specific information we want to extract will often be different for each document. As such, Scrapers are usually bespoke to the document they’re supposed to process.

### Scrapers don’t crawl

The point is that all a scraper does is **extract information from a (web) document**. It isn’t responsible for actually _retrieving_ said document. It could be the result of an HTTP request, a static `.html` file on your computer or the result of you hitting your hard drive with the radiation from your microwave by opening and closing its door in exactly the right sequence.

This means that you can do web scraping without doing web crawling.

## Crawlers

Web crawling is the process of iteratively finding and following web links from one or multiple start URLs. A crawler doesn't really care about the _contents_ of a page but about its structure. Strictly speaking, crawlers have to do some scraping as well to extract the urls from the page contents.
