---
title: Upgrade Guide
section: Getting Started
subtitle: Steps to take to upgrade your application to a newer version of Roach.
---

## Migrating to 1.0.0 from 0.x

### Required Symfony Version

**Likelihood of Impact: Medium**

Up until now, Roach supported both version 5 and 6 of various Symfony components. With Roach 1.0, we’re dropping support for Symfony 5.

### Required Laravel Version

**Likelihood of Impact: High**

The first-party Laravel integration of Roach now requires Laravel 9.x.

### Browsershot No Longer Included by Default

**Likelihood Of Impact: Medium**

Roach uses the `spatie/browsershot` package to execute Javascript as part of the `ExcecuteJavascriptMiddleware` downloader middleware. As this dependency is only needed when using this middleware, it is no longer included with Roach by default. 

If you’re using the `ExcecuteJavascriptMiddleware`, make sure to explicitly require `spatie/browsershot` in your application’s `composer.json`.

```bash
composer require spatie/browsershot
```

If you’re not using this middleware, you can ignore this change.

### Changes to `RequestSchedulerInterface`

**Likelihood Of Impact: Low**

Roach 1.0 changes the definition of the `RequestSchedulerInterface`. If you’re implementing this interface yourself, make sure to update your implementation accordingly.

```diff
interface RequestSchedulerInterface
{
    /**
    * Return the next number of requests as defined by $batchSize as soon
    * as they are ready.
    *
    * @return Request[]
    */
-	public function nextRequests(): array;
+	public function nextRequests(int $batchSize): array;

	public function empty(): bool;

+ 	/**
+ 	* Immediately return the next number of requests as defined by $batchSize
+ 	* regardless of the configured delay.
+ 	*
+ 	* @return Request[]
+ 	*/
+ 	public function forceNextRequests(int $batchSize): array;

- 	public function setBatchSize(int $batchSize): self;

	public function setDelay(int $delay): self;
}
```

You can view the full interface definition [here](https://github.com/roach-php/core/blob/main/src/Scheduling/RequestSchedulerInterface.php).

