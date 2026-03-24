import { describe, it, expect } from 'vitest'
import { artCropHeight, ART_BASE_HEIGHT } from './crop'

describe('artCropHeight', () => {
  it('returns full base height when crop is 0', () => {
    expect(artCropHeight(0)).toBe(ART_BASE_HEIGHT)
  })

  it('returns full base height when crop is undefined', () => {
    expect(artCropHeight(undefined)).toBe(ART_BASE_HEIGHT)
  })

  it('returns full base height when crop is negative', () => {
    expect(artCropHeight(-10)).toBe(ART_BASE_HEIGHT)
  })

  it('crops 50% correctly', () => {
    expect(artCropHeight(50)).toBe(150)
  })

  it('crops 30% correctly', () => {
    expect(artCropHeight(30)).toBe(210)
  })

  it('crops 25% correctly', () => {
    expect(artCropHeight(25)).toBe(225)
  })

  it('crops 70% correctly', () => {
    expect(artCropHeight(70)).toBe(90)
  })

  it('returns 0 when crop is 100', () => {
    expect(artCropHeight(100)).toBe(0)
  })

  it('returns 0 when crop exceeds 100', () => {
    expect(artCropHeight(120)).toBe(0)
  })

  it('result is always a whole number', () => {
    // 33% of 300 = 201 (rounded)
    expect(Number.isInteger(artCropHeight(33))).toBe(true)
  })
})
