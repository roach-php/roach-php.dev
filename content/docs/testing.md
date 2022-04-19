---
title: Testing
subtitle: Learn how to integrate Roach spiders into your test suite.
section: Advanced Usage
---

Testing spiders can be a little tricky. Nevertheless, Roach offers a few testing helpers to make integrating spiders into your test suite easier.

## Faking Runs

It’s common that we want to test that a run for a specific spider was started as part of our application logic. Naturally, we don’t actually want to _start_ the run every time we run our test suite.

To do so, we may call the `Roach::fake()` method. This will instruct Roach to record which runs _would have been started_ without actually starting them.

<CodeBlock>

```php
use RoachPHP\Roach;

$runner = Roach::fake();

// Doesn't actually start the run but records that
// a run for MySpider was started.
Roach::startSpider(MySpider::class);
```

</CodeBlock>

The `Roach::fake()` method returns a `FakeRunner` that Roach will use internally instead of the real one. The `FakeRunner` allows us to make assertions about any runs that were or weren’t started.

To restore the real runner, we can call the `Roach::restore()` method.

<CodeBlock>

```php
Roach::fake();
// Won't start spider because we’re in fake mode.
Roach::startSpider(MySpider::class);

Roach::restore();
// Will run normally as we’ve reverted the fake.
Roach::startSpider(MySpider::class);
```

</CodeBlock>

It is a good idea to explicitly call `Roach::restore()` in the `tearDown` method of our test suite to avoid potential issues when running tests in parallel.

<CodeBlock>

```php
protected function setUp(): void
{
    $this->runner = Roach::fake();
}

protected function tearDown(): void
{
    Roach::restore();
}
```

</CodeBlock>

Note that `Roach::collectSpider()` will always return an empty array when in fake mode as no run actually gets started and as such no items will get scraped. Apart from that, it behaves exactly the same as `Roach::startSpider()` and all assertion mentioned below will work as expected for either method.

### Asserting that a run was started

To assert that a run for a specific spider was started, we can use the `assertRunWasStarted` method of the `FakeRunner`.

```php
<?php
    
use App\Commands\NightlyScrapeCommand;
use RoachPHP\Roach;
use PHPUnit\Framework\TestCase;

final class NightlyScrapeCommandTest extends TestCase
{
    protected function tearDown(): void
    {
        Roach::restore();
    }
    
    public function testCorrectSpiderRunGetsStarted(): void
    {
     	$runner = Roach::fake();
        $command = new NightlyScrapeCommand();
        
        $command->execute();
        
        $runner->assertRunWasStarted(MySpider::class);
    }
}
```

This assertion passes if at least one run for the provided spider class was recorded.

### Inspecting started runs

We often want to check that a run was started with the correct overrides or context. To do so, we can pass an additional callback as the second parameter to the `assertRunWasStarted` method.

<CodeBlock>

```php
use RoachPHP\Spider\Configuration\Overrides;

$runner->assertRunWasStarted(
    MySpider::class, 
    function (?Overrides $overrides, array $context): bool {
    	return $overrides->concurrency === 10;
	},
);
```

</CodeBlock>

The callback gets passed the run’s `Overrides` (or `null`, if there weren’t any) as well as the run’s [context](/docs/spiders#passing-additional-context-to-spiders). The callback should return a boolean. If `false` is returned, the assertion fails.

### Asserting that a run was not started

We can also assert that a run was _not_ started for a given spider. To do so, we can use the `assertRunNotStarted` method of the `FakeRunner`.

<CodeBlock>

```php
$runner->assertRunNotStarted(MySpider::class);
```

</CodeBlock>

This assertion passes if _no_ run was started for the `MySpider` spider.
