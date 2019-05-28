import { getLeanShippingOptions } from '../react/leanShipping'

import { DELIVERY } from '../react/constants'
import { BASE_LOGISTICS_INFO } from './fixtures/logisticsInfo'
import { SAME_ID_LOGISTICS_INFO } from './fixtures/logisticsInfo-sameId'

import {
  SCHEDULED_DELIVERY_LOGISTICS_INFO,
  MANDATORY_SCHEDULED_DELIVERY_LOGISTICS_INFO,
  MULTIPLE_MANDATORY_SCHEDULED_DELIVERY_LOGISTICS_INFO,
} from './fixtures/logisticsInfo-scheduled-delivery'
import { DIFFERENT_SCHEDULED_DELIVERY_LOGISTICS_INFO } from './fixtures/logisticsInfo-different-scheduled-delivery'

describe('Check if getLeanShippingOptions', () => {
  it('For correct lean shipping options', () => {
    const result = getLeanShippingOptions({
      logisticsInfo: BASE_LOGISTICS_INFO,
      activeChannel: DELIVERY,
    })

    const expectedResult = {
      cheapest: [
        {
          selectedSla: 'Normal',
        },
        {
          selectedSla: 'Normal',
        },
      ],
      fastest: [
        {
          selectedSla: 'Expressa',
        },
        {
          selectedSla: 'Expressa',
        },
      ],
    }

    expect(result.cheapest[0].selectedSla).toEqual(
      expectedResult.cheapest[0].selectedSla
    )
    expect(result.cheapest[1].selectedSla).toEqual(
      expectedResult.cheapest[1].selectedSla
    )
    expect(result.fastest[0].selectedSla).toEqual(
      expectedResult.fastest[0].selectedSla
    )
    expect(result.fastest[1].selectedSla).toEqual(
      expectedResult.fastest[1].selectedSla
    )
  })

  it('For correct lean shipping options for same itemId items', () => {
    const expectedResult = {
      cheapest: [
        {
          selectedSla: 'Normal',
        },
        {
          selectedSla: 'Normal',
        },
      ],
      fastest: [
        {
          selectedSla: 'Expressa',
        },
        {
          selectedSla: 'Expressa',
        },
      ],
    }

    const result = getLeanShippingOptions({
      logisticsInfo: SAME_ID_LOGISTICS_INFO,
      activeChannel: DELIVERY,
    })

    expect(result.cheapest[0].selectedSla).toEqual(
      expectedResult.cheapest[0].selectedSla
    )
    expect(result.cheapest[1].selectedSla).toEqual(
      expectedResult.cheapest[1].selectedSla
    )
    expect(result.fastest[0].selectedSla).toEqual(
      expectedResult.fastest[0].selectedSla
    )
    expect(result.fastest[1].selectedSla).toEqual(
      expectedResult.fastest[1].selectedSla
    )
  })

  it('should select scheduled delivery if has mandatory scheduled delivery', () => {
    const result = getLeanShippingOptions({
      logisticsInfo: MANDATORY_SCHEDULED_DELIVERY_LOGISTICS_INFO,
      activeChannel: DELIVERY,
    })

    const expectedResult = {
      cheapest: [
        {
          selectedSla: 'agendada',
        },
        {
          selectedSla: 'agendada',
        },
      ],
    }

    expect(result.cheapest[0].selectedSla).toEqual(
      expectedResult.cheapest[0].selectedSla
    )
    expect(result.cheapest[1].selectedSla).toEqual(
      expectedResult.cheapest[1].selectedSla
    )
    expect(result.fastest).toBeUndefined()
  })

  it('should select mandatory scheduled delivery even if has other type of scheduled scheduled', () => {
    const result = getLeanShippingOptions({
      logisticsInfo: DIFFERENT_SCHEDULED_DELIVERY_LOGISTICS_INFO,
      activeChannel: DELIVERY,
    })

    const expectedResult = {
      cheapest: [
        {
          selectedSla: 'agendada',
        },
        {
          selectedSla: 'outra agendada',
        },
      ],
    }

    expect(result.cheapest[0].selectedSla).toEqual(
      expectedResult.cheapest[0].selectedSla
    )
    expect(result.cheapest[1].selectedSla).toEqual(
      expectedResult.cheapest[1].selectedSla
    )
    expect(result.fastest).toBeUndefined()
  })

  it('should NOT select scheduled delivery if has scheduled delivery but NOT mandatory', () => {
    const result = getLeanShippingOptions({
      logisticsInfo: SCHEDULED_DELIVERY_LOGISTICS_INFO,
      activeChannel: DELIVERY,
    })

    const expectedResult = {
      cheapest: [
        {
          selectedSla: 'Expressa',
        },
        {
          selectedSla: 'Expressa',
        },
      ],
    }

    expect(result.cheapest[0].selectedSla).toEqual(
      expectedResult.cheapest[0].selectedSla
    )
    expect(result.cheapest[1].selectedSla).toEqual(
      expectedResult.cheapest[1].selectedSla
    )
    expect(result.fastest).toBeUndefined()
  })

  it('should maintain selected scheduled delivery', () => {
    const result = getLeanShippingOptions({
      logisticsInfo: MULTIPLE_MANDATORY_SCHEDULED_DELIVERY_LOGISTICS_INFO,
      activeChannel: DELIVERY,
    })

    const expectedResult = {
      cheapest: [
        {
          selectedSla: 'outra agendada',
        },
        {
          selectedSla: 'outra agendada',
        },
      ],
    }

    expect(result.cheapest[0].selectedSla).toEqual(
      expectedResult.cheapest[0].selectedSla
    )
    expect(result.cheapest[1].selectedSla).toEqual(
      expectedResult.cheapest[1].selectedSla
    )
    expect(result.fastest).toBeUndefined()
  })
})
