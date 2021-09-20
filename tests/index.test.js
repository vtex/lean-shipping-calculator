import { CHEAPEST, DELIVERY } from '../react/constants'
import {
  getOptionsDetails,
  getSelectedDeliveryOption,
} from '../react/leanShipping'

describe('getOptionDetails', () => {
  it('should get correct lean shipping options details', () => {
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
        averageEstimatePerItem: 24 * 60 * 60,
        id: 'CHEAPEST',
        packagesLength: 1,
        price: 100,
        shippingEstimate: '1d',
        shippingEstimateInSeconds: 24 * 60 * 60,
      },
    ]

    expect(resultDetails).toEqual(expectedResult)
  })
})

describe('getSelectedDeliveryOption', () => {
  it('should select correct delivery option', () => {
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
