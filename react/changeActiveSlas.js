import {
  findFirstItemWithPickup,
  findSlaOption,
  findPickupSla,
  isFromCurrentSeller,
  hasSLAs,
  setSelectedDeliveryChannel,
} from './utils'
import { getNewLogisticsInfo } from './logisticsInfo'

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
      : findPickupSla(firstItemWithPickup)

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

  if (!hasSLAs(logisticsInfo)) {
    newLogisticsInfo = setSelectedDeliveryChannel(channel)
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
      : findPickupSla(firstItemWithPickup)

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

  const hasSlas = logisticsInfo && !!logisticsInfo.find(li => hasSLAs(li))

  if (!hasSlas) {
    newLogisticsInfo =
      newLogisticsInfo &&
      newLogisticsInfo.map(li => ({
        ...li,
        selectedDeliveryChannel: channel,
      }))
  }

  return newLogisticsInfo
}
