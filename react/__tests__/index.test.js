import { CHEAPEST, DELIVERY } from '../constants'
import {
  getOptionsDetails,
  getSelectedDeliveryOption,
} from '../leanShipping'
import { removeAddressValidation } from '../utils'

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

describe('removeAddressValidation', () => {
  it('should return empty object when address is undefined', () => {
    expect(removeAddressValidation(undefined)).toStrictEqual({})
  })

  it('should clean simple address object', () => {
    expect(removeAddressValidation({
      postalCode: {
        value: 'abc123',
      },
    })).toStrictEqual({
      postalCode: 'abc123',
    })
  })

  it('should not fail when address doesnt have validation', () => {
    expect(removeAddressValidation({
      postalCode: 'abc123',
    })).toStrictEqual({
      postalCode: 'abc123',
    })
  })

  it('should not fail when field is undefined', () => {
    expect(removeAddressValidation({
      postalCode: undefined,
    })).toStrictEqual({
      postalCode: undefined,
    })
  })

  it('should not fail when field value is undefined', () => {
    expect(removeAddressValidation({
      postalCode: { value: undefined },
    })).toStrictEqual({
      postalCode: null,
    })
  })
})
