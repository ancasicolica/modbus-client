# Installation

This tool was developed and tested on POSIX based operating systems, it should work also on Windows but this is not tested yet. All descriptions below are therefore for POSIX based systems.

## Install node.js

If you don't already have a recent version of node.js (check on the command line by typing `node --version`) installed (all versions higher than 6.0 should work), you have to install node.js first. 
I recommend using _n_ which allows easy upgrading. See the instructions [on the GitHub Page](https://github.com/tj/n). In short:

    git clone https://github.com/tj/n.git
    cd n
    make install
    n lts   

## Download the most recent version of modbus-client

Two ways to do:

  * Download the latest release from the [release page](https://github.com/ancasicolica/modbus-client/releases), which is the recommended way to do in most cases
  * Clone the repository and get all updates on the master branch (which might be a bit risky...)
  
## Install the dependencies

Enter into the directory where you copied the modbus-client sources to.

Either run `npm i` or, if you have installed yarn, `yarn install`. This will fetch the required sources from the NPM repository and take a little time.

## Test the installation

As you don't have a valid [configuration](./configuration.md) right now, we can only test the basics.

Enter the modbus-client directory, start the server with `node server.js`. A bunch of log messages, some of them errors (ECONNREFUSED) will appear. Open the URL [http://localhost:8080](http://localhost:8080) in your browser, you should see a website with one demo entry (but no values, as we can't connect to this not existing device).

If port 8080 is already occupied, see [configuration](./configuration.md) how to change the port. 