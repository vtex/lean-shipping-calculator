const {
  getLeanShippingOptions,
  getOptionsDetails,
  getSelectedDeliveryOption,
} = require('../src/index')

const { BASE_LOGISTICS_INFO } = require('./fixtures/logisticsInfo')

describe('Check if getLeanShippingOptions', () => {
  it('For correct lean shipping options', () => {
    expect(getLeanShippingOptions()).toBeNull()
  })
})

describe('Check if getOptionsDetails', () => {
  it('For correct lean shipping options details', () => {
    expect(getOptionsDetails()).toBeNull()
  })
})

describe('Check if getSelectedDeliveryOption', () => {
  it('For correct selected delivery option', () => {
    expect(getSelectedDeliveryOption()).toBeNull()
  })
})
