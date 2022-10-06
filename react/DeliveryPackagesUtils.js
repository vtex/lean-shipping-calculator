import estimateCalculator, {
  getShippingEstimateQuantityInSeconds,
} from '@vtex/estimate-calculator'
import flatten from 'lodash/flatten'
import groupBy from 'lodash/groupBy'
import get from 'lodash/get'
import isArray from 'lodash/isArray'
import sortBy from 'lodash/sortBy'
import findIndex from 'lodash/findIndex'
import uniq from 'lodash/uniq'
import uniqBy from 'lodash/uniqBy'

import { hasSLAs, isDelivery, getSelectedSlaInSlas } from './utils'

function hasMoreThanOneSla(li) {
  return li.slas.length > 1
}

function hasAvailableDeliveryWindows(sla) {
  return sla.availableDeliveryWindows.length > 0
}

function getUniqueSlasById(logisticsInfo) {
  return uniqBy(
    flatten(
      logisticsInfo.map(li =>
        li.slas.filter(
          sla =>
            isDelivery(sla) &&
            (hasMoreThanOneSla(li) ? !hasAvailableDeliveryWindows(sla) : true)
        )
      )
    ),
    'id'
  )
}

function getPackagesLength(chosenPackage) {
  const packages = uniq(
    flatten(
      chosenPackage
        .filter(
          (li) =>
            isDelivery(li) &&
            (!!li.selectedSla || (hasSLAs(li) && li.slas.some(isDelivery)))
        )
        .map((li) => {
          const sla = li.slas.find((sla) => sla.id === li.selectedSla)

          if (sla == null) {
            return null
          }

          return sla.id + sla.shippingEstimate
        })
    )
  )

  return packages.length
}

function getCheapestSlasFromLogisticsInfo(logisticsInfo) {
  return (
    (logisticsInfo &&
      sortBy(getUniqueSlasById(logisticsInfo), sla => sla.price)) ||
    []
  )
}

function getFastestSlasFromLogisticsInfo(logisticsInfo) {
  return (
    (logisticsInfo &&
      sortBy(
        getUniqueSlasById(logisticsInfo),
        sla =>
          sla &&
          estimateCalculator.getShippingEstimateQuantityInSeconds(
            sla.shippingEstimate
          )
      )) ||
    []
  )
}

function getGroupedLogisticsInfoWithSelectedSlas(slas, logisticsInfo) {
  return (
    (slas.length > 1 &&
      logisticsInfo.length > 1 &&
      slas.map(sla => {
        const groupedLogisticsInfoBySlas = groupBy(logisticsInfo, li => {
          const groupedSla = li.slas.find(localSla => localSla.id === sla.id)
          return groupedSla && groupedSla.id
        })

        // if group is not undefined select sla in li
        return Object.keys(groupedLogisticsInfoBySlas).map(selectedSla => {
          const isSelectedSlaUndefined = selectedSla !== 'undefined'

          const notUndefinedLogisticsInfo =
            isSelectedSlaUndefined &&
            groupedLogisticsInfoBySlas[selectedSla].map(li => ({
              ...li,
              selectedSla,
            }))

          return (
            notUndefinedLogisticsInfo || {
              unselectedLogisticsInfo: groupedLogisticsInfoBySlas.undefined,
            }
          )
        })
      })) ||
    estimateCalculator.selectCheapestSlaForAllItems(logisticsInfo)
  )
}

export function getCostBenefitCombination(logisticsInfo) {
  const fastestSlas = getFastestSlasFromLogisticsInfo(logisticsInfo)
  const groupedLIsWithSelectedSlas = getGroupedLogisticsInfoWithSelectedSlas(
    fastestSlas,
    logisticsInfo
  )

  const groupedLIsWithUnselectedLogisticsInfo =
    groupedLIsWithSelectedSlas.find(item => isArray(item)) &&
    groupedLIsWithSelectedSlas.length > 1 &&
    flatten(
      groupedLIsWithSelectedSlas[1].map(liGroup => {
        const hasUnselected = get(liGroup, 'unselectedLogisticsInfo')
        return hasUnselected
          ? getCostBenefitCombination(get(liGroup, 'unselectedLogisticsInfo'))
          : liGroup
      })
    )

  return (
    groupedLIsWithUnselectedLogisticsInfo || groupedLIsWithSelectedSlas || []
  )
}

