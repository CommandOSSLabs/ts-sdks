import { style } from '@vanilla-extract/css'

export const container = style({
  height: '100%',
  width: '100%',
  position: 'relative'
})

export const canvas = style({
  pointerEvents: 'none'
})
