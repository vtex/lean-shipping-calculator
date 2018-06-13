const cloneDeep = require('lodash/cloneDeep')

const {
  getShippingEstimateQuantityInSeconds,
  getLatestSla,
  getCheapestSla,
  getFastestSla,
  selectCheapestSlaForAllItems,
  selectFastestSlaForAllItems,
} = require('../src/index')

const { BASE_LOGISTICS_INFO } = require('./fixtures/logisticsInfo')

function getNewLogisticWithSla(logisticsInfo, slaId, shippingEstimate) {
  return cloneDeep(
    logisticsInfo.map(item => {
      return Object.assign({}, item, {
        slas: item.slas.map(sla => {
          if (sla.id === slaId) {
            return Object.assign({}, sla, { shippingEstimate })
          }
          return sla
        }),
      })
    })
  )
}

function getNewLogisticWithoutSla(logisticsInfo) {
  return cloneDeep(
    logisticsInfo.map(item => {
      return Object.assign({}, item, {
        slas: [],
      })
    })
  )
}

function getNewLogisticWithSelectedSla(
  logisticsInfo,
  selectedSla,
  selectedDeliveryChannel = 'delivery'
) {
  return cloneDeep(
    logisticsInfo.map(item => {
      return Object.assign({}, item, {
        selectedSla,
        selectedDeliveryChannel,
      })
    })
  )
}

const LOGISTICS_INFO_WITHOUT_SLAS = getNewLogisticWithoutSla(
  BASE_LOGISTICS_INFO
)
const BUSINESS_DAYS_LOGISTICS_INFO = getNewLogisticWithSla(
  BASE_LOGISTICS_INFO,
  'Expressa',
  '1bd'
)
const EXPECTED_BUSINESS_DAYS_CHEAPEST_LOGISTICS_INFO = getNewLogisticWithSelectedSla(
  BUSINESS_DAYS_LOGISTICS_INFO,
  'Normal'
)
const EXPECTED_BUSINESS_DAYS_FASTEST_LOGISTICS_INFO = getNewLogisticWithSelectedSla(
  BUSINESS_DAYS_LOGISTICS_INFO,
  'Expressa'
)

const DAYS_LOGISTICS_INFO = getNewLogisticWithSla(
  BASE_LOGISTICS_INFO,
  'Expressa',
  '2d'
)
const EXPECTED_DAYS_CHEAPEST_LOGISTICS_INFO = getNewLogisticWithSelectedSla(
  DAYS_LOGISTICS_INFO,
  'Normal'
)
const EXPECTED_DAYS_FASTEST_LOGISTICS_INFO = getNewLogisticWithSelectedSla(
  DAYS_LOGISTICS_INFO,
  'Expressa'
)

const HOURS_LOGISTICS_INFO = getNewLogisticWithSla(
  BASE_LOGISTICS_INFO,
  'Expressa',
  '20h'
)
const EXPECTED_HOURS_CHEAPEST_LOGISTICS_INFO = getNewLogisticWithSelectedSla(
  HOURS_LOGISTICS_INFO,
  'Normal'
)
const EXPECTED_HOURS_FASTEST_LOGISTICS_INFO = getNewLogisticWithSelectedSla(
  HOURS_LOGISTICS_INFO,
  'Expressa'
)

const MINS_LOGISTICS_INFO = getNewLogisticWithSla(
  BASE_LOGISTICS_INFO,
  'Expressa',
  '90m'
)
const EXPECTED_MINS_CHEAPEST_LOGISTICS_INFO = getNewLogisticWithSelectedSla(
  MINS_LOGISTICS_INFO,
  'Normal'
)
const EXPECTED_MINS_FASTEST_LOGISTICS_INFO = getNewLogisticWithSelectedSla(
  MINS_LOGISTICS_INFO,
  'Expressa'
)

describe('Check if getShippingEstimateQuantityInSeconds', () => {
  it('For nullable cases', () => {
    expect(getShippingEstimateQuantityInSeconds()).toBeNull()
    expect(getShippingEstimateQuantityInSeconds(null)).toBeNull()
    expect(getShippingEstimateQuantityInSeconds('')).toBeNull()
  })

  it('For bd unit', () => {
    expect(getShippingEstimateQuantityInSeconds('10bd')).toBe(1209600)
  })

  it('For d unit', () => {
    expect(getShippingEstimateQuantityInSeconds('10d')).toBe(864000)
  })

  it('For h unit', () => {
    expect(getShippingEstimateQuantityInSeconds('10h')).toBe(36000)
  })

  it('For m unit', () => {
    expect(getShippingEstimateQuantityInSeconds('10m')).toBe(600)
  })
})

