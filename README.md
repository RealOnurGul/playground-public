# Snake

A small browser Snake game that can be run locally and opened from a phone on the same Wi-Fi network.

## Run locally

Start a local web server from this repository:

```sh
python3 -m http.server 5173 --bind 0.0.0.0
```

Open the game on the computer at:

```text
http://localhost:5173
```

## Open from a phone

Keep the server running and make sure the computer and phone are on the same Wi-Fi network.

Find the computer's local network IP address:

```sh
ipconfig getifaddr en0
```

If that command prints `192.168.1.25`, open this URL on the phone:

```text
http://192.168.1.25:5173
```

If the page does not load, check that both devices are on the same network and that the computer firewall allows incoming connections for Python.
