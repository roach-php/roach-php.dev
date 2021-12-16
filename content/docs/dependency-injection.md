---
title: Dependency Injection
subtitle: Use a different dependency injection container for resolving spiders, middleware and processors.
---

Roach uses a dependency injection container under the hood to create spiders, middleware, item processors and extensions. This has the advantage that you can typehint dependencies without having to worry about how and where they will be injected.

Roach ships with a small container based on [`league/container`](https://container.thephpleague.com/) that registers only a few bindings. This is fine if you want to use Roach in a standalone project.

## Swapping out the container

When integrating Roach into a project that already has dependency injection container (e.g. the one provided by the web framework), we can tell Roach to use another container instead.

Here’s an example of how we can do this inside a [Laravel](https://laravel.com) app.

<CodeBlock>

```php
// app/Providers/AppServiceProvider.php
<?php

use RoachPHP\Roach;

class AppServiceProvider extends ServiceProvider
{
    public function register()
    {
        Roach::useContainer($this->app);
    }
}
```

</CodeBlock>
