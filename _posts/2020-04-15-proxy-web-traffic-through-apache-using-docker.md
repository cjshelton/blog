---
layout: post
title:  "Running ASP.NET Core in Docker on a Raspberry Pi"
comments-enabled: true
---

## Introduction

In a world of growing popularity in cloud computing, it's important not to lose sight of what goes on behind the scenes when provisioning resources and quickly spinning up web apps in the cloud. Although as a developer, you don't necessarily need to understand the how web servers like Apache work and how to configure them, it's a good skill to have and helps contribute to your overall understanding of the field; software development is more than just writing code.

<!-- excerpt-start -->
Web servers are not something I've ever spent a great deal of time with, so I was keen to give it a go from scratch.
This post does not cover anything ground breaking, but hopefully covers a few things which I misunderstood and found difficult and confusing from different resources online.

In particular, I was interested in running Apache on my Raspberry Pi inside a Docker container, and using it to proxy traffic to multiple web applications also hosted within Docker containers on the Pi.
<!-- excerpt-end -->

The problem I was trying to solve...
The post will cover a few different things:
1. Running an Apache web server on the Raspberry Pi.
2. Using Apache Virtual Hosts to run multiple web applications on the pi using different domain names. (I was quite new to this. Knew it wasn't 1 machine per application, but didn't know how this would be implemented to share server resources).
3. Proxying traffic for a domain name based virtual host to a Docker Container. Won't always be dealing with a DocumentRoot.
