# Website info

The un-compiled content for the website goes in the `content` folder. Nanoc compiles everything using either
kramdown for the markdown or pandoc (slightly customized/recompiled) for latex.

Currently in the `content` folder are the following
* `index.md` for the site homepage
* `assets` which contains css, images
* `notes`
  * An `index.md` which has some erb code to dynamically generate the list of notes
  * Subfolders for
