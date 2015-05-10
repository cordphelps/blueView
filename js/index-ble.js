var bluetoothle;

var app = {

  data: {
    devices: []
  },

  targetDevice: {
    indexSelected: 0,
    status: "",
    name: "",
    advertisement: "",
    address: "",

    service:           "713d0000-503e-4c75-ba94-3148f18d941e",
    characteristic_tx: "713d0002-503e-4c75-ba94-3148f18d941e",   // subscribe/listen here
    characteristic_rx: "713d0003-503e-4c75-ba94-3148f18d941e",   // write here
  
    services: [],
    connected: false
  },

  knownAddresses: [],

  initialize: function() {

    console.log("app.initialize");
  
  }  // end initialize

};  // end app object


function initialize()
{
	var paramsObj = {request:true};
	
	updateLog('blueLog', "Initialize : " + JSON.stringify(paramsObj));
	
	bluetoothle.initialize(initializeSuccess, initializeError, paramsObj);
	
	return false;
}

function initializeSuccess(obj)
{
	updateLog('blueLog', "Initialize Success : " + JSON.stringify(obj));
  buttonColor('initMe', colorGreen);
  clearLog('discoverStatus');
	
  if (obj.status == "enabled")
  {
  	updateLog('blueLog', "Enabled");
  }
  else
  {
  	updateLog('blueLog', "Unexpected Initialize Status");
  }
}

function initializeError(obj)
{
  updateLog('blueLog', "Initialize Error : " + JSON.stringify(obj));
  buttonColor('initMe', colorRed);
}

function enable()      // android only
{
	updateLog('blueLog', "Enable");
	
	bluetoothle.enable(enableSuccess, enableError);
	
	return false;
}

function enableSuccess(obj)
{
	updateLog('blueLog', "Enable Success : " + JSON.stringify(obj));
	
  if (obj.status == "enabled")
  {
  	updateLog('blueLog', "Enabled");
  }
  else
  {
  	updateLog('blueLog', "Unexpected Enable Status");
  }
}

function enableError(obj)
{
  updateLog('blueLog', "Enable Error : " + JSON.stringify(obj));
}

function disable()
{
	updateLog('blueLog', "Disable");
	
	bluetoothle.disable(disableSuccess, disableError);
	
	return false;
}

function disableSuccess(obj)
{
	updateLog('blueLog', "Disable Success : " + JSON.stringify(obj));
	
  if (obj.status == "disabled")
  {
  	updateLog('blueLog', "Disabled");
  }
  else
  {
  	updateLog('blueLog', "Unexpected Disable Status");
  }
}

function disableError(obj)
{
  updateLog('blueLog', "Disable Error : " + JSON.stringify(obj));
}

function startScan()
{
	//TODO Disconnect / Close all addresses and empty
	
	updateLog('blueLog', "Start Scan: (full reset)");

  if (app.targetDevice.connected) {
    disconnect(app.targetDevice.address);
  }

  app.targetDevice.indexSelected = 0;
  app.targetDevice.status = "";
  app.targetDevice.name = "";
  app.targetDevice.advertisement = "";
  app.targetDevice.address = "";
  app.targetDevice.connected = false;

  app.knownAddresses = [];
  app.data.devices = [];

  clearLog('discoverStatus');
  buttonColor('connectMe', colorWhite);
  buttonColor('reconnectMe', colorWhite);
  buttonColor('disconnectMe', colorWhite);
	
  var paramsObj = {serviceUuids:[]};
  bluetoothle.startScan(startScanSuccess, startScanError, paramsObj);
  
  return false;
}

