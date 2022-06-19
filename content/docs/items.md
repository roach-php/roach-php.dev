---
title: Items
section: Basic Concepts
subtitle: An abstraction about data extracted from web documents.
---

Items represent data that was extracted from documents. They are simple abstraction around PHP arrays that are more comfortable to work with than plain arrays.

## Using Items

Since an `Item` is just a simple wrapper around a plain PHP array, it has a rather straight-forward API.

<CodeBlock>

```php
<?php
  
use RoachPHP\Support\DroppableInterface;
  
interface ItemInterface extends DroppableInterface, ArrayAccess
{
    /**
     * Returns the underlying data array.
     */
  	public function all(): array;
  
  	/**
  	 * Set a value on the item for the provided `$key`.
  	 */
  	public function set(string $key, mixed $value): self;
  
    /**
     * Retrieve the value for `$key` or return `$default` instead.
     */
    public function get(string $key, mixed $default = null): mixed;
  
  	/**
  	 * Checks if `$key` exists on the item. Note that this checks
  	 * if `$key` exists on the underlying data array, not if the
  	 * value is truthy.
  	 */
  	public function has(string $key): bool;
}
```

</CodeBlock>

Most of the time, you won’t directly create instances of an `Item`, but use the spider’s `item()` method instead. When writing [`ItemProcessors`](/docs/item-pipeline), however, this is the interface you will be dealing with.
