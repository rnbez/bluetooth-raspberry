const util = require('util')
const bleno = require('bleno')

const Descriptor = bleno.Descriptor
const Characteristic = bleno.Characteristic

let state = {
  connected: false
}

const StateCharacteristic = function() {
  StateCharacteristic.super_.call(this, {
    uuid: '40c67dc7-ad9a-43a0-b7b5-0407e21392e6',
    properties: ['read', 'notify'],
    value: null,
    descriptors: [
      new Descriptor({
        uuid: '480d9d58-424d-435f-80bc-5e2664c42693',
        value: 'Current state of the device: connected or not-connected'
      })
    ]
  })

  // this._value = new Buffer(0)
  // this._updateValueCallback = null
}

util.inherits(StateCharacteristic, Characteristic)

StateCharacteristic.prototype.onReadRequest = function(offset, callback) {
  // console.log(
  //   'StateCharacteristic - onReadRequest: value = ' +
  //     this._value.toString('hex')
  // )
  if (offset) {
    console.log(offset, this.RESULT_ATTR_NOT_LONG)
    callback(this.RESULT_ATTR_NOT_LONG, null)
  } else {
    const buf = new Buffer(JSON.stringify(state))
    console.log(
      'StateCharacteristic - onReadRequest: value = ' + buf.toString('hex')
    )
    console.log(
      'StateCharacteristic - onReadRequest: value = ' + buf.toString()
    )
    console.log(offset, this.RESULT_SUCCESS)
    callback(this.RESULT_SUCCESS, buf)
  }
}

StateCharacteristic.prototype.onSubscribe = function(
  maxValueSize,
  updateValueCallback
) {
  console.log('StateCharacteristic - onSubscribe')

  this._updateValueCallback = updateValueCallback
}

StateCharacteristic.prototype.onUnsubscribe = function() {
  console.log('StateCharacteristic - onUnsubscribe')

  this._updateValueCallback = null
}

StateCharacteristic.prototype.setState = function(connected) {
  console.log(connected)
  state = {
    connected
  }

  if (this._updateValueCallback) {
    const buf = new Buffer(JSON.stringify(state))
    console.log('StateCharacteristic - onWriteRequest: notifying')
    this._updateValueCallback(buf)
  }
}

module.exports = StateCharacteristic