function startScanSuccess(obj)
{
	updateLog('blueLog', "Start Scan Success : " + JSON.stringify(obj));

  buttonColor('scanMe', colorGreen);


  if (app.data.devices.length < MAX_DEVICES) {

    // is this a duplicate?

    for (var k=0; k < app.knownAddresses.length; k++) {
        if (obj.address == app.knownAddresses[k]) {
          updateLog('blueLog', "duplicate address!");
          return;
        }
    }

    // no duplicate found; carry on
	
    if (obj.status == "scanResult")
    {
      var length = app.data.devices.length;
      updateLog('blueLog', "Scan Result");
      // updateLog('blueLog', "length: " + length);
      // addDevice(obj.address, obj.name);

      // grab last 4 chars of the address to help form a unique label for the select widget
      var lastFour = obj.address.slice(obj.address.length - 4);


      app.data.devices[length] = obj;
      app.data.devices[length].name = obj.name + ' ' + length + ' ' + lastFour;
      //updateLog('blueLog', "stringify: " + JSON.stringify(app.data.devices[0]));

      // remember this address, store it in the address array

      app.knownAddresses[app.knownAddresses.length] = obj.address;

      repopulate('select-sensorPack');

    }

    else if (obj.status == "scanStarted")
    {
      updateLog('blueLog', "Scan Started");
    }
    else
    {
  	 updateLog('blueLog', "Unexpected Start Scan Status");
    }

  } else {  // too many devices

    stopScan();

  }

}

function startScanError(obj)
{
  updateLog('blueLog', "Start Scan Error : " + JSON.stringify(obj));
  buttonColor('scanMe', colorRed);
}

function stopScan()   // scanning is expensive, stop with timeout or other event
{
	updateLog('blueLog', "Stop Scan");
	
  bluetoothle.stopScan(stopScanSuccess, stopScanError);
  
  return false;
}

function stopScanSuccess(obj)
{
	updateLog('blueLog', "Stop Scan Success : " + JSON.stringify(obj));
	
  if (obj.status == "scanStopped")
  {
    updateLog('blueLog', "Scan Stopped");
  }
  else
  {
  	updateLog('blueLog', "Unexpected Stop Scan Status");
  }
}

function stopScanError(obj)
{
  updateLog('blueLog', "Stop Scan Error : " + JSON.stringify(obj));
}

function retrieveConnected()
{
	//TODO Add to readme that at least one is required
	var paramsObj = {serviceUuids:["180D"]};
	
	updateLog('blueLog', "Retrieve Connected : " + JSON.stringify(paramsObj));
	
	bluetoothle.retrieveConnected(retrieveConnectedSuccess, retrieveConnectedError, paramsObj);
	
	return false;
}

function retrieveConnectedSuccess(obj)
{
	updateLog('blueLog', "Retrieve Connected Success : " + JSON.stringify(obj));
  
	for (var i = 0; i < obj.length; i++)
	{
		addDevice(obj[i]);
	}
}

function retrieveConnectedError(obj)
{
	updateLog('blueLog', "Retrieve Connected Error : " + JSON.stringify(obj));
}

function isInitialized()
{
	updateLog('blueLog', "Is Initialized");
	
  bluetoothle.isInitialized(isInitializedSuccess);
  
  return false;
}

function isInitializedSuccess(obj)
{
	updateLog('blueLog', "Is Initialized Success : " + JSON.stringify(obj));
	
  if (obj.isInitialized)
  {
    updateLog('blueLog', "Is Initialized : true");
  }
  else
  {
  	updateLog('blueLog', "Is Initialized : false");
  }
}

function isEnabled()
{
	updateLog('blueLog', "Is Enabled");
	
  bluetoothle.isEnabled(isEnabledSuccess);
  
  return false;
}

function isEnabledSuccess(obj)
{
	updateLog('blueLog', "Is Enabled Success : " + JSON.stringify(obj));
	
  if (obj.isEnabled)
  {
    updateLog('blueLog', "Is Enabled : true");
  }
  else
  {
  	updateLog('blueLog', "Is Enabled : false");
  }
}

function isScanning()
{
	updateLog('blueLog', "Is Scanning");
	
  bluetoothle.isScanning(isScanningSuccess);
  
  return false;
}

function isScanningSuccess(obj)
{
	updateLog('blueLog', "Is Scanning Success : " + JSON.stringify(obj));
	
  if (obj.isScanning)
  {
    updateLog('blueLog', "Is Scanning : true");
  }
  else
  {
  	updateLog('blueLog', "Is Scanning : false");
  }
}

