import isEqual from 'lodash/isEqual'
import { DELIVERY } from './constants'
import {
  isPickup,
  findChannelById,
} from '@vtex/delivery-packages/dist/delivery-channel'
import {
  findSlaOption,
  isFromCurrentSeller,
  hasCurrentDeliveryChannel,
  findSlaWithChannel,
  removeAddressValidation,
} from './utils'

export function getNewLogisticsInfoIfPickup({
  activePickupPoint,
  actionAddress,
  actionSearchAddress,
  channel,
  canEditData,
  firstPickupSla,
  logisticsInfo,
  hasMultipleItems,
}) {
  if (
    firstPickupSla &&
    findChannelById(logisticsInfo, channel) &&
    firstPickupSla.deliveryChannel === DELIVERY
  ) {
    return logisticsInfo
  }

  const hasFirstPickupSla =
    firstPickupSla &&
    logisticsInfo.slas.some((sla) => sla.id === firstPickupSla.id)

  if (
    hasFirstPickupSla &&
    findChannelById(logisticsInfo, firstPickupSla.deliveryChannel) &&
    firstPickupSla.deliveryChannel === DELIVERY
  ) {
    return {
      ...logisticsInfo,
      addressId: actionAddress.addressId,
      selectedDeliveryChannel: firstPickupSla
        ? firstPickupSla.deliveryChannel
        : null,
      selectedSla: firstPickupSla.id,
    }
  }

  const defaultSlaSelection =
    logisticsInfo.slas.find(
      (sla) => firstPickupSla && sla.id === firstPickupSla.id
    ) || findSlaWithChannel(logisticsInfo, channel)

  if (
    hasCurrentDeliveryChannel(logisticsInfo, channel) &&
    isPickup(channel) &&
    ((defaultSlaSelection &&
      firstPickupSla &&
      defaultSlaSelection.id !== firstPickupSla.id) ||
      !defaultSlaSelection)
  ) {
    const defaultDeliverySla = findSlaWithChannel(logisticsInfo, DELIVERY)

    if (defaultDeliverySla && hasMultipleItems) {
      return {
        ...logisticsInfo,
        addressId: actionAddress.addressId,
        selectedDeliveryChannel: DELIVERY,
        selectedSla: defaultDeliverySla.id,
      }
    }

    if (activePickupPoint && activePickupPoint.id) {
      return {
        ...logisticsInfo,
        addressId: actionSearchAddress.addressId,
        selectedDeliveryChannel: channel,
        selectedSla: activePickupPoint.id,
      }
    }

    return {
      ...logisticsInfo,
      addressId: actionSearchAddress.addressId,
      selectedDeliveryChannel: channel,
      selectedSla: null,
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
        isPickup(channel) && hasFirstPickupSla
          ? firstPickupSla.id
          : defaultSlaSelection.id,
    }
  }

  return {
    ...logisticsInfo,
    selectedDeliveryChannel: hasCurrentDeliveryChannel(logisticsInfo, channel)
      ? channel
      : DELIVERY,
    addressId: hasCurrentDeliveryChannel(logisticsInfo, channel)
      ? actionSearchAddress.addressId
      : actionAddress.addressId,
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

  if (
    hasCurrentDeliveryChannel(logisticsInfo, channel) &&
    slaFromSlaOption &&
    logisticsInfo.slas.some((sla) => sla.id === slaFromSlaOption.id)
  ) {
    return {
      ...logisticsInfo,
      addressId: actionAddress.addressId,
      selectedDeliveryChannel: channel,
      selectedSla: slaFromSlaOption.id,
    }
  }

  const selectedSla = findSlaOption([logisticsInfo], logisticsInfo.selectedSla)
  const shouldUseSelectedSla =
    selectedSla && selectedSla.deliveryChannel === channel

  if (hasCurrentDeliveryChannel(logisticsInfo, channel)) {
    return {
      ...logisticsInfo,
      addressId: actionAddress.addressId,
      selectedDeliveryChannel: channel,
      selectedSla: shouldUseSelectedSla
        ? logisticsInfo.selectedSla
        : defaultSlaSelection.id,
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
  const actionAddress = removeAddressValidation(action.address)
  const actionSearchAddress = removeAddressValidation(action.searchAddress)

  return newLogisticsInfo.map((li) => {
    const hasSellerIdMatch = isFromCurrentSeller({ items, li, seller })

    if (!hasSellerIdMatch) {
      return li
    }

    if (isPickup(channel)) {
      const newLogisticsInfoIfPickup = getNewLogisticsInfoIfPickup({
        activePickupPoint: action.activePickupPoint,
        action,
        actionAddress,
        actionSearchAddress,
        channel,
        canEditData,
        firstPickupSla: slaFromSlaOption || firstPickupSla,
        logisticsInfo: li,
        hasMultipleItems: newLogisticsInfo.length > 1,
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
