# Security

This library builds command strings and parses replies. It does not open sockets, USB devices, or the network.

Report a vulnerability by opening a private security advisory on GitHub for `WiFiLabel/label-toolkit`. Please include a vector file or a short input that shows the problem, and the version you ran.

Do not send printer passwords, Wi-Fi credentials, or SGD values that identify a site. `device.reset`, `device.restore_defaults`, and `^JUF` are destructive. Callers must pass an explicit confirm flag. The library still sends those bytes once confirmed, so keep confirm off unless the operator asked for the reset.