function connect(address)
{
  app.targetDevice.connected = false;
  updateLog('discoverStatus', "address object : " + JSON.stringify(address));

  var paramsObj = {address:address};
 	
  bluetoothle.connect(connectSuccess, connectError, paramsObj);
  
  return false;
}

function connectSuccess(obj)
{
	
  if (obj.status == "connected")
  {

    app.targetDevice.connected = true;

  	updateLog('discoverStatus', "connected");

    buttonColor('connectMe', colorGreen);
    buttonColor('reconnectMe', colorWhite);
    buttonColor('disconnectMe', colorWhite);
  }
  else if (obj.status == "connecting")
  {
  	updateLog('discoverStatus', "Connecting");
    buttonColor('connectMe', colorRed);
  }
	else
  {
  	updateLog('discoverStatus', "Unexpected Connect Status");
    buttonColor('connectMe', colorRed);
  }
}

function connectError(obj)
{
  updateLog('discoverStatus', "Connect Error : " + JSON.stringify(obj));
  buttonColor('connectMe', colorRed);
  buttonColor('reconnectMe', colorWhite);
  buttonColor('disconnectMe', colorWhite);
}

function reconnect(address)
{

  // app.targetDevice.connected = false;  <-- can't assume disconnected

	var paramsObj = {address:address};

  bluetoothle.reconnect(reconnectSuccess, reconnectError, paramsObj);
  
}

function reconnectSuccess(obj)
{
  if (obj.status == "connected")
  {
    app.targetDevice.connected = true;

  	updateLog('discoverStatus', "reconnected");
    buttonColor('reconnectMe', colorGreen);
    buttonColor('connectMe', colorWhite);
    buttonColor('disconnectMe', colorWhite);
  }
  else if (obj.status == "connecting")
  {
    updateLog('discoverStatus', "Reconnect: " + JSON.stringify(obj));
    buttonColor('reconnectMe', colorRed);
  }
  else
  {
    updateLog('discoverStatus', "Unexpected Reconnect Status: " + JSON.stringify(obj));
    buttonColor('reconnectMe', colorRed);
  }
}

function reconnectError(obj)
{
  updateLog('discoverStatus', "Reconnect Error : " + JSON.stringify(obj));
  buttonColor('reconnectMe', colorRed);
  buttonColor('connectMe', colorWhite);
  buttonColor('disconnectMe', colorWhite);
}

function disconnect(address)
{
	var paramsObj = {address:address};
	
	bluetoothle.disconnect(disconnectSuccess, disconnectError, paramsObj);
	
}

function disconnectSuccess(obj)
{
	if (obj.status == "disconnected")
  {
    app.targetDevice.connected = false;

    updateLog('discoverStatus', "disconnected");
    buttonColor('disconnectMe', colorGreen);
    buttonColor('connectMe', colorWhite);
    buttonColor('reconnectMe', colorWhite);
  }
  else if (obj.status == "disconnecting")
  {
    updateLog('discoverStatus', "disconnecting");
    buttonColor('disconnectMe', colorRed);
  }
  else
  {
    updateLog('discoverStatus', "unexpected disconnect status : " + JSON.stringify(obj));
    buttonColor('disconnectMe', colorRed);
  }
}

function disconnectError(obj)
{
	updateLog('discoverStatus', "Disconnect Error: " + JSON.stringify(obj));
  buttonColor('disconnectMe', colorRed);
  buttonColor('connectMe', colorWhite);
  buttonColor('reconnectMe', colorWhite);
}


function close(address)
{
	var paramsObj = {address:address};
	
	updateLog('blueLog', "Close : " + JSON.stringify(paramsObj));
	
  bluetoothle.close(closeSuccess, closeError, paramsObj);
  
  return false;
}

function closeSuccess(obj)
{
	updateLog('blueLog', "Close Success : " + JSON.stringify(obj));
	
	if (obj.status == "closed")
	{
		updateLog('blueLog', "Closed");
	}
	else
  {
  	updateLog('blueLog', "Unexpected Close Status");
  }
}

function closeError(obj)
{
	updateLog('blueLog', "Close Error : " + JSON.stringify(obj));
}