describe('Check if getCheapestSla works', () => {
  it('For nullable cases', () => {
    expect(getCheapestSla()).toBeNull()
    expect(getCheapestSla(null)).toBeNull()
    expect(getCheapestSla([])).toBeNull()
  })

  it('For single sla case', () => {
    expect(getCheapestSla([{ id: 1, price: 50 }])).toEqual({
      id: 1,
      price: 50,
    })
  })

  it('For multiple slas cases', () => {
    expect(
      getCheapestSla([
        { id: 1, price: 50 },
        { id: 2, price: 15 },
        { id: 3, price: 100 },
      ])
    ).toEqual({ id: 2, price: 15 })
  })
})

describe('Check if getFastestSla works', () => {
  it('For nullable cases', () => {
    expect(getFastestSla()).toBeNull()
    expect(getFastestSla(null)).toBeNull()
    expect(getFastestSla([])).toBeNull()
  })

  it('For single sla case', () => {
    expect(getFastestSla([{ id: 1, shippingEstimate: '1d' }])).toEqual({
      id: 1,
      shippingEstimate: '1d',
    })
  })

  it('For multiple slas cases with bd unit', () => {
    expect(
      getFastestSla([
        { id: 1, shippingEstimate: '50bd' },
        { id: 2, shippingEstimate: '15bd' },
        { id: 3, shippingEstimate: '100bd' },
      ])
    ).toEqual({ id: 2, shippingEstimate: '15bd' })
  })

  it('For multiple slas cases with d unit', () => {
    expect(
      getFastestSla([
        { id: 1, shippingEstimate: '50d' },
        { id: 2, shippingEstimate: '15d' },
        { id: 3, shippingEstimate: '100d' },
      ])
    ).toEqual({ id: 2, shippingEstimate: '15d' })
  })

  it('For multiple slas cases with h unit', () => {
    expect(
      getFastestSla([
        { id: 1, shippingEstimate: '50h' },
        { id: 2, shippingEstimate: '15h' },
        { id: 3, shippingEstimate: '100h' },
      ])
    ).toEqual({ id: 2, shippingEstimate: '15h' })
  })

  it('For multiple slas cases with m unit', () => {
    expect(
      getFastestSla([
        { id: 1, shippingEstimate: '50m' },
        { id: 2, shippingEstimate: '15m' },
        { id: 3, shippingEstimate: '100m' },
      ])
    ).toEqual({ id: 2, shippingEstimate: '15m' })
  })

  it('For multiple slas cases mixing d and bd units', () => {
    expect(
      getFastestSla([
        { id: 1, shippingEstimate: '10bd' },
        { id: 2, shippingEstimate: '11bd' },
        { id: 3, shippingEstimate: '13d' },
      ])
    ).toEqual({ id: 3, shippingEstimate: '13d' })
  })

  it('For multiple slas cases mixing many units', () => {
    expect(
      getFastestSla([
        { id: 1, shippingEstimate: '7bd' },
        { id: 2, shippingEstimate: '8d' },
        { id: 3, shippingEstimate: '90m' },
        { id: 4, shippingEstimate: '23h' },
      ])
    ).toEqual({ id: 3, shippingEstimate: '90m' })
    expect(
      getFastestSla([
        { id: 1, shippingEstimate: '8d' },
        { id: 2, shippingEstimate: '23h' },
      ])
    ).toEqual({ id: 2, shippingEstimate: '23h' })
  })
})

describe('Check if selectCheapestSlaForAllItems works', () => {
  it('For nullable cases', () => {
    expect(selectCheapestSlaForAllItems()).toBeNull()
    expect(selectCheapestSlaForAllItems(null)).toBeNull()
    expect(selectCheapestSlaForAllItems([])).toBeNull()
  })

  it('For Empty SLAs cases', () => {
    expect(selectCheapestSlaForAllItems(LOGISTICS_INFO_WITHOUT_SLAS)).toEqual(
      LOGISTICS_INFO_WITHOUT_SLAS
    )
  })

  it('For Business Days case', () => {
    expect(selectCheapestSlaForAllItems(BUSINESS_DAYS_LOGISTICS_INFO)).toEqual(
      EXPECTED_BUSINESS_DAYS_CHEAPEST_LOGISTICS_INFO
    )
  })

  it('For Days case', () => {
    expect(selectCheapestSlaForAllItems(DAYS_LOGISTICS_INFO)).toEqual(
      EXPECTED_DAYS_CHEAPEST_LOGISTICS_INFO
    )
  })

  it('For Hours case', () => {
    expect(selectCheapestSlaForAllItems(HOURS_LOGISTICS_INFO)).toEqual(
      EXPECTED_HOURS_CHEAPEST_LOGISTICS_INFO
    )
  })

  it('For Minutes case', () => {
    expect(selectCheapestSlaForAllItems(MINS_LOGISTICS_INFO)).toEqual(
      EXPECTED_MINS_CHEAPEST_LOGISTICS_INFO
    )
  })
})

