---
---




## this is an iOS sandbox for checking the awesome API [BluetoothLE](https://github.com/randdusing/BluetoothLE) against a RedBearLabs BLE Shield 2.1 .

The interface (3 jQuery Mobile pages via PhoneGapBuild) steps through the basic connectivity functions, displaying status messages to a textarea in the app. 



## initialize and scan for bluetooth devices; select one

```
bluetoothle.initialize(initializeSuccess, initializeError, paramsObj);
bluetoothle.startScan(startScanSuccess, startScanError, paramsObj);
bluetoothle.stopScan(stopScanSuccess, stopScanError);
```

[![screen shot](https://raw.githubusercontent.com/cordphelps/blueView/master/IMG_1564.jpg)]()


## connect to the selected device (optionally surf available data)

```
var paramsObj = {address:address};	
bluetoothle.connect(connectSuccess, connectError, paramsObj);
```

[![screen shot](https://raw.githubusercontent.com/cordphelps/blueView/master/IMG_1565.jpg)]()


## subscribe / send data

```
subscribe(app.targetDevice.address, app.targetDevice.service, app.targetDevice.characteristic_tx);
write(app.targetDevice.address, app.targetDevice.service, app.targetDevice.characteristic_rx, bytes);
```

per [the open issue](https://github.com/randdusing/BluetoothLE/issues/154), these are hardcoded.


## open issue:

- I can't subscribe() or write() to the published ReadBear (BLE Shield 2.1) service "713d0000-503e-4c75-ba94-3148f18d941e", error reported is 'service not found'

[![screen shot](https://raw.githubusercontent.com/cordphelps/blueView/master/IMG_1566.jpg)]()






 





