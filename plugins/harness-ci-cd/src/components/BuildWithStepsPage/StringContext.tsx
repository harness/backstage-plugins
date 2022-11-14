/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'

import type { StringsMap } from './stringTypes'

export type StringKeys = keyof StringsMap

export type { StringsMap }

export interface StringsContextValue {
  data: StringsMap
  getString?(key: StringKeys, vars?: Record<string, any>): string
}

export const StringsContext = React.createContext<StringsContextValue>({} as StringsContextValue)

export function useStringsContext(): StringsContextValue {
  return React.useContext(StringsContext)
}
