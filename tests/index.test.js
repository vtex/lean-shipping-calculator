import { CHEAPEST, DELIVERY } from '../react/constants'
import {
  getOptionsDetails,
  getSelectedDeliveryOption,
} from '../react/leanShipping'

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
              shippingEstimate: '1d',
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
        shippingEstimate: '1d',
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
