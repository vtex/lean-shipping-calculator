import estimateCalculator from '@vtex/estimate-calculator'
import sumBy from 'lodash/sumBy'
import minBy from 'lodash/minBy'
import isEqual from 'lodash/isEqual'
import omit from 'lodash/omit'
import { getStructuredOption } from './DeliveryPackagesUtils'
import { CHEAPEST, COMBINED, FASTEST, DELIVERY } from './constants'
import {
  hasDeliveryWindows,
  hasOnlyScheduledDelivery,
  isPickup,
  isDelivery,
  isCurrentChannel,
} from './utils'

function getShippingEstimateInSeconds(shippingEstimate) {
  return estimateCalculator.getShippingEstimateQuantityInSeconds(
    shippingEstimate
  )
}

function filterPreviousExpensiveOptions(options) {
  return options.filter((option, index) =>
    options[index + 1] ? option.price < options[index + 1].price : true
  )
}

function filterEqualOptions(options) {
  const finalOptions = []

  options.forEach(option => {
    const indexFromFinalArray = finalOptions.findIndex(finalOption =>
      isEqual(omit(finalOption, 'id'), omit(option, 'id'))
    )

    if (indexFromFinalArray <= -1) {
      finalOptions.push(option)
    }
  })

  return filterPreviousExpensiveOptions(finalOptions)
}

export function getOptionsDetails(delivery) {
  const hasCheapest = delivery[CHEAPEST] && delivery[CHEAPEST].length > 0
  const hasCombined = delivery[COMBINED] && delivery[COMBINED].length > 0
  const hasFastest = delivery[FASTEST] && delivery[FASTEST].length > 0

  const options = [
    ...(hasCheapest ? [getStructuredOption(delivery[CHEAPEST], CHEAPEST)] : []),
    ...(hasCombined ? [getStructuredOption(delivery[COMBINED], COMBINED)] : []),
    ...(hasFastest ? [getStructuredOption(delivery[FASTEST], FASTEST)] : []),
  ]

  return filterEqualOptions(options)
}

export function getSelectedDeliveryOption({
  optionsDetails = null,
  newCombined,
  newFastest,
  newCheapest,
  activeDeliveryOption,
}) {
  if (!optionsDetails) {
    optionsDetails = getOptionsDetails({
      ...(newCheapest ? { [CHEAPEST]: newCheapest } : {}),
      ...(newCombined ? { [COMBINED]: newCombined } : {}),
      ...(newFastest ? { [FASTEST]: newFastest } : {}),
    })
  }

  const hasCurrentDeliveryOption =
    optionsDetails &&
    !!optionsDetails.find(option => option.id === activeDeliveryOption)

  return optionsDetails.length > 0 && !hasCurrentDeliveryOption
    ? optionsDetails[0].id
    : activeDeliveryOption
}

function filterSlasByChannel(slas) {
  if (!slas) return

  return slas.filter(sla => isDelivery(sla) && !hasDeliveryWindows(sla))
}

function getSlaAccumulatedPrice(sla, logisticsInfo) {
  return logisticsInfo
    .map(li => li.slas.find(localSla => localSla.id === sla.id))
    .reduce(
      (accPrice, currSla) => (currSla ? currSla.price + accPrice : accPrice),
      0
    )
}

function createArrayOfSlasObject(slas, logisticsInfo) {
  return slas.map(sla => ({
    ...sla,
    price: getSlaAccumulatedPrice(sla, logisticsInfo),
    shippingEstimateInSeconds: getShippingEstimateInSeconds(
      sla.shippingEstimate
    ),
  }))
}

function createArraysOfSlas(logisticsInfo) {
  return logisticsInfo.map(item => {
    const filteredByChannel = filterSlasByChannel(item.slas)

    return filteredByChannel.length
      ? createArrayOfSlasObject(filteredByChannel, logisticsInfo)
      : []
  })
}

function isUnavailable(logisticsInfo) {
  return (
    logisticsInfo.selectedSla === null &&
    logisticsInfo.selectedDeliveryChannel === null
  )
}

