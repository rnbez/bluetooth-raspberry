const Promise = require('bluebird')
const cmd = require('node-cmd')
const fs = require('fs')

const getAsync = Promise.promisify(cmd.get, { multiArgs: true, context: cmd })

function isConnected(retry = false) {
  return new Promise((resolve, reject) => {
    const command = '/sbin/iw wlan0 link'
    console.log(command)
    getAsync(command)
      .then(data => {
        console.log('cmd data', data)
        const connected = !data[0].toLowerCase().includes('not connected')
        if (!retry) {
          resolve(connected)
          return
        } else {
          console.log('WILL CHECK CONNECTION STATUS AGAIN IN 2 SECONDS')
          return Promise.delay(2000)
            .then(() => {
              return getAsync(command)
            })
            .then(data => {
              console.log('cmd data', data)
              const connected = !data[0]
                .toLowerCase()
                .includes('not connected')
              if (connected) {
                resolve(connected)
                return
              } else {
                console.log('WILL CHECK CONNECTION STATUS AGAIN IN 5 SECONDS')
                return Promise.delay(5000)
                  .then(() => {
                    return getAsync(command)
                  })
                  .then(data => {
                    console.log('cmd data', data)
                    const connected = !data[0]
                      .toLowerCase()
                      .includes('not connected')
                    resolve(connected)
                  })
              }
            })
        }
      })
      .catch(err => {
        console.log('cmd err', err)
        reject(err)
      })
  })
}

module.exports.connect = function(ssid, psk) {
  // getAsync('node -v')
  //   .then(data => {
  //     console.log('cmd data', data)
  //   })
  //   .catch(err => {
  //     console.log('cmd err', err)
  //   })

  const wpaConfPath = '/etc/wpa_supplicant/wpa_supplicant.conf'
  console.log('sudo ip link set wlan0 up')
  return (
    getAsync('sudo ip link set wlan0 up')
      // .then(data => {
      //   console.log(data)
      //   console.log('ip link show wlan0')
      //   return getAsync('ip link show wlan0')
      // })
      // .then(data => {
      //   console.log(data)
      //   return isConnected()
      // })
      .then(data => {
        console.log(data)
        console.log(`chmod 766 ${wpaConfPath}`)
        fs.chmodSync(wpaConfPath, '766')
        const wpaConf =
          'ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev \n' +
          'update_config=1\n' +
          'country=GB\n\n'
        fs.writeFileSync(wpaConfPath, wpaConf)
        console.log(`sudo wpa_passphrase ${ssid} ${psk} >> ${wpaConfPath}`)
        return getAsync(`sudo wpa_passphrase ${ssid} ${psk} >> ${wpaConfPath}`)
      })
      .then(data => {
        console.log(data)
        console.log('sudo kill -9 $(pgrep wpa_supplicant)')
        return getAsync('sudo kill -9 $(pgrep wpa_supplicant)')
      })
      .then(data => {
        console.log(data)
        console.log(
          `sudo wpa_supplicant -B -D wext -i wlan0 -c ${wpaConfPath}`
        )
        return getAsync(
          `sudo wpa_supplicant -B -D wext -i wlan0 -c ${wpaConfPath}`
        )
      })
      .then(data => {
        console.log(data)
        return isConnected(true)
      })
      .then(data => {
        console.log('IS CONNECTED? ' + data)
        console.log('sudo dhclient wlan0')
        return getAsync('sudo dhclient wlan0')
      })
      .then(data => {
        console.log(data)
        return null
      })
  )
}
