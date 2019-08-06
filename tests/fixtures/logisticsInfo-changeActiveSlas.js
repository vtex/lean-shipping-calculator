import { DELIVERY, PICKUP_IN_STORE } from '../../react/constants'

const ONLY_DELIVERY_NO_SLAS_LOGISTICS_INFO = [
  {
    addressId: 'residentialId',
    itemIndex: 0,
    selectedDeliveryChannel: DELIVERY,
    deliveryChannels: [
      {
        id: DELIVERY,
      },
      {
        id: PICKUP_IN_STORE,
      },
    ],
    slas: [],
    selectedSla: null,
  },
]

const ONLY_DELIVERY_LOGISTICS_INFO = [
  {
    addressId: 'residentialId',
    itemIndex: 0,
    selectedDeliveryChannel: DELIVERY,
    deliveryChannels: [
      {
        id: DELIVERY,
      },
      {
        id: PICKUP_IN_STORE,
      },
    ],
    slas: [
      {
        id: 'deliverySLA',
        deliveryChannel: DELIVERY,
        availableDeliveryWindows: [],
      },
    ],
    selectedSla: 'deliverySLA',
  },
]

const DELIVERY_PICKUP_LOGISTICS_INFO = [
  {
    addressId: 'residentialId',
    itemIndex: 0,
    selectedDeliveryChannel: DELIVERY,
    deliveryChannels: [
      {
        id: DELIVERY,
      },
      {
        id: PICKUP_IN_STORE,
      },
    ],
    slas: [
      {
        id: 'deliverySLA',
        deliveryChannel: DELIVERY,
        availableDeliveryWindows: [],
      },
      {
        id: 'pickupSla',
        deliveryChannel: PICKUP_IN_STORE,
        availableDeliveryWindows: [],
      },
    ],
    selectedSla: 'deliverySLA',
  },
]

const MULTIPLE_DELIVERY_PICKUP_LOGISTICS_INFO = [
  {
    addressId: 'residentialId',
    itemIndex: 0,
    selectedDeliveryChannel: DELIVERY,
    deliveryChannels: [
      {
        id: DELIVERY,
      },
      {
        id: PICKUP_IN_STORE,
      },
    ],
    slas: [
      {
        id: 'deliverySLA',
        deliveryChannel: DELIVERY,
        availableDeliveryWindows: [],
      },
      {
        id: 'pickupSla',
        deliveryChannel: PICKUP_IN_STORE,
        availableDeliveryWindows: [],
      },
    ],
    selectedSla: 'deliverySLA',
  },
  {
    addressId: 'residentialId',
    itemIndex: 0,
    selectedDeliveryChannel: DELIVERY,
    deliveryChannels: [
      {
        id: DELIVERY,
      },
      {
        id: PICKUP_IN_STORE,
      },
    ],
    slas: [
      {
        id: 'deliverySLA',
        deliveryChannel: DELIVERY,
        availableDeliveryWindows: [],
      },
    ],
    selectedSla: 'deliverySLA',
  },
]

const PICKUP_SELECTED_LOGISTICS_INFO = [
  {
    addressId: 'residentialId',
    itemIndex: 0,
    selectedDeliveryChannel: DELIVERY,
    deliveryChannels: [
      {
        id: DELIVERY,
      },
      {
        id: PICKUP_IN_STORE,
      },
    ],
    slas: [
      {
        id: 'deliverySLA',
        deliveryChannel: DELIVERY,
        availableDeliveryWindows: [],
      },
      {
        id: 'pickupSla',
        deliveryChannel: PICKUP_IN_STORE,
        availableDeliveryWindows: [],
      },
      {
        id: 'pickupSlaSelected',
        deliveryChannel: PICKUP_IN_STORE,
        availableDeliveryWindows: [],
      },
    ],
    selectedSla: 'deliverySLA',
  },
]

const MULTIPLE_SELLERS_LOGISTICS_INFO = [
  {
    addressId: 'residentialId',
    itemIndex: 0,
    selectedDeliveryChannel: DELIVERY,
    deliveryChannels: [
      {
        id: DELIVERY,
      },
      {
        id: PICKUP_IN_STORE,
      },
    ],
    slas: [
      {
        id: 'deliverySLA',
        deliveryChannel: DELIVERY,
        availableDeliveryWindows: [],
      },
      {
        id: 'pickupSeller1',
        deliveryChannel: PICKUP_IN_STORE,
        availableDeliveryWindows: [],
      },
    ],
    selectedSla: 'deliverySLA',
  },
  {
    addressId: 'residentialId',
    itemIndex: 1,
    selectedDeliveryChannel: DELIVERY,
    deliveryChannels: [
      {
        id: DELIVERY,
      },
      {
        id: PICKUP_IN_STORE,
      },
    ],
    slas: [
      {
        id: 'deliverySLA',
        deliveryChannel: DELIVERY,
        availableDeliveryWindows: [],
      },
      {
        id: 'pickupSeller2',
        deliveryChannel: PICKUP_IN_STORE,
        availableDeliveryWindows: [],
      },
    ],
    selectedSla: 'deliverySLA',
  },
]

module.exports = {
  ONLY_DELIVERY_NO_SLAS_LOGISTICS_INFO,
  ONLY_DELIVERY_LOGISTICS_INFO,
  DELIVERY_PICKUP_LOGISTICS_INFO,
  PICKUP_SELECTED_LOGISTICS_INFO,
  MULTIPLE_SELLERS_LOGISTICS_INFO,
  MULTIPLE_DELIVERY_PICKUP_LOGISTICS_INFO,
}
