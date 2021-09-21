# lean-shipping-calculator

> Utilities library to for VTEX lean shipping options

[Documentation](https://docs.google.com/document/d/1tDhV1ZOhHhwRYXRGcYmsLvNjsc2pzfQGHKePV68BEKg)

## Install

```sh
$ npm install @vtex/lean-shipping-calculator -S
```

---

## API

### getLeanShippingOptions({ logisticsInfo, activeChannel, isScheduledDeliveryActive })

Returns lean shipping options (cheapest, fastest and combined)

#### logisticsInfo

Type: `Array`

Logistics info for each item

#### activeChannel

Type: `String` <br/>
Default: `delivery`

Active channel

#### isScheduledDeliveryActive

Type: `boolean` <br/>
Default: `false`

---

### getOptionsDetails(delivery)

Get more details about each lean option

#### delivery

Type: `Object`

Lean shipping options

---

### getSelectedDeliveryOption

Get lean shipping option that is current selected

#### delivery

Type: `Object`

Object with lean shipping options

---

## Usage

### getLeanShippingOptions

Return all options are only returned if they are worthy according to the calculation.

```js
const leanShippingCalculator = require('@vtex/lean-shipping-calculator')

const options = leanShippingCalculator.getLeanShippingOptions({
  logisticsInfo,
  activeChannel,
})

console.log(options)
// {
//   cheapest: [{item1}, {item2}],
//   fastest:  [{item1}, {item2}],
//   combined: [{item1}, {item2}]
// }
```

An example of the function returning only cheapest option:

```js
console.log(options)
// {
//   cheapest: [{item1}, {item2}]
// }
```

### getOptionsDetails

Returns more details about each lean shipping option

```js
const leanShippingCalculator = require('@vtex/lean-shipping-calculator')

const optionDetails = leanShippingCalculator.getOptionsDetails({
  [CHEAPEST]: cheapestOption,
  [COMBINED]: combinedOption,
  [FASTEST]: fastestOption,
})

console.log(optionDetails)
// [
//   {
//     averageEstimatePerItem: 520200,
//     id: 'CHEAPEST',
//     packagesLength: 2,
//     price: 1000,
//     shippingEstimate: '8bd',
//   },
//   {
//     averageEstimatePerItem: 220200,
//     id: 'COMBINED',
//     packagesLength: 2,
//     price: 3000,
//     shippingEstimate: '2bd',
//   },
//   {
//     averageEstimatePerItem: 300200,
//     id: 'FASTEST',
//     packagesLength: 2,
//     price: 1500,
//     shippingEstimate: '5bd',
//   }
// ]
```

### getSelectedDeliveryOption

Returns the selected lean options

```js
const leanShippingCalculator = require('@vtex/lean-shipping-calculator')

const optionToBeSelected = leanShippingCalculator.getSelectedDeliveryOption({
  optionsDetails = null,
  newCombined,
  newFastest,
  newCheapest,
  activeDeliveryOption,
})

console.log(optionToBeSelected) // CHEAPEST
```
