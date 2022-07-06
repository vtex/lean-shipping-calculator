import { DELIVERY, PICKUP_IN_STORE } from '../../constants'

export const ONLY_DELIVERY_NO_SLAS_LOGISTICS_INFO = [
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

export const ONLY_DELIVERY_LOGISTICS_INFO = [
  {
    addressId: 'residentialId',
    itemIndex: 0,
    selectedDeliveryChannel: DELIVERY,
    deliveryChannels: [
      {
        id: DELIVERY,
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

export const DELIVERY_PICKUP_LOGISTICS_INFO = [
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

export const MULTIPLE_DELIVERY_PICKUP_LOGISTICS_INFO = [
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
    ],
    selectedSla: 'deliverySLA',
  },
]

export const PICKUP_SELECTED_LOGISTICS_INFO = [
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

export const NO_PICKUP_SELECTED_LOGISTICS_INFO = [
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

export const MULTIPLE_SELLERS_LOGISTICS_INFO = [
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
