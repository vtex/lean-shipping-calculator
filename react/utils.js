import isString from 'lodash/isString'
import get from 'lodash/get'
import { PICKUP_IN_STORE, DELIVERY } from './constants'
import { findSlaWithChannel } from '@vtex/delivery-packages/dist/sla'

function getDeliveryChannel(deliveryChannelSource) {
  if (isString(deliveryChannelSource)) {
    return deliveryChannelSource
  }
  return (
    get(deliveryChannelSource, 'deliveryChannel') ||
    get(deliveryChannelSource, 'selectedDeliveryChannel') ||
    get(deliveryChannelSource, 'id')
  )
}

export function isPickup(deliveryChannelSource) {
  const deliveryChannel = getDeliveryChannel(deliveryChannelSource)
  return deliveryChannel === PICKUP_IN_STORE
}

export function isDelivery(deliveryChannelSource) {
  const deliveryChannel = getDeliveryChannel(deliveryChannelSource)
  return deliveryChannel === DELIVERY
}

export function hasDeliveryWindows(sla) {
  return sla && sla.availableDeliveryWindows.length > 0
}

export function hasOnlyScheduledDelivery(slas) {
  return (
    slas.filter(sla => isDelivery(sla) && !hasDeliveryWindows(sla)).length === 0
  )
}

export function hasSLAs(slasSource) {
  if (slasSource && slasSource.slas) {
    return slasSource.slas.length > 0
  }
  return slasSource && slasSource.length > 0
}

export function getSelectedSlaInSlas(item) {
  return item.slas && item.slas.find(sla => sla.id === item.selectedSla)
}

export function isCurrentChannel(deliveryChannelSource, currentChannel) {
  const deliveryChannel = getDeliveryChannel(deliveryChannelSource)
  return deliveryChannel === currentChannel
}

export function isFromCurrentSeller({ items, li, seller, sellerId }) {
  const localSellerId = isString(sellerId) ? sellerId : seller && seller.id
  return (
    li && items[li.itemIndex] && items[li.itemIndex].seller === localSellerId
  )
}

export function findPickupSla(firstItemWithPickup) {
  const selectedSla = getSelectedSlaInSlas(firstItemWithPickup)
  const selectedSlaIsPickup = selectedSla && isPickup(selectedSla)

  if (selectedSlaIsPickup) {
    return selectedSla
  }

  return (
    firstItemWithPickup &&
    findSlaWithChannel(firstItemWithPickup, PICKUP_IN_STORE)
  )
}

export function findSlaOption(logisticsInfo, slaOption) {
  const logisticsInfoWithSla = logisticsInfo.find(li =>
    li.slas.find(sla => sla.id === slaOption)
  )

  return (
    logisticsInfoWithSla &&
    logisticsInfoWithSla.slas.find(sla => sla.id === slaOption)
  )
}

export function findFirstItemWithPickup({ logisticsInfo, seller, items }) {
  return (
    logisticsInfo &&
    logisticsInfo.find(li => {
      const hasSellerIdMatch = seller
        ? isFromCurrentSeller({ items, li, seller })
        : true

      const hasPickupSelectedOrHasPickupInSlas =
        isPickup(li) || findSlaWithChannel(li, PICKUP_IN_STORE)

      return hasSellerIdMatch && hasPickupSelectedOrHasPickupInSlas
    })
  )
}

export function setSelectedDeliveryChannel(logisticsInfo, deliveryChannel) {
  if (Array.isArray(logisticsInfo)) {
    return logisticsInfo.map(li => ({
      ...li,
      selectedDeliveryChannel: deliveryChannel,
    }))
  }

  return (
    logisticsInfo && {
      ...logisticsInfo,
      selectedDeliveryChannel: deliveryChannel,
    }
  )
}
