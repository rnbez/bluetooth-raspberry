const cmd = require('node-cmd')
const util = require('util')
const bleno = require('bleno')

const Characteristic = bleno.Characteristic

let address = '0.0.0.0'

const AddressCharacteristic = function() {
  AddressCharacteristic.super_.call(this, {
    uuid: '7a305c79-e3be-4e05-9208-591d8617908c',
    properties: ['read'],
    value: null
  })
}

util.inherits(AddressCharacteristic, Characteristic)

AddressCharacteristic.prototype.onReadRequest = function(offset, callback) {
  if (offset) {
    console.log(offset, this.RESULT_ATTR_NOT_LONG)
    callback(this.RESULT_ATTR_NOT_LONG, null)
  } else {
    const buf = new Buffer(address)
    console.log(
      'AddressCharacteristic - onReadRequest: value = ' + buf.toString('hex')
    )
    console.log(
      'AddressCharacteristic - onReadRequest: value = ' + buf.toString()
    )
    console.log(offset, this.RESULT_SUCCESS)
    callback(this.RESULT_SUCCESS, buf)
  }
}

AddressCharacteristic.prototype.getIpAddress = function() {
  cmd.get('ifconfig wlan0 | grep "inet addr"', function(err, data, stderr) {
    if (err || stderr) {
      console.log('ERROR')
      return
    }
    if (!data) {
      return
    }
    const spl = data.trim().split('  ')
    if (spl.length === 0 || !spl[0].startsWith('inet addr')) {
      return
    }
    address = spl[0].replace('inet addr:', '')
    console.log(address)
  })
}

module.exports = AddressCharacteristic
