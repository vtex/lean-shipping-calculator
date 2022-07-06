import {
  changeActiveSlas,
  setSelectedSlaFromSlaOption,
} from '../changeActiveSlas'
import { DELIVERY, PICKUP_IN_STORE } from '../constants'
import {
  ONLY_DELIVERY_NO_SLAS_LOGISTICS_INFO,
  ONLY_DELIVERY_LOGISTICS_INFO,
  DELIVERY_PICKUP_LOGISTICS_INFO,
  PICKUP_SELECTED_LOGISTICS_INFO,
  MULTIPLE_SELLERS_LOGISTICS_INFO,
  MULTIPLE_DELIVERY_PICKUP_LOGISTICS_INFO,
  NO_PICKUP_SELECTED_LOGISTICS_INFO,
} from './fixtures/logisticsInfo-changeActiveSlas'

describe('changeActiveSlas', () => {
  it('simple switch with no SLAs', () => {
    const logisticsInfo = ONLY_DELIVERY_NO_SLAS_LOGISTICS_INFO
    const action = {
      address: {
        addressId: { value: 'residentialId' },
        addressType: { value: 'residential' },
        postalCode: { value: 'testPostalCode' },
      },
      searchAddress: {
        addressId: { value: 'searchId' },
        addressType: { value: 'search' },
        postalCode: { value: 'testPostalCode' },
      },
    }
    const items = [{ seller: '1' }]
    const sellers = [{ id: '1' }]
    const canEditData = true
    const slaOption = null

    const result = changeActiveSlas({
      logisticsInfo,
      action,
      items,
      sellers,
      channel: PICKUP_IN_STORE,
      canEditData,
      slaOption,
    })

    expect(result[0].selectedDeliveryChannel).toEqual(PICKUP_IN_STORE)
    expect(result[0].addressId).toEqual('searchId')

    const result2 = changeActiveSlas({
      logisticsInfo,
      action,
      items,
      sellers,
      channel: DELIVERY,
      canEditData,
      slaOption,
    })
    expect(result2[0].selectedDeliveryChannel).toEqual(DELIVERY)
    expect(result2[0].addressId).toEqual('residentialId')
  })

  it('simple switch with one logistics info with ONLY Delivery', () => {
    const logisticsInfo = ONLY_DELIVERY_LOGISTICS_INFO
    const action = {
      address: {
        addressId: { value: 'residentialId' },
        addressType: { value: 'residential' },
        postalCode: { value: 'testPostalCode' },
      },
      searchAddress: {
        addressId: { value: 'searchId' },
        addressType: { value: 'search' },
        postalCode: { value: 'testPostalCode' },
      },
    }
    const items = [{ seller: '1' }]
    const sellers = [{ id: '1' }]
    const canEditData = true
    const slaOption = null

    const result = changeActiveSlas({
      logisticsInfo,
      action,
      items,
      sellers,
      channel: PICKUP_IN_STORE,
      canEditData,
      slaOption,
    })

    expect(result[0].selectedDeliveryChannel).toEqual(DELIVERY)
    expect(result[0].addressId).toEqual('residentialId')
  })

  it('switch with one logistics info with both Delivery Channels and has slas', () => {
    const logisticsInfo = DELIVERY_PICKUP_LOGISTICS_INFO
    const action = {
      address: {
        addressId: { value: 'residentialId' },
        addressType: { value: 'residential' },
        postalCode: { value: 'testPostalCode' },
      },
      searchAddress: {
        addressId: { value: 'searchId' },
        addressType: { value: 'search' },
        postalCode: { value: 'testPostalCode' },
      },
    }
    const items = [{ seller: '1' }]
    const sellers = [{ id: '1' }]
    const canEditData = true
    const slaOption = null

    const result = changeActiveSlas({
      logisticsInfo,
      action,
      items,
      sellers,
      channel: PICKUP_IN_STORE,
      canEditData,
      slaOption,
    })

    expect(result[0].selectedDeliveryChannel).toEqual(PICKUP_IN_STORE)
    expect(result[0].selectedSla).toEqual('pickupSla')
    expect(result[0].addressId).toEqual('searchId')
  })

  it('switches with multiple logistics info with both Delivery Channels and has slas but one does not have pickup', () => {
    const logisticsInfo = MULTIPLE_DELIVERY_PICKUP_LOGISTICS_INFO
    const action = {
      address: {
        addressId: { value: 'residentialId' },
        addressType: { value: 'residential' },
        postalCode: { value: 'testPostalCode' },
      },
      searchAddress: {
        addressId: { value: 'searchId' },
        addressType: { value: 'search' },
        postalCode: { value: 'testPostalCode' },
      },
    }
    const items = [{ seller: '1' }]
    const sellers = [{ id: '1' }]
    const canEditData = true
    const slaOption = null

    const result = changeActiveSlas({
      logisticsInfo,
      action,
      items,
      sellers,
      channel: PICKUP_IN_STORE,
      canEditData,
      slaOption,
    })

    expect(result[0].selectedDeliveryChannel).toEqual(PICKUP_IN_STORE)
    expect(result[0].selectedSla).toEqual('pickupSla')
    expect(result[0].addressId).toEqual('searchId')
    expect(result[1].selectedDeliveryChannel).toEqual(DELIVERY)
    expect(result[1].selectedSla).toEqual('deliverySLA')
    expect(result[1].addressId).toEqual('residentialId')
  })

  it('switch with one logistics info with both Delivery Channels and an active pickup point', () => {
    const logisticsInfo = PICKUP_SELECTED_LOGISTICS_INFO
    const action = {
      address: {
        addressId: { value: 'residentialId' },
        addressType: { value: 'residential' },
        postalCode: { value: 'testPostalCode' },
      },
      searchAddress: {
        addressId: { value: 'searchId' },
        addressType: { value: 'search' },
        postalCode: { value: 'testPostalCode' },
      },
    }
    const items = [{ seller: '1' }]
    const sellers = [{ id: '1' }]
    const canEditData = true
    const slaOption = 'pickupSlaSelected'

    const result = changeActiveSlas({
      logisticsInfo,
      action,
      items,
      sellers,
      channel: PICKUP_IN_STORE,
      canEditData,
      slaOption,
    })

    expect(result[0].selectedDeliveryChannel).toEqual(PICKUP_IN_STORE)
    expect(result[0].selectedSla).toEqual('pickupSlaSelected')
    expect(result[0].addressId).toEqual('searchId')
  })

  it('switches with one logistics info with both Delivery Channels and no pickup points', () => {
    const logisticsInfo = NO_PICKUP_SELECTED_LOGISTICS_INFO
    const action = {
      address: {
        addressId: { value: 'residentialId' },
        addressType: { value: 'residential' },
        postalCode: { value: 'testPostalCode' },
      },
      searchAddress: {
        addressId: { value: 'searchId' },
        addressType: { value: 'search' },
        postalCode: { value: 'testPostalCode' },
      },
    }
    const items = [{ seller: '1' }]
    const sellers = [{ id: '1' }]
    const canEditData = true
    const slaOption = 'pickupSlaSelected'

    const result = changeActiveSlas({
      logisticsInfo,
      action,
      items,
      sellers,
      channel: PICKUP_IN_STORE,
      canEditData,
      slaOption,
    })

    expect(result[0].selectedDeliveryChannel).toEqual(PICKUP_IN_STORE)
    expect(result[0].selectedSla).toBeNull()
    expect(result[0].addressId).toEqual('searchId')
  })

  it('switch with multiple logistics info and multiple sellers with both Delivery Channels and an active pickup point', () => {
    const logisticsInfo = MULTIPLE_SELLERS_LOGISTICS_INFO
    const action = {
      address: {
        addressId: { value: 'residentialId' },
        addressType: { value: 'residential' },
        postalCode: { value: 'testPostalCode' },
      },
      searchAddress: {
        addressId: { value: 'searchId' },
        addressType: { value: 'search' },
        postalCode: { value: 'testPostalCode' },
      },
    }
    const items = [{ seller: '1' }, { seller: '2' }]
    const sellers = [{ id: '1' }, { id: '2' }]
    const canEditData = true
    const slaOption = null

    const result = changeActiveSlas({
      logisticsInfo,
      action,
      items,
      sellers,
      channel: PICKUP_IN_STORE,
      canEditData,
      slaOption,
    })

    expect(result[0].selectedDeliveryChannel).toEqual(PICKUP_IN_STORE)
    expect(result[0].selectedSla).toEqual('pickupSeller1')
    expect(result[0].addressId).toEqual('searchId')
    expect(result[1].selectedDeliveryChannel).toEqual(PICKUP_IN_STORE)
    expect(result[1].selectedSla).toEqual('pickupSeller2')
    expect(result[1].addressId).toEqual('searchId')
  })
})

