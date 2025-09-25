// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import type { BcsType } from '@mysten/sui/bcs'
import { BcsStruct } from '@mysten/sui/bcs'

export class MoveStruct<
  // biome-ignore lint/suspicious/noExplicitAny: no issue
  T extends Record<string, BcsType<any>>,
  const Name extends string = string
> extends BcsStruct<T, Name> {}