function discover(address)  // android only
{
	var paramsObj = {address:address};
		
	updateLog('blueLog', "Discover : " + JSON.stringify(paramsObj));
		
	bluetoothle.discover(discoverSuccess, discoverError, paramsObj);
	
	return false;
}

function discoverSuccess(obj)
{
	updateLog('blueLog', "Discover Success : " + JSON.stringify(obj));
	
	if (obj.status == "discovered")
	{
		updateLog('blueLog', "Discovered");
		
		var address = obj.address;
		
		var services = obj.services;
		
		for (var i = 0; i < services.length; i++)
		{
			var service = services[i];
			
			addService(address, service.serviceUuid);
			
			var characteristics = service.characteristics;
			
			for (var j = 0; j < characteristics.length; j++)
			{
				var characteristic = characteristics[j];
				
				addCharacteristic(address, service.serviceUuid, characteristic.characteristicUuid);
				
				var descriptors = characteristic.descriptors;
				
				for (var k = 0; k < descriptors.length; k++)
				{
					var descriptor = descriptors[k];
					
					addDescriptor(address, service.serviceUuid, characteristic.characteristicUuid, descriptor.descriptorUuid);
				}
			}
		}
  }
  else
  {
  	updateLog('blueLog', "Unexpected Discover Status");
  }
}

function discoverError(obj)
{
  updateLog('blueLog', "Discover Error : " + JSON.stringify(obj));
}

function services(address)
{
  // https://developer.bluetooth.org/gatt/services/Pages/ServicesHome.aspx
  // '180A' : 'device information'

	var paramsObj = {address:address, serviceUuids:[]};
		
	updateLog('discoverStatus', "got services? : " + address);
	
	bluetoothle.services(servicesSuccess, servicesError, paramsObj);
	
}

function servicesSuccess(obj)
{
	updateLog('discoverStatus', "Services Success : " + JSON.stringify(obj));

    // redBear BLE
    // {
    //   "status" : "services",
    //   "name" : "BLE Shield",
    //   "address" : 12345678-1234-1234-123456789012,
    //   "serviceUuids" : ['713d0000-503e-4c75-ba94-3148f18d941e','180a']
    //  }
	
  if (obj.status == "services") {
  	
    var serviceUuids = obj.serviceUuids;

    // updateLog('discoverStatus', "uuids : " + JSON.stringify(obj.serviceUuids));


    
    for (var i = 0; i < serviceUuids.length; i++)
    {
			// addService(obj.address, serviceUuids[i]);  // randdusing version 0

      if (typeof app.targetDevice.services == 'undefined') {
        app.targetDevice.services = new Array();
      }

      app.targetDevice.services[i] = new Object();

      app.targetDevice.services[i].serviceUuid = serviceUuids[i];

      updateLog('discoverStatus', "\nserviceUuid: " + serviceUuids[i]);

      characteristics(obj.address, serviceUuids[i]);

    }

  } else {
  	updateLog('discoverStatus', "Unexpected Services Status");
  }
}

function servicesError(obj)
{
  updateLog('discoverStatus', "Services Error : " + JSON.stringify(obj));
}

function rssi(address)
{
	var paramsObj = {address:address};
		
	updateLog('blueLog', "RSSI : " + JSON.stringify(paramsObj));
		
	bluetoothle.rssi(rssiSuccess, rssiError, paramsObj);
	
	return false;
}

function rssiSuccess(obj)
{
	updateLog('blueLog', "RSSI Success : " + JSON.stringify(obj));
	
	if (obj.status == "rssi")
	{
		updateLog('blueLog', "RSSI");
  }
  else
  {
  	updateLog('blueLog', "Unexpected RSSI Status");
  }
}

function rssiError(obj)
{
  updateLog('blueLog', "RSSI Error : " + JSON.stringify(obj));
}

function isConnected(address)
{
	var paramsObj = {address:address};
		
	updateLog('blueLog', "Is Connected : " + JSON.stringify(paramsObj));
	
  bluetoothle.isConnected(isConnectedSuccess, paramsObj);
  
  return false;
}

function isConnectedSuccess(obj)
{
	updateLog('blueLog', "Is Connected Success : " + JSON.stringify(obj));
	
  if (obj.isConnected)
  {
    updateLog('blueLog', "Is Connected : true");
  }
  else
  {
  	updateLog('blueLog', "Is Connected : false");
  }
}