describe('setSelectedSlaFromSlaOption', () => {
  it('simple switch with no SLAs', () => {
    const logisticsInfo = ONLY_DELIVERY_NO_SLAS_LOGISTICS_INFO
    const action = {
      address: {
        addressId: { value: 'residentialId' },
        addressType: { value: 'residential' },
        postalCode: { value: 'testPostalCode' },
      },
      searchAddress: {
        addressId: { value: 'searchId' },
        addressType: { value: 'search' },
        postalCode: { value: 'testPostalCode' },
      },
    }
    const items = [{ seller: '1' }]
    const sellers = [{ id: '1' }]
    const canEditData = true
    const slaOption = null

    const result = setSelectedSlaFromSlaOption({
      logisticsInfo,
      action,
      items,
      sellers,
      channel: PICKUP_IN_STORE,
      canEditData,
      slaOption,
    })

    expect(result[0].selectedDeliveryChannel).toEqual(PICKUP_IN_STORE)
    expect(result[0].addressId).toEqual('searchId')

    const result2 = setSelectedSlaFromSlaOption({
      logisticsInfo,
      action,
      items,
      sellers,
      channel: DELIVERY,
      canEditData,
      slaOption,
    })
    expect(result2[0].selectedDeliveryChannel).toEqual(DELIVERY)
    expect(result2[0].addressId).toEqual('residentialId')
  })

  it('simple switch with one logistics info with ONLY Delivery', () => {
    const logisticsInfo = ONLY_DELIVERY_LOGISTICS_INFO
    const action = {
      address: {
        addressId: { value: 'residentialId' },
        addressType: { value: 'residential' },
        postalCode: { value: 'testPostalCode' },
      },
      searchAddress: {
        addressId: { value: 'searchId' },
        addressType: { value: 'search' },
        postalCode: { value: 'testPostalCode' },
      },
    }
    const items = [{ seller: '1' }]
    const sellers = [{ id: '1' }]
    const canEditData = true
    const slaOption = null

    const result = setSelectedSlaFromSlaOption({
      logisticsInfo,
      action,
      items,
      sellers,
      channel: PICKUP_IN_STORE,
      canEditData,
      slaOption,
    })

    expect(result[0].selectedDeliveryChannel).toEqual(DELIVERY)
    expect(result[0].addressId).toEqual('residentialId')
  })

  it('switch with one logistics info with both Delivery Channels and has slas', () => {
    const logisticsInfo = DELIVERY_PICKUP_LOGISTICS_INFO
    const action = {
      address: {
        addressId: { value: 'residentialId' },
        addressType: { value: 'residential' },
        postalCode: { value: 'testPostalCode' },
      },
      searchAddress: {
        addressId: { value: 'searchId' },
        addressType: { value: 'search' },
        postalCode: { value: 'testPostalCode' },
      },
    }
    const items = [{ seller: '1' }]
    const sellers = [{ id: '1' }]
    const canEditData = true
    const slaOption = null

    const result = setSelectedSlaFromSlaOption({
      logisticsInfo,
      action,
      items,
      sellers,
      channel: PICKUP_IN_STORE,
      canEditData,
      slaOption,
    })

    expect(result[0].selectedDeliveryChannel).toEqual(PICKUP_IN_STORE)
    expect(result[0].selectedSla).toEqual('pickupSla')
    expect(result[0].addressId).toEqual('searchId')
  })

  it('switch with one logistics info with both Delivery Channels and an active pickup point', () => {
    const logisticsInfo = PICKUP_SELECTED_LOGISTICS_INFO
    const action = {
      address: {
        addressId: { value: 'residentialId' },
        addressType: { value: 'residential' },
        postalCode: { value: 'testPostalCode' },
      },
      searchAddress: {
        addressId: { value: 'searchId' },
        addressType: { value: 'search' },
        postalCode: { value: 'testPostalCode' },
      },
    }
    const items = [{ seller: '1' }]
    const sellers = [{ id: '1' }]
    const canEditData = true
    const slaOption = 'pickupSlaSelected'

    const result = setSelectedSlaFromSlaOption({
      logisticsInfo,
      action,
      items,
      sellers,
      channel: PICKUP_IN_STORE,
      canEditData,
      slaOption,
    })

    expect(result[0].selectedDeliveryChannel).toEqual(PICKUP_IN_STORE)
    expect(result[0].selectedSla).toEqual('pickupSlaSelected')
    expect(result[0].addressId).toEqual('searchId')
  })

  it('switch with multiple logistics info and multiple sellers with both Delivery Channels and an active pickup point', () => {
    const logisticsInfo = MULTIPLE_SELLERS_LOGISTICS_INFO
    const action = {
      address: {
        addressId: { value: 'residentialId' },
        addressType: { value: 'residential' },
        postalCode: { value: 'testPostalCode' },
      },
      searchAddress: {
        addressId: { value: 'searchId' },
        addressType: { value: 'search' },
        postalCode: { value: 'testPostalCode' },
      },
    }
    const items = [{ seller: '1' }, { seller: '2' }]
    const sellers = [{ id: '1' }, { id: '2' }]
    const canEditData = true
    const slaOption = null

    const result = setSelectedSlaFromSlaOption({
      logisticsInfo,
      action,
      items,
      sellers,
      channel: PICKUP_IN_STORE,
      canEditData,
      slaOption,
    })

    expect(result[0].selectedDeliveryChannel).toEqual(PICKUP_IN_STORE)
    expect(result[0].selectedSla).toEqual('pickupSeller1')
    expect(result[0].addressId).toEqual('searchId')
    expect(result[1].selectedDeliveryChannel).toEqual(PICKUP_IN_STORE)
    expect(result[1].selectedSla).toEqual('pickupSeller2')
    expect(result[1].addressId).toEqual('searchId')
  })
})
