# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.20] - 2023-04-04
### Fixed
- Pick up selection when switching between delivery and pickup with item only available for pickup.

## [0.2.19] - 2022-10-06
### Fixed
- Error when calculating packages length with item only available for pickup.

## [0.2.18] - 2022-07-21
### Fixed
- Calculation of `packagesLength` not considering SLA estimate.

## [0.2.17] - 2022-07-06
### Fixed
- Error when `address` is `undefined`.

## [0.2.16] - 2022-07-06
### Changed
- Bundle all IO app entrypoints in NPM package.

## [0.2.15] - 2022-07-05
### Changed
- Remove `vtex.address-form` dependency.

### Fixed
- Build script not working.

## [0.2.14] - 2021-09-28

### Added

- Debug logs for getLeanShippingOptions function

## [0.2.13] - 2021-09-21

### Fixed

- Validate selected SLAs and consider different options.

## [0.2.12] - 2021-07-29

### Fixed

- Use consistency of SLA's through items as a tiebreaker.

## [0.2.11] - 2020-11-17

### Changed

- `findSlaWithChannel` now returns the cheapest SLA.

## [0.2.10] - 2020-05-13

### Fixed

- Pickup SLAs can not be selected when the `selectedDeliveryChannel` is `delivery`.

## [0.2.9] - 2020-04-30

### Fixed

- `hasItemWithMandatoryScheduledDelivery` only evaluates to `true` if all the SLAs have `delivery` as their delivery channel.

## [0.2.8] - 2020-04-20

### Changed

- Scheduled SLAs are no longer taken into consideration when calculating lean shipping options.

## [0.2.7] - 2020-04-08

### Fixed

- In Pickup channel, `setSelectedSlaFromSlaOption` only sets the SLA of items that have that SLA.

## [0.2.6] - 2020-04-07

### Fixed

- `setSelectedSlaFromSlaOption` only sets the SLA of items that have that SLA.

## [0.2.5] - 2019-08-14

### Changed

- Selecting pickup points considering if have single or multiple items

## [0.2.4] - 2019-08-06

### Changed

- `findSlaWithChannel` to prioritize non scheduled options to select

## [0.2.3] - 2019-07-04

## [0.2.2] - 2019-07-04

### Changed

- Behavior when switching between deliveryChannels.

## [0.2.1] - 2019-05-28

### Fixed

- Showing combined

## [0.2.0] - 2019-05-28

### Added

- `setSelectedSlaFromSlaOption` `changeActiveSlas` helper functions to select slas

## [0.1.5] - 2019-02-04

### Fixed

- Item selection from `itemId` to `itemIndex`

## [0.1.4] - 2019-01-11

### Fixed

- Fix selecting empty logisticsInfo

## [0.1.3] - 2019-01-04

### Changed

- Filter SLAs per current channel

## [0.1.2] - 2018-12-12

### Changed

- Fix behavior when selecting multiple scheduled deliveries

## [0.1.1] - 2018-12-06

### Changed

- Mantain scheduled delivery if is already selected

## [0.1.0] - 2018-11-30

- Update conditions to select scheduled delivery
- Transpose component to VTEX IO maintaining support for npm package
- Update unit tests
- Add CHANGELOG.md
- Add github templates
- Add husky integration for linting and testing before push
