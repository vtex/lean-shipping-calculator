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
