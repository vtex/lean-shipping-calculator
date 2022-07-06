import { getLeanShippingOptions } from '../leanShipping'

import { DELIVERY } from '../constants'
import { BASE_LOGISTICS_INFO } from './fixtures/logisticsInfo'
import { SAME_ID_LOGISTICS_INFO } from './fixtures/logisticsInfo-sameId'

import {
  SCHEDULED_DELIVERY_LOGISTICS_INFO,
  MANDATORY_SCHEDULED_DELIVERY_LOGISTICS_INFO,
  MULTIPLE_MANDATORY_SCHEDULED_DELIVERY_LOGISTICS_INFO,
} from './fixtures/logisticsInfo-scheduled-delivery'
import { DIFFERENT_SCHEDULED_DELIVERY_LOGISTICS_INFO } from './fixtures/logisticsInfo-different-scheduled-delivery'

describe('getLeanShippingOptions', () => {
  it('should get correct lean shipping options', () => {
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

  it('should get correct lean shipping options for items with same id', () => {
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

  it('should get lean shipping options even when all combinations are invalid', () => {
    const result = getLeanShippingOptions({
      activeChannel: DELIVERY,
      logisticsInfo: [
        {
          itemIndex: 0,
          selectedSla: null,
          selectedDeliveryChannel: DELIVERY,
          slas: [
            {
              id: 'A',
              deliveryChannel: DELIVERY,
              shippingEstimate: '1d',
              price: 1,
            },
          ],
        },
        {
          itemIndex: 1,
          selectedSla: null,
          selectedDeliveryChannel: DELIVERY,
          slas: [
            {
              id: 'A',
              deliveryChannel: DELIVERY,
              shippingEstimate: '1d',
              price: 1,
            },
            {
              id: 'B',
              deliveryChannel: DELIVERY,
              shippingEstimate: '1d',
              price: 1,
            },
          ],
        },
        {
          itemIndex: 2,
          selectedSla: null,
          selectedDeliveryChannel: DELIVERY,
          slas: [
            {
              id: 'B',
              deliveryChannel: DELIVERY,
              shippingEstimate: '1d',
              price: 1,
            },
          ],
        },
      ],
    })

    expect(result.cheapest).toBeDefined()
    expect(result.fastest).toBeUndefined()
  })

  // for the sake of simplicity, the cheapest option is always equal to the
  // fastest option in the tests below
  describe('should select the best SLA', () => {
    it('with 1 item and 3 SLAs', () => {
      const result = getLeanShippingOptions({
        activeChannel: DELIVERY,
        logisticsInfo: [
          {
            itemIndex: 0,
            selectedSla: null,
            selectedDeliveryChannel: DELIVERY,
            slas: [
              {
                id: 'A',
                deliveryChannel: DELIVERY,
                shippingEstimate: '2d',
                price: 2,
              },
              {
                id: 'B',
                deliveryChannel: DELIVERY,
                shippingEstimate: '1d',
                price: 1,
              },
              {
                id: 'C',
                deliveryChannel: DELIVERY,
                shippingEstimate: '3d',
                price: 3,
              },
            ],
          },
        ],
      })

      expect(result.cheapest[0].selectedSla).toEqual('B')
      expect(result.fastest).toBeUndefined()
    })
    it('with 2 items and 2 consistent SLAs', () => {
      const result = getLeanShippingOptions({
        activeChannel: DELIVERY,
        logisticsInfo: [
          {
            itemIndex: 0,
            selectedSla: null,
            selectedDeliveryChannel: DELIVERY,
            slas: [
              {
                id: 'B',
                deliveryChannel: DELIVERY,
                shippingEstimate: '3d',
                price: 3,
              },
              {
                id: 'A',
                deliveryChannel: DELIVERY,
                shippingEstimate: '1d',
                price: 1,
              },
            ],
          },
          {
            itemIndex: 1,
            selectedSla: null,
            selectedDeliveryChannel: DELIVERY,
            slas: [
              {
                id: 'B',
                deliveryChannel: DELIVERY,
                shippingEstimate: '3d',
                price: 1,
              },
              {
                id: 'A',
                deliveryChannel: DELIVERY,
                shippingEstimate: '1d',
                price: 2,
              },
            ],
          },
        ],
      })

      expect(result.cheapest[0].selectedSla).toEqual('A')
      expect(result.cheapest[1].selectedSla).toEqual('A')
      expect(result.fastest).toBeUndefined()
    })

    it('with 2 items, 1 consistent SLA and 2 splitted SLAs, where all options have the same cost', () => {
      const result = getLeanShippingOptions({
        activeChannel: DELIVERY,
        logisticsInfo: [
          {
            itemIndex: 0,
            selectedSla: null,
            selectedDeliveryChannel: DELIVERY,
            slas: [
              {
                id: 'B',
                deliveryChannel: DELIVERY,
                shippingEstimate: '1d',
                price: 1,
              },
              {
                id: 'A',
                deliveryChannel: DELIVERY,
                shippingEstimate: '1d',
                price: 2,
              },
            ],
          },
          {
            itemIndex: 1,
            selectedSla: null,
            selectedDeliveryChannel: DELIVERY,
            slas: [
              {
                id: 'C',
                deliveryChannel: DELIVERY,
                shippingEstimate: '1d',
                price: 2,
              },
              {
                id: 'A',
                deliveryChannel: DELIVERY,
                shippingEstimate: '1d',
                price: 1,
              },
            ],
          },
        ],
      })

      expect(result.cheapest[0].selectedSla).toEqual('A')
      expect(result.cheapest[1].selectedSla).toEqual('A')
      expect(result.fastest).toBeUndefined()
    })

    it('with 2 items, 1 consistent SLA and 2 splitted SLAs, where the splitted option is better', () => {
      const result = getLeanShippingOptions({
        activeChannel: DELIVERY,
        logisticsInfo: [
          {
            itemIndex: 0,
            selectedSla: null,
            selectedDeliveryChannel: DELIVERY,
            slas: [
              {
                id: 'B',
                deliveryChannel: DELIVERY,
                shippingEstimate: '1d',
                price: 2,
              },
              {
                id: 'A',
                deliveryChannel: DELIVERY,
                shippingEstimate: '2d',
                price: 2,
              },
            ],
          },
          {
            itemIndex: 1,
            selectedSla: null,
            selectedDeliveryChannel: DELIVERY,
            slas: [
              {
                id: 'A',
                deliveryChannel: DELIVERY,
                shippingEstimate: '2d',
                price: 2,
              },
              {
                id: 'C',
                deliveryChannel: DELIVERY,
                shippingEstimate: '1d',
                price: 1,
              },
            ],
          },
        ],
      })

      expect(result.cheapest[0].selectedSla).toEqual('B')
      expect(result.cheapest[1].selectedSla).toEqual('C')
      expect(result.fastest).toBeUndefined()
    })

    it('with the best SLA previously selected', () => {
      const result = getLeanShippingOptions({
        activeChannel: DELIVERY,
        logisticsInfo: [
          {
            itemIndex: 0,
            selectedSla: 'A',
            selectedDeliveryChannel: DELIVERY,
            slas: [
              {
                id: 'A',
                deliveryChannel: DELIVERY,
                shippingEstimate: '1d',
                price: 1,
              },
              {
                id: 'B',
                deliveryChannel: DELIVERY,
                shippingEstimate: '2d',
                price: 2,
              },
              {
                id: 'C',
                deliveryChannel: DELIVERY,
                shippingEstimate: '3d',
                price: 3,
              },
            ],
          },
        ],
      })

      expect(result.cheapest[0].selectedSla).toEqual('A')
      expect(result.fastest).toBeUndefined()
    })

    it('with the worse SLA previously selected', () => {
      const result = getLeanShippingOptions({
        activeChannel: DELIVERY,
        logisticsInfo: [
          {
            itemIndex: 0,
            selectedSla: 'C',
            selectedDeliveryChannel: DELIVERY,
            slas: [
              {
                id: 'A',
                deliveryChannel: DELIVERY,
                shippingEstimate: '1d',
                price: 1,
              },
              {
                id: 'B',
                deliveryChannel: DELIVERY,
                shippingEstimate: '2d',
                price: 2,
              },
              {
                id: 'C',
                deliveryChannel: DELIVERY,
                shippingEstimate: '3d',
                price: 3,
              },
            ],
          },
        ],
      })

      expect(result.cheapest[0].selectedSla).toEqual('A')
      expect(result.fastest).toBeUndefined()
    })
  })

  describe('scheduled deliveries', () => {
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
})
