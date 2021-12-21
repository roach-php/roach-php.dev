---
title: Extensions
section: Advanced Usage
subtitle: Extend Roach by hooking into events which get fired during a run
---

Extensions provide a way to extend Roach by hooking into the various events being fired throughout a run. Unlike [downloader middleware](/docs/downloader-middleware), [spider middleware](/docs/spider-middleware), and [item processors](/docs/item-processors), Extensions don’t live inside a specific part of Roach’s lifecycle and as such can do things that regular middleware can’t.

## Built-in Extensions

Roach ships with a few built-in extensions we can use in our spiders.

### Logging

_todo_

### Collecting Stats

_todo_

## Writing Extensions

_todo_

## Events

Roach fires various requests throughout a run which allow us to hook into various parts of a spider run’s lifecycle. Here’s  a list of all events, when they get fired, and what their payload is.

### `RunStarting`

### `RunFinished`

### `RequestScheduling`

### `RequestSending`

### `RequestDropped`

### `ResponseDropped`

### `ItemScraped`

### `ItemDropped`
