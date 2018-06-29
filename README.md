<h1 align="center">
  <img src="https://raw.githubusercontent.com/omarandstuff/desplega-api/master/media/desplega-logo.png" alt="Desplega-api" title="Desplega-api" width="512">
</h1>

[![npm version](https://badge.fury.io/js/desplega-api.svg)](https://www.npmjs.com/package/desplega-api)
[![Build Status](https://travis-ci.org/omarandstuff/desplega-api.svg?branch=master)](https://travis-ci.org/omarandstuff/desplega-api)
[![Maintainability](https://api.codeclimate.com/v1/badges/c7a58bcf312d8c47c4fa/maintainability)](https://codeclimate.com/github/omarandstuff/desplega-api/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/c7a58bcf312d8c47c4fa/test_coverage)](https://codeclimate.com/github/omarandstuff/desplega-api/test_coverage)

Desplega api is what Desplega uses internally to run pipelines.

## API

### Loader
Searchs and load a desplega file

### Local
Basic local exec functionality.

### LocalManager
Extended local exec functionality.

### LocalStep
Can be executed by a runner like an Stage object.

### Parser
Parses deplega files and convert them into actual Pipelines, Stages and Steps objects.

### Pipeline
Object to manage the whole exec process.

### Printer
Print features for the UI.

### Remote
Basic remote exec functionality.

### RemoteManager
Extended remote exec functionality.

### RemoteStep
Can be executed by a runner like an Stage object.

### Runner
Base runner class for Stages and Pipelines.

### Stage
Sub runner to be executed by a Pipeline object.

### Theme
Basic chalk theming generation.

### utils
Some functions that do not fit on classes to reuse.

## TODO
If people get interested in desplega we can document a lot further so people can use this api for other projects.

## Contribtions
PRs are welcome.

## Lisence
MIT
