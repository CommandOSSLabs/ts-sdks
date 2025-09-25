// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

/** Sui object identifiers */

import { bcs } from '@mysten/sui/bcs'
import { MoveStruct } from './utils'

const $moduleName = '0x2::object'
export const UID = new MoveStruct({
  name: `${$moduleName}::UID`,
  fields: {
    id: bcs.Address
  }
})
