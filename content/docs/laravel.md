---
title: Laravel
section: Framework Integration
subtitle: Easily integrate Roach into any Laravel application.
---

This page will walk you through the steps to install Roach into your Laravel projects.

## Installing the Laravel Adapter

Instead of installing the core Roach package, we are going to install Roach’s Laravel adapter.

<CodeBlock>

```bash
composer require roach-php/laravel
```

</CodeBlock>

Next, let’s publish the configuration file that comes with the package.

<CodeBlock>

```bash
php artisan vendor:publish --provider='RoachPHP\Laravel\RoachServiceProvider'
```

</CodeBlock>

This will publish a `roach.php` configuration file to our app’s `config` folder.

## Configuring the package

Most apps will be fine using the default configuration Roach uses out of the box. Nevertheless, let’s go through the configuration options available to us.

### Logging

Roach comes with a `LoggerExtension` which to log useful information during a run. The extension uses our app’s logging configuration