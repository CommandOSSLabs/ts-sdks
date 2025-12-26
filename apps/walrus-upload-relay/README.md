# Walrus Upload Relay

> **Walrus Upload Relay** is a powerful new companion binary for the Walrus TypeScript SDK that makes it easier and faster for apps to upload data to Walrus. The relay acts as a specialized, high-performance lane for an application's data, taking over the task of encoding and [distributing data](https://www.walrus.xyz/blog/how-walrus-red-stuff-encoding-works) shards across Walrus’s decentralized network of storage nodes. Designed to be more lightweight than the Publisher, any developer can run a Relay for their own applications, so you don't have to rely on a third-party operator. Plus, aspiring Relay operators can easily set up a Relay and get paid for the service in SUI.

This is image is based on the official [mysten/walrus-upload-relay](https://hub.docker.com/r/mysten/walrus-upload-relay/), with some added features

## Added features

- Configuration generation from Environment Variables, using [`hairyhenderson/gomplate`](https://hub.docker.com/r/hairyhenderson/gomplate)
- Server address bind configuration via `HOST`and `PORT`
