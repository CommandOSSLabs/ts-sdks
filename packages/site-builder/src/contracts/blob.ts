// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { bcs } from '@mysten/sui/bcs'
import { UID } from './object'
import { Storage } from './storage_resource'
import { MoveStruct } from './utils'

const $moduleName = '@local-pkg/walrus::blob'
export const Blob = new MoveStruct({
  name: `${$moduleName}::Blob`,
  fields: {
    id: UID,
    registered_epoch: bcs.u32(),
    blob_id: bcs.u256(),
    size: bcs.u64(),
    encoding_type: bcs.u8(),
    certified_epoch: bcs.option(bcs.u32()),
    storage: Storage,
    deletable: bcs.bool()
  }
})
