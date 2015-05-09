

#include <SPI.h>
#include <Nordic_nRF8001.h>  // yes, for BLE Shield 2.1
#include <ble_shield.h>

// don't use the strings library http://forum.arduino.cc/index.php?topic=126834.0

void setup()
{  

  ble_begin();
  Serial.begin(57600);
  
}

int value = 0;

void loop()
{

  if ( ble_available() ) {
    while ( ble_available() )
      Serial.write(ble_read());
      
    Serial.println("");

    value = analogRead(0)/4;
    
    ble_write(value);
    
    Serial.println("analog");
    Serial.println(value);
    
  }
  
  ble_do_events();
}


