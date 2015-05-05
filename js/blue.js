//status
//name
//advertisement
//address
//rssi

var iOS = true;

var colorRed = '#FF3300';
var colorGreen = '#00FF00';
var colorWhite = '#FFFFFF';

var MAX_DEVICES = 5;
var SCAN_DURATION = 5000;  // milliseconds

function selectSetup() {

  console.log("setup");

    $('#select-sensorPack').on('vmouseout', function () {

      // it seems cordova triggers 'vmouseout' at the completion of the select
      // (completion = 'done' for the iOS cylindrical selector gizmo)

      console.log("that was mouse out: " + app.targetDevice.indexSelected);

      app.targetDevice.indexSelected = $('#select-sensorPack').prop("selectedIndex");
      //app.targetDevice.indexSelected = 0;
      app.targetDevice.address = app.data.devices[app.targetDevice.indexSelected].address;

      //updateLog('blueLog', JSON.stringify(app.targetDevice));
      clearLog('discoverStatus');
      updateLog('discoverStatus', 'index: ' + app.targetDevice.indexSelected + ' app.targetDevice.address: ' + app.targetDevice.address);


    });

    $('#select-sensorPack').on('vmouseup', function () {

      //updateLog('blueLog', "that was mouse up");

      app.targetDevice.indexSelected = $('#select-sensorPack').prop("selectedIndex");
      app.targetDevice.address = app.data.devices[app.targetDevice.indexSelected].address;

      updateLog('blueLog', "mouse up: " +  JSON.stringify(app.targetDevice) + 
        "\n index: " + app.targetDevice.indexSelected +
        "\n address: " + app.targetDevice.address);
      clearLog('discoverStatus');
      updateLog('discoverStatus', 'index: ' + app.targetDevice.indexSelected + ' app.targetDevice.address: ' + app.targetDevice.address);

    });

    $('#select-sensorPack').on('vmousedown', function () {

      updateLog('blueLog', "that was mouse down");

    });

}


function repopulate(targetElement) {

    //////////////////////////////////////////////////////////////////////////
    // now the drop down list can be re-populated
    //////////////////////////////////////////////////////////////////////////

  // http://stackoverflow.com/questions/26666593/how-to-remove-option-element-in-jquery-mobile
  $('#' + targetElement).find('option').remove();
  $('#' + targetElement).selectmenu('refresh', true);

  for (var j=app.data.devices.length - 1; j > -1; j--) {
    // "You cannot use a variable to access a property via dot notation, instead use the array notation"
    // updateLog('blueLog', "PREPENDING: " + app.data.devices[j].name);
    $('#' + targetElement).prepend("<option id='sel" + j + targetElement + "' value='" + j + "'>" + 
      app.data.devices[j].name + "</option"); 
  }

  // http://stackoverflow.com/questions/20706764/jquery-mobile-not-displaying-correct-selected-item-in-list/20706846#20706846
  $('#sel0' + targetElement).prop('selected', true);
  $('#' + targetElement).selectmenu('refresh', true).trigger('updatelayout');

  app.targetDevice.indexSelected = 0;  // new
  app.targetDevice.labelSelected = $('#' + targetElement).find(":selected").text();

  app.targetDevice.address = app.data.devices[app.targetDevice.indexSelected].address;

  clearLog('discoverStatus');
  updateLog('discoverStatus', 'index: ' + app.targetDevice.indexSelected + ' app.targetDevice.address: ' + app.targetDevice.address);


}


function buttonColor(element, color) {
  $('#' + element).parent().find('.ui-btn').css("background", color);
}

function clearResponse() {
  $('#blueResponse').val("");
}

function clearLog(element) {
  $('#' + element).val("").change();  // 'change' gets the textinput to re-size appropriately
}

function updateLog(element, newString) {
  var tempString = $('#' + element).val();
  tempString = tempString + "\n" + newString;
  $('#' + element).val(tempString).change();
  console.log("updateLog: " + tempString);
}

function show() {

    // dump the contents of app.targetDevice.services[] to the textarea
    //
    //

      updateLog('discoverStatus', 'services len: ' + app.targetDevice.services.length);

      for (var i = 0; i < app.targetDevice.services.length; i++) {

        updateLog('discoverStatus', '\nserviceUuid: ' + app.targetDevice.services[i].serviceUuid);

        if (typeof app.targetDevice.services[i].characteristics == 'undefined') {

          updateLog('discoverStatus', '    charUuid: <none>');
          // http://encosia.com/using-jquery-1-6-to-find-an-array-of-an-objects-keys/
          var CharKeys = $.map(app.targetDevice.services[i].Characteristics, function(value, key) {return key;});
          for (var n = 0; n < CharKeys.length; n++) {
            updateLog('discoverStatus', '      key: ' + CharKeys[n]);
          }


        } else {

          if (app.targetDevice.services[i].characteristics.length > 0) {

            for (var j = 0; j < app.targetDevice.services[i].characteristics.length; j++) {

              //updateLog('discoverStatus', 'chars: ' + JSON.stringify(app.targetDevice.services[i].characteristics)); 

              updateLog('discoverStatus', '   charUuid: ' + app.targetDevice.services[i].characteristics[j].characteristicUuid);

              // redBear not reporting descriptors
              /*
              if (app.targetDevice.services[i].characteristics[j].descriptors.length > 0) {

                updateLog('discoverStatus', 'descriptors len: ' + app.targetDevice.services[i].characteristics[j].descriptors.length);

                for (var k = 0; k < app.targetDevice.services[i].characteristics[j].descriptors.length; k++) {
                  updateLog('discoverStatus', 'descriptor: ' + app.targetDevice.services[i].characteristics[j].descriptors[k].descriptorUuid  + '\n');
                }

              } else {
                updateLog('discoverStatus', '(no descriptors)' + '\n');
              }
              */

              //updateLog('discoverStatus', '\nproperty object: ' + JSON.stringify(app.targetDevice.services[i].characteristics[j].properties) + '\n');

              // http://encosia.com/using-jquery-1-6-to-find-an-array-of-an-objects-keys/
              var textKeys = $.map(app.targetDevice.services[i].characteristics[j].properties, function(value, key) {return key;});
              for (var m = 0; m < textKeys.length; m++) {
                updateLog('discoverStatus', '      property key: ' + textKeys[m]);
                }

            }  // end characteristics.length

          } else {  // end 0 characteristics 



          }

        }  // end characteriscics defined

      }  // end services

      updateLog('discoverStatus', '\n');

}