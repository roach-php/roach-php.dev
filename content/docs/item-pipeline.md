---
title: Item Pipeline
section: Basic Concepts
subtitle: Process extracted data by sending it through a series of sequential steps.
---

After we yield an item from our spiders, that item will be sent through the **item processing pipeline**. The processing pipeline consists of multiple **processors** (or **handlers**) that get invoked sequentially to process the item.

Check out the section on [configuring spiders](/docs/spiders#configuring-spiders) to learn how to enable item processors for our spiders.

## Writing Item Processors

An item processor is a PHP class which implements the `ItemProcessorInterface`. This interface defines only a single method that our processor has to implement.

<CodeBlock>

```php
interface ItemProcessorInterface extends ConfigurableInterface
{
  	public function processItem(ItemInterface $item): ItemInterface;
}
```

</CodeBlock>

So what are things that we can do with item processors? Here are a few suggestions to get you started.

- Save the item to a database
- Validate if the item contains all necessary data and drop it if it doesn’t
- Send an email notification if a specific item was scraped
- Add additional meta data to an item

An item processor should be focused on a single task. So instead of having one processor that validates an item, saves it to the database and sends a notification mail, we should instead write three separate processors for each of those tasks. This allows us to keep processors simple and easily testable.

Because of the plug-and-play nature of the item pipeline, we can create arbitrarily complex pipelines from simple building blocks.

### Making Processors Configurable

You may have noticed that `ItemProcessorInterface` extends the `ConfigurableInterface`. All middleware, processors and extensions in Roach implement this interface.

<CodeBlock>

```php
interface ConfigurableInterface
{
  	public function configure(array $options): void;
}
```

</CodeBlock>

This interface allows us to pass configuration options to our processors to make them more, well, configurable. Not all processors will need that kind of flexibility, however, so being forced to implement this method every time seems like a bit of a chore.

To alleviate some of the boilerplate, Roach comes with a `Configurable` trait we can use when writing our own processors. This trait provides the necessary methods to implement the `ConfigurableInterface` and allows us to define options  together with their default values via the `defaultOptions` method. This method defaults to an empty array, so there’s nothing for us to do if our processor is not providing any configuration options.

Say we want to write a processor that filters out items based on a minimum value in a given field. We want to make the threshold configurable below which an item should be dropped. Here’s what that processor might look like.

<CodeBlock>

```php
<?php

use RoachPHP\ItemPipeline\ItemInterface;
use RoachPHP\ItemPipeline\Processors\ItemProcessorInterface;
use RoachPHP\Support\Configurable;

class MinimumScoredGoalsProcessor implements ItemProcessorInterface
{
    use Configurable;

  	public function processItem(ItemInterface $item): ItemInterface
    {
      	$totalGoals = $item->get('awayGoals', 0) + $item->get('homeGoals', 0);

      	if ($totalGoals < $this->option('threshold')) {
          	return $item->drop(
                sprintf('Fewer than %s goals scored', $this->option('threshold'))
          	);
        }

      	return $item;
    }
  
  	private function defaultOptions(): array
    {
        // If not overwritten by the user, the default threshold
        // is 4. Any game with fewer goals than that will get
        // dropped.
      	return [
          	'threshold' => 4
        ];
    }
}
```

</CodeBlock>

To register this processor, we add it to the `$itemProcessors` property of our spider and specify the minimum goal threshold we want to use.

<CodeBlock>

```php
<?php

use App\ItemProcessors\MinimumScoredGoalsProcessor;
use RoachPHP\Spider\BasicSpider;

class MySpider extends BasicSpider
{
    public array $itemProcessors = [
        // We care only about games with a minimum of
        // 10 scored goals. Wow!
        [
            MinimumScoredGoalsProcessor::class,
            ['threshold' => 10],
        ],
    ];
}
```

</CodeBlock>

If we were to simply register the processor without specifying any options, it would use the default values instead.

<CodeBlock>

```php
public array $itemProcessors = [
    // No options specified, using whatever defaults are
    // defined in the processor class (4, in this example).
    MinimumScoredGoalsProcessor::class,
];
```

</CodeBlock>

### Dropping Items

We can stop an item from being processed further by calling the `drop()` method on the item.

<CodeBlock>

```php
<?php

use RoachPHP\ItemPipeline\ItemInterface;
use RoachPHP\ItemPipeline\Processors\ItemProcessorInterface;
use RoachPHP\Support\Configurable;

class ValidateMatchProcessor implements ItemProcessorInterface
{
    use Configurable;
  
  	public function processItem(ItemInterface $item): ItemInterface
    {
        if (!($item->has('score') && $item->get('score') !== null)) {
          	return $item->drop('Missing score');
        }

      	return $item;
    }
}
```

</CodeBlock>

The `drop` method takes a string as argument describing the reason the item was dropped. We can check if an item has been dropped by calling the `wasDropped` method on the item. To get the reason, we can use the `getDropReason` method.

<CodeBlock>

```php
$item->wasDropped();
// => false

$item = $item->drop('Bad breath');

$item->wasDropped();
// => true

$item->getDropReason();
// => "Bad breath"
```

</CodeBlock>

Roach will fire an `ItemDropped` event after an item was dropped. [Extensions](/docs/extensions) may subscribe to this event to react to items being dropped. For instance, Roach comes with a `LoggerExtensions` which will log whenever an item was dropped and why.

### Dependency Injection

Roach uses a [dependency injection container](/docs/dependency-injection) behind the scenes to resolve all middleware, processors and extensions. As such, we can typehint any dependency our processor needs in the constructor and have Roach attempt to autowire it for us.

<CodeBlock>

```php
<?php

use App\Repository\MatchRepository;
use RoachPHP\ItemPipeline\ItemInterface;
use RoachPHP\ItemPipeline\Processors\ItemProcessorInterface;
use RoachPHP\Support\Configurable;

class SaveMatchToDatabaseProcessor implements ItemProcessorInterface
{
    use Configurable;
  
  	public function __construct(
      private MatchRepository $repository
    ) {
    }

  	public function processItem(ItemInterface $item): ItemInterface
    {
  		$matchId = $this->repository->save($item->all());

      	return $item->set('id', $matchId);
    }
}
```

</CodeBlock>
