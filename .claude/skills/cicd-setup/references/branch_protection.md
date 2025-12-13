# Setting Up Branch Protection Rules

Branch protection rules help enforce workflows and prevent unwanted changes to your main branch.

To set up branch protection for your `main` branch:

1.  Navigate to your repository on GitHub.
2.  Go to `Settings > Branches`.
3.  Under "Branch protection rules", click `Add rule`.
4.  For "Branch name pattern", enter `main`.
5.  Enable `Require a pull request before merging`.
    -   Optionally, enable `Require approvals`.
6.  Enable `Require status checks to pass before merging`.
    -   Search for and select the status checks from your PR workflow (e.g., `build`). This will ensure that all tests must pass before a PR can be merged.
7.  Click `Create`.

With these rules, all changes to the `main` branch must come through a pull request where all status checks have passed.
