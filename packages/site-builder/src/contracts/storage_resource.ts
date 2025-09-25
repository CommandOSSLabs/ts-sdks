// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { bcs } from '@mysten/sui/bcs'
import { UID } from './object'
import { MoveStruct } from './utils'

const $moduleName = '@local-pkg/walrus::storage_resource'
export const Storage = new MoveStruct({
  name: `${$moduleName}::Storage`,
  fields: {
    id: UID,
    start_epoch: bcs.u32(),
    end_epoch: bcs.u32(),
    storage_size: bcs.u64()
  }
})