describe('Check if selectFastestSlaForAllItems works', () => {
  it('For nullable cases', () => {
    expect(selectFastestSlaForAllItems()).toBeNull()
    expect(selectFastestSlaForAllItems(null)).toBeNull()
    expect(selectFastestSlaForAllItems([])).toBeNull()
  })

  it('For Empty SLAs cases', () => {
    expect(selectFastestSlaForAllItems(LOGISTICS_INFO_WITHOUT_SLAS)).toEqual(
      LOGISTICS_INFO_WITHOUT_SLAS
    )
  })

  it('For Business Days case', () => {
    expect(selectFastestSlaForAllItems(BUSINESS_DAYS_LOGISTICS_INFO)).toEqual(
      EXPECTED_BUSINESS_DAYS_FASTEST_LOGISTICS_INFO
    )
  })

  it('For Days case', () => {
    expect(selectFastestSlaForAllItems(DAYS_LOGISTICS_INFO)).toEqual(
      EXPECTED_DAYS_FASTEST_LOGISTICS_INFO
    )
  })

  it('For Hours case', () => {
    expect(selectFastestSlaForAllItems(HOURS_LOGISTICS_INFO)).toEqual(
      EXPECTED_HOURS_FASTEST_LOGISTICS_INFO
    )
  })

  it('For Minutes case', () => {
    expect(selectFastestSlaForAllItems(MINS_LOGISTICS_INFO)).toEqual(
      EXPECTED_MINS_FASTEST_LOGISTICS_INFO
    )
  })
})

describe('Check if getFastestSla works', () => {
  it('For nullable cases', () => {
    expect(getLatestSla()).toBeNull()
    expect(getLatestSla(null)).toBeNull()
    expect(getLatestSla([])).toBeNull()
  })

  it('For single sla case', () => {
    expect(getLatestSla([{ id: 1, shippingEstimate: '1d' }])).toEqual({
      id: 1,
      shippingEstimate: '1d',
    })
  })

  it('For multiple slas cases with bd unit', () => {
    expect(
      getLatestSla([
        { id: 1, shippingEstimate: '50bd' },
        { id: 2, shippingEstimate: '15bd' },
        { id: 3, shippingEstimate: '100bd' },
      ])
    ).toEqual({ id: 3, shippingEstimate: '100bd' })
  })

  it('For multiple slas cases with d unit', () => {
    expect(
      getLatestSla([
        { id: 1, shippingEstimate: '50d' },
        { id: 2, shippingEstimate: '15d' },
        { id: 3, shippingEstimate: '100d' },
      ])
    ).toEqual({ id: 3, shippingEstimate: '100d' })
  })

  it('For multiple slas cases with h unit', () => {
    expect(
      getLatestSla([
        { id: 1, shippingEstimate: '50h' },
        { id: 2, shippingEstimate: '15h' },
        { id: 3, shippingEstimate: '100h' },
      ])
    ).toEqual({ id: 3, shippingEstimate: '100h' })
  })

  it('For multiple slas cases with m unit', () => {
    expect(
      getLatestSla([
        { id: 1, shippingEstimate: '50m' },
        { id: 2, shippingEstimate: '15m' },
        { id: 3, shippingEstimate: '100m' },
      ])
    ).toEqual({ id: 3, shippingEstimate: '100m' })
  })

  it('For multiple slas cases mixing d and bd units', () => {
    expect(
      getLatestSla([
        { id: 1, shippingEstimate: '10bd' },
        { id: 2, shippingEstimate: '11bd' },
        { id: 3, shippingEstimate: '13d' },
      ])
    ).toEqual({ id: 2, shippingEstimate: '11bd' })
  })

  it('For multiple slas cases mixing many units', () => {
    expect(
      getLatestSla([
        { id: 1, shippingEstimate: '7bd' },
        { id: 2, shippingEstimate: '8d' },
        { id: 3, shippingEstimate: '90m' },
        { id: 4, shippingEstimate: '23h' },
      ])
    ).toEqual({ id: 1, shippingEstimate: '7bd' })
    expect(
      getLatestSla([
        { id: 1, shippingEstimate: '8d' },
        { id: 2, shippingEstimate: '23h' },
      ])
    ).toEqual({ id: 1, shippingEstimate: '8d' })
  })
})