function isDiscovered(address)
{
	var paramsObj = {address:address};
		
	updateLog('blueLog', "Is Discovered : " + JSON.stringify(paramsObj));
	
  bluetoothle.isDiscovered(isDiscoveredSuccess, paramsObj);
  
  return false;
}

function isDiscoveredSuccess(obj)
{
	updateLog('blueLog', "Is Discovered Success : " + JSON.stringify(obj));
	
  if (obj.isDiscovered)
  {
    updateLog('blueLog', "Is Discovered : true");
  }
  else
  {
  	updateLog('blueLog', "Is Discovered : false");
  }
}

function characteristics(address, serviceUuid)
{
  updateLog('discoverStatus', "just checking: " + serviceUuid);
	var paramsObj = {address:address, serviceUuid:serviceUuid, characteristicUuids:[]};
	
	updateLog('discoverStatus', "charsObj from services: " + JSON.stringify(paramsObj));

  // redBear bug ?
  // serviceUuid = '180a' here
  // results in 
  // serviceUuid = '713d0000-503e-4c75-ba94-3148f18d941e' being returned with characteristics[]
  // by characteristicsSuccess()
	
	bluetoothle.characteristics(characteristicsSuccess, characteristicsError, paramsObj);
	
	return false;
}

function characteristicsSuccess(obj) {

	updateLog('discoverStatus', "charsSuccessObj: " + JSON.stringify(obj) + '\n');
	
  if (obj.status == "characteristics") {

    updateLog('discoverStatus', "typeof obj.char: " + typeof obj.characteristics);
  	
    var characteristics = obj.characteristics;

    updateLog('discoverStatus', "char length: " + obj.characteristics.length);
    
    for (var i = 0; i < obj.characteristics.length; i++) { 

      // addCharacteristic(obj.address, obj.serviceUuid, characteristics[i].characteristicUuid); // randdusing version 0

      for (var j = 0; j < app.targetDevice.services.length; j++) {  // get a match on the serviceUuid

        if (app.targetDevice.services[j].serviceUuid == obj.serviceUuid) {

          //updateLog('discoverStatus', "char match: " + app.targetDevice.services[j].serviceUuid);

          if (typeof app.targetDevice.services[j].characteristics == 'undefined') {
            app.targetDevice.services[j].characteristics = new Array;
          }

          app.targetDevice.services[j].characteristics[i] = new Object();

          // updateLog('discoverStatus', "char uuid: " + characteristics[i].characteristicUuid);

          app.targetDevice.services[j].characteristics[i].characteristicUuid = obj.characteristics[i].characteristicUuid;


          descriptors(obj.address, obj.serviceUuid, characteristics[i].characteristicUuid);

          //
          // redBear does not seem to report 'descriptors',
          // instead, we are getting 'properties' (as an object)
          //
          //    'WriteWithoutResponse' : true
          //    'notify' : true
          //

          if (typeof obj.characteristics[i].properties != 'undefined') {

            updateLog('discoverStatus', "property: " + JSON.stringify(obj.characteristics[i].properties) + "\n");

            app.targetDevice.services[j].characteristics[i].properties = new Object;

            app.targetDevice.services[j].characteristics[i].properties = obj.characteristics[i].properties;

          }

          break;
        } //  end if
      }  //  end for (services)
    }  // end for (characteristics)

  } else {

  	updateLog('discoverStatus', "Unexpected Characteristics Status: " + obj.status);

  }

}

function characteristicsError(obj)
{
  updateLog('discoverStatus', "Characteristics Error : " + JSON.stringify(obj));
}

function descriptors(address, serviceUuid, characteristicUuid)
{
	var paramsObj = {address:address, serviceUuid:serviceUuid, characteristicUuid:characteristicUuid};
	
	updateLog('discoverStatus', "Descriptors : " + JSON.stringify(paramsObj));
	
	bluetoothle.descriptors(descriptorsSuccess, descriptorsError, paramsObj);
	
	return false;
}

