# How To Contribute

## Installation

- `git clone <repository-url>`
- `cd ember-data-factory-guy`
- `pnpm install`

## Linting

- `pnpm lint`
- `pnpm lint:fix`
- `pnpm lint:js`
- `pnpm lint:hbs`
- `pnpm lint:prettier`
- `pnpm lint:prettier:fix`

## Running tests

- `pnpm test` - Builds the addon and runs test-app tests from the repository root

From the repository root you can also run package-scoped commands:

- `pnpm --filter ember-data-factory-guy build` - Build only the addon package
- `pnpm --filter test-app test` - Run tests on the current Ember version
- `pnpm --filter test-app test:ember -- --server` - Run tests in "watch mode"
- `pnpm --filter test-app test:ember-compatibility` - Run tests against multiple Ember versions

## Running the test-app application

- `pnpm --filter test-app exec ember serve`
- Visit the test-app application at [http://localhost:4200](http://localhost:4200).

For more information on using ember-cli, visit [https://ember-cli.com/](https://ember-cli.com/).
