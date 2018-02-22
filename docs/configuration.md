# Configuration

## Root level

### title
This is a string which is displayed as title in the browser.

### server
An object configuring the web server. There is only one parameter right now, the port. If you don't set the value, the default port 8080 is used.

    "server": {
       "port": 8080
     }
     
### devices

An array with several modbus devices.

## device Object  

Every device object is defined by server settings and the registers (elements)

Sample:

      "description": "Modbus Server XY",
      "server": {
        "url": "192.168.1.10",
        "port": 502
      },
      "interval": 2000,
      "elements": [
        {
          ...

### description
A string which is used as title for the device.

### server
IP address and port of the Modbus server.

### interval
The modbus-client is polling the server periodically. This value is the interval between two requests (in milliseconds). Don't go too low, a value between 1000 and 2000 looks reasonable.

### elements
The registers of a modbus device which are read out.

## element Object

The element object defines all parameters of a register, including the source address and the way how the data is parsed.

    {
      "description": "Temperature",
      "type": "inputRegister",
      "parser": "float",
      "length": 4
      "address": 5,
      "levels": {
        "alarmLow": 0,
        "warningLow": 12.0,
        "warningHigh": 30,
        "alarmHigh": 40
    }
    
 ### description
 
 String describing the contents of the register.
 
 ### type
 
 So far, only two different types of registers are supported:
 
   * _coil_
   * _inputRegister_
   
 ### address
 
 The address of the register, see the documentation of the modbus server.     
   
 ### parser / len
 
 Defines how the data is parsed, default is _byte_. The length of some data types is defined by its type (does not have to be specified), the others are indicated with _n_ in the lenght column. 
 
 Numbers are printed in decimal.
 
 
 | value       | len         | remarks  |
 |-------------|-------------|----------|
 | uint8 / byte      | 1 | Used for coils, _byte_ is just an alias |
 | uint16 / int16 | 1 | |
 | uint32 / int32 | 2 | |
 | float | 2 | |
 | hex-string | n | hexadecimal notation of data |
 | ip-address | 2 | e.g.: 192.168.1.19 |
 | mac-address | 3 | e.g.: 0:90:e8:5f:ea:2b |
 | string | n | parsing every byte as ASCII character |
 
### levels

An optional parameter allowing to display different levels of a value (normal / warning / alarm). This works only for numeric values.

Not all four properties are needed, just define the ones making sense for your application:

  * alarmLow: any value same and below this value is considered as alarm
  * warningLow: any value same and below this value is considered as warning
  * warningHigh: any value same and above this value is considered as warning
  * alarmHigh: any value same and above this value is consiedered as alarm
  
Alarms have the higher priority than warnings. Alarms are displayed in red, warnings in yellow and all other values in green.  