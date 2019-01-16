---
layout: post
title:  "Creating the Blog"
---

I have created a few simple static websites like this before, mainly when I was quite new to website development. I spent most of my early software development career building ASP.NET MVC web applications which one approaches in a totally different way. You already have the framework there for layout pages, partials and dynamically displaying content through Razor syntax.

When it came to creating this blog, I knew I didn't need anything fancy; I needed something simple, cheap to run and easy to maintain. It always bugged me how, with static websites I have previously built, all of the boilerplate content was duplicated between my HTML files - the head (including meta tags, favicons and css), the navbar, the footer and general page layout. As the website grows, this becomes hard to maintain and more prone to simple mistakes. Any new pages require a copy and paste of boilerplate content, and any edits to boilerplate content must be applied individually to all pages. I wanted to find a better way to do it, and that's how I came across Jekyll and GitHub Pages, which offered the workflow improvements I was after.

{:#logo-container}
![Jekyll logo][jekyll-logo]
![GitHub Pages logo][github-pages-logo]

[jekyll-logo]: {{ site.baseurl }}/assets/images/jekyll-logo.png "Jekyll logo"
[github-pages-logo]: {{ site.baseurl }}/assets/images/github-pages-logo.png "GitHub Pages logo"

[Jekyll][jekyll-url] is an open source static site generation tool which is also blog-aware. Jekyll, written in Ruby, simplifies the process of building and maintaining a static website. Jekyll is also blog-aware, meaning it has features which make the process of creating a blog much easier, since a blog can easily be represented as a static website. Driven by MD files, not a DB.

Some of the most useful features of Jekyll I have found include:
- Support for Markdown and automatic conversion to HTML.
- Support for SASS and minification out-of-the-box.
- Front Matter to set and apply data from site and page configuration data.
- Liquid - a templating language to set page content and add logic to your page content generation.
- Layouts and partial views to avoid page duplication and a promote modular page structure.
- CLI-driven making it easy to create custom scripts and automate your workflow.

The Jekyll website explains the above well and has an easy-to-follow tutorial to get you started writing a simple blog.

[GitHub Pages][github-pages-url] is a free hosting platform provided by GitHub for websites that use static content, and is a natural choice for blogs written in Jekyll. It allows you to turn any public GitHub repository into a live website, supporting Jekyll out-of-the-box so your site will be built and published on push to your master branch.

[jekyll-url]: https://jekyllrb.com
[github-pages-url]: https://pages.github.com

# Setup

I vary which machine I develop on, but for small development projects like this which aren't tied to Windows, I tend to use my Mac. Jekyll runs on Ruby which was already installed on my Mac along with the RubyGems package manager (I believe they're pre-installed on all Mac machines by default), so I only had to run the below command to install Jekyll and the Bundler:

{:.code-block}
`sudo gem install jekyll bundler`

Installation is fairly trivial, and there are good instructions on the Jekyll website for installing on different environments.

# Enabling GitHub Pages

Turning your repo into a live website is pretty straight forward and can be done from the repo settings.

{:#enablingGitHubPages}
![Enabling GitHub Pages for the repo][enabling-github-pages]

[enabling-github-pages]: {{ site.baseurl }}/assets/images/2018-12-01-github-pages.png "Enabling GitHub Pages for the repo"

I chose my master branch as the one that should be listened to for any changes. Representing my live code base, whenever any new commits are made to this branch, the code is automatically built and published. I opted not to go for a theme as I wanted to write all of the styling myself, and have not hooked up the site to a custom domain as I am happy to take the free hosting and HTTPS at the expense of .github.io appended to the URL!

# Creating the Walking Skeleton

As I do with most projects (in and out of work), I always try start off with the most basic product and try to prove the whole build and release workflow. Solving any issues with your build and release process is much easier when there are fewer variables involved - a very small code base lessens the chance that issues are being caused by your code.

As a Walking Skelton, along with the required Jekyll config, I chose a simple index.html page with a basic nav and footer. I merged this branch into my master branch to kick off a Jekyll build of my site. This highlighted an issue with my Gemfile. After fixing that,my site was live shortly after. After initally enabling GitHub Pages on my repo, I did have to wait around 30 minutes for the change to take affect and for my site to be fully available.

# Styling and Structure

Now that I had proved my build and release process, I got on with designing the general theme and structure of the blog, making use of the Jekyll features listed above to reduce the need for duplication and to make it as easy as possible to make future edits. The main ways I achieved this was to use Layouts, Includes and Data Files.

## Styling with SASS

Support for SASS is built right into Jekyll, so it didn't take much setting up to get it working. I defined a `_sass` folder in the root of my project containing separate `.scss` files for each logical part of the website, helping to keep the modular and easy to maintain in the future.

## Layouts

One of the main benefits I have found from using a static site generator is being able to define layout pages and using them to structure pages in a more readable and maintainable way.

I created a main layout page to act as the base HTML for all pages, containing placeholders for the header, nav, body and footer content defined using Liquid syntax. This meant that all pages were based off the same base HTML, ensuring consistency in the event of any changes.

{:.code-block}
```
<!doctype html>
<html>
    <head>
        {{ "{% include head.html " }}%}
    </head>
    <body>
        <header>
            {{ "{% include navigation.html " }}%}
        </header>
        <div id="site-content">
            {{ "{{ content " }}}}
        </div>
        <footer>
            {{ "{% include footer.html " }}%}
        </footer>

        <script src="{{ "/assets/js/lib/jquery-3.3.1.min.js" | relative_url }}"></script>
        <script src="{{ "/assets/js/lib/bootstrap.min.js" | relative_url }}"></script>
    </body>
</html>
```

Every blog post will has a very similar structure so it makes sense to make use of a Layout page here too. Again, this layout is small, defining the Bootstrap grid layout and setting the blog title, date published and and blog content through Liquid.

{:.code-block}
```
---
layout: main
---
<div class="container">
    <div class="row">
        <div class="col-md-12">
            <h2 id="post-title">{{ "{{ page.title " }}}}</h2>
            <h4 id="post-published-date">Published: {{ "{{ page.date | date_to_string " }}}}</h4>
        </div>
    </div>
    <div class="row">
        <div class="col-md-12">
            <div id="post-content">
                {{ "{{ content " }}}}
            </div>
        </div>
    </div>
</div>
```

## Includes

Similar to Layouts, Includes helped reduce duplication and promoted a cleaner more modular approach to defining the HTML for all pages.

I created Includes for HTML that either needed to be used in multiple places, or when the HTML was defnining a logical component of the website. Using this criteria, I initially ended up with 3 types of Includes:

- Head
- Footer
- Navigation

Each of the above could have easily been defined within the `main` Layout page, but for modularity, it made sense to keep these as separate components.

## Data Files

# Writing Blog Entries

# Custom Scripts

## Running the Site

The base URL of my site is different when running locally to that which is live. As a convention, GitHub Pages will publish your site to https://\<your-username>.github.io/\<repo-name>. This meant . Rather than set my site to be hosted locally at /blog too, I created a custom shell script which launches the site at a configurable base URL. The script also first cleans out the Jekyll output directory and launches Google Chrome on a configurable port.