function getGroupedLIsWithLessPackages(logisticsInfo) {
  return (
    logisticsInfo &&
    logisticsInfo.reduce((previousLIGroup, currentLIGroup) => {
      const previousArray = previousLIGroup.find(item => isArray(item))
      const currentArray = currentLIGroup.find(item => isArray(item))

      if (!previousArray) return currentLIGroup

      if (!currentArray) return previousLIGroup

      return previousArray.length >= currentArray.length
        ? previousLIGroup
        : currentLIGroup
    })
  )
}

export function getCheapestCombination(logisticsInfo) {
  const cheapestSlas = getCheapestSlasFromLogisticsInfo(logisticsInfo)

  const freeSla = cheapestSlas.find(sla => sla.price === 0)

  const groupedLIsWithSelectedSlas = getGroupedLogisticsInfoWithSelectedSlas(
    cheapestSlas,
    logisticsInfo
  )

  const groupedLIsWithLessPackages =
    groupedLIsWithSelectedSlas.find(item => isArray(item)) &&
    getGroupedLIsWithLessPackages(groupedLIsWithSelectedSlas)

  const groupedLIsWithFreeSla =
    freeSla && groupedLIsWithSelectedSlas[findIndex(cheapestSlas, freeSla)]

  const selectedGroupedLIs =
    groupedLIsWithFreeSla ||
    groupedLIsWithLessPackages ||
    groupedLIsWithSelectedSlas

  const groupedLIsWithUnselectedLogisticsInfo =
    selectedGroupedLIs &&
    selectedGroupedLIs.length > 0 &&
    flatten(
      selectedGroupedLIs.map(liGroup => {
        const hasUnselected = get(liGroup, 'unselectedLogisticsInfo')

        return hasUnselected
          ? getCheapestCombination(get(liGroup, 'unselectedLogisticsInfo'))
          : liGroup
      })
    )

  return groupedLIsWithUnselectedLogisticsInfo || [selectedGroupedLIs] || []
}

function getLatestSLAEstimate(option) {
  const latestSla = estimateCalculator.getLatestSla(
    option
      .filter(li => !!li.selectedSla && hasSLAs(li) && isDelivery(li))
      .map(li => getSelectedSlaInSlas(li))
  )

  return latestSla && latestSla.shippingEstimate
}

function getAccumulatedPrice(option) {
  return (
    option &&
    option
      .filter(li => (!!li.selectedSla || hasSLAs(li)) && isDelivery(li))
      .reduce((acc, currentItem) => {
        const selectedSla = getSelectedSlaInSlas(currentItem)

        if (
          selectedSla &&
          selectedSla.availableDeliveryWindows &&
          selectedSla.availableDeliveryWindows.length > 0
        ) {
          return acc
        }

        return selectedSla ? acc + selectedSla.price : acc
      }, 0)
  )
}

function convertShippingEstimateToSeconds(sla) {
  return Math.abs(
    estimateCalculator.getShippingEstimateQuantityInSeconds(
      sla.shippingEstimate
    )
  )
}

function getTotalEstimate(leanOption) {
  return leanOption
    .filter(li => isDelivery(li))
    .reduce((acc, currentItem) => {
      const selectedSla = getSelectedSlaInSlas(currentItem)

      return (
        (selectedSla && acc + convertShippingEstimateToSeconds(selectedSla)) ||
        acc + 0
      )
    }, 0)
}

function getAverageEstimate(leanOption) {
  const estimateSum = leanOption && getTotalEstimate(leanOption)

  return estimateSum / leanOption.length
}

export function getStructuredOption(option, optionString) {
  const shippingEstimate = getLatestSLAEstimate(option)
  return {
    price: getAccumulatedPrice(option),
    shippingEstimate,
    shippingEstimateInSeconds: getShippingEstimateQuantityInSeconds(
      shippingEstimate
    ),
    averageEstimatePerItem: getAverageEstimate(option),
    packagesLength: getPackagesLength(option),
    ...(optionString ? { id: optionString } : {}),
  }
}
