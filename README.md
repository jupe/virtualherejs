# virtualherejs

VirtualHere library and cli interface for nodejs.

## Help

```
$ vh
Usage example:
vh allocate --hub vh-server-address --requirements type=phone
vh release --hub vh-server-address

Commands:
  cli.js allocate  allocate devices
  cli.js release   release allocated resources

Options:
  --version    Show version number                                     [boolean]
  --hub        Virtualhere hub address. <address>(:<port>)   [string] [required]
  --deviceMap  device map file                                          [string]
  --help       Show help                                               [boolean]

Missing required argument: hub
```

## deviceMap file

Example file:
```shell script
[
  {
    "name": "long device name",
    "type": 'dut'
  },
  {
    "serial": "123456",
    "type": 'dut'
  }
]
```

Rules maps all devices using above rules:
* which contains `"name" = "long device name"` with `type: "dut"` -property
* which contains `"serial" = "123456"` with "`type: "dut"` -property.

This allows to map extra details to each unique devices or generally for all similar ones.
