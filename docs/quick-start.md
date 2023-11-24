# Quick Start

## Installation

You can install `ember-data-factory-guy` using the Ember package installer:

```bash
ember install ember-data-factory-guy
```

Or you can install it using your favorite package manager:

```bash
npm install ember-data-factory-guy --save-dev
```

```bash
yarn add --dev ember-data-factory-guy
```

```bash
pnpm add -D ember-data-factory-guy
```

## How it works

Factory Guy works by:

- defining factories for your models
- use them to create records in the Store using the built-in build strategies.

The build strategies allow you to either create new records, persisted ones, or just build a JSON payload for your model
for mocking an HTTP request's payload.
