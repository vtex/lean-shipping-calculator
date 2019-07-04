import isEqual from 'lodash/isEqual'
import { DELIVERY } from './constants'
import { findSlaWithChannel } from '@vtex/delivery-packages/dist/sla'
import {
  isPickup,
  findChannelById,
} from '@vtex/delivery-packages/dist/delivery-channel'
import { helpers } from 'vtex.address-form'
import { isFromCurrentSeller, hasCurrentDeliveryChannel } from './utils'
const { removeValidation } = helpers

export function getNewLogisticsInfoIfPickup({
  actionAddress,
  actionSearchAddress,
  channel,
  canEditData,
  firstPickupSla,
  logisticsInfo,
}) {
  if (
    firstPickupSla &&
    findChannelById(logisticsInfo, channel) &&
    firstPickupSla.deliveryChannel === DELIVERY
  ) {
    return logisticsInfo
  }

  if (
    firstPickupSla &&
    findChannelById(logisticsInfo, firstPickupSla.deliveryChannel) &&
    firstPickupSla.deliveryChannel === DELIVERY
  ) {
    return {
      ...logisticsInfo,
      addressId: actionAddress.addressId,
      selectedDeliveryChannel: firstPickupSla
        ? firstPickupSla.deliveryChannel
        : null,
      selectedSla: firstPickupSla ? firstPickupSla.id : null,
    }
  }

  const defaultSlaSelection =
    logisticsInfo.slas.find(
      sla => firstPickupSla && sla.id === firstPickupSla.id
    ) || findSlaWithChannel(logisticsInfo, channel)

  if (
    hasCurrentDeliveryChannel(logisticsInfo, channel) &&
    isPickup(channel) &&
    defaultSlaSelection &&
    firstPickupSla &&
    defaultSlaSelection.id !== firstPickupSla.id
  ) {
    const defaultDeliverySla = findSlaWithChannel(logisticsInfo, DELIVERY)

    return {
      ...logisticsInfo,
      addressId: defaultDeliverySla
        ? actionAddress.addressId
        : actionSearchAddress.addressId,
      selectedDeliveryChannel: defaultDeliverySla ? DELIVERY : channel,
      selectedSla: defaultDeliverySla ? defaultDeliverySla.id : null,
    }
  }

  const hasDifferentGeoCoordinates = !isEqual(
    actionAddress.geoCoordinates,
    actionSearchAddress.geoCoordinates
  )

  if (
    hasCurrentDeliveryChannel(logisticsInfo, channel) &&
    defaultSlaSelection
  ) {
    const shouldReferenceSearchAddress =
      isPickup(channel) &&
      firstPickupSla &&
      (canEditData || hasDifferentGeoCoordinates)

    return {
      ...logisticsInfo,
      selectedDeliveryChannel: channel,
      addressId: shouldReferenceSearchAddress
        ? actionSearchAddress.addressId
        : actionAddress.addressId,
      selectedSla:
        isPickup(channel) && firstPickupSla
          ? firstPickupSla.id
          : defaultSlaSelection.id,
    }
  }

  return {
    ...logisticsInfo,
    selectedDeliveryChannel: hasCurrentDeliveryChannel(logisticsInfo, channel)
      ? channel
      : DELIVERY,
    addressId: actionSearchAddress.addressId,
    selectedSla: null,
  }
}

export function getNewLogisticsInfoIfDelivery({
  actionAddress,
  channel,
  slaFromSlaOption,
  logisticsInfo,
}) {
  const defaultSlaSelection = findSlaWithChannel(logisticsInfo, channel)

  if (!defaultSlaSelection) {
    return {
      ...logisticsInfo,
      addressId: actionAddress.addressId,
      selectedDeliveryChannel: null,
      selectedSla: null,
    }
  }

  if (hasCurrentDeliveryChannel(logisticsInfo, channel) && slaFromSlaOption) {
    return {
      ...logisticsInfo,
      addressId: actionAddress.addressId,
      selectedDeliveryChannel: channel,
      selectedSla: slaFromSlaOption.id,
    }
  }

  if (
    hasCurrentDeliveryChannel(logisticsInfo, channel) &&
    defaultSlaSelection
  ) {
    return {
      ...logisticsInfo,
      addressId: actionAddress.addressId,
      selectedDeliveryChannel: channel,
      selectedSla: defaultSlaSelection.id,
    }
  }
}

export function getNewLogisticsInfo({
  action,
  canEditData,
  channel,
  slaFromSlaOption,
  firstPickupSla,
  items,
  newLogisticsInfo,
  seller,
}) {
  const actionAddress = removeValidation(action.address)
  const actionSearchAddress = removeValidation(action.searchAddress)

  return newLogisticsInfo.map(li => {
    const hasSellerIdMatch = isFromCurrentSeller({ items, li, seller })

    if (!hasSellerIdMatch) {
      return li
    }

    if (isPickup(channel)) {
      const newLogisticsInfoIfPickup = getNewLogisticsInfoIfPickup({
        action,
        actionAddress,
        actionSearchAddress,
        channel,
        canEditData,
        firstPickupSla: slaFromSlaOption || firstPickupSla,
        logisticsInfo: li,
      })

      if (newLogisticsInfoIfPickup) {
        return newLogisticsInfoIfPickup
      }
    } else {
      const newLogisticsInfoIfDelivery = getNewLogisticsInfoIfDelivery({
        actionAddress,
        channel,
        slaFromSlaOption,
        logisticsInfo: li,
      })

      if (newLogisticsInfoIfDelivery) {
        return newLogisticsInfoIfDelivery
      }
    }

    return {
      ...li,
      addressId: actionAddress.addressId,
    }
  })
}
