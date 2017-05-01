const BluetoothSetupServer = require('./libs/bluetooth')
const wificonn = require('./libs/wifi-connector')

const bluServer = new BluetoothSetupServer()
bluServer.setReceiveSetupListener(setup => {
  wificonn
    .connect(setup.ssid, setup.psk)
    .then(() => {
      bluServer.connectionSucceed()
    })
    .catch(err => {
      console.log(err)
    })
})

console.log('starting ble server')
bluServer.startBle()