function descriptorsSuccess(obj)
{
	updateLog('discoverStatus', "Descriptors Success : " + JSON.stringify(obj) +
    " obj.len: " + obj.descriptorUuids.length);
	
  if (obj.status == "descriptors" && obj.descriptorUuids.length > 0) {

  	updateLog('discoverStatus', "yes, descriptors");
  	
  	var descriptorUuids = obj.descriptorUuids;
    
    for (var i = 0; i < descriptorUuids.length; i++) { 

      // addDescriptor(obj.address, obj.serviceUuid, obj.characteristicUuid, descriptorUuids[i]);

      for (var j = 0; j < app.targetDevice.services.length; j++) {  // get a match on the serviceUuid

        if (app.targetDevice.services[j].serviceUuid == obj.serviceUuid) {

          updateLog('discoverStatus', "yes, match on service Uuid");

          for (var k = 0; k < app.targetDevice.services[j].characteristics.length; k++) {

            if (app.targetDevice.services[j].characteristics[k].characteristicUuid == obj.characteristicUuid) {

              updateLog('discoverStatus', "yes, match on characteristic Uuid");

              if (typeof app.targetDevice.services[j].characteristics[k].descriptorUuids == 'undefined') {
                app.targetDevice.services[j].characteristics[k].descriptorUuids = new Array;
              }

              app.targetDevice.services[j].characteristics[k].descriptorUuids[i] = new Object();

              app.targetDevice.services[j].characteristics[k].descriptorUuids[i].descriptorUuid = descriptorUuids[i].descriptorUuid;

              updateLog('discoverStatus', "service: " + app.targetDevice.services[j].serviceUuid + "\n" +
                "characteristic: " + app.targetDevice.services[j].characteristics[k].characteristicUuid + "\n" +
                "descriptor: " + app.targetDevice.services[j].characteristics[k].descriptorUuids[i].descriptorUuid );

              break;

            }

          }

        }
        
      }

    }

  } else {

  	updateLog('discoverStatus', "Unexpected Descriptors Status: " + obj.status + 
      " number of descUuids: " + obj.descriptorUuids.length);

  }

}

function descriptorsError(obj)
{
  updateLog('discoverStatus', "Descriptors Error : " + JSON.stringify(obj));
}

function read(address, serviceUuid, characteristicUuid)
{
	var paramsObj = {address:address, serviceUuid:serviceUuid, characteristicUuid:characteristicUuid};
	
	// updateLog('blueLog', "Read : " + JSON.stringify(paramsObj));
	
  bluetoothle.read(readSuccess, readError, paramsObj);
  
  return false;
}

function readSuccess(obj) {

	updateLog('txLog', "Read Success : " + JSON.stringify(obj));
	
	if (obj.status == "read") {

		var bytes = bluetoothle.encodedStringToBytes(obj.value);
		updateLog('txLog', "Read : " + bytes[0]);
		
	} else {

  	updateLog('txLog', "Unexpected Read Status");

  }
}

function readError(obj)
{
  updateLog('txLog', "Read Error : " + JSON.stringify(obj));
}

function subscribe(address, serviceUuid, characteristicUuid)
{
	var paramsObj = {address:address, serviceUuid:serviceUuid, characteristicUuid:characteristicUuid};
	
	updateLog('txLog', "Subscribe : " + JSON.stringify(paramsObj));
	
	bluetoothle.subscribe(subscribeSuccess, subscribeError, paramsObj);
	
	return false;
}

function subscribeSuccess(obj)
{	
	updateLog('txLog', "Subscribe Success : " + JSON.stringify(obj));

  buttonColor('subscribeBtn', colorGreen);
	
	if (obj.status == "subscribedResult")   // subscription result received
	{
    updateLog('txLog', "\nvalue : " + obj.value + "\n");

    var analogValue = base64parseRBLOneByteIntegerData(obj.value);

    // since the arduino code is trying to report an analog value that is > 255, it
    // cooperates by dividing by 4 before sending it. Multiply by 4 here to get the 
    // correct value.

    analogValue = analogValue * 4 ;

    updateLog('receive', "\narduino onboard value : " + analogValue);

	}
	else if (obj.status == "subscribed")   // subscription has started (we are listening)
	{
		updateLog('txLog', "Subscribed");
	}
	else
  {
  	updateLog('txLog', "Unexpected Subscribe Status");
  }
}



