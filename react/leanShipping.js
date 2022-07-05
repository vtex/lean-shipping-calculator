import estimateCalculator from '@vtex/estimate-calculator'
import intersection from 'lodash/intersection'
import isEqual from 'lodash/isEqual'
import minBy from 'lodash/minBy'
import omit from 'lodash/omit'
import sortBy from 'lodash/sortBy'
import sumBy from 'lodash/sumBy'
import { getStructuredOption } from './DeliveryPackagesUtils'
import {
  CHEAPEST,
  COMBINED,
  FASTEST,
  DELIVERY,
  PRICE,
  SHIPPING_ESTIMATE_IN_SECONDS,
} from './constants'
import {
  hasDeliveryWindows,
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

function createArrayOfSlas(logisticsInfo) {
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
    li.slas.every(sla => hasDeliveryWindows(sla) && isDelivery(sla))
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
    (_combination, index) => {
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

function getBestSlasBy(arrayOfSlas, property, shouldPrioritizeConsistentSlas) {
  const slasAvailableToEveryItem = intersection(
    ...arrayOfSlas.map(slas => slas.map(sla => sla.id))
  )

  const sortingCriterias = []

  // "Consistent SLAs" stands for SLAs that are available to every item
  if (shouldPrioritizeConsistentSlas) {
    sortingCriterias.push(sla => !slasAvailableToEveryItem.includes(sla.id))
  }
  sortingCriterias.push(sla => sla[property])
  sortingCriterias.push(sla => sla.id)

  return arrayOfSlas.map(slas => sortBy(slas, sortingCriterias)[0])
}

function shouldShowCheapest(cheapest, fastest) {
  const cheapestDetails = getStructuredOption(cheapest, CHEAPEST)
  const fastestDetails = getStructuredOption(fastest, FASTEST)

  const hasCheapestLessPackages =
    cheapestDetails.packagesLength < fastestDetails.packagesLength
  const isCheapestCheaperThanFastest =
    cheapestDetails.price < fastestDetails.price
  const fastestAndCheapestAreEqual = isEqual(cheapest, fastest)
  const isCheapestEmpty = cheapestDetails.packagesLength === 0

  return (
    cheapest &&
    (hasCheapestLessPackages ||
      isCheapestCheaperThanFastest ||
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
  const cheapestDetails = getStructuredOption(cheapest, CHEAPEST)
  const fastestDetails = getStructuredOption(fastest, FASTEST)

  const hasCheapestLessPackages =
    cheapestDetails.packagesLength < fastestDetails.packagesLength
  const fastestAndCheapestAreEqual = isEqual(cheapest, fastest)

  return fastest && !fastestAndCheapestAreEqual && !hasCheapestLessPackages
}

function areSelectedSlasValid(logisticsInfo) {
  const selectedSlas = logisticsInfo
    .filter(logisticInfo => logisticInfo.selectedSla !== null)
    .map(logisticInfo => logisticInfo.selectedSla)

  return logisticsInfo.every(
    logisticInfo =>
      intersection(
        logisticInfo.slas.map(sla => sla.id),
        selectedSlas
      ).length === 1
  )
}

function setSelectedSlaIfValid({
  logisticsInfo,
  selectedSlas,
  activeChannel,
  isScheduledDeliveryActive,
}) {
  const newLogisticsInfo = setSelectedSla({
    logisticsInfo,
    selectedSlas,
    activeChannel,
    isScheduledDeliveryActive,
  })
  return areSelectedSlasValid(newLogisticsInfo) ? newLogisticsInfo : null
}

function getBestOption({
  logisticsInfo,
  activeChannel = DELIVERY,
  isScheduledDeliveryActive = false,
  property,
}) {
  const arrayOfSlas = createArrayOfSlas(logisticsInfo)

  const currentSelectedSlas = arrayOfSlas.map((slas, index) =>
    slas.find(sla => sla.id === logisticsInfo[index].selectedSla)
  )
  const bestIndividualSlas = getBestSlasBy(arrayOfSlas, property, false)
  const bestConsistentSlas = getBestSlasBy(arrayOfSlas, property, true)

  const currentLogisticsInfo = setSelectedSlaIfValid({
    logisticsInfo,
    selectedSlas: currentSelectedSlas,
    activeChannel,
    isScheduledDeliveryActive,
  })

  const bestIndividualLogisticsInfo = setSelectedSlaIfValid({
    logisticsInfo,
    selectedSlas: bestIndividualSlas,
    activeChannel,
    isScheduledDeliveryActive,
  })

  const bestConsistentLogisticsInfo = setSelectedSlaIfValid({
    logisticsInfo,
    selectedSlas: bestConsistentSlas,
    activeChannel,
    isScheduledDeliveryActive,
  })

  const validLogisticsInfoArray = [
    currentLogisticsInfo,
    bestIndividualLogisticsInfo,
    bestConsistentLogisticsInfo,
  ].filter(logisticsInfo => logisticsInfo)

  const slasAvailableToEveryItem = intersection(
    ...arrayOfSlas.map(slas => slas.map(sla => sla.id))
  )

  // if all options are invalid, returns what used to be returned in the
  // previous "buggy" version
  const fallback = setSelectedSla({
    logisticsInfo,
    selectedSlas: bestIndividualSlas,
    activeChannel,
    isScheduledDeliveryActive,
  })

  const bestLogisticsInfo =
    sortBy(validLogisticsInfoArray, [
      li => getStructuredOption(li)[property],
      li => li.every(x => !slasAvailableToEveryItem.includes(x.selectedSla)),
    ])[0] || fallback

  const report = generateReport({
    arrayOfSlas,
    property,
    currentLogisticsInfo,
    bestIndividualLogisticsInfo,
    bestConsistentLogisticsInfo,
    bestLogisticsInfo,
    fallback,
  })

  return [bestLogisticsInfo, report]
}

function generateReport({
  arrayOfSlas,
  property,
  currentLogisticsInfo,
  bestIndividualLogisticsInfo,
  bestConsistentLogisticsInfo,
  fallback,
}) {
  const validLogisticsInfoArray = [
    { logisticsInfo: currentLogisticsInfo, method: 'current' },
    { logisticsInfo: bestIndividualLogisticsInfo, method: 'individual' },
    { logisticsInfo: bestConsistentLogisticsInfo, method: 'consistent' },
  ].filter(x => x.logisticsInfo)

  const slasAvailableToEveryItem = intersection(
    ...arrayOfSlas.map(slas => slas.map(sla => sla.id))
  )

  const bestLogisticsInfo = sortBy(validLogisticsInfoArray, [
    x => getStructuredOption(x.logisticsInfo)[property],
    x =>
      x.logisticsInfo.every(
        y => !slasAvailableToEveryItem.includes(y.selectedSla)
      ),
  ])[0] || { logisticsInfo: fallback, method: 'fallback' }

  const selectedSlas = [
    ...new Set(bestLogisticsInfo.logisticsInfo.map(li => li.selectedSla)),
  ]
  const numberOfAvailableSlas = new Set(
    arrayOfSlas.map(slas => slas.map(sla => sla.id))
  ).size

  const profit = bestIndividualLogisticsInfo
    ? getStructuredOption(bestLogisticsInfo.logisticsInfo)[property] -
      getStructuredOption(bestIndividualLogisticsInfo)[property]
    : -1

  const prefix = property === PRICE ? 'cheapest' : 'fastest'
  const report = {
    numberOfAvailableSlas,
    [`${prefix}Profit`]: profit,
    [`${prefix}NumberOfSelectedSlas`]: selectedSlas.length,
    [`${prefix}SelectedMethod`]: bestLogisticsInfo.method,
    [`${prefix}CurrentMethodIsValid`]: currentLogisticsInfo !== null,
    [`${prefix}IndividualMethodIsValid`]: bestIndividualLogisticsInfo !== null,
    [`${prefix}ConsistentMethodIsValid`]: bestConsistentLogisticsInfo !== null,
  }

  return report
}

function getAccountName() {
  const vtex = window.vtex
  return (
    (vtex && (vtex.accountName || (vtex.vtexid && vtex.vtexid.accountName))) ||
    (window.__RUNTIME__ && window.__RUNTIME__.account)
  )
}

function logReport(report) {
  const log = {
    level: 'Info',
    type: 'Debug',
    workflowType: 'lean-shipping',
    workflowInstance: 'get-lean-shipping-options',
    event: {
      ...report,
      orderFormId:
        window.vtexjs &&
        window.vtexjs.checkout &&
        window.vtexjs.checkout.orderFormId,
    },
    account: getAccountName(),
  }

  if (Math.random() < 0.1) {
    window.logSplunk && window.logSplunk(log)
  }
}

export function getLeanShippingOptions({
  logisticsInfo,
  activeChannel = DELIVERY,
  isScheduledDeliveryActive = false,
}) {
  const [cheapest, cheapestReport] = getBestOption({
    logisticsInfo,
    activeChannel,
    isScheduledDeliveryActive,
    property: PRICE,
  })

  const [fastest, fastestReport] = getBestOption({
    logisticsInfo,
    activeChannel,
    isScheduledDeliveryActive,
    property: SHIPPING_ESTIMATE_IN_SECONDS,
  })

  const fastestAndCheapestAreEqual = isEqual(cheapest, fastest)

  let combined = []

  if (!fastestAndCheapestAreEqual) {
    combined = getBestOption({
      logisticsInfo,
      activeChannel,
      isScheduledDeliveryActive,
      property: SHIPPING_ESTIMATE_IN_SECONDS,
    })[0]
  }

  logReport({
    activeChannel,
    isScheduledDeliveryActive,
    ...cheapestReport,
    ...fastestReport,
  })

  return {
    ...(shouldShowCheapest(cheapest, fastest) ? { cheapest } : {}),
    ...(shouldShowCombined(cheapest, fastest, combined) ? { combined } : {}),
    ...(shouldShowFastest(cheapest, fastest) ? { fastest } : {}),
  }
}
