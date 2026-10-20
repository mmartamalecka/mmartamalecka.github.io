

## Setup

```

bundle exec jekyll serve -H --livereload

```

This site runs on Jekyll, an opensource static site generating platform.

- Clone or download a zip of this project to your computer and navigate to the
  project directory in your terminal
  
- Make sure Ruby is installed, to check if it is, run:
  ```
  ruby -v
  ``` 
  For more information about installing Ruby, refer to the [Ruby installation ](https://www.ruby-lang.org/en/documentation/installation/).

- Install the Jekyll and bundler [gems](https://jekyllrb.com/docs/ruby-101/#gems) from the commandline:
  ```
  gem install jekyll bundler
  ```
  For more information about installing Jekyll, refer to the [Jekyll quickstart guide](https://jekyllrb.com/docs/quickstart/)


- Install Gem dependencies for the project by running:
  ```
  bundle install
  ```
  
- To run the server in your local environment run:
  ```
  bundle exec jekyll serve
  ```
  
- Go to http://localhost:4000/ in your browser


## Structure

The site is a single scrolling page (`index.html`) on Jekyll, deployed to GitHub Pages by `.github/workflows/jekyll.yml`.

- `_sections/*.md` – page sections, in `order`. Each one gets a nav button that scrolls to it. `type` is `hero`, `projects` (shows projects whose `page` equals `filter`) or `about`. Texts are `*_en` / `*_pl`.
- `_projects/*.md` – projects, opened in an overlay (deep link: `/#project-<file-name>`). Set `page: design|video`, `priority`, `published`.
- `_sass/` – styles; colors, fonts and motion settings are CSS variables in `_sass/site/base/_variables.scss`.
- `assets/js/site.js` – scroll reveal, scroll-spy menu, language switch, project overlay.

## Licenses

### Underlying source code

Under the [GNU General Public License v3.0](LICENSE), you can adapt and use the source code of this site (but not it's content) for personal and commercial use, so long as you retain the same license for your own project. See a quick breakdown of what you can and cant do [here](https://tldrlegal.com/license/gnu-lesser-general-public-license-v3-(lgpl-3))

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg?style=flat-square)](https://www.gnu.org/licenses/gpl-3.0)

