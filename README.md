# Modbus Web Client

This is a Modbus client collecting data from several Modbus servers and visualizing them in a simple web app.

The tool is written in JavaScript using node.js, the client uses vue.js.

## Development status

The tool is currently under development, I'll add the features I need for myself. Feel free to ask for (or even better add) features you need.

## Installation
Todo

## Configuration & Options

The configuration with all devices is found in a json file. See the config folder of this project for some samples.

The root element is the _devices_ array, which contains all  Modbus devices to read out.


### _devices_ object

The devices object has the following properties:

|Property|Data|
|-------:|---:|
|_description_| String used for the title of the server |
|_server_| Object with the URL and port of the server |
|_interval_| The data is read out in this interval (ms) |
|_elements_| Array with element configuration objects |

#### _element configuration_ object

|Property|Data|
|-------:|---:|
|_description_| String used for the name of the element |
|_type_| Either 'coil', 'inputRegister' |
|_address_| Address of the register |
|_length_| Length of the data (if applicable) |
|_parser_| How the data should be parsed before visualizing |

### _parser_ options

 * int8, uint8: one byte, decimal
 * int16, uint16: 2 byte value, decimal
 * int32, uint32: 4 byte value, decimal
 * float
 * hex-string: displaying _length_ bytes in hexadecimal notation
 * ip-address: a 4 byte string displayed as IP address
 * mac-address: a 6 byte value displayed as MAC address
 * string: displaying _length_ bytes parsed as string  
 

## Licence

MIT

[License](./LICENSE)
[Page 2](./page2.md)

## Contact
Christian Kuster, CH-8342 Wernetshausen
[www.ancasicolica.ch](http://www.ancasicolica.ch)