function findLogisticsInfoWithSameId(logisticsInfo, currentLi) {
  return logisticsInfo.find(li => li.itemIndex === currentLi.itemIndex)
}

function setSelectedSla({
  logisticsInfo,
  selectedSlas,
  activeChannel,
  isScheduledDeliveryActive,
}) {
  const newLogisticsInfo = []

  const hasItemWithMandatoryScheduledDelivery = logisticsInfo.some(li =>
    li.slas.every(sla => hasDeliveryWindows(sla))
  )

  logisticsInfo.forEach((logisticsItem, index) => {
    if (
      isUnavailable(logisticsItem) ||
      (isPickup(logisticsItem) && isPickup(activeChannel))
    ) {
      newLogisticsInfo.push(logisticsItem)

      return
    }

    const hasMandatoryScheduledDelivery =
      logisticsItem.slas.length === 1 &&
      logisticsItem.slas.every(
        sla => isCurrentChannel(sla, activeChannel) && hasDeliveryWindows(sla)
      )

    const scheduledDelivery = logisticsItem.slas.find(
      sla => isCurrentChannel(sla, activeChannel) && hasDeliveryWindows(sla)
    )

    if (
      ((isScheduledDeliveryActive || hasMandatoryScheduledDelivery) &&
        scheduledDelivery) ||
      (hasItemWithMandatoryScheduledDelivery && scheduledDelivery)
    ) {
      const selectedSla = logisticsItem.slas.find(
        sla => sla.id === logisticsItem.selectedSla
      )

      const shouldUseSelectedSla =
        !hasMandatoryScheduledDelivery &&
        selectedSla &&
        hasDeliveryWindows(selectedSla)

      newLogisticsInfo.push({
        ...logisticsItem,
        selectedSla: shouldUseSelectedSla
          ? selectedSla.id
          : scheduledDelivery.id,
        selectedDeliveryChannel: shouldUseSelectedSla
          ? selectedSla.deliveryChannel
          : scheduledDelivery.deliveryChannel,
      })

      return
    }

    const previousLogisticsWithSameId = findLogisticsInfoWithSameId(
      newLogisticsInfo,
      logisticsItem
    )

    if (previousLogisticsWithSameId) {
      newLogisticsInfo.push({
        ...logisticsItem,
        selectedSla: previousLogisticsWithSameId.selectedSla,
        selectedDeliveryChannel:
          previousLogisticsWithSameId.selectedDeliveryChannel,
      })

      return
    }

    const currentSla = selectedSlas && selectedSlas[index]
    const slaId = currentSla && selectedSlas[index].id
    const slaDeliveryChannel = currentSla && selectedSlas[index].deliveryChannel

    newLogisticsInfo.push({
      ...logisticsItem,
      selectedSla: slaId || logisticsItem.selectedSla,
      selectedDeliveryChannel:
        slaDeliveryChannel || logisticsItem.selectedDeliveryChannel,
    })
  })

  return newLogisticsInfo
}

function getSmallerThanIndex(averages, index) {
  return averages.map(details => details < index)
}

function getGreaterThanIndex(averages, index) {
  return averages.map(details => details > index)
}

