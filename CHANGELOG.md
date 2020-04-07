# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
