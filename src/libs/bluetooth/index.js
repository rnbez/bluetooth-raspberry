const bleno = require('bleno')

const BlenoPrimaryService = bleno.PrimaryService
const primaryServiceUuid = '4095880c-f7c3-42df-9a49-8dbb7a171995'

const AddressCharacteristic = require('./address')
const SetupCharacteristic = require('./setup')
const StateCharacteristic = require('./state')

class BluetoothSetupServer {
  constructor(onReceiveSetup) {
    this.address = new AddressCharacteristic()
    this.state = new StateCharacteristic()
    this.setup = new SetupCharacteristic()
    this.setup.setReceiveSetupListener(onReceiveSetup)

  }

  setReceiveSetupListener(onReceiveSetup) {
    this.setup.setReceiveSetupListener(onReceiveSetup)
  }

  getIpAddress() {
    this.address.getIpAddress()
  }

  startBle() {
    console.log('rpi wifi config - ble!')

    bleno.on('stateChange', (state) => {
      console.log('on -> stateChange: ' + state)

      if (state === 'poweredOn') {
        bleno.startAdvertising('Raspberry Pi 3', [primaryServiceUuid])
      } else {
        bleno.stopAdvertising()
      }
    })

    bleno.on('advertisingStart', (error) => {
      console.log(
        'on -> advertisingStart: ' + (error ? 'error ' + error : 'success')
      )

      if (!error) {
        bleno.setServices([
          new BlenoPrimaryService({
            uuid: primaryServiceUuid,
            characteristics: [this.address, this.state, this.setup]
          })
        ])
      }
    })
  }

  connectionSucceed() {
    this.state.setState(true)
  }
}

module.exports = BluetoothSetupServer
