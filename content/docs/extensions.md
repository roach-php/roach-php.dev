---
title: Extensions
section: Advanced Usage
subtitle: Extend Roach by hooking into events which get fired during a run
---

Extensions provide a way to extend Roach by hooking into the various events being fired throughout a run. Unlike [downloader middleware](/docs/downloader-middleware), [spider middleware](/docs/spider-middleware), and [item processors](/docs/item-processors), Extensions don’t live inside a specific part of Roach’s lifecycle and as such can do things that regular middleware can’t.

## Writing Extensions

An extension is a class which implements `ExtensionInterface`. This interface itself is a composition of Symfony’s `EventSubscriberInterface` and Roach’s `ConfigurableInterface`.

```php
interface ExtensionInterface extends ConfigurableInterface, EventSubscriberInterface
{
}

```

We can see that all extensions are, are glorified event listeners. Every extension needs to provide a list of [events](/docs/extensions#events) it wants to listen on along with the event handler to be called when the event fires.

```php
<?php
    
use RoachPHP\Events\RunFinished;
use RoachPHP\Extensions\ExtensionInterface;
use RoachPHP\Support\Configurable;

class EmailDigestExtension implements ExtensionInterface
{
    public function __construct(private Mailer $mailer)
    {
    }

    public static function getSubscribedEvents(): array
    {
        return [
        	RunFinished::NAME => ['onRunFinished', 100],  
        ];
    }
    
    public function onRunFinished(RunFinished $event): void
    {
    	// Totally real and production ready code
        $this->mailer->sendNotificationMail($event->run);
    }
}
```

Roach uses Symfony’s [`EventDispatcher`](https://symfony.com/doc/current/components/event_dispatcher.html) component under hood, so check out its [documentation about event subscribers](https://symfony.com/doc/current/components/event_dispatcher.html#using-event-subscribers) for a more thorough explanation.

### Defining Configuration Options

Check out the dedicated page about [configuring middleware and extensions](/docs/configuring-middleware-and-extensions) to learn how to define configuration options for our middleware.

## Built-in Extensions

Roach ships with a few built-in extensions we can use in our spiders.

### Logging

The built-in `LoggerExtension` logs information about a run. This includes

- requests getting sent
- requests getting dropped
- items successfully scraped
- items getting dropped

By default, the extensions logs to `stdout`. To change this, we can pass a different `Psr\Log\LoggerInterface` implementation to the its constructor. Check the section on [dependency injection](/docs/dependency-injection) to see learn how we can swap out Roach’s default DI container.

To use this extension, add it to your spider’s `$extension` array.

```php
<?php
    
use RoachPHP\Spider\BasicSpider;
use RoachPHP\Extensions\LoggerExtension;

class MySpider extends BasicSpider
{
    public array $extensions = [
        LoggerExtension::class,
    ];
}
```

This extension takes no configuration options.

### Collecting Run Statistics

The `StatsCollectorExtension` gathers statistics about our run, such as the total runtime of a run and the number of requests sent. 

After a run finishes, the extensions logs these statistics using its `Psr\Log\LoggerInterface` dependency. By default, this will log to `stdout` but can be configured by providing a different implementation of the logger interface. Check the section on [dependency injection](/docs/dependency-injection) to see learn how we can swap out Roach’s default DI container.

To use this extension, add it to your spider’s `$extension` array.

```php
<?php
    
use RoachPHP\Spider\BasicSpider;
use RoachPHP\Extensions\StatsCollectorExtension;

class MySpider extends BasicSpider
{
    public array $extensions = [
        StatsCollectorExtension::class,
    ];
}
```

This extension takes no configuration options.

## Events

Roach fires various requests throughout a run which allow us to hook into various parts of a spider run’s lifecycle. Here’s  a list of all events, when they get fired, and what their payload is.

### `RunStarting`

Fired when a new run is starting before the first request gets scheduled.

#### Payload

| Property | Description                                                  |
| -------- | ------------------------------------------------------------ |
| `run`    | The `Run` object containing the configuration of the run being started. |

### `RunFinished`

Fired after the last response was processed and no new requests were scheduled.

#### Payload

| Property | Description                                                  |
| -------- | ------------------------------------------------------------ |
| `run`    | The `Run` object containing the configuration of the finished run. |

### `RequestScheduling`

Fired before a new request gets passed to the scheduler. Requests dropped at this point will not get scheduled and as such will **not** get passed through the [downloader middleware](/docs/downloader-middleware).

#### Payload

| Property  | Description                                 |
| --------- | ------------------------------------------- |
| `request` | The `Request` object about to be scheduled. |

### `RequestSending`

Fired right before a request gets sent. This event fires after the request was passed through the [downloader middleware](/docs/downloader-middleware) and wasn’t dropped. Requests dropped at this point will not get sent.

#### Payload

| Property  | Description                            |
| --------- | -------------------------------------- |
| `request` | The `Request` object about to be sent. |

### `RequestDropped`

Fired whenever a request was dropped for any reason.

#### Payload

| Property  | Description                   |
| --------- | ----------------------------- |
| `request` | The dropped `Request` object. |

To get the drop reason, we can call the `getDropReason` method on the request object.

### `ResponseDropped`

Fired whenever a response was dropped by one of the [spider middleware](/docs/spider-middleware). Dropped responses will not get passed to the spider’s parse callback.

#### Payload

| Property   | Description                    |
| ---------- | ------------------------------ |
| `response` | The dropped `Response` object. |

### `ItemScraped`

Fired when an item was passed through the [item processing pipeline](/docs/item-pipeline) without being dropped.

#### Payload

| Property | Description                  |
| -------- | ---------------------------- |
| `item`   | The scraped `ItemInterface`. |

### `ItemDropped`

Fired whenever an item was dropped by one of the [item processors](/docs/item-pipeline#writing-item-processors).

#### Payload

| Property | Description                  |
| -------- | ---------------------------- |
| `item`   | The dropped `ItemInterface`. |

