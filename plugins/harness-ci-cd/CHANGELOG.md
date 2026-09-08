# @harnessio/backstage-plugin-ci-cd

## 1.0.0

### Breaking Changes

- Requires **Backstage 1.53**, **React 18**, and **Node 22 or 24** (Backstage’s supported runtimes since 1.46). Hosts on older Backstage must stay on **0.11.0**.
- `peerDependencies.react` is now `^18.0.0` (previously `^16 \|\| ^17`).
- `@backstage/*` dependencies are aligned to the 1.53 release line (`plugin-catalog-react` v3, `core-components` 0.18, etc.).
- `MissingAnnotationEmptyState` is imported from `@backstage/plugin-catalog-react` (removed from `@backstage/core-components`).

### Minor Changes

- Adds a new frontend system entry at `@harnessio/backstage-plugin-ci-cd/alpha` (`EntityContentBlueprint` for the Harness CI/CD entity tab).
- Declares `backstage.pluginId` / package metadata required by Backstage 1.50+.

### Migration

```diff
- yarn add --cwd packages/app @harnessio/backstage-plugin-ci-cd
+ yarn add --cwd packages/app @harnessio/backstage-plugin-ci-cd@^1.0.0
```

Existing catalogs that already pin `0.11.0` or `^0.11.0` are unaffected. `^0.11.0` does not include `1.0.0`.

## 0.2.0

### Minor Changes

- 3a6d88f6e3: First implementation of the Harness NextGen CI/CD(https://harness.io/) plugin. For more information refer to it's README.md.

### Patch Changes

- Updated dependencies
  - @backstage/core-components@0.11.1
  - @backstage/core-plugin-api@1.0.6
