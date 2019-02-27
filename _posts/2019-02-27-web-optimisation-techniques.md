---
layout: post
title:  "Web Optimisation Techniques"
comments-enabled: true
---

## Introduction

<!-- excerpt-start -->
This post covers some simple, but effective, techniques to follow when it comes to improving the performance of your website. Some of these techniques may sound quite trivial to the more experienced web developer, but it can be easy to overlook them and forget about them, especially when you have been involved in building a large-scale web app with lots of moving parts. This should also serve as a useful checklist to those more unfamiliar to web development to help make sure you're getting the most out of your website's performance.
<!-- excerpt-end -->

I plan on doing a follow-up post later in the year covering some of the more complex techniques like efficient resource caching, and showing how some of these techniques can be automated and introduced into your development workflow.

## Techniques for Optimisation

#### JavaScript and CSS Minification and Concatenation

Any Javascript or CSS files which your website needs will need to be fetched individually by the browser when the page loads. Each of these fetches is additional HTTP traffic to the server which consumes more bandwidth and increases the overall time it takes for the page to be fully loaded.

A simple technique which can be employed to mitigate this is to first minify the content and concatenate it into a single file.

##### Minification

Minification takes the original source JS &amp; CSS files and strips out any unnecessary content, including whitespace and any optional tokens (curly braces, semi-colons etc.). The benefit of this being that your minified files are smaller and should take less time to be served to the browser. 

##### Concatenation

Concatenation, as the name suggests, takes the original source files and concatenates them together into a single file. The result being a larger file, but having only one file reduces the number of HTTP requests that need to be made to the server to fetch the content.

Use build tools such as [Grunt][grunt-url] or [Gulp][gulp-url] to add minification and concatenation to your development workflow and automatically generate these files for you.

#### Image Size, File Types and Compression

Unlike individual JS and CSS files, it's much easier for images to exceed 1000KB in size unedited. For obvious reasons, the techniques described in the previous section cannot be applied here. The best technique for images is to use the right image type and ensure the image is no larger than it needs to be in terms of size and dimensions.

##### Image File Types

There are various image types, and some are more favourable for websites than others.

##### Images Sizes

The larger the image is in pixels, the larger the file size, so it's important to make sure your images are no larger than they could possible be when rendered on your website. For example, it's unnecessary to server up an image which is 4000 x 2000 pixels in size yet is styled with `width: 120px`{:.code-inline}. Preview tool.

Image size can further be reduced by compressing the image using tools such as [TinyPNG][tinypng-url]. Compression works by reducing the number of colours stored in an image and stripping out some metadata. Image quality is reduced, but its affect on how the image looks on the eye is negligible. I have almost always seen reductions in file sizes, and have seen reductions of up to 90% in some cases which makes a big difference.

#### Minimal External Resources (CDN for JS - less network activity/reduced latency same server)

#### Placement of JS resources at end of Body

#### Using a performance tool

### Using service like Cloudflare for caching resources and web files

### Webpack or YARN can be used so you don't have to store browser dependencies in the repo and don't need CDN links.

### Async for js

### 

[grunt-url]: https://gruntjs.com/
[gulp-url]: https://gulpjs.com/
[tinypng-url]: https://tinypng.com/