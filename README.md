# lean-shipping-calculator

> Small library to create lean shipping options

## Install

```sh
$ npm install @vtex/lean-shipping-calculator -S
```

## Usage

```js
const leanShippingCalculator = require('@vtex/lean-shipping-calculator')

leanShippingCalculator.getLeanShippingOptions(logisticsInfo, activeChannel)
/*
{
  cheapest: [{item1}, {item2}],
  fastest: [{item1}, {item2}],
  combined: [{item1}, {item2}]
}

The options above are only returned if they are worthy according to the calculation.
An example of the function returning only cheapest option:

{
  cheapest: [{item1}, {item2}]
}
*/
```

## API

### getLeanShippingOptions

Returns lean shipping options (cheapest, fastest and combined)

### getOptionsDetails

Get more details about each lean option

### getSelectedDeliveryOption

Get selected delivery options
