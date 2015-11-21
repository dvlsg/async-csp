# Change Log

## 0.3.0 (2015-11-21)

### Changed

- **(BREAKING)** `Channel` is no longer buffered by default. To make a buffered `Channel`, you must pass a size into the constructor. ([c17ddb8](https://github.com/dvlsg/async-csp/commit/c17ddb8954090d655c2b20790fb4dc07d4d985f5))

### Added

- `Channel.pipeline()` can now accept an array of functions to make a set of piped `Channel`s. ([45656df](https://github.com/dvlsg/async-csp/commit/45656df827f8df589f947bd7f67054674dc19d6c))

## 0.2.2 (2015-09-28)

### Added

- Added `Channel#tail()`. ([6058027](https://github.com/dvlsg/async-csp/commit/605802764bd7f2498a7ef97dce27f8f4041ec846))

## 0.2.1 (2015-07-25)

### Changed

- Performance improvements with `Channel#consume()`. ([5d2f9e9](https://github.com/dvlsg/async-csp/commit/5d2f9e9b1d759d84f3e9f3fe57ced5c37a519def))

## 0.2.0 (2015-07-25)

### Changed

- `Channel.from()` will now set the size of the returned `Channel` to the size of the original iterable. ([4a712bf](https://github.com/dvlsg/async-csp/commit/4a712bf8c8dd66aeb0ae41afe083633dbe598c34))

### Added

- Added support for asynchronous `Channel` transforms. ([15b0eb0](https://github.com/dvlsg/async-csp/commit/15b0eb09e84b26cd8a73b96eb1fd4638b4287dc3), [4a712bf](https://github.com/dvlsg/async-csp/commit/4a712bf8c8dd66aeb0ae41afe083633dbe598c34))

### Fixed

- `Channel#consume()` will no longer trigger a `Channel#close()` until the final consume callback has been settled. This means the general flow should still be the same, but any instances of `Channel#done()` should wait to resolve until `Channel#consume()` is done working. ([da66c61](https://github.com/dvlsg/async-csp/commit/da66c61e954caad58bbd62a68c11b43216859db7))

## 0.1.0 (2015-06-27)

### Added

- Initial commit for all `Channel` code.
