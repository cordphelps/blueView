---
---




### this is an iOS sandbox for checking the awesome API [BluetoothLE](https://github.com/randdusing/BluetoothLE) against a RedBearLabs bluetooth BLE Shield 2.1 for arduino.


The interface (3 jQuery Mobile pages via PhoneGapBuild) steps through the basic connectivity functions, displaying status messages to a textarea in the app. 

The code then demonstrates how to send, and, importantly, how to receive and decode an integer sent from the arduino.



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

[![screen shot](https://raw.githubusercontent.com/cordphelps/blueView/master/IMG_1610.PNG)]()


## secret sauce:

The trick is to be able to interpret the encoded arduino response sent by the RedBearLabs firmware. It seems to be a single byte of base64 encoding that can be decoded with the following:


```

function base64parseRBLOneByteIntegerData(string) {

  // base64 parse encoded integers sent by RBL from arduino to our BluetoothLE client
  //
  // expected incoming string format is two characters followed by two equal signs 'xx=='
  // valid return is a positive integer
  // error return is -1
  //
  // caution: if the source integer is > 255, then divide by 4 before sending from arduino, 
  // and then multiply by 4 after decoding
  // 
  // beginning with an integer = 807 (for instance, a value from an analog port)
  //
  // RBL ble_write() on arduino encodes the value and sends it over the air as 'Jw=='
  //
  // notice that 807 in binary is :    0 0 0 0 0 0 1 1 0 0 1 0 0 1 1 1
  //
  // shift these 8 bits to the left :  0 0 1 0 0 1 1 1 0 0 0 0 0 0 0 0 
  //
  // now evaluate 6 bits at a time according to the base64 scheme
  // http://en.wikipedia.org/wiki/Base64
  //
  //     -----------
  //     0 0 1 0 0 1 1 1 0 0 0 0 0 0 0 0
  //                 -----------
  // 
  // 0 0 1 0 0 1 = 9 decimal which maps to the base64 character 'J'
  // 1 1 0 0 0 0 = 48 decimal which maps to the base64 character 'w'
  //
  // on the BluetoothLE side, we, in fact, receive the characters 'Jw==' as obj.value
  // BUT, because the value is > 255, we can't convert back to 807 because a 
  // meaningful bit was lost in the shift. (So, divide the source integer by 4 before sending it.)


  // chop off trailing '=='   (per the base64 standard, these indicate the last base64 group contained only one byte)
  var trimmed = string.replace(/==$/, "");
  //updateLog('txLog', "trimmed : " + trimmed);

  if (trimmed.length > 2) {
    // can't handle that; doesn't look like a byte from arduino
    return -1;
  }

  var firstCharacter = trimmed.charAt(0);
  var secondCharacter = trimmed.charAt(1);

  // find the base64 index for each character
  var base64characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  var firstIndex = base64characters.indexOf(firstCharacter);
  var secondIndex = base64characters.indexOf(secondCharacter);

  //updateLog('txLog', "firstCharacter : " + firstCharacter + " index: " + firstIndex);
  //updateLog('txLog', "secondCharacter : " + secondCharacter + " index: " + secondIndex);

  var rawValue = base64IndicesToInt(firstIndex, secondIndex);

  updateLog('txLog', "returning int: " + rawValue);

  return rawValue;

}


```







 





