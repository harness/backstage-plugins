/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react';
import { get } from 'lodash-es';

import { useStringsContext, StringKeys } from './StringContext';

export interface UseStringsReturn {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getString(key: StringKeys, vars?: Record<string, any>): string;
}

export function useStrings(): UseStringsReturn {
  const { data: strings, getString } = useStringsContext();

  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getString(key: StringKeys, vars: Record<string, any> = {}) {
      if (typeof getString === 'function') {
        return getString(key, vars);
      }

      const template = get(strings, key);

      if (typeof template !== 'string') {
        throw new Error(
          `No valid template with id "${key}" found in any namespace`,
        );
      }

      return template;
    },
  };
}

export interface StringProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLElement>,
    HTMLElement
  > {
  stringID: StringKeys;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  vars?: Record<string, any>;
  useRichText?: boolean;
  tagName: keyof JSX.IntrinsicElements;
}

export function String(props: StringProps): React.ReactElement | null {
  const { stringID, vars, useRichText, tagName: Tag, ...rest } = props;
  const { getString } = useStrings();

  try {
    const text = getString(stringID, vars);

    return useRichText ? (
      <Tag {...(rest as object)} dangerouslySetInnerHTML={{ __html: text }} />
    ) : (
      <Tag {...(rest as object)}>{text}</Tag>
    );
  } catch (e: any) {
    if (process.env.NODE_ENV !== 'production') {
      return <Tag style={{ color: 'var(--red-500)' }}>{e.message}</Tag>;
    }

    return null;
  }
}

String.defaultProps = {
  tagName: 'span',
};
