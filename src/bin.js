#!/usr/bin/env node
require('perish')
var log = require('./logger')
var meow = require('meow')
var cosmos = require('./cosmos')
var cli = meow(
  `
    Usage
      $ cosmos <input>

    Options
      --motto, -m  Show the cosmonauts motto

    Examples
      $ cosmos listen # listen for cosmonaut travel requests
      $ cosmos --motto
`,
  {
    flags: {
      version: {
        type: 'boolean',
        alias: 'm'
      }
    }
  }
)

if (cli.flags.motto) {
  log('to infinity, and beyond! 🚀')
} else {
  cosmos.listen()
}
