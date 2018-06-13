# lean-shipping-calculator

> Small library to create lean shipping options

## Install

```sh
$ npm install @vtex/lean-shipping-calculator
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

### getShippingEstimateQuantityInSeconds(estimate)

Returns shippingEstimate converted to seconds

#### estimate

Type: `String`

shippingEstimate of a given SLA

### getLatestSla(slas)

Returns the SLA that will take the most time (i.e: worst-case scenario in a shippingEstimate context)

#### slas

Type: `Array`

List of SLAS
