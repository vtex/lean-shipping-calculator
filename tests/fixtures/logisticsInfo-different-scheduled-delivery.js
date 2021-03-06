const DIFFERENT_SCHEDULED_DELIVERY_LOGISTICS_INFO = [
  {
    itemIndex: 0,
    selectedSla: 'agendada',
    selectedDeliveryChannel: '',
    addressId: '62e1db5500824a66bcef708d09388a8e',
    slas: [
      {
        id: 'agendada',
        deliveryChannel: 'delivery',
        name: 'agendada',
        deliveryIds: [
          {
            courierId: '1',
            warehouseId: '1afe1cf',
            dockId: '1b91c3b',
            courierName: 'Courrier e-commerce',
            quantity: 1,
          },
        ],
        shippingEstimate: '0bd',
        shippingEstimateDate: null,
        lockTTL: null,
        availableDeliveryWindows: [{}, {}],
        deliveryWindow: null,
        price: 334,
        listPrice: 334,
        tax: 0,
        pickupStoreInfo: {
          isPickupStore: false,
          friendlyName: null,
          address: null,
          additionalInfo: null,
          dockId: null,
        },
      },
    ],
    shipsTo: ['BRA'],
    itemId: '100006786',
    deliveryChannels: [
      {
        id: 'delivery',
      },
    ],
  },
  {
    itemIndex: 1,
    selectedSla: 'outra agendada',
    selectedDeliveryChannel: '',
    addressId: '62e1db5500824a66bcef708d09388a8e',
    slas: [
      {
        id: 'outra agendada',
        deliveryChannel: 'delivery',
        name: 'outra agendada',
        deliveryIds: [
          {
            courierId: '1',
            warehouseId: '1afe1cf',
            dockId: '1b91c3b',
            courierName: 'Courrier e-commerce',
            quantity: 1,
          },
        ],
        shippingEstimate: '0bd',
        shippingEstimateDate: null,
        lockTTL: null,
        availableDeliveryWindows: [{}, {}],
        deliveryWindow: null,
        price: 333,
        listPrice: 333,
        tax: 0,
        pickupStoreInfo: {
          isPickupStore: false,
          friendlyName: null,
          address: null,
          additionalInfo: null,
          dockId: null,
        },
      },
      {
        id: 'Expressa',
        deliveryChannel: 'delivery',
        name: 'Expressa',
        deliveryIds: [
          {
            courierId: '14bebf5',
            warehouseId: '1afe1cf',
            dockId: '188bc53',
            courierName: 'Courrier a jato',
            quantity: 1,
          },
        ],
        shippingEstimate: '0bd',
        shippingEstimateDate: null,
        lockTTL: null,
        availableDeliveryWindows: [],
        deliveryWindow: null,
        price: 6667,
        listPrice: 6667,
        tax: 0,
        pickupStoreInfo: {
          isPickupStore: false,
          friendlyName: null,
          address: null,
          additionalInfo: null,
          dockId: null,
        },
      },
    ],
    shipsTo: ['BRA'],
    itemId: '100006786',
    deliveryChannels: [
      {
        id: 'delivery',
      },
    ],
  },
]

module.exports = { DIFFERENT_SCHEDULED_DELIVERY_LOGISTICS_INFO }
