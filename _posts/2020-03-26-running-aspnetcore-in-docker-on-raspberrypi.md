---
layout: post
title:  "Running ASP.NET Core in Docker on a Raspberry Pi"
comments-enabled: true
---

## Introduction

<!-- excerpt-start -->
One of my most recent personal projects has been to create a dashboard application to be utilised around the home. It uses VueJS as the front-end technology, which is supported by an ASP.NET Core 2.1 Web API. Unfortunately, I had to downgrade from ASP.NET 3.1 to 2.1 for reasons explained later in the post.

Some of the functionality of the API requires it to be on the local network and not cloud-hosted, and I had a Raspberry Pi which wasn't being put to any good use, so I thought it would be an ideal hosting platform for the application.

This post aims to explain the process of publishing an ASP.NET Core application to a Raspberry Pi 2, and running it within Docker for easier deployment and more consistent runtime behaviour.
<!-- excerpt-end -->

### Why Docker?

I won't be going to any great lengths to explain what Docker is and what benefits it offers, and for those with experience with using Docker, then the reasons are likely very clear.

Simply, Docker is a containerisation platform, enabling applications to be run in an isolated environment on a host machine, much like a Virtual Machine (VM). Containerisation differs from the more traditional approach of running applications from within VMs; Containers do not require their own operating system, they explicitly define all of their required dependencies to run the application up-front, and they are designed to run on practically any host machine.

Docker changes the way applications are built, deployed and run. The benefits to using Docker are significant, including:
- Reduced infrastructure costs.
- Easier scaling to match demand.
- A far simpler and more repeatable deployment model.
- Quicker onboarding onto a project for new developers.
- Consistent runtime behaviour (helps overcome the age-old story of &quot;It runs on my machine!&quot;).

### The Raspberry Pi

For completeness, I thought it would be worthwhile detailing some basic specs of my Raspberry Pi, in case anyone has any trouble getting their setup to work.

- Raspberry Pi 2 Model B Rev 1.1 (2015).
- Fresh installation of Raspbian GNU/Linux 10 (buster) using [NOOBS][noobs-url].
- Up-to-date system packages by running `apt-get update && apt-get upgrade`{:.code-inline}.
- Enabled SSH for easier access and configuration. [The documentation][enable-ssh-url] explains how to do this.
- Installed Docker and Docker Compose. This isn't trivial on a Raspberry Pi, but there are numerous articles online which explain how to do it. I found [this article][install-docker-article-url] to be really helpful.

And that's about it. The dotnet CLI does not need to be installed, nor does Node or any other SDK; Docker is really the only pre-requisite for running different applications using a variety of technologies on the Raspberry Pi.

## Publishing and Running the App

### Publishing the App for the Raspberry Pi

First thing's first &mdash you'll need an application to publish. For me, I already had a solution which contained two projects &mdash; a WebAPI project targeting `netcoreapp2.1`{:.code-inline} and a Class Library project used for abstracting data access targeting `netstandard2.0`{:.code-inline}. If you don't have a project yet, a fresh WebAPI project created through the dotnet CLI would suffice.

.NET Core apps can be prepared for deployment to a host machine using the `dotnet publish`{:.code-inline} command. By default, the `publish`{:.code-inline} command restores dependencies and builds the application, and then outputs the result of the build to a folder, the contents of which is enough to run the application. As .NET Core is cross-platform, a single `publish`{:.code-inline} command can generate an application DLL and library files which can be executed on different target platforms and architectures.

When it comes to the Raspberry Pi, storage space is more of a consideration when deciding to host applications on it, so I configured the `publish`{:.code-inline} command to produce a leaner output to put less strain on the Pi. I acheived this in a few ways:

- Since I knew this application would be running on the Pi, I configured the `--runtime`{:.code-inline} option to specifically target the `linux-arm`{:.code-inline} architecture.
- As specified in the guidance for the .NET Core 2.1 SDK, supplying a `--runtime`{:.code-inline} option implicitly sets the `--self-contained`{:.code-inline} to `true`{:.code-inline}. I'm not interested in a self-contained deployment (SCD) because the application is going to be running within Docker which will already have the .NET Core Runtime installed. So to keep the application size down, the second option in my `publish`{:.code-inline} command is to set the `--self-contained`{:.code-inline} option to `false`{:.code-inline} to ensure the Runtime is not packaged as part of my application.

A few other notes about my `publish`{:.code-inline} command:
- I'm targeting the `Release`{:.code-inline} configuration because the Pi will be acting as my Production system and I want the output of the build to be as optimised as possible.
- I'm also supplying the `--no-restore`{:.code-inline} to ensure that dependencies are not restored as part of the `publish`{:.code-inline} &mdash; in my Dockerfile, a `restore`{:.code-inline} has already explicitly been performed on my Project files prior to the `publish`{:.code-inline} command to make use of Docker's caching ability.

The result of the above configuration looks like the following:

{:.code-block}
```
RUN dotnet publish server.sln \
    -c Release \
    -o dist \
    -r linux-arm \
    --no-restore \
    --self-contained false
```

The Microsoft Docs (https://docs.microsoft.com/en-us/dotnet/core/deploying/#examples) says that this command does not work using the .NET Core SDK 2.1, but that's not quite accurate; the command runs successfully, but the output does not include a platform-specific executable, nor is the output cross-platform, but that's just what I needed to minimise application size.







* Note about publish to seperate `out` folders in 2.1, but in the root level in 3.1.
* Note about `<TargetLatestRuntimePatch>true</TargetLatestRuntimePatch>`
* Note about gRPC error. Use latest version.
* Note about why not 3.1

[noobs-url]: https://www.raspberrypi.org/downloads/noobs/
[enable-ssh-url]: https://www.raspberrypi.org/documentation/remote-access/ssh/
[install-docker-article-url]: https://dev.to/rohansawant/installing-docker-and-docker-compose-on-the-raspberry-pi-in-5-simple-steps-3mgl
