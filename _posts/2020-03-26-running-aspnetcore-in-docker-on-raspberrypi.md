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








* Note about publish to seperate `out` folders in 2.1, but in the root level in 3.1.
* Note about `<TargetLatestRuntimePatch>true</TargetLatestRuntimePatch>`
* Note about gRPC error. Use latest version.
* Note about why not 3.1

[noobs-url]: https://www.raspberrypi.org/downloads/noobs/
[enable-ssh-url]: https://www.raspberrypi.org/documentation/remote-access/ssh/
[install-docker-article-url]: https://dev.to/rohansawant/installing-docker-and-docker-compose-on-the-raspberry-pi-in-5-simple-steps-3mgl
