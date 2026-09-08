module.exports = require('@backstage/cli/config/eslint-factory')(__dirname, {
  // Repo tsconfig still uses classic JSX (`jsx: "react"`) because this
  // monorepo is on @backstage/cli 0.25. Switching the root to `react-jsx`
  // would make `import React from 'react'` unused across every other plugin
  // (`noUnusedLocals`). CLI 0.34 still flags those imports; keep classic JSX
  // for this package instead of rewriting every file.
  rules: {
    'no-restricted-syntax': 'off',
  },
  parserOptions: {
    lib: ['DOM', 'DOM.Iterable', 'ScriptHost', 'ES2022'],
  },
});