function subscribeError(obj)
{
  updateLog('txLog', "Subscribe Error : " + JSON.stringify(obj));

  buttonColor('subscribeBtn', colorRed);
}

function unsubscribe(address, serviceUuid, characteristicUuid)
{
	var paramsObj = {address:address, serviceUuid:serviceUuid, characteristicUuid:characteristicUuid};
	
	updateLog('txLog', "Unsubscribe : " + JSON.stringify(paramsObj));
	
	bluetoothle.unsubscribe(unsubscribeSuccess, unsubscribeError, paramsObj);
	
	return false;
}

function unsubscribeSuccess(obj)
{
	updateLog('txLog', "Unsubscribe Success : " + JSON.stringify(obj));
	
	if (obj.status == "unsubscribed")
	{
		updateLog('txLog', "Unsubscribed");
	}
	else
	{
		updateLog('txLog', "Unexpected Unsubscribe Status");
	}
}

function unsubscribeError(obj)
{
	updateLog('txLog', "Unsubscribe Error : " + JSON.stringify(obj));
}

function write(address, serviceUuid, characteristicUuid, value) {

	var paramsObj = {address:address, serviceUuid:serviceUuid, characteristicUuid:characteristicUuid, type:"noResponse", value:value};

  // TODO investigate type:"noResponse" (seems required)
	
	updateLog('txLog', "Write : " + JSON.stringify(paramsObj));
	
	bluetoothle.write(writeSuccess, writeError, paramsObj);

  // not triggering writeSuccess() ; bug?
	

}

function writeSuccess(obj) {

	updateLog('txLog', "Write Success : " + JSON.stringify(obj));
	
	if (obj.status == "written") {

		updateLog('txLog', "Written");

    buttonColor('sendItBtn', colorGreen);

    // address , service, characteristic
    read(app.targetDevice.address, app.targetDevice.service, app.targetDevice.characteristic_rx);

	} else {

		updateLog('txLog', "Unexpected Write Status");

	}

}

function writeError(obj)
{
	updateLog('txLog', "Write Error : " + JSON.stringify(obj));

  buttonColor('sendItBtn', colorRed);
}

function readDescriptor(address, serviceUuid, characteristicUuid, descriptorUuid)
{
	var paramsObj = {address:address, serviceUuid:serviceUuid, characteristicUuid:characteristicUuid, descriptorUuid:descriptorUuid};
	
	updateLog('blueLog', "Read Descriptor : " + JSON.stringify(paramsObj));
	
	bluetoothle.readDescriptor(readDescriptorSuccess, readDescriptorError, paramsObj);
	
	return false;
}

function readDescriptorSuccess(obj)
{
	updateLog('blueLog', "Read Descriptor Success : " + JSON.stringify(obj));
	
	if (obj.status == "readDescriptor")
	{
		updateLog('blueLog', "Read Descriptor");
	}
	else
  {
  	updateLog('blueLog', "Unexpected Read Descriptor Status");
  }
}

function readDescriptorError(obj)
{
  updateLog('blueLog', "Read Descriptor Error : " + JSON.stringify(obj));
}

function writeDescriptor(address, serviceUuid, characteristicUuid, descriptorUuid, value)
{
	var paramsObj = {address:address, serviceUuid:serviceUuid, characteristicUuid:characteristicUuid, descriptorUuid:descriptorUuid, value:value};
	
	updateLog('txLog', "Write Descriptor : " + JSON.stringify(paramsObj));
	
	bluetoothle.writeDescriptor(writeDescriptorSuccess, writeDescriptorError, paramsObj);
	
	return false;
}

function writeDescriptorSuccess(obj)
{
	updateLog('blueLog', "Write Descriptor Success : " + JSON.stringify(obj));
	
	if (obj.status == "writeDescriptor")
	{
		updateLog('txLog', "Write Descriptor success");
	}
	else
  {
  	updateLog('txLog', "Unexpected Write Descriptor Status");
  }
}

