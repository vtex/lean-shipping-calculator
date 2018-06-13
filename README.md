# lean-shipping-calculator

> Utilities library to for VTEX lean shipping options

## Install

```sh
$ npm install @vtex/lean-shipping-calculator -S
```

---

## API

### getLeanShippingOptions(logisticsInfo, activeChannel)

Returns lean shipping options (cheapest, fastest and combined)

#### logisticsInfo

Type: `Array`

Logistics info for each item

#### activeChannel

Type: `String`

Active channel

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

```js
const leanShippingCalculator = require('@vtex/lean-shipping-calculator')
leanShippingCalculator.getLeanShippingOptions(logisticsInfo, activeChannel)

/*
// Returns

{
  cheapest: [{item1}, {item2}],
  fastest: [{item1}, {item2}],
  combined: [{item1}, {item2}]
}

All options are only returned if they are worthy according to the calculation.
An example of the function returning only cheapest option:

{
  cheapest: [{item1}, {item2}]
}
*/
```

### getOptionsDetails

Returns more details about each lean shipping option

```js
const leanShippingCalculator = require('@vtex/lean-shipping-calculator')
leanShippingCalculator.getOptionsDetails({
  [CHEAPEST]: cheapestOption,
  [COMBINED]: combinedOption,
  [FASTEST]: fastestOption,
})

// For each lean shipping option, it returns

[
  {
    averageEstimatePerItem: 520200,
    id: 'CHEAPEST',
    packagesLength: 2,
    price: 1500,
    shippingEstimate: '8bd',
  }
]
```

### getSelectedDeliveryOption

```js
const leanShippingCalculator = require('@vtex/lean-shipping-calculator')
leanShippingCalculator.getSelectedDeliveryOption({
  optionsDetails = null,
  newCombined,
  newFastest,
  newCheapest,
  activeDeliveryOption,
})

/*
It returns the selected lean options

Ex: CHEAPEST
*/
```
