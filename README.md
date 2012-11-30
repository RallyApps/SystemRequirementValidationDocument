Rally System Requirement Validation Document
============

![Title](https://raw.github.com/RallyApps/SystemRequirementValidationDocument/master/screenshots/title-screenshot.png)

## Overview

The System Requirements Validation Document App shows how functional and nonfunctional requirements are implemented by generating a printable report.

## How to Use

### Running the App

If you want to start using the app immediately, create an Custom HTML app on your Rally dashboard. Then copy App.html from the deploy folder into the HTML text area. That's it, it should be ready to use. See [this](http://www.rallydev.com/help/use_apps#create) help link if you don't know how to create a dashboard page for Custom HTML apps.

Or you can just click [here](https://raw.github.com/RallyApps/SystemRequirementValidationDocument/master/deploy/App.html) to find the file and copy it into the custom HTML app.

### Using the App

If you work in a high-assurance environment, you may need to generate documents that prove requirements have been implemented, and print or export those documents to document repositories in order to pass audits.

This app keys off of special tags. To get started, you'll need to let Rally know which user stories represent your System Requirements by tagging them "SRS".

When it is printed, a signature line and printed date are appended to the bottom of the document. Use the Auto Height setting to automatically adjust the vertical space of the app based on the amount of visible data available.

#### Summary of Product Requirement Data

* Market Requirement: Link and name for parent of the chosen 'SRS' tagged story
* System Requirement: Chosen 'SRS' tagged story link and name
* Acceptance Date: Chosen 'SRS' tagged story acceptance date

#### Summary of System Requirement Description Data

* Specification: Chosen 'SRS' tagged story link and name
* Description: Chosen 'SRS' tagged story description
* Functional Stories: Links and names for the children stories of the chosen 'SRS' story

#### Summary of Test Case Data

This section loops through the test cases of the chosen 'SRS' story and its children stories. If no test cases exist, this section will not show.

* Test Case: Link and name of test case
* Story: Story that attaches to this test case
* Test Case Description: Description for this test case
* Last Run: Date that this test case was last ran
* Steps: Table of steps defined for this test case

## Customize this App

<b>NOTE:</b> In App-debug.html, the example image will not show up in the app when you have no SRS tags in your requirements. They will show up in Rally's Custom HTML panel.

You're free to customize this app to your liking (see the License section for details). If you need to add any new Javascript or CSS files, make sure to update config.json so it will be included the next time you build the app.

This app uses the Rally SDK 1.32. The documentation can be found [here](http://developer.rallydev.com/help/app-sdk). 

Available Rakefile tasks are:

    rake build                      # Build a deployable app which includes all JavaScript and CSS resources inline
    rake clean                      # Clean all generated output
    rake debug                      # Build a debug version of the app, useful for local development
    rake deploy                     # Deploy an app to a Rally server
    rake deploy:debug               # Deploy a debug app to a Rally server
    rake deploy:info                # Display deploy information
    rake jslint                     # Run jslint on all JavaScript files used by this app, can be enabled by setting ENABLE_JSLINT=true.

## License

SystemRequirementValidationDocument is released under the MIT license. See the file [LICENSE](https://raw.github.com/RallyApps/SystemRequirementValidationDocument/master/LICENSE) for the full text.