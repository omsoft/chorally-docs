# Chorally Engineering Documentation

In this handbook you will learn about Chorally Engineering policies and microservices.

This documentation was built for engineers/support team members that work on the platform, and does not contain business jargon or fancy words. Only practical informations that give you an head start and will make 10x faster at dealing with our complexities.

If you’re new to the company, welcome! It’s important that you review at least the "Workflows" and "Architecture" sections in this handbook, so you know what to expect when writing software.

Please note that this handbook may be updated at any time, and it’s up to you to keep abreast of those updates. Reach out to any of your senior peers if you have any questions about the information contained in this handbook.

Built with pure markdown code using [Docusaurus](https://docusaurus.io/) and a bit of React.

## Installation

```bash
yarn
```

## Local Development

```bash
yarn start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

## Build

```bash
yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

## Deployment

Using SSH:

```bash
USE_SSH=true yarn deploy
```

Not using SSH:

```bash
GIT_USER=<Your GitHub username> yarn deploy
```

If you are using GitHub pages for hosting, this command is a convenient way to build the website and push to the `gh-pages` branch.
