Contributing to LightViz
------------------------

# Setting up your development environment

You will need a recent version of node/npm since LightViz uses npm and webpack for its builds.

Check out the LightViz source with:
`git clone git@github.com:kitware/light-viz.git`

Change into the source directory.  First you need to tell npm to install the dependencies of LightViz.  Run `npm install` to install these locally.  This will probably take a few minutes.

Create a branch and make your changes.  When you want to test your changes, run `npm run build`. The first time you run this command, you will probably need to run `npm link` to override the npm global light-viz module with your locally built one.  Then you should be able to start LightViz locally to test your changes.

When you are satisfied with your changes, run `npm run build:release`.  This adds some minification to the LightViz.js built in the dist folder.  Add the contents of the dist folder to the git stage as well as your changes -- this project commits the built version.

We use commitizen to manage versioning in LightViz.  Rather than running `git commit`, instead run `git cz` which will prompt you to select the category of change (feature, fix, docs, etc.).  Then it will ask you for the component that this change affects, followed by a minimal summary.  These three things will become the first line of the commit message.  Next it will ask for a more detailed summary which will become the rest of the commit message and finally if you broke backwards compatibility with your change.  Please fill out all of these as accurately as possible.

Next push your changes and make a pull request to the kitware/light-viz repository.  When it is merged a new version of light-viz will be automatically published and the version number incremented according to semantic versioning rules and the information you entered into the prompts on `git cz`.
