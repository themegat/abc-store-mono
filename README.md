# ABC Store Mono Repo

## Overview

**ABC Store** (_Whatever Store_) is mono-repository containing most if not all the projects or source-code needed to run ABC Store properly.

The repo contains:

- [ABC Store API](./abc-store-api/) : A C# ASP.NET Core application serving as the backend API.
- [ABC Store Webapp](./abc-store-webapp/) : A React application serving as the frontend application.
- [Functions](./functions/) : The Firebase function built using Typescript serving as utility functions.

## Project Setup

### Enironment

**Your environment needs to have Node.js and .Net9.**
Download them at:
- [Node.js](https://nodejs.org/en/download)
- [.Net9](https://dotnet.microsoft.com/en-us/download)

> Also setup and configure the Firbase emulator using this [Guide](https://firebase.google.com/docs/emulator-suite/install_and_configure) .

### Setting up

**These projects are dependant on [Firebase](https://firebase.google.com/) so make sure that you have set up a Firebase Project and enable [Firebase Authentication](https://firebase.google.com/products/auth), [Firebase Functions](https://firebase.google.com/products/functions) and [Firebase Storage](https://firebase.google.com/products/storage) .**

### Quick Start

```bash
# Clone the repository
git clone https://github.com/themegat/abc-store-mono

# Install dependencies
npm install
```

## License

[MIT](./LICENSE)
