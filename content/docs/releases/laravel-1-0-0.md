---
title: laravel@1.0.0
section: Releases
subtitle: Released on April 19, 2022
---

- Dropped support for Laravel 8
- Added support for `roach-php/core:^1.0.0`
- Add `spider_default_namespace` configuration option to define the default namespace `artisan roach:run` and `artisan roach:spider` use to determine the namespace of a spider
- Fixed bug where `artisan roach:run` command would sometimes not correctly parse namespaces (fixes [#11](https://github.com/roach-php/laravel/issues/11))