function writeDescriptorError(obj)
{
  updateLog('txLog', "Write Descriptor Error : " + JSON.stringify(obj));
}


////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////


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

function base64IndicesToInt (index1, index2) {

  // base64 decode helper function
  // take two base64 indicies (representing two characters)
  // and decode them into an source integer.
  //
  // caution: there is no logic to detect an index that would indicate a value > 255
  //

  var binFirst = integerToSixBitBinaryLikeString(index1);
  var binSecond = integerToSixBitBinaryLikeString(index2);
  //alert(binFirst + "\n" + binSecond);

  var joined = binFirst.concat(binSecond);
  //alert("that should be 12 bits: " + joined);

  var chopped = joined.substring(0,8);  // chop off the last 4 
  var b = parseInt( chopped, 2 );       // convert bits to int
  // alert("and the integer is:  " + b + " times 4: " + b*4);

  return b;
}

function integerToSixBitBinaryLikeString(decimalIndex) {

    // base64 decode helper function
    // return 'bits' representing a decimal value padded to 6 bits

    var zeros = "000000";
    var bits = (decimalIndex >>> 0).toString(2);  // coerces argument to unsigned integer
    var len = bits.length;
    //alert(bits + "  len: " + len);
    if (len < 6) {
        var padding = zeros.substring(len);
        var finalBitString = padding.concat(bits);
    } else {
        finalBitString = bits;
    }
    
    //alert("padded bits: " + finalBitString);
    
    return finalBitString;
}


function addDevice(address, name)
{
	var $devices = $(".devices");
	
	var $check = $devices.find("li[data-address='{0}']".format(address));
	if ($check.length > 0)
	{
		return;
	}
	
	var template = $("#device").text().format(address, name);

	$devices.append(template);
}

function getAddress($item)
{
	return $item.parents("li[data-address]").attr("data-address");
}

function addService(address, serviceUuid)
{
	var $devices = $(".devices");
	
	var $services = $devices.find("li[data-address='{0}'] ul.services".format(address));
	
	var $check = $services.find("li[data-serviceUuid='{0}']".format(serviceUuid));
	if ($check.length > 0)
	{
		return;
	}
	
	var template = $("#service").text().format(serviceUuid);
	
	$services.append(template);
}

function getServiceUuid($item)
{
	return $item.parents("li[data-serviceUuid]").attr("data-serviceUuid");
}

function addCharacteristic(address, serviceUuid, characteristicUuid)
{
	var $devices = $(".devices");
	
	var $services = $devices.find("li[data-address='{0}'] ul.services".format(address));

	var $characteristics = $services.find("li[data-serviceUuid='{0}'] ul.characteristics".format(serviceUuid));
	
	var $check = $characteristics.find("li[data-characteristicUuid='{0}']".format(characteristicUuid));
	if ($check.length > 0)
	{
		return;
	}

	var template = $("#characteristic").text().format(characteristicUuid);
	
	$characteristics.append(template);
}

function getCharacteristicUuid($item)
{
	return $item.parents("li[data-characteristicUuid]").attr("data-characteristicUuid");
}

function addDescriptor(address, serviceUuid, characteristicUuid, descriptorUuid)
{
	var $devices = $(".devices");
	
	var $services = $devices.find("li[data-address='{0}'] ul.services".format(address));

	var $characteristics = $services.find("li[data-serviceUuid='{0}'] ul.characteristics".format(serviceUuid));
	
	var $descriptors = $characteristics.find("li[data-characteristicUuid='{0}'] ul.descriptors".format(characteristicUuid));

	var $check = $descriptors.find("li[data-descriptorUuid='{0}']".format(descriptorUuid));
	if ($check.length > 0)
	{
		return;
	}

	var template = $("#descriptor").text().format(descriptorUuid);
	
	$descriptors.append(template);
}

function getDescriptorUuid($item)
{
	return $item.parents("li[data-descriptorUuid]").attr("data-descriptorUuid");
}

String.prototype.format = function()
{
  var args = arguments;
  return this.replace(/{(\d+)}/g, function(match, number)
  { 
    return typeof args[number] != 'undefined' ? args[number] : match;
  });
};