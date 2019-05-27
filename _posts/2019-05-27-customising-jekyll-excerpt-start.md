---
layout: post
title:  "Customising the Start Excerpt Separator in Jekyll"
comments-enabled: true
---

{:#logo-single-container}
![Jekyll Logo][jekyll-logo]

## Introduction

<!-- excerpt-start -->
Jekyll offers a multitude of Blog related functionality out-of-the-box, all which make creating a blog with Jekyll much easier. One of these features is Post Excerpts, which allow you to display a subset of text from blog post - useful on a list page to give the reader a quick insight into what each post is about.

When creating my blog, I found the Excerpt feature useful, but it had one limitation which I needed to work around.

By default, the Excerpt for a blog post is set as the first paragraph of text. The end of the Excerpt can be easily be configured through Jekyll, allowing you to have as much or as little in the Excerpt as possible for each blog post.
<!-- excerpt-end -->

## Customising the End Excerpt Separator

## Customising the Start Excerpt Separator

Something which isn't configurable in Jekyll, is defining the point in a blog post where the Excerpt text should be started from.

I can see this not necessarily being needed by lots of people, hence why it's not supported in Jekyll. But for me, I have been creating my blog posts with a title and sometimes an image, meaning my excerpt text is set with these in, whereas my first "real" paragraph is a few lines in.

[jekyll-logo]: {{ site.baseurl }}/assets/images/jekyll-logo.png "Jekyll logo"