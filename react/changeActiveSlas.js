import {
  findFirstItemWithPickup,
  findSlaOption,
  findPickupSla,
  isFromCurrentSeller,
  hasSLAs,
  isPickup,
} from './utils'
import { getNewLogisticsInfo } from './logisticsInfo'
import { helpers } from 'vtex.address-form'
const { removeValidation } = helpers

export function setSelectedSlaFromSlaOption({
  logisticsInfo,
  action,
  items,
  sellers,
  channel,
  canEditData,
  slaOption,
}) {
  let newLogisticsInfo = [...logisticsInfo]

  sellers.forEach(seller => {
    const filteredLogisticsInfo = logisticsInfo.filter(li =>
      isFromCurrentSeller({ items, li, seller })
    )

    const slaFromSlaOption = findSlaOption(filteredLogisticsInfo, slaOption)

    const firstItemWithPickup = findFirstItemWithPickup({
      logisticsInfo,
      seller,
      items,
    })

    const firstPickupSla = slaOption
      ? findSlaOption(filteredLogisticsInfo, slaOption)
      : firstItemWithPickup && findPickupSla(firstItemWithPickup)

    newLogisticsInfo = getNewLogisticsInfo({
      action,
      canEditData,
      channel,
      slaFromSlaOption,
      firstPickupSla,
      items,
      newLogisticsInfo,
      seller,
    })
  })

  const actionAddress = removeValidation(action.address)
  const actionSearchAddress = removeValidation(action.searchAddress)
  const hasSlas = logisticsInfo && !!logisticsInfo.find(li => hasSLAs(li))

  if (newLogisticsInfo && !hasSlas) {
    newLogisticsInfo = newLogisticsInfo.map(li => ({
      ...li,
      selectedDeliveryChannel: channel,
      addressId: isPickup(channel)
        ? actionSearchAddress.addressId
        : actionAddress.addressId,
    }))
  }

  return newLogisticsInfo
}

export function changeActiveSlas({
  logisticsInfo,
  action,
  items,
  sellers,
  channel,
  canEditData,
  slaOption,
}) {
  let newLogisticsInfo = logisticsInfo && [...logisticsInfo]

  sellers.forEach(seller => {
    const firstItemWithPickup = findFirstItemWithPickup({
      logisticsInfo,
      seller,
      items,
    })

    const filteredLogisticsInfo = logisticsInfo.filter(li =>
      isFromCurrentSeller({ items, li, seller })
    )

    const firstPickupSla = slaOption
      ? findSlaOption(filteredLogisticsInfo, slaOption)
      : firstItemWithPickup && findPickupSla(firstItemWithPickup)

    newLogisticsInfo = getNewLogisticsInfo({
      action,
      canEditData,
      channel,
      firstPickupSla,
      items,
      newLogisticsInfo,
      seller,
    })
  })

  const actionAddress = removeValidation(action.address)
  const actionSearchAddress = removeValidation(action.searchAddress)
  const hasSlas = logisticsInfo && !!logisticsInfo.find(li => hasSLAs(li))

  if (newLogisticsInfo && !hasSlas) {
    newLogisticsInfo = newLogisticsInfo.map(li => ({
      ...li,
      selectedDeliveryChannel: channel,
      addressId: isPickup(channel)
        ? actionSearchAddress.addressId
        : actionAddress.addressId,
    }))
  }

  return newLogisticsInfo
}
