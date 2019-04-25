---
layout: post
title:  "Publishing a .NET Standard Library to NuGet using Azure"
comments-enabled: true
---

## Introduction

<!-- excerpt-start -->
I am keen to start contributing more to Open Source Software. Contribution can come in many forms: improving docs, creating libraries, fixing bugs or even adding features to existing libraries and frameworks. I recently had an idea for creating a NuGet package to assist with identifying ASP.NET Core web application dependencies which had not been registered in IoC, and therefore causing a runtime error.

This post outlines the process of creating a .NET Standard Library which is packaged and pushed to NuGet using Microsoft Azure.
<!-- excerpt-end -->

## The Idea

Compared to the traditional .NET Framework, .NET Core approaches web application development in a different way, adopting a pipeline approach to handing HTTP requests, built-in logging and dependency injection and more. An IoC container is built-in to promote a dependency injection focused way of structuring classes.

From time to time I would find myself creating a new service and adding it as a constructor dependency, but forgetting to register the new service in the IoC container. Unit testing  For those familiar with ASP.NET Core development, this doesn't cause a build error and the app starts up without issue, and unit testing does not help in because constructor dependencies are mocked and passed in as part of the test. The problem is only obvious once you try to access a controller which uses the unregistered dependency (either directly or indirectly via another dependency) which results in a runtime error. If the developer exception page option has not been enabled during development, it won't be immediately obvious what the problem is.

It seems wrong for the app to start-up and accept requests when the it is not configured correctly and will produce a server error when certain routes are accessed. I had an idea to create a NuGet package to verify that all dependencies had been setup in IoC, and to stop app execution if any had not been registered.

## Creating the Library

I won't be going into too much detail of the code here, the source is available on my GitHub page so I will give a high level overview.

- The package idea
- Setting up the build pipeline in Azure
- Ideally need a release step after build

- Successful build status on NuGet
- Screenshot of build pipeline
