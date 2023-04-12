<h1 align="center"><big>fail3</big></h1>

<p align="center"><img src="assets/logo.png" alt="logo" width="200"/></p>

This project contains a script called `fail3.js`, which is a command-line interface (CLI) utility to
manage software projects. It allows you to initialize new projects and create sprints with a
specified scope.

<!-- toc -->

- [Features](#features)
- [Getting Started](#getting-started)
- [Options](#options)
- [Examples](#examples)

<!-- tocstop -->

## Features

1. Initialize a new project with a specified name.
2. Create a sprint with a specified scope.

## Getting Started

To get started with **fail3**, follow these steps:

**1. Clone the repository:**

```shell
git clone git@github.com:failfa-st/fail3.git
```

**2. Change to the project directory:**

```shell
cd fail3
```

**3. Install the required dependencies:**

```shell
npm install
```

**4. Configure environment variables:**

The project requires the following environment variables:

```dotenv
OPENAI_API_KEY=
GITHUB_TOKEN=
GITHUB_OWNER=
```

We provide a `.env.example` file, which should be copied to `.env` and filled in with the necessary
information.

- `GITHUB_TOKEN`: Generate a token from https://github.com/settings/tokens?type=beta with write
  access
- `OPENAI_API_KEY`: Generate a key by signing up at https://platform.openai.com/signup
- `GITHUB_OWNER`: Your GitHub username
