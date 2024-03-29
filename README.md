# Cover GitHub Action

This project provides a GitHub Action for running Diffblue Cover.

- [Diffblue EULA](https://docs.diffblue.com/legal/diffblue-legal/diffblue-end-user-license-agreement-eula)
- [Diffblue Privacy Notice](https://docs.diffblue.com/legal/diffblue-legal/privacy-notice)
- [Request Diffblue trial license](https://www.diffblue.com/try-cover/github)


## Usage

In it's simplest form the "batteries included" action is intended to be used in a workflow to run all things Diffblue Cover:

```yaml
name: Example Workflow

# Diffblue Cover CI responds to pull request
on:
  pull_request:

# Avoid running the same workflow on the same branch concurrently
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}

jobs:
  DiffblueCover:
    runs-on: ubuntu-latest
    steps:

      # Checkout the repository with permission to push
      - name: Checkout
        uses: actions/checkout@v4
        with:
          # The default GITHUB_TOKEN doesn't have the necessary permissions
          # so a custom token should be used here with sufficient access.
          #
          # Must have access to the project with at least Write role, and scopes
          # including code, commit-statuses, pull-requests, workflows and actions.
          #
          token: ${{ secrets.DIFFBLUE_TOKEN }}

      # Diffblue Cover requires the project to be built so that
      # the class files can be analysed and tests created.

      # This job configures Java so that the project can be built.
      - name: Setup Java
        uses: actions/setup-java@v4
        with:
          java-version: '8'
          distribution: 'zulu'

      # This job runs a Maven command to build the project.
      - name: Maven Install
        run: mvn --batch-mode install

      # # This job runs a Gradle command to build the project.
      # - name: Gradle Build
      #   run: ./gradlew --console plain build

      # Run Diffblue Cover
      - name: Diffblue Cover
        uses: diffblue/cover-github-action@main
        env:
          JVM_ARGS: -Xmx4096m
          GITHUB_PR_NUMBER: ${{ github.event.number }}
        with:
          # The access token used to push commits and call GitHub APIs.
          #
          # Must have access to the project with at least Write role, and scopes
          # including code, commit-statuses, pull-requests, workflows and actions.
          access-token: ${{ secrets.DIFFBLUE_TOKEN }}

          # The license key provided in your welcome email or provided by your organization.
          # Alternatively obtain a free trial key from https://www.diffblue.com/try-cover/github.
          license-key: ${{ secrets.DIFFBLUE_LICENSE_KEY }}

          # Working directory where the project can be found, if not at the root.
          # working-directory: path/to/project

          # The Diffblue Cover commands and options to use.
          # args: >-
          #   ci
          #   activate
          #   validate
          #   create

      # Collect Diffblue Cover log files
      - name: Diffblue Artifacts
        uses: actions/upload-artifact@v4
        with:
          name: logs
          path: |
            **/.diffblue/**
```
