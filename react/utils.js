import isString from 'lodash/isString'
import get from 'lodash/get'
import { PICKUP_IN_STORE, DELIVERY } from './constants'

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
  return (
    sla &&
    sla.availableDeliveryWindows &&
    sla.availableDeliveryWindows.length > 0
  )
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

export function hasCurrentDeliveryChannel(li, currentChannel) {
  return (
    li &&
    li.deliveryChannels &&
    li.deliveryChannels.some(channel => channel.id === currentChannel)
  )
}

export function checkIfHasGeoCoordinates(address) {
  return (
    address &&
    get(address, 'geoCoordinates.value') &&
    address.geoCoordinates.value.length > 0
  )
}

export function checkIfHasPostalCode(searchAddress, address) {
  return (
    (searchAddress && !!get(searchAddress, 'postalCode.value')) ||
    !!get(address, 'postalCode.value')
  )
}

export function hasPostalCodeGeocoordinates(address, searchAddress) {
  const addressesHasPostalCode = checkIfHasPostalCode(address, searchAddress)
  const addressHasGeocoordinates = checkIfHasGeoCoordinates(address)
  const searchAddressHasPostalCode = checkIfHasPostalCode(searchAddress)
  const searchAddressHasGeocoordinates = checkIfHasGeoCoordinates(searchAddress)

  return (
    addressesHasPostalCode ||
    addressHasGeocoordinates ||
    searchAddressHasGeocoordinates ||
    searchAddressHasPostalCode
  )
}

export function findSlaWithChannel(item, channel) {
  if (!item || !item.slas) {
    return null
  }

  const hasOnlyScheduledDeliverySla = hasOnlyScheduledDelivery(
    item.slas,
    channel
  )

  const currentChannelSlas = item.slas.filter(sla => {
    return (
      isCurrentChannel(sla, channel) &&
      (!hasDeliveryWindows(sla) || hasOnlyScheduledDeliverySla)
    )
  })

  let cheapestSla = currentChannelSlas[0]

  if (cheapestSla) {
    currentChannelSlas.forEach(sla => {
      cheapestSla = sla.price < cheapestSla.price ? sla : cheapestSla
    })
  }

  return cheapestSla
}

export function removeAddressValidation(address) {
  if (address == null) {
    return {}
  }

  const newAddressEntries = Object.entries(address).map(([key, value]) => {
    const newValue =
      value == null || value.value == null
        ? typeof value === 'object'
          ? null
          : value
        : value.value

    return [key, newValue]
  })

  const newAddress = Object.fromEntries(newAddressEntries)

  return newAddress
}
