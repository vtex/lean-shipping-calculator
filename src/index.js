import estimateCalculator from '@vtex/estimate-calculator'
import sumBy from 'lodash/sumBy'
import minBy from 'lodash/minBy'
import isEqual from 'lodash/isEqual'
import omit from 'lodash/omit'
import { getStructuredOption } from './DeliveryPackagesUtils'
import { CHEAPEST, COMBINED, FASTEST } from './constants'
import {
  hasDeliveryWindows,
  hasOnlyScheduledDelivery,
  isPickup,
  isDelivery,
} from './utils'

function getShippingEstimateInSeconds(shippingEstimate) {
  return estimateCalculator.getShippingEstimateQuantityInSeconds(
    shippingEstimate
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

  return finalOptions
}

function getOptionsDetails(delivery) {
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

function getSelectedDeliveryOption({
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

  return slas.filter(
    sla =>
      hasOnlyScheduledDelivery(slas)
        ? isDelivery(sla)
        : isDelivery(sla) && !hasDeliveryWindows(sla)
  )
}

function createArrayOfSlasObject(slas) {
  return slas.map((sla, index) => ({
    ...sla,
    shippingEstimateInSeconds: getShippingEstimateInSeconds(
      sla.shippingEstimate
    ),
  }))
}

function createArraysOfSlas(logisticsInfo) {
  return logisticsInfo.map(item => {
    const filteredByChannel = filterSlasByChannel(item.slas)

    return filteredByChannel.length
      ? createArrayOfSlasObject(filteredByChannel)
      : []
  })
}

function isUnavailable(logisticsInfo) {
  return (
    logisticsInfo.selectedSla === null &&
    logisticsInfo.selectedDeliveryChannel === null
  )
}

function setSelectedSla(logisticsInfo, selectedSlas, activeChannel) {
  return logisticsInfo.map((logisticsItem, index) => {
    if (
      isUnavailable(logisticsItem) ||
      (isPickup(logisticsItem) && isPickup(activeChannel))
    ) {
      return logisticsItem
    }

    const currentSla = selectedSlas && selectedSlas[index]
    const slaId = currentSla && selectedSlas[index].id
    const slaDeliveryChannel = currentSla && selectedSlas[index].deliveryChannel

    return {
      ...logisticsItem,
      selectedSla: slaId || logisticsItem.selectedSla,
      selectedDeliveryChannel:
        slaDeliveryChannel || logisticsItem.selectedDeliveryChannel,
    }
  })
}

function getSmallerThanIndex(averages, index) {
  return averages.map(details => details < index)
}

function getGreaterThanIndex(averages, index) {
  return averages.map(details => details > index)
}

function getCombinedOption( // eslint-disable-line
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

function shouldShowFastest(cheapest, fastest) {
  const fastestAndCheapestAreEqual = isEqual(cheapest, fastest)

  return fastest && !fastestAndCheapestAreEqual
}

function getLeanShippingOptions(logisticsInfo, activeChannel) {
  const arraysOfSlas = createArraysOfSlas(logisticsInfo)
  const selectedSlas = {
    cheapest: getMinSlaBy(arraysOfSlas, 'price'),
    fastest: getMinSlaBy(arraysOfSlas, 'shippingEstimateInSeconds'),
  }

  const cheapest = setSelectedSla(
    logisticsInfo,
    selectedSlas.cheapest,
    activeChannel
  )
  const fastest = setSelectedSla(
    logisticsInfo,
    selectedSlas.fastest,
    activeChannel
  )

  const fastestAndCheapestAreEqual = isEqual(cheapest, fastest)

  let combined // eslint-disable-line

  if (!fastestAndCheapestAreEqual) {
    combined = setSelectedSla(
      logisticsInfo,
      selectedSlas.fastest,
      activeChannel
    )
  }

  return {
    ...(shouldShowCheapest(cheapest, fastest) ? { cheapest } : {}),
    ...(shouldShowFastest(cheapest, fastest) ? { fastest } : {}),
  }
}

module.exports = {
  getLeanShippingOptions,
  getOptionsDetails,
  getSelectedDeliveryOption,
}
