---
title: Configuring Middleware and Extensions
section: Advanced Usage
subtitle: Learn how to write configurable middleware and extensions.
---

All extensions and middleware in Roach provide a mechanism to pass configuration options to them when registering them in our spiders. This page talks about how to this mechanism works and how to implement it for our own middleware and extensions.

## The Interface

All middleware and extensions implement the `ConfigurableInterface`. This interface defines a single method `configure` which accepts an array of options.

<CodeBlock>

```php
interface ConfigurableInterface
{
    public function configure(array $options): void;
}
```

</CodeBlock>

In order to make our classes configurable, we need to implement this interface and ensure that whatever options get passed in get merged correctly with any defaults that we defined.

## Defining Configuration Options

Since we want the behavior of all configurable classes to be consistent with each other, the implementation of this interface is going to look the same for all middleware and extensions. For this reason, Roach comes with a handy `Configurable` trait that we can use in our classes to implement the `ConfigurableInterface`.

<CodeBlock>

```php
<?php
    
use RoachPHP\Support\Configurable;
use RoachPHP\Support\ConfigurableInterface;

class MyConfigurableClass implements ConfigurableInterface
{
    use Configurable;
}
```

</CodeBlock>

<Callout>

To keep this page as generic as possible, all examples directly implement the `ConfigurableInterface`. In practice, we will be implementing one of the [downloader middleware interfaces](/docs/downloader-middleware), [spider middleware interfaces](/docs/spider-middleware), or the [extension interface](/docs/extensions#writing-extensions), instead, all of which extend the `ConfigurableInterface`.

</Callout>

If we were to try and call the `configure` method now with any options, however, Roach would throw an exception. 

<CodeBlock>

```php
$myClass = new MyConfigurableClass();
$myClass->configure(['option' => 'value']);
// Boom!
```

</CodeBlock>

This is because any configuration options that our classes accept need to be explicitly declared. By default, all the `Configurable` trait does is provide a default implementation of the `ConfigurableInterface` that doesn’t accept any options. 

In order to define the configuration options our class accepts, we need to override the `defaultOptions` method that comes with the trait.

<CodeBlock>

```php
<?php
    
use RoachPHP\Support\Configurable;
use RoachPHP\Support\ConfigurableInterface;

class MyConfigurableClass implements ConfigurableInterface
{
    use Configurable;
    
    private function defaultOptions(): array
    {
        return [
            'timeout' => 5 * 60,
        ];
    }
}
```

</CodeBlock>

The `defaultOptions` method needs to return an associative array of option names and their corresponding default value. In the example above, we have defined an option called `timeout` with a default value of `5 * 60` (or 300 for those of you less mathematically inclined than myself).

<CodeBlock>

```php
$myClass = new MyConfigurableClass();

// Calling `configure` without any option uses the
// default values for all defined options.
$myClass->configure([]);

// Overriding the default value of the `timeout` option.
$myClass->configure(['timeout' => 2 * 60]);
```

</CodeBlock>

<Callout>

In practice, we will never call the `configure` method of our extensions or middleware ourselves. This is only done here for illustration purposes so we can understand what is actually going on behind the scenes.

</Callout>

Now that we have declared a `timeout` option, we can override the default when registering this extension or middleware in our spider. If we don’t specify an explicit `timeout`, the default value will be used instead.

Check out the [page on spiders](/docs/spiders#passing-options-to-middleware) to learn more about how to configure spiders.

## Accessing Options

To access configuration options inside our class, we can use `option()` method that comes with the `Configurable` trait.

<CodeBlock>

```php
<?php
    
use RoachPHP\Support\Configurable;
use RoachPHP\Support\ConfigurableInterface;

class MyConfigurableClass implements ConfigurableInterface
{
    use Configurable;
    
    public function doSomething(): void
    {
        $timeout = $this->option('timeout');
        
        // continue doing something...
    }
    
    private function defaultOptions(): array
    {
        return [
            'timeout' => 5 * 60,
        ];
    }
}
```

</CodeBlock>

The method accepts the name of the option and returns the configured value. 