export function getCombinedOption(
  logisticsInfo,
  slasCombinations,
  combinationsDetails,
  cheapestIndex,
  fastestIndex,
  activeChannel
) {
  if (!fastestIndex) return

  const slasMoreExpensiveThanCheapest = getGreaterThanIndex(
    combinationsDetails.averagePrices,
    combinationsDetails.averagePrices[cheapestIndex]
  )

  const slasFasterThanCheapest = getSmallerThanIndex(
    combinationsDetails.averageShippingEstimates,
    combinationsDetails.averageShippingEstimates[cheapestIndex]
  )

  const slasSlowerThanFastest = getGreaterThanIndex(
    combinationsDetails.averageShippingEstimates,
    combinationsDetails.averageShippingEstimates[fastestIndex]
  )

  const slasMoreExpensiveThanFastest = getGreaterThanIndex(
    combinationsDetails.averagePrices,
    combinationsDetails.averagePrices[fastestIndex]
  )

  const possibleCombinedCombinations = slasCombinations.map(
    (combination, index) => {
      if (
        slasMoreExpensiveThanCheapest[index] &&
        slasFasterThanCheapest[index] &&
        slasSlowerThanFastest[index] &&
        slasMoreExpensiveThanFastest[index]
      ) {
        const numberOfItems = slasCombinations[0].length
        const averageShippingEstimate =
          sumBy(slasCombinations[index], sla => sla.shippingEstimateInSeconds) /
          numberOfItems

        return { averageShippingEstimate, index }
      }
      return false
    }
  )

  const combinedCombinationsFiltered = possibleCombinedCombinations.filter(
    combination => combination
  )

  const chosenCombination = minBy(
    combinedCombinationsFiltered,
    'averageShippingEstimate'
  )

  return (
    chosenCombination && {
      logisticsInfo: setSelectedSla(
        logisticsInfo,
        slasCombinations[chosenCombination.index],
        activeChannel
      ),
      combination: slasCombinations[chosenCombination.index],
      indexInCombinations: chosenCombination.index,
    }
  )
}

function getMinSlaBy(items, property) {
  return items.map(slas => minBy(slas, slasGroup => slasGroup[property]))
}

function shouldShowCheapest(cheapest, fastest) {
  const cheapestDetails = getStructuredOption(cheapest, CHEAPEST)

  const fastestDetails = getStructuredOption(fastest, FASTEST)

  const isCheapestCheaperThanFastest =
    cheapestDetails.price < fastestDetails.price

  const fastestAndCheapestAreEqual = isEqual(cheapest, fastest)

  const isCheapestEmpty = cheapestDetails.packagesLength === 0

  return (
    cheapest &&
    (isCheapestCheaperThanFastest ||
      isCheapestEmpty ||
      fastestAndCheapestAreEqual)
  )
}

function shouldShowCombined(cheapest, fastest, combined) {
  const cheapestDetails = getStructuredOption(cheapest)

  const fastestDetails = getStructuredOption(fastest)

  const combinedDetails = getStructuredOption(combined)

  return (
    !isEqual(combinedDetails, cheapestDetails) &&
    !isEqual(combinedDetails, fastestDetails)
  )
}

function shouldShowFastest(cheapest, fastest) {
  const fastestAndCheapestAreEqual = isEqual(cheapest, fastest)

  return fastest && !fastestAndCheapestAreEqual
}

export function getLeanShippingOptions({
  logisticsInfo,
  activeChannel = DELIVERY,
  isScheduledDeliveryActive = false,
}) {
  const arraysOfSlas = createArraysOfSlas(logisticsInfo)
  const selectedSlas = {
    cheapest: getMinSlaBy(arraysOfSlas, 'price'),
    fastest: getMinSlaBy(arraysOfSlas, 'shippingEstimateInSeconds'),
  }

  const cheapest = setSelectedSla({
    logisticsInfo,
    selectedSlas: selectedSlas.cheapest,
    activeChannel,
    isScheduledDeliveryActive,
  })

  const fastest = setSelectedSla({
    logisticsInfo,
    selectedSlas: selectedSlas.fastest,
    activeChannel,
    isScheduledDeliveryActive,
  })

  const fastestAndCheapestAreEqual = isEqual(cheapest, fastest)

  let combined = []

  if (!fastestAndCheapestAreEqual) {
    combined = setSelectedSla({
      logisticsInfo,
      selectedSlas: selectedSlas.fastest,
      activeChannel,
      isScheduledDeliveryActive,
    })
  }

  return {
    ...(shouldShowCheapest(cheapest, fastest) ? { cheapest } : {}),
    ...(shouldShowCombined(cheapest, fastest, combined) ? { combined } : {}),
    ...(shouldShowFastest(cheapest, fastest) ? { fastest } : {}),
  }
}
