import { CHEAPEST, DELIVERY } from '../src/constants'
const {
  getLeanShippingOptions,
  getOptionsDetails,
  getSelectedDeliveryOption,
} = require('../src/index')

const { BASE_LOGISTICS_INFO } = require('./fixtures/logisticsInfo')
const { SAME_ID_LOGISTICS_INFO } = require('./fixtures/logisticsInfo-sameId')

describe('Check if getLeanShippingOptions', () => {
  it('For correct lean shipping options', () => {
    const resultLogisticsInfo = getLeanShippingOptions(BASE_LOGISTICS_INFO)

    expect(resultLogisticsInfo.cheapest[0].selectedSla).toEqual('Normal')
    expect(resultLogisticsInfo.cheapest[1].selectedSla).toEqual('Normal')
    expect(resultLogisticsInfo.fastest[0].selectedSla).toEqual('Expressa')
    expect(resultLogisticsInfo.fastest[1].selectedSla).toEqual('Expressa')
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

    const resultLogisticsInfo = getLeanShippingOptions(SAME_ID_LOGISTICS_INFO)

    expect(resultLogisticsInfo.cheapest[0].selectedSla).toEqual(
      expectedResult.cheapest[0].selectedSla
    )
    expect(resultLogisticsInfo.cheapest[1].selectedSla).toEqual(
      expectedResult.cheapest[1].selectedSla
    )
    expect(resultLogisticsInfo.fastest[0].selectedSla).toEqual(
      expectedResult.fastest[0].selectedSla
    )
    expect(resultLogisticsInfo.fastest[1].selectedSla).toEqual(
      expectedResult.fastest[1].selectedSla
    )
  })
})

describe('Check if getOptionsDetails', () => {
  it('For correct lean shipping options details', () => {
    const delivery = {
      [CHEAPEST]: [
        {
          selectedDeliveryChannel: DELIVERY,
          selectedSla: 'Normal',
          slas: [
            {
              id: 'Normal',
              price: 100,
              deliveryChannel: DELIVERY,
              shippingEstimate: '1bd',
            },
          ],
        },
      ],
    }

    const resultDetails = getOptionsDetails(delivery)

    const expectedResult = [
      {
        averageEstimatePerItem: 86400,
        id: 'CHEAPEST',
        packagesLength: 1,
        price: 100,
        shippingEstimate: '1bd',
      },
    ]

    expect(resultDetails).toEqual(expectedResult)
  })
})

describe('Check if getSelectedDeliveryOption', () => {
  it('For correct selected delivery option', () => {
    const delivery = {
      CHEAPEST: [
        {
          selectedSla: 'Normal',
          slas: [
            {
              id: 'Normal',
              price: 100,
              shippingEstimate: '1bd',
            },
          ],
        },
      ],
    }

    const resultDeliveryOption = getSelectedDeliveryOption({
      newCheapest: delivery['CHEAPEST'],
    })

    expect(resultDeliveryOption).toEqual('CHEAPEST')
  })
})
