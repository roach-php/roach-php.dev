---
title: Laravel
section: Framework Integration
subtitle: Easily integrate Roach into any Laravel application.
---

This page will walk you through the steps to install Roach into your Laravel projects.

The Laravel adapter mostly provides the necessary container bindings for the various services Roach uses, as well as making certain configuration options available via a config file. To learn about how to actually start using Roach itself, check out the [rest of the documentation](/docs/spiders).

## Installing the Laravel Adapter

Instead of installing the core Roach package, we are going to install Roach’s Laravel adapter.

<CodeBlock>

```bash
composer require roach-php/laravel
```

</CodeBlock>

We can also publish the configuration file that comes with the package.

<CodeBlock>

```bash
php artisan vendor:publish --provider='RoachPHP\Laravel\RoachServiceProvider'
```

</CodeBlock>

This will publish a `roach.php` configuration file to our app’s `config` folder.

## Available Commands

The Laravel adapter of Roach registers a few Artisan commands to make out development experience as pleasant as possible.

### Generating new Spiders

To quickly stub out a new spider, we can use the `roach:spider` Artisan command.

<CodeBlock>

```bash
php artisan roach:spider LaravelDocsSpider
```

</CodeBlock>

This command will create a new spider with the provided name inside our app’s `Spider` directory. Check out the section about [getting started with spiders](/docs/spiders) to learn about how to proceed from this point.

### Starting the REPL

Roach ships with an [interactive shell](/docs/repl) (often called Read-Evaluate-Print-Loop, or Repl for short) which makes prototyping our spiders a breeze. We can use the provided `roach:shell` command to launch a new Repl session.

<CodeBlock>

```bash
php artisan roach:shell https://roach-php.dev/docs/introduction
```

</CodeBlock>

Check out the [shell documentation](/docs/repl) to learn more.