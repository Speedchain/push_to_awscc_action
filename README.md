# push_to_awscc_action

This Github action takes a tagged release and pushes it as a _single commit_
to an Amazon AWS CC repo. From there it can be deployed by Amplify.

# Working on this action

The code for the action is in index.js. It's plain Javascript using Github action helper APIs.

In order to run as an action, all dependencies must be bundled into a single file with `ncc`.
There is a husky pre-commit hook to do this. For this reason **DO NOT SKIP PRE-COMMIT HOOKS WHEN
YOU COMMIT CHANGES** or your changes will not run.

You can also compile changes manually with `yarn build`. The compiled output is in `dist/index.js`.

Once you have a stable set of changes, tag the last stable commit and update workflows to use the new tag.
