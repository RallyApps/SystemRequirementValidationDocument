function SystemRequirementValidationDocument() {
    var chooser, chooseButton, dataSource, stepsTables = {};
    var testCaseWorkProducts = {};

    this.display = function() {
        rally.sdk.ui.AppHeader.showPageTools(true);
        rally.sdk.ui.AppHeader.removePageTool("popOut");
        rally.sdk.ui.AppHeader.setHelpTopic("255");

        dataSource = new rally.sdk.data.RallyDataSource(
                '__WORKSPACE_OID__',
                '__PROJECT_OID__',
                '__PROJECT_SCOPING_UP__',
                '__PROJECT_SCOPING_DOWN__');

        dataSource.find({
            key:"srs",
            type:"HierarchicalRequirement",
            query: "( Tags.Name = SRS )",
            fetch:"Name"
        }, dojo.hitch(this, this._showChooserOrInstructions));
    };

    this._showChooserOrInstructions = function(results) {
        if (results.srs.length > 0) {
            dojo.byId("signAndDate").innerHTML =
                    'Signature _________________________<br/>' +
                            'Date Printed ' + dojo.date.locale.format(new Date(), 'MM/DD/yyyy');

            if (!chooseButton) {
                chooseButton = new rally.sdk.ui.basic.Button({text:'Choose a System Requirement'});
                chooseButton.display('chooseButton', function() {
                    chooser.display();
                });
            }

            var chooserConfig = {
                fetch:"FormattedID,Name,Description",
                query:'Tags.Name = SRS',
                title: 'System Requirement Chooser'
            };
            chooser = new rally.sdk.ui.Chooser(chooserConfig, dataSource);
            chooser.addEventListener('onClose', dojo.hitch(this, this._displayChosenSRS));
            chooser.display();

        } else {
            var instructionsDiv = document.createElement("div");
            dojo.addClass(instructionsDiv, "instructions");

            var instructions = document.createElement("span");
            dojo.addClass(instructions, "quote");
            instructions.innerHTML = "<p><b>No SRSs Found.</b></p><p>This app keys off of special tags.  To get started, you'll need to let Rally know which user stories represent your System Requirements by tagging them 'SRS'.</p><p >The System Requirement Validation Document App shows how functional and nonfunctional requirements are implemented by generating a printable report.</p>";
            instructionsDiv.appendChild(instructions);

            var learnMoreLinkElement = document.createElement("a");
            dojo.attr(learnMoreLinkElement, "href", "http://www.rallydev.com/help/system-requirement-validation-document-0");
            dojo.attr(learnMoreLinkElement, "target", "new");
            learnMoreLinkElement.innerHTML = "Learn more about how to use the System Requirements Validation Document";
            instructions.appendChild(learnMoreLinkElement);

            var exampleImage = document.createElement("img");
            dojo.attr(exampleImage, "src", "/apps/resources/SystemRequirementValidationDocument/example.png");
            dojo.addClass(exampleImage, "exampleImage");
            instructionsDiv.appendChild(exampleImage);

            dojo.byId("display").appendChild(instructionsDiv);
        }
    };

    this._displayChosenSRS = function(chooser, args) {
        dataSource.findAll([
            {
                key:"srs",
                type:"HierarchicalRequirement",
                query: "( ObjectID = " + rally.sdk.util.Ref.getOidFromRef(args.selectedItem._ref) + ")",
                order:"Name",
                fetch:"Children,Name,TestCases,WorkProduct,LastRun,FormattedID,Parent,Steps,TestCaseStep,Description,AcceptedDate,StepIndex,Input,ExpectedResult"
            },
            {
                key: "childTestCasesWorkProducts",
                placeholder: '${srs/Children.Children.TestCases?fetch=WorkProduct,FormattedID,Name,Description,LastRun,Steps,StepIndex,Input,ExpectedResult,TestCaseStep}'
            },
            {
                key:"testCasesWorkProducts",
                placeholder: '${srs/Children.TestCases?fetch=WorkProduct,FormattedID,Name,Description,LastRun,Steps,StepIndex,Input,ExpectedResult,TestCaseStep}'
            }
        ], dojo.hitch(this, this._showStory));
    };

    this._formatDate = function(dateString) {
        var dateObject = rally.sdk.util.DateTime.fromIsoString(dateString);
        return rally.sdk.util.DateTime.format(dateObject, "dd MMM yyyy");
    };

    this._provideTextForNoData = function(field, text, formatAsDate) {
        var content;
        if (field === null || dojo.trim(field) === "" || dojo.trim(field) === "<br />") {
            content = text;
        } else {
            if (formatAsDate) {
                content = this._formatDate(field);
            } else {
                content = field;
            }
        }
        return content;
    };

    this._buildStepsTable = function(steps, div) {
        var stepsTableDiv = document.createElement("div");
        stepsTableDiv.id = div + "Div";
        dojo.byId(div).appendChild(stepsTableDiv);

        if (steps.length > 0) {
            var tableConfig = {
                'columnKeys'   : ['StepIndex', 'Input', 'ExpectedResult'],
                'columnHeaders': ['Step', 'Input', 'Expected Result'],
                'width'        : '500px'
            };

            var table = new rally.sdk.ui.Table(tableConfig);
            table.addRows(steps);
            table.display(stepsTableDiv.id);
            stepsTables[stepsTableDiv.id] = {table: table, tableId: stepsTableDiv.id};
        } else {
            stepsTableDiv.innerHTML = "No Steps";
        }
    };

    this._buildParentSRS = function(story) {
        var parentOfSRS = "";
        if (story.Parent) {
            parentLink = new rally.sdk.ui.basic.Link({item: story.Parent}).renderToHtml();
            parentOfSRS = parentLink + ' ' + story.Parent.Name;
        }
        var storyLink = new rally.sdk.ui.basic.Link({item: story}).renderToHtml();
        dojo.byId('display').innerHTML =
                '<table class="srsTable">' +
                        '<tr><td colspan="2" class="header">Product Requirement</td></tr>' +
                        '<tr><th>Market Requirement:</th><td>' + parentOfSRS + '</td></tr>' +
                        '<tr><th>System Requirement:</th><td>' + storyLink + ' ' + story.Name + '</td></tr>' +
                        '<tr><th>Acceptance Date:</th><td>' + this._provideTextForNoData(story.AcceptedDate, "Not Accepted Yet", true) + '</td></tr>' +
                        '</table>';
    };

    this._buildSRSs = function(story) {
        var link = new rally.sdk.ui.basic.Link({item: story}).renderToHtml();
        var srsDescriptionMarkup =
                '<table class="srsTable">' +
                        '<tr><td colspan="2" class="header">System Requirement Description</td></tr>' +
                        '<tr><th>Specification:</th><td>' + link + ' ' + story.Name + '</td></tr>' +
                        '<tr><th>Description:</th><td>' + this._provideTextForNoData(story.Description, "None", false) + '</td></tr>' +
                        '<tr><th>Functional Stories:</th><td class="functionalLinks">';

        if (story.Children.length > 0) {
            dojo.forEach(story.Children, dojo.hitch(this, function(story) {
                var link2 = new rally.sdk.ui.basic.Link({item: story}).renderToHtml();
                srsDescriptionMarkup += link2 + ' ' + story.Name + ' (' + story.TestCases.length + ' Test Cases)<br/>';
            }));
        } else {
            srsDescriptionMarkup += 'No Stories';
        }
        srsDescriptionMarkup += '</td></tr></table>';
        dojo.byId('display').innerHTML = dojo.byId('display').innerHTML + srsDescriptionMarkup;
    };

    this._buildSRSTestCases = function(story, testCases) {
        if (testCases.length > 0) {
            dojo.forEach(testCases, dojo.hitch(this, function(testCase, x) {
                var div = 'stepsCell' + x;
                var testCaseDiv = document.createElement("div");
                var testCaseLink = new rally.sdk.ui.basic.Link({item: testCase}).renderToHtml();
                var workProduct = testCaseWorkProducts[testCase.FormattedID];
                var parentLink, parentName;
                if (workProduct === undefined) {
                    parentName = story.Name;
                    parentLink = new rally.sdk.ui.basic.Link({item: story}).renderToHtml();
                } else {
                    parentName = workProduct.Name;
                    parentLink = new rally.sdk.ui.basic.Link({item: workProduct}).renderToHtml();
                }
                dojo.addClass(testCaseDiv, "testCase");
                document.getElementById("display").appendChild(testCaseDiv);

                testCaseDiv.innerHTML =
                        '<table class="srsTable">' +
                                '<tr><td colspan="2" class="header">Test Case</td></tr>' +
                                '<tr><th>Test Case:</th><td>' + testCaseLink + ' ' + testCase.Name + '</td></tr>' +
                                '<tr><th>Story:</th><td>' + parentLink + ' ' + parentName + '</td></tr>' +
                                '<tr><th>Test Case Description:</th><td>' + this._provideTextForNoData(testCase.Description, "None", false) + '</td></tr>' +
                                '<tr><th>Last Run:</th><td>' + this._provideTextForNoData(testCase.LastRun, "Never", true) + '</td></tr>' +
                                '<tr><th>Steps:</th><td id="' + div + '" class="stepsCell"></td></tr></table>';

                this._buildStepsTable(testCase.Steps, div);
            }));
        }
    };

    this._showStory = function(results) {

        rally.forEach(stepsTables, function(tableObj) {
            delete tableObj.tableId;
            tableObj.table.destroy();
        });

        stepsTables = {};

        var story = results.srs[0];
        var testCases = results.srs[0].TestCases;
        testCases = testCases.concat(results.testCasesWorkProducts);
        testCases = testCases.concat(results.childTestCasesWorkProducts);

        dojo.forEach(testCases, function(testCase) {
            testCaseWorkProducts[testCase.FormattedID] = testCase.WorkProduct;
        });

        this._buildParentSRS(story);
        this._buildSRSs(story);
        if (testCases.length > 0) {
            this._buildSRSTestCases(story, testCases);
        }
    };
}