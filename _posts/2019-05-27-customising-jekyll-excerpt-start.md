---
layout: post
title:  "Customising the Excerpt Separators in Jekyll"
comments-enabled: true
---

{:#logo-single-container}
![Jekyll Logo][jekyll-logo]

## Introduction

<!-- excerpt-start -->
Jekyll offers a multitude of blog related functionality out-of-the-box, all which make creating a custom blog much easier. One of these features is excerpts, which allow you to display a subset of text from blog post -- useful on a list page to give the reader a quick insight into what each post is about.

When creating my blog, I found this feature useful, but it had one limitation which I needed to work around -- configuring where the excerpt should start from.
<!-- excerpt-end -->

By default, the excerpt for a blog post is set as the first paragraph of text. The end of the excerpt can be configured through Jekyll, allowing it to include text beyond the first paragraph, but the the point at which the excerpt should start from is not.

This was a problem for me because my blog posts start with a title, and sometimes an image, neither of which I want to be included in the excerpt.

## Customising the End Excerpt Separator

A custom separator can be used to tell Jekyll at what point to stop when building the Excerpt text for a blog post. This can be found on the Jekyll documentation, but in short: this can be set on the page itself in the Front Matter block, or across the site in the `config.yml`{:.code-inline} file. I opted for the latter, as I wanted this to be applied to all posts in a consistent and maintainable way. I added the following line to the config file:

{:.code-block}
```
excerpt_separator: <!-- excerpt-end -->
```

Now the `<!-- excerpt-end -->`{:.code-inline} separator can be placed at any point in each post, and all text before it will be included in the excerpt.

## Customising the Start Excerpt Separator

Defining the start point of the excerpt isn't configurable in Jekyll. I'm assuming because, for most, the beginning of the blog is suitable.

The standard way of including a post's excerpt on a page is by accessing the `excerpt`{:.code-inline} property which is available on a
post.

{:.code-block}
{% raw %}
```
{% for post in site.posts %}
    <!-- Code removed for brevity -->
    {{ post.excerpt }}
{% endfor %}
```
{% endraw %}

With the help of some Liquid syntax, I was able to replace the above with:

{:.code-block}
{% raw %}
```
{% for post in site.posts %}
    <!-- Code removed for brevity -->
    {% assign excerptParts = post.excerpt | split: "<!-- excerpt-start -->" %}
    {{ excerptParts[1] | strip_newlines | truncatewords: 50 }}
{% endfor %}
```
{% endraw %}

This is hopefully quite self-explanatory, but this is doing a couple of things:

1. Taking the original `post.excerpt`{:.code-inline} text and splitting it into an array of strings using the separator `<!-- excerpt-start -->`{:.code-inline}. Assuming the separator is included exactly once in each post, then this should result in an array of two strings: the text before the separator which shouldn't be included, and the text after which should.
1. Outputting the new excerpt which is the second element of the array, discarding any text before the start separator. I have also included some Liquid filters to strip out any new lines and truncate the text to 50 characters, both of which are optional and can be configured as you prefer.

This approach obviously relies on the presence of the start separator in each blog post to define where the excerpt should start from, and the end separator to define where the excerpt should stop. But this does achieve a simple and clean way to configure the excerpt for each blog post.

[jekyll-logo]: {{ site.baseurl }}/assets/images/jekyll-logo.png "Jekyll logo"