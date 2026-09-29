//console.log("I am in .... " + color);
// Store
// Retrieve
//console.log("storage " + localStorage.getItem("lastname"));


// The popup re-injects this whole file on every single button click,
// which would normally add a brand new onMessage listener each time -
// so after a few clicks, one click ends up running optionSelected()
// several times over (once per accumulated listener). Guard against
// that by only ever registering the listener once per page.
if (!window.__attPluginListenerRegistered) {
    window.__attPluginListenerRegistered = true;
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.clickedId) {
          const btn = message.clickedId;
          console.log("Received ID in content script: " + btn);
          // Now you can use receivedId in your content script
          optionSelected(btn);
        }
        else{
            console.log("No ID received in content script");
        }
    });
}



function optionSelected (btn) {
    page = $("#pagetitle").html();

    console.log("action: " + btn);

    // the changelog isn't tied to any particular page (Attendance
    // Tracking / Final Grades / scripting), so handle it before the
    // page-specific switches below and stop there.
    if (btn == "showChangelog") {
        showChangelog();
        return;
    }

    initStatus();
    if (page == "Attendance Tracking"){
        switch (btn) {
            case "webexComments":
                webexComments();
                storeData();
                showStatus();
                break;
            case "smartFill":
                smartFillData();
                showStatus();
                break;
            case "uiEnhancement":
                enhanceUIForAttendance();
                break;
            case "autoFill":
                autoFillAttendance();
                showStatus();
                break;
            case "storeData":
                storeData();
                showStatus();
                break;
            case "fillData":
                fillData();
                showStatus();
                break;
            case "clearData":
                clearData();
                showStatus();
                break;
            case "displayData":
                showStatus();
                break;
            default:
                break;
        }
        
    } else if(page == "Final Grades"){
        switch (btn) {
            case "resulting-storeData":
                storeResults();
                break;
            case "resulting-fillData":
                fillDataResults();
                break;
            case "resulting-clearData":
                clearDataResults();
                break;
            case "resulting-displayData":
                break;
            default:
                break;
        }
        showStatusResults();
    } else {
    
        switch(btn) {
            case "scripting-createStudentFolders":
                studentFolders();
                break;
            case "scripting-csv-resulting":
                csvResulting();
                break;
            case "scripting-csv-netlab":
                csvNetlab();
                break;
            case "scripting-insert-formular":
                insertFormular();
                break;
            default:
                break;
        }
    }
    

}




function insertFormular() {
    console.log("insertFormular() called");
    const f = {
        // Buttons (will be filled by function s)
        "<<": null, "<": null, ">": null, ">>": null,
        "Backspace": null, "Clear": null,
        "7": null, "8": null, "9": null, "/": null,
        "4": null, "5": null, "6": null, "*": null,
        "1": null, "2": null, "3": null, "-": null,
        "0": null, ".": null, "+": null,
        "AND": null, "OR": null,
        "(": null, ")": null, "=": null, "<>": null,
        "<=": null, ">=": null,
        "Insert": null,
        "Start": null, "Next Term": null, "End": null,

        // Selects (will be filled by functions 2–4)
        "assessments-select": null,
        "point-select": null,
        "function-select": null
    };

    const iframe = document.querySelector('iframe[title="Formula Editor"]');
    if (!iframe) {
        console.error("Formula Editor iframe not found.");
        return;
    }
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    if (!iframeDoc) {
        console.error("Unable to access the content of the Formula Editor iframe.");
        return;
    }

    function getOptionValueByText(select, textMatch) {
        const opt = Array.from(select.options).find(opt => opt.textContent.includes(textMatch));
        return opt?.value;
    }

    function populateButtons() {
        iframeDoc.querySelectorAll('.d_fe_control td.d_fe_button a, .d_fe_control td.d_fe_button_disabled a').forEach(a => {
            const key = a.textContent.trim();
            if (f.hasOwnProperty(key)) {
            f[key] = a;
            }
        });
    }

    function populateAssessmentsSelect() {
        const select = Array.from(iframeDoc.querySelectorAll('.d_fe_control select')).find(sel =>
            Array.from(sel.options).some(opt => {
                console.log(opt.textContent);
                return opt.textContent.includes("Assessment One")})
        );
        console.log("select: " + select);

        if (select) {
            f["assessments-select"] = {
                select,
                options: {
                    at1: getOptionValueByText(select, "Assessment One"),
                    at2: getOptionValueByText(select, "Assessment Two")
                },
                selectAT1: function() {
                    this.select.value = this.options.at1;
                    this.select.dispatchEvent(new Event("change", { bubbles: true }));
                },
                selectAT2: function() {
                    this.select.value = this.options.at2;
                    this.select.dispatchEvent(new Event("change", { bubbles: true }));
                },
            };
        }
    }

    function populatePointSelect() {
        const select = Array.from(iframeDoc.querySelectorAll('.d_fe_control select')).find(sel =>
            Array.from(sel.options).some(opt =>
            ["Points Received", "Max Points", "Percent"].includes(opt.textContent.trim())
            )
        );

        if (!select) return;

        const ctrl = {
            select,
            options: {
                pointsReceived: getOptionValueByText(select, "Points Received"),
                maxPoints: getOptionValueByText(select, "Max Points"),
                percent: getOptionValueByText(select, "Percent")
            },
            pointsReceived: function() {
                this.select.value = this.options.pointsReceived;
                this.select.dispatchEvent(new Event("change", { bubbles: true }));
            },
            maxPoints: function() {
                this.select.value = this.options.maxPoints;
                this.select.dispatchEvent(new Event("change", { bubbles: true }));
            },
            percent: function() {
                this.select.value = this.options.percent;
                this.select.dispatchEvent(new Event("change", { bubbles: true }));
            }
        };
        f["point-select"] = ctrl;
    }

    function populateFunctionSelect() {
        const select = Array.from(iframeDoc.querySelectorAll('.d_fe_control select')).find(sel =>
            Array.from(sel.options).some(opt =>
                ["MAX", "MIN", "SUM", "AVG", "IF", "NOT"].includes(opt.textContent.trim())
            )
        );

        if (!select) return;

        const ctrl = {
            select,
            options: {
                max: getOptionValueByText(select, "MAX"),
                min: getOptionValueByText(select, "MIN"),
                sum: getOptionValueByText(select, "SUM"),
                avg: getOptionValueByText(select, "AVG"),
                if: getOptionValueByText(select, "IF"),
                not: getOptionValueByText(select, "NOT")
            },
            max: function(){
                this.select.value = this.options.max;
                this.select.dispatchEvent(new Event("change", { bubbles: true }));
            },
            min: function(){
                this.select.value = this.options.min;
                this.select.dispatchEvent(new Event("change", { bubbles: true }));
            },
            sum: function(){
                this.select.value = this.options.sum;
                this.select.dispatchEvent(new Event("change", { bubbles: true }));
            },
            avg: function(){
                this.select.value = this.options.avg;
                this.select.dispatchEvent(new Event("change", { bubbles: true }));
            },
            if: function(){
                this.select.value = this.options.if;
                this.select.dispatchEvent(new Event("change", { bubbles: true }));
            },
            not: function(){
                this.select.value = this.options.not;
                this.select.dispatchEvent(new Event("change", { bubbles: true }));
            }

        };

        f["function-select"] = ctrl;
    }

    function validateFormularCtrls() {
        const missingKeys = Object.entries(f)
            .filter(([key, value]) => value === null)
            .map(([key]) => key);

        if (missingKeys.length > 0) {
            console.warn("❗ Missing control(s) in f:", missingKeys);
            return false;
        }

        console.log("✅ All controls are populated in f.");
        return true;
    }

    // Populate the controls
    populateButtons();
    populateAssessmentsSelect();
    populatePointSelect();
    populateFunctionSelect();

    // Validate the controls
    if (!validateFormularCtrls()) {
        console.error("❗ Formular controls are not fully populated. Please check the implementation.");
        return;
    }

    function ifStart() {
        // Click the Start button
        f["function-select"].if(); // select IF function
        f["Start"].click(); // click Start
    }
    function ifNextTerm() {
        // Click the Next Term button
        f["function-select"].if(); // select IF function
        f["Next Term"].click(); // click Next Term
    }
    function ifEnd() {
        // Click the End button
        f["function-select"].if(); // select IF function
        f["End"].click(); // click End
    }

    function at1PointsReceived() {
        // Select Assessment One Points Received
        f["assessments-select"].selectAT1(); // select Assessment One
        f["point-select"].pointsReceived(); // select Points Received
        f["Insert"].click(); // click Insert
    }
    function at2PointsReceived() {
        // Select Assessment Two Points Received
        f["assessments-select"].selectAT2(); // select Assessment Two
        f["point-select"].pointsReceived(); // select Points Received
        f["Insert"].click(); // click Insert
    }

    function at1PercentageReceived() {
        // Select Assessment One Percentage Received
        f["assessments-select"].selectAT1(); // select Assessment One
        f["point-select"].percent(); // select Percent
        f["Insert"].click(); // click Insert
    }   
    function at2PercentageReceived() {
        // Select Assessment Two Percentage Received
        f["assessments-select"].selectAT2(); // select Assessment Two
        f["point-select"].percent(); // select Percent
        f["Insert"].click(); // click Insert
    }


    // at1 or at2 is pending if points received = 0
    function at1Pending() {
        // Select Assessment One Points Received
        f["("].click(); // click (
        // at1PointsReceived(); // click Insert
        at1PercentageReceived(); // click Insert
        f["="].click(); // click =
        f["0"].click(); // click 0
        f[")"].click(); // click )
    }
    function at2Pending() {
        // Select Assessment Two Points Received
        f["("].click(); // click (
        at2PercentageReceived(); // click Insert
        f["="].click(); // click =
        f["0"].click(); // click 0
        f[")"].click(); // click )
    }

    // at 1 or 2 is n if 0 < points received < 2
    function at1N() {
        // Select Assessment Two Points Received
        f["("].click(); // click (
        // at1PointsReceived(); // click Insert
        at1PercentageReceived(); // click Insert
        f[">"].click(); // click <
        f["0"].click(); // click 2
        f["AND"].click(); // click AND
        //at1PointsReceived(); // click Insert
        at1PercentageReceived()
        f["<"].click(); // click <
        f["1"].click(); // click 1
        f["0"].click(); // click 0
        f["0"].click(); // click 0
        f[")"].click(); // click )
    }
    function at2N() {
        // Select Assessment Two Points Received
        f["("].click(); // click (
        at2PercentageReceived(); // click Insert
        f[">"].click(); // click <
        f["0"].click(); // click 2
        f["AND"].click(); // click AND
        at2PercentageReceived(); // click Insert
        f["<"].click(); // click <
        f["1"].click(); // click 1
        f["0"].click(); // click 0
        f["0"].click(); // click 0
        f[")"].click(); // click )
    }

    function at1NOrPx() {
        // Select Assessment Two Points Received
        f["("].click(); // click (
        at1PercentageReceived(); // click Insert
        f[">"].click(); // click <
        f["0"].click(); // click 2
        f["AND"].click(); // click AND
        at1PercentageReceived(); // click Insert
        f["<="].click(); // click <
        f["1"].click(); // click 1
        f["0"].click(); // click 0
        f["0"].click(); // click 0
        f[")"].click(); // click )
    }
    function at2NOrPx() {
        // Select Assessment Two Points Received
        f["("].click(); // click (
        at2PercentageReceived(); // click Insert
        f[">"].click(); // click <
        f["0"].click(); // click 2
        f["AND"].click(); // click AND
        at2PercentageReceived(); // click Insert
        f["<="].click(); // click <
        f["1"].click(); // click 1
        f["0"].click(); // click 0
        f["0"].click(); // click 0
        f[")"].click(); // click )
    }

    // at1 or at2 is px if points received = 2

    function at1Px() {
        // Select Assessment One Points Received
        f["("].click(); // click (
        at1PercentageReceived(); // click Insert
        f["="].click(); // click =
        f["1"].click(); // click 1
        f["0"].click(); // click 0
        f["0"].click(); // click 0
        f[")"].click(); // click )
    }
    function at2Px() {
        // Select Assessment Two Points Received
        f["("].click(); // click (
        at2PercentageReceived(); // click Insert
        f["="].click(); // click =
        f["1"].click(); // click 1
        f["0"].click(); // click 0
        f["0"].click(); // click 0
        f[")"].click(); // click )
    }

    // let's create a formular

    ifStart(); // click Start
        at1Pending(); f["AND"].click(); at2Pending(); // click Insert
    ifNextTerm(); // click Next Term
        f["1"].click(); // click 1
    ifNextTerm(); // click Next Term
        ifStart(); // click Start
            f["("].click(); // click (
                at1Pending(); f["AND"].click(); at2NOrPx(); // click Insert
            f[")"].click(); // click )
            f["OR"].click(); // click OR
            f["("].click(); // click (
                at1NOrPx(); f["AND"].click(); at2Pending(); // click Insert
            f[")"].click(); // click )
        ifNextTerm(); // click Next Term
            f["2"].click(); // click 2
        ifNextTerm(); // click Next Term
            ifStart(); // click Start
                f["("].click(); // click (
                    at1N(); f["AND"].click(); at2NOrPx(); // click Insert
                f[")"].click(); // click )
                f["OR"].click(); // click OR
                f["("].click(); // click (
                    at1NOrPx(); f["AND"].click(); at2N(); // click Insert
                f[")"].click(); // click )
            ifNextTerm(); // click Next Term
                f["4"].click(); // click 4
            ifNextTerm(); // click Next Term
                ifStart(); // click Start
                    at1Px(); f["AND"].click(); at2Px(); // click Insert
                ifNextTerm(); // click Next Term
                    f["5"].click(); // click 5
                ifNextTerm(); // click Next Term
                    f["0"].click(); // click 0
                ifEnd(); // click End
            ifEnd(); // click End
        ifEnd(); // click End
    ifEnd(); // click End

}   



function getFormattedTimestamp() {
    const now = new Date();
    
    // Get date components
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    
    // Get time components
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    // Get milliseconds (truncate to 5 digits)
    const milliseconds = String(now.getMilliseconds()).padStart(3, '0').slice(0, 5);
    
    // Combine in desired format
    return `${year}-${month}-${day}T${hours}-${minutes}-${seconds}_${milliseconds}`;
}

function csvNetlab() {
    // timestamp format: 2023-10-12T14-30-00_12344
    const timeStamp = getFormattedTimestamp();
    console.log(timeStamp);
    let table = $(".d2l-table");
    if (table[0]) {
        console.log(table[0]);
        let rowList = $(table[0]).find("tr").not(".d2l-table-row-first");
        console.log(rowList);
        let cvs = "Username,Full Name,Display Name,Sorted Name,Email\n";
        rowList.each(function(i, e){
            let name = $(e).find("th").eq(0).find("a.d2l-link.d2l-link-inline").html();
            let [lname, fname] = name.split(", ")
            console.log(lname + ", " + fname);

            let id = $(e).find("td").eq(3).find("label").html();
            console.log(id);

            let username = $(e).find("td").eq(2).find("label").html();
            console.log(username);

            let email = username + "@student.holmesglen.edu.au";
            console.log(email);

            let fullname = fname + " " + lname;
            let sortedname = "\"" + lname + ", " + fname + "\"";
            cvs += id+","+fullname+","+fullname+","+sortedname+","+email+"\n";
        });
        download(`netlab-class-list-${timeStamp}.csv`, cvs);
    }
}

// function getStoredAttendanceEntry: looks up a previously stored
// attendance record - typically saved via "Store Data" from a
// *different* course covering the same class session - for the given
// student id/date/startTime key. Returns the stored {ac_hour, ab_hour,
// auth_ab, comment} entry, or null if nothing matches.
function getStoredAttendanceEntry(id, date, startTime) {
    let attendanceDataLoaded = JSON.parse(localStorage.getItem("attendance_data"));
    if (attendanceDataLoaded &&
        attendanceDataLoaded[id] &&
        attendanceDataLoaded[id][date] &&
        attendanceDataLoaded[id][date][startTime]) {
        return attendanceDataLoaded[id][date][startTime];
    }
    return null;
}

// function detectAttendanceStatus: from raw ac_hour/ab_hour/comment
// values (however they got there - typed on the page, or restored
// from memory), works out which of oncampus/online/absence they
// represent. Mirrors the values oncampusClick() writes out.
function detectAttendanceStatus(acHour, abHour, comment) {
    if (parseFloat(abHour) > 0) {
        return "absence";
    } else if (parseFloat(acHour) > 0) {
        return (comment === "R") ? "online" : "oncampus";
    }
    return null;
}

// function autoFillAttendance: for every student row on the current
// page that doesn't already have attendance entered, checks whether
// attendance for that same student/date/class-time was already stored
// (e.g. entered and saved from a different course covering the same
// session) and, if so, fills it in - and, if the UI Enhancement
// columns are showing, selects the matching radio button too. Rows
// that already have data on the page are left untouched. Returns the
// number of rows that were filled in.
function autoFillAttendance() {
    let attendanceTable = $(".fieldlabeltext").parents("table");
    if (attendanceTable.length == 0) {
        console.log("Error: Table not found");
        return 0;
    }

    let filledCount = 0;
    $(attendanceTable).find("tr").each(function(index, element){
        let cellList = $(element).find("td.dbdefault").not(".att-enhance-col");
        if (cellList.length != 10) return;

        let id = cellList[1].innerText;
        let date = cellList[3].innerText;
        let startTime = cellList[4].innerText;

        let acHour = $(cellList[6]).find("input").val() ? $(cellList[6]).find("input").val() : 0;
        let abHour = $(cellList[7]).find("input").val() ? $(cellList[7]).find("input").val() : 0;
        let comment = $(cellList[9]).find("input").val();

        // already has attendance entered on this page - don't clobber it
        if (detectAttendanceStatus(acHour, abHour, comment)) return;

        let stored = getStoredAttendanceEntry(id, date, startTime);
        if (!stored) return;

        $(cellList[6]).find("input").val(stored.ac_hour);
        $(cellList[7]).find("input").val(stored.ab_hour);
        $(cellList[8]).find("select").val(stored.auth_ab);
        $(cellList[9]).find("input").val(stored.comment);

        let status = detectAttendanceStatus(stored.ac_hour, stored.ab_hour, stored.comment);
        if (status) {
            // the "attendance" attribute alone drives the row's
            // colour (via the stylesheet the enhancement injects) -
            // no separate inline style, so hiding the enhancement can
            // cleanly undo it later just by removing this attribute.
            $(element).attr("attendance", status);
            $(element).find(`input[type="radio"][value="${status}"]`).prop("checked", true);
            filledCount++;
        }
    });

    console.log(`Auto-Fill: filled ${filledCount} row(s) from stored attendance.`);
    return filledCount;
}

function enhanceUIForAttendance(){
    // find the main attendance tracking table
    let attendanceTable = $(".fieldlabeltext").parents("table");
    if (attendanceTable.length == 0) {
        console.log("Error: Table not found");
        return;
    }

    // if the enhancement columns already exist, this call is just a
    // toggle: show them if hidden, hide them if shown.
    let existingCols = $(attendanceTable).find("td.att-enhance-col");
    if (existingCols.length > 0) {
        if (existingCols.is(":visible")) {
            // hiding: undo the row colouring the enhancement applied
            // (the "attendance" attribute is what the injected
            // stylesheet keys off), so the page looks exactly like it
            // did before the enhancement was turned on.
            existingCols.hide();
            $(attendanceTable).find("tr").removeAttr("attendance");
        } else {
            // showing again: nothing in the underlying fields changed
            // while hidden, so just re-derive each row's colour from
            // whatever is currently in them.
            existingCols.show();
            $(attendanceTable).find("tr").each(function(index, element){
                let cellList = $(element).find("td.dbdefault").not(".att-enhance-col");
                if (cellList.length < 10) return;
                let acHour = $(cellList[6]).find("input").val() ? $(cellList[6]).find("input").val() : 0;
                let abHour = $(cellList[7]).find("input").val() ? $(cellList[7]).find("input").val() : 0;
                let comment = $(cellList[9]).find("input").val();
                let status = detectAttendanceStatus(acHour, abHour, comment);
                if (status) {
                    $(element).attr("attendance", status);
                }
            });
        }
        return;
    }

    if ($("#attPluginEnhanceStyle").length == 0) {
        $('<style>').attr("id", "attPluginEnhanceStyle").text(`
    table.bordertable tr:hover {
        background:#ddd!important;
    }

    table.bordertable tr[attendance="oncampus"] {
        background:#a2f2ad;
    }
    table.bordertable tr[attendance="oncampus"]:hover {
        background:#679c6e!important;
    }
    table.bordertable tr[attendance="oncampus"]:hover td:nth-of-type(2),
    table.bordertable tr[attendance="oncampus"]:hover td:nth-of-type(3) {
        background:#234728!important;
        color: white!important;
    }
    table.bordertable tr[attendance="oncampus"]:hover td:nth-of-type(3) a {
        color: white!important;
    }

    table.bordertable tr[attendance="online"] {
        background:#759cf0;
    }
    table.bordertable tr[attendance="online"]:hover {
        background:#6485cc!important;
    }
    table.bordertable tr[attendance="online"]:hover td:nth-of-type(2),
    table.bordertable tr[attendance="online"]:hover td:nth-of-type(3) {
        background:#364973!important;
        color: white!important;
    }
    table.bordertable tr[attendance="online"]:hover td:nth-of-type(3) a {
        color: white!important;
    }

    table.bordertable tr[attendance="absence"] {
        background:#f59d9a;
    }
    table.bordertable tr[attendance="absence"]:hover {
        background:#d98b89!important;
    }
    table.bordertable tr[attendance="absence"]:hover td:nth-of-type(2),
    table.bordertable tr[attendance="absence"]:hover td:nth-of-type(3) {
        background:#783d3c!important;
        color: white!important;
    }
    table.bordertable tr[attendance="absence"]:hover td:nth-of-type(3) a {
        color: white!important;
    }

    `).appendTo(document.head);
    }

    // function selectColumn: sets every radio button of the given value
    // (oncampus/online/absence) in the attendance table, firing each
    // one's own click event so the row-level handler (oncampusClick)
    // runs for every row, same as if the user had clicked them by hand.
    function selectColumn(value) {
        $(attendanceTable).find(`input[type="radio"][value="${value}"]`).each(function(){
            this.click();
        });
    }

    // function makeColumnHeaderButton: styles a header cell to look like a
    // clickable button in the column's own colour (so it's obvious it's
    // clickable while still matching the colour code of that column), and
    // wires it to select every radio in that column when clicked.
    function makeColumnHeaderButton(td, label, bgColor, hoverColor, tooltip, radioValue) {
        td.innerHTML = `<button type="button">${label}</button>`;
        $(td).css({
            "text-align": "center"
        });
        let btn = $(td).find("button");
        btn.css({
            "cursor": "pointer",
            "display": "inline-block",
            "width": "100%",
            "font-weight": "bold",
            "text-transform": "capitalize",
            "color": "#1a1a1a",
            "background-color": bgColor,
            "border": "1px solid " + hoverColor,
            "border-radius": "4px",
            "padding": "4px 10px",
            "box-shadow": "0 1px 2px rgba(0,0,0,.25)"
        });
        btn.attr("title", tooltip);
        btn.on("mouseenter", function(){
            $(this).css("background-color", hoverColor);
        });
        btn.on("mouseleave", function(){
            $(this).css("background-color", bgColor);
        });
        btn.on("mousedown", function(){
            $(this).css("box-shadow", "inset 0 1px 2px rgba(0,0,0,.35)");
        });
        btn.on("mouseup", function(){
            $(this).css("box-shadow", "0 1px 2px rgba(0,0,0,.25)");
        });
        btn.on("click", function(){
            selectColumn(radioValue);
        });
    }

    if(attendanceTable.length > 0) {
        // main attendance tracking table found

        // before building the columns, auto-detect any student whose
        // attendance was already stored from another course covering
        // this same class session, and fill it straight in - so the
        // radio buttons below come up already selected instead of
        // requiring a separate manual "Fill Data" pass.
        autoFillAttendance();

        $(attendanceTable).find("tr").each(function(index, element){
            //console.log(index);
            //console.log(element);


            let cellList = $(element).find("td.dbdefault").not(".att-enhance-col");

                if(cellList.length == 0) {
                    if (index == 0) {
                        console.log("this row must be table header");
                        var td1 = document.createElement('td');
                        td1.classList.add("dbdefault", "att-enhance-col");
                        makeColumnHeaderButton(td1, "campus", "#a2f2ad", "#679c6e", "Click to mark everyone as On Campus", "oncampus");
                        element.appendChild(td1);

                        var td2 = document.createElement('td');
                        td2.classList.add("dbdefault", "att-enhance-col");
                        makeColumnHeaderButton(td2, "online", "#759cf0", "#6485cc", "Click to mark everyone as Online", "online");
                        element.appendChild(td2);

                        var td3 = document.createElement('td');
                        td3.classList.add("dbdefault", "att-enhance-col");
                        makeColumnHeaderButton(td3, "absent", "#f59d9a", "#d98b89", "Click to mark everyone as Absent", "absence");
                        element.appendChild(td3);
                    } else {
                        console.log("Error: this is interesting");
                    }
                } else if(cellList.length == 10) {
                    

                    

                    function oncampusClick(evt){
                        
                        let id = cellList[1].innerText;
                        let date = cellList[3].innerText
                        let startTime = cellList[4].innerText

                        let name = $(cellList[2]).find("a")[0].innerHTML.trim().split("<br>");
                        let expHour = $(cellList[5])[0].innerText;
                        let acHour = $(cellList[6]).find("input").val() ? $(cellList[6]).find("input").val() : 0;
                        let abHour = $(cellList[7]).find("input").val() ? $(cellList[7]).find("input").val() : 0;
                        let authAb = $(cellList[8]).find("select").val();
                        let comment = $(cellList[9]).find("input").val();
                        console.log(name + "/" + expHour + "/" + acHour + "/" + abHour + "/" + authAb);


                        console.log(evt);
                        console.log(evt.target.value);
                        let value = evt.target.value;
                        switch(value){
                            case "oncampus":
                                $(cellList[6]).find("input").val(expHour);
                                $(cellList[7]).find("input").val("0");
                                $(cellList[8]).find("select").val("Y");
                                $(cellList[9]).find("input").val("");
                                $(element).attr("attendance", "oncampus");
                                break;
                            case "online":
                                $(cellList[6]).find("input").val(expHour);
                                $(cellList[7]).find("input").val("0");
                                $(cellList[8]).find("select").val("Y");
                                $(cellList[9]).find("input").val("R");
                                $(element).attr("attendance", "online");
                                break;
                            case "absence":
                                $(cellList[6]).find("input").val("0");
                                $(cellList[7]).find("input").val(expHour);
                                $(cellList[8]).find("select").val("N");
                                $(cellList[9]).find("input").val("");
                                $(element).attr("attendance", "absence");
                                break;
                            default:
                                console.log("this is interesting");
                                break;
                        }
                    }
                    // detect the student's already-entered attendance
                    // (matches the logic oncampusClick writes out, in
                    // reverse) so the right radio can be preselected.
                    let curAcHour = $(cellList[6]).find("input").val() ? $(cellList[6]).find("input").val() : 0;
                    let curAbHour = $(cellList[7]).find("input").val() ? $(cellList[7]).find("input").val() : 0;
                    let curComment = $(cellList[9]).find("input").val();
                    let currentStatus = null;
                    if (parseFloat(curAbHour) > 0) {
                        currentStatus = "absence";
                    } else if (parseFloat(curAcHour) > 0) {
                        currentStatus = (curComment === "R") ? "online" : "oncampus";
                    }
                    if (currentStatus) {
                        $(element).attr("attendance", currentStatus);
                    }

                    var td1 = document.createElement('td');
                    td1.classList.add("dbdefault", "att-enhance-col");
                    td1.innerHTML = `
                    <input type='radio' value='oncampus' name='group-${index}' ${currentStatus === "oncampus" ? "checked" : ""}>
                    `;
                    td1.addEventListener("input", oncampusClick);
                    element.appendChild(td1);

                    var td2 = document.createElement('td');
                    td2.classList.add("dbdefault", "att-enhance-col");
                    td2.innerHTML = `
                    <input type='radio' value='online' name='group-${index}' ${currentStatus === "online" ? "checked" : ""}>
                    `;
                    td2.addEventListener("input", oncampusClick);
                    element.appendChild(td2);

                    var td3 = document.createElement('td');
                    td3.classList.add("dbdefault", "att-enhance-col");
                    td3.innerHTML = `
                    <input type='radio' value='absence' name='group-${index}' ${currentStatus === "absence" ? "checked" : ""}>
                    `;
                    td3.addEventListener("input", oncampusClick);
                    element.appendChild(td3);

                } else {
                    console.log("Error: this is interesting");
                }

        });
    } else {
        console.log("Error: Table not found");
    }
    
    return;
}


function csvResulting() {
    let table = $(".d2l-table");
    if (table[0]) {
        console.log(table[0]);
        let rowList = $(table[0]).find("tr").not(".d2l-table-row-first");
        console.log(rowList);
        let cvs = "ID,User Name,HEmail,Last Name,First Name,Full Name,Sorted Name\n";
        rowList.each(function(i, e){
            let name = $(e).find("th").eq(0).find("a.d2l-link.d2l-link-inline").html();
            let [lname, fname] = name.split(", ")
            console.log(lname + ", " + fname);

            let id = $(e).find("td").eq(3).find("label").html();
            console.log(id);

            let username = $(e).find("td").eq(2).find("label").html();
            console.log(username);

            let fullname1 = fname + " " + lname;
            let fullname2 = "\"" + lname + ", " + fname + "\"";
            cvs += id+","+username+","+username+"@student.holmesglen.edu.au"+","+lname+","+fname+","+fullname1+","+fullname2+"\n";
        });
        download("resulting.csv", cvs);
    }
}
function studentFolders() {
    table = $(".d2l-table");
    if (table[0]) {
        console.log(table[0]);
        nameList = $(table[0]).find("th a.d2l-link.d2l-link-inline");
    
        //download("gen_folder.py_", py);
        var zip = new JSZip();
        if ($(nameList).length > 0) {
            nameList.each(function(i, e) {
                console.log($(e).html());
                zip.folder($(e).html());
                /*
                zip.folder($(e).html()+"/at1");
                zip.folder($(e).html()+"/at2");
                */
            })
        }
        
        zip.generateAsync({type:"blob"}).then(function(content) {
            // see FileSaver.js
            saveAs(content, "students.zip");
        });

    }
}

function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
  
    element.style.display = 'none';
    document.body.appendChild(element);
  
    element.click();
  
    document.body.removeChild(element);
  }

// function showChangelog: shows the release changelog as a modal
// injected into the actual page (the main browser window), the same
// way the status panel is - not inside the small extension popup
// menu, which closes as soon as focus leaves it. Clicking the version
// number toggles it: a second click closes it again.
function showChangelog() {
    if ($("#attPluginChangelogOverlay").length > 0) {
        $("#attPluginChangelogOverlay").remove();
        return;
    }

    let overlay = document.createElement("div");
    $(overlay).attr("id", "attPluginChangelogOverlay");
    $(overlay).css({
        "position": "fixed",
        "top": "0",
        "left": "0",
        "right": "0",
        "bottom": "0",
        "background": "rgba(0,0,0,.45)",
        "z-index": "10000",
        "display": "flex",
        "align-items": "center",
        "justify-content": "center"
    });

    let box = document.createElement("div");
    $(box).css({
        "background": "#fff",
        "color": "#222",
        "width": "320px",
        "max-width": "90%",
        "border-radius": "6px",
        "box-shadow": "0 4px 16px rgba(0,0,0,.35)",
        "padding": "16px 18px",
        "font-size": "14px"
    });
    $(box).html(`
        <div style="margin-bottom:10px;">
            <strong>Attendance updates in this release</strong>
        </div>
        <ul style="margin:0 0 14px 0;padding-left:18px;">
            <li style="margin-bottom:6px;">Ability to select all students as online, campus or absent</li>
            <li style="margin-bottom:6px;">Ability to hide the popups</li>
            <li style="margin-bottom:6px;">Turning on enhancement auto fills rows where possible</li>
            <li style="margin-bottom:6px;">Toggle enhancement visibility</li>
            <li style="margin-bottom:6px;">Fixed bug where store data failed until after "Submit" pressed</li>
            <li style="margin-bottom:6px;">Fixed bug that required two clicks to perform an action</li>
        </ul>
    `);

    // reuse the same blue "Close" button style used on the status panel
    let closeWrap = document.createElement("div");
    $(closeWrap).html("<button type='button'>Close</button>");
    $(closeWrap).css({ "text-align": "right" });
    let closeBtn = $(closeWrap).find("button");
    closeBtn.css({
        "cursor": "pointer",
        "font-weight": "400",
        "font-size": "14px",
        "line-height": "1.5",
        "color": "#fff",
        "background-color": "#0d6efd",
        "border": "1px solid #0d6efd",
        "border-radius": "4px",
        "padding": "6px 12px",
        "box-shadow": "none",
        "transition": "background-color .15s ease-in-out, border-color .15s ease-in-out"
    });
    closeBtn.on("mouseenter", function () {
        $(this).css({ "background-color": "#0b5ed7", "border-color": "#0a58ca" });
    });
    closeBtn.on("mouseleave", function () {
        $(this).css({ "background-color": "#0d6efd", "border-color": "#0d6efd" });
    });
    closeBtn.on("click", function () {
        $(overlay).remove();
    });
    $(box).append(closeWrap);

    $(overlay).append(box);
    $("body").append(overlay);

    // clicking the dimmed backdrop (not the box itself) also closes it
    $(overlay).on("click", function (evt) {
        if (evt.target === overlay) {
            $(overlay).remove();
        }
    });
}

function initStatus() {
    // if the status div have not been created, created it.
    if($("#attPluginStatus").length == 0) {
        let divStatus = document.createElement("div");
        $(divStatus).attr("id", "attPluginStatus")
        $(divStatus).css({
            "position": "fixed",
            "right": "0",
            "top": "105px",
            "bottom": "0",
            "width": "auto",
            "max-width": "1200px",
            "background-color": "rgba(204, 238, 255, .8)",
            "z-index": "1000",
            "padding": "20px 10px 20px 30px"
        });
        $("body").append(divStatus);
    }
    $("#attPluginStatus").hide();
}

// function addCloseButton: appends a [close] button to the status panel
// that hides the panel when clicked. Call this after emptying/populating
// the panel's content so the button is always present.
function addCloseButton(statusDiv) {
    let closeBtn = document.createElement("div");
    $(closeBtn).html("<button type='button'>Close</button>");
    $(closeBtn).css({
        "text-align": "right",
        "margin-bottom": "10px"
    });
    $(closeBtn).find("button").css({
        "cursor": "pointer",
        "display": "inline-block",
        "font-weight": "400",
        "font-size": "14px",
        "line-height": "1.5",
        "color": "#fff",
        "background-color": "#0d6efd",
        "border": "1px solid #0d6efd",
        "border-radius": "4px",
        "padding": "6px 12px",
        "box-shadow": "none",
        "transition": "background-color .15s ease-in-out, border-color .15s ease-in-out"
    });
    $(closeBtn).find("button").on("mouseenter", function () {
        $(this).css({ "background-color": "#0b5ed7", "border-color": "#0a58ca" });
    });
    $(closeBtn).find("button").on("mouseleave", function () {
        $(this).css({ "background-color": "#0d6efd", "border-color": "#0d6efd" });
    });
    $(closeBtn).find("button").on("click", function () {
        $(statusDiv).slideUp(300);
    });
    $(statusDiv).append(closeBtn);
}

function showStatusResults() {
    let statusDiv = $("#attPluginStatus");
    $(statusDiv).empty();
    addCloseButton(statusDiv);
    let attendanceDataLoaded = JSON.parse(localStorage.getItem("results_data"));

    // data in storage
    let divStored = document.createElement("div");
    $(divStored).attr("class", "m-stored");
    if (attendanceDataLoaded != null) {
        dataArray2 = [];
        
        for (let key in attendanceDataLoaded) {
            if (attendanceDataLoaded.hasOwnProperty(key)) {
                let obj = [
                    attendanceDataLoaded[key].name,
                    "<li>" + 
                    key + " " + 
                    attendanceDataLoaded[key].name + " " +
                    "(" + (attendanceDataLoaded[key].grade ? attendanceDataLoaded[key].grade : "NONE") + " | " + attendanceDataLoaded[key].date + ")" +
                    "</li>"
                ];                    
                dataArray2.push(obj);
            }
        }
        // sort data Array by element[0] which is the full name "Last Name,First Name"
        dataArray2.sort(function(a, b){
            let aKey = a[0];
            let bKey = b[0];
            return aKey.toLowerCase().localeCompare(bKey.toLowerCase());
        })
        console.log(dataArray2);

        let htmlLi = "";
        dataArray2.forEach(function (item) {
            htmlLi += item[1];
        });
        console.log(htmlLi);
        
        $(divStored).html("<h4><strong>Data in storage</strong></h4><ol>"+htmlLi+"</ol>");

    } else {
        $(divStored).html("<h4><strong>Data in storage</strong></h4><div>No data stored!</div>");
    }
    $(statusDiv).append(divStored);


    // data missing

    $(statusDiv).slideDown(600);
}

function showStatus() {
    let statusDiv = $("#attPluginStatus");
    $(statusDiv).empty();
    addCloseButton(statusDiv);
    let attendanceDataLoaded = JSON.parse(localStorage.getItem("attendance_data"));

    // data in storage
    let divStored = document.createElement("div");
    $(divStored).attr("class", "m-stored");
    if (attendanceDataLoaded != null) {
        dataArray2 = [];
        
        for (let key_id in attendanceDataLoaded) {
            if (attendanceDataLoaded.hasOwnProperty(key_id)) {
                for(let key_date in attendanceDataLoaded[key_id]) {
                    for (let key_start_time in attendanceDataLoaded[key_id][key_date]){
                        let item = attendanceDataLoaded[key_id][key_date][key_start_time];
                        let obj = [
                            item.name[0] + "," + item.name[1],
                            key_date,
                            key_start_time,
                            "<li>" + 
                            key_id + " " + 
                            key_date + " " +
                            key_start_time + " " +
                            item.name.join(", ") + " " +
                            "(" + item.ac_hour + "/" + item.ab_hour + ")" +
                            "</li>"
                        ];                    
                        dataArray2.push(obj);
                    }
                }
                
            }
        }
        // sort data Array by element[0] which is the full name "Last Name,First Name"
        dataArray2.sort(function(a, b){
            let aKey = a[0];
            let bKey = b[0];
            let r = aKey.toLowerCase().localeCompare(bKey.toLowerCase());
            return r;
        })
        console.log(dataArray2);

        let htmlLi = "";
        dataArray2.forEach(function (item) {
            htmlLi += item[3];
        });
        console.log(htmlLi);
        
        $(divStored).html("<h4><strong>Data in storage</strong></h4><ol>"+htmlLi+"</ol>");

    } else {
        $(divStored).html("<h4><strong>Data in storage</strong></h4><div>No data stored!</div>");
    }
    $(statusDiv).append(divStored);


    // data missing

    $(statusDiv).slideDown(600);
}

function clearDataResults() {
    localStorage.removeItem("results_data")
}
// function clearData: clar all attendance in local storage
function clearData() {
    localStorage.removeItem("attendance_data")
}

function fillDataResults() {
    let resultsDataLoaded = JSON.parse(localStorage.getItem("results_data"));
    if (resultsDataLoaded != null) {
        console.log(resultsDataLoaded);
        let resultsTable = $("table.dataentrytable");
        if(resultsTable.length > 0) {
            // main attendance tracking table found
            $(resultsTable).find("tr").each(function(index, element){
                let cellList = $(element).find("td.dedefault");
                
                if(cellList.length == 0) {
                    if (index == 0) {
                        console.log("this row must be table header");
                    } else {
                        console.log("Error: this is interesting");
                    }
                } else if(cellList.length == 10) {
                    let id = cellList[2].innerText;
                    if (id in resultsDataLoaded) {
                        $(cellList[5]).find("select").val(resultsDataLoaded[id].grade);
                        $(cellList[7]).find("input").val(resultsDataLoaded[id].date);
                        $(element).css({
                            "background-color": "#e6ffee"
                        });
                    } else {
                        console.log("Error: student " + id + " not found!");
                        $(element).css({
                            "background-color": "#ffcccc"
                        });
                    }
                } else {
                    console.log("Error: this is interesting");
                }
            });
        }
    } else {
        console.log("No data loaded from local storage");
    }
}
// function fillData: get all attendance from local storage and set the form
function fillData() {
    let attendanceDataLoaded = JSON.parse(localStorage.getItem("attendance_data"));
    if (attendanceDataLoaded != null) {
        console.log(attendanceDataLoaded);
        attendanceTable = $(".fieldlabeltext").parents("table");
        if(attendanceTable.length > 0) {
            // main attendance tracking table found
            $(attendanceTable).find("tr").each(function(index, element){
                let cellList = $(element).find("td.dbdefault").not(".att-enhance-col");
                
                if(cellList.length == 0) {
                    if (index == 0) {
                        console.log("this row must be table header");
                    } else {
                        console.log("Error: this is interesting");
                    }
                } else if(cellList.length == 10) {
                    let id = cellList[1].innerText;
                    let date = cellList[3].innerText
                    let startTime = cellList[4].innerText
                    if (id in attendanceDataLoaded && 
                        date in attendanceDataLoaded[id] && 
                        startTime in attendanceDataLoaded[id][date]) {
                        
                            let item = attendanceDataLoaded[id][date][startTime];
                            $(cellList[6]).find("input").val(item.ac_hour);
                            $(cellList[7]).find("input").val(item.ab_hour);
                            $(cellList[8]).find("select").val(item.auth_ab);
                            $(cellList[9]).find("input").val(item.comment);
                            $(element).css({
                                "background-color": "#e6ffee"
                            });
                    } else {

                        console.log("Error: student " + id + " not found!");
                        $(element).css({
                            "background-color": "#ffcccc"
                        });
                    }
                } else {
                    console.log("Error: this is interesting");
                }
            });
        }
    } else {
        console.log("No data loaded from local storage");
    }
}

function storeResults() {
    let resultsDataCurr = {}; 
    // find the main attendance tracking table
    let resultsTable = $("table.dataentrytable");
    if(resultsTable.length > 0) {
        // main attendance tracking table found
        $(resultsTable).find("tr").each(function(index, element){
            //console.log(index);
            //console.log(element);
            let cellList = $(element).find("td.dedefault");
            if(cellList.length == 0) {
                if (index == 0) {
                    console.log("this row must be table header");
                } else {
                    console.log("Error: this is interesting");
                }
            } else if(cellList.length == 10) {
                
                let id = cellList[2].innerText;
                let name = $(cellList[1]).find("a")[0].innerHTML.trim();
                let grade = $(cellList[5]).find("input").length == 0 ? $(cellList[5]).find("select").val() : $(cellList[5]).find("input").val();
                let date = $(cellList[7]).find("input").val() ? $(cellList[7]).find("input").val() : "";
 
                //console.log(id);
                //console.log(name);
                //console.log(grade);
                //console.log(date);
                resultsDataCurr[id] = {
                    name: name,
                    grade: grade,
                    date: date,
                };
    
            } else {
                console.log("Error: this is interesting");
            }
        });
    } else {
        console.log("Error: Table not found");
    }
    console.log(resultsDataCurr);
    localStorage.setItem("results_data", JSON.stringify(resultsDataCurr));
}
// function storeData: get all attendance form data and store in local storage
function storeData() {
    let attendanceDataCurr = {}; 
    // find the main attendance tracking table
    let attendanceTable = $(".fieldlabeltext").parents("table");
    if(attendanceTable.length > 0) {
        // main attendance tracking table found
        $(attendanceTable).find("tr").each(function(index, element){
            //console.log(index);
            //console.log(element);
            let cellList = $(element).find("td.dbdefault").not(".att-enhance-col");
            if(cellList.length == 0) {
                if (index == 0) {
                    console.log("this row must be table header");
                } else {
                    console.log("Error: this is interesting");
                }
            } else if(cellList.length == 10) {
                
                // use id, date, startTime as key
                let id = cellList[1].innerText;
                let date = cellList[3].innerText
                let startTime = cellList[4].innerText

                let name = $(cellList[2]).find("a")[0].innerHTML.trim().split("<br>");
                let acHour = $(cellList[6]).find("input").val() ? $(cellList[6]).find("input").val() : 0;
                let abHour = $(cellList[7]).find("input").val() ? $(cellList[7]).find("input").val() : 0;
                let authAb = $(cellList[8]).find("select").val();
                let comment = $(cellList[9]).find("input").val();
                console.log(id);
                console.log(date);
                console.log(startTime);
                console.log(name);
                console.log(acHour);
                console.log(abHour);
                console.log(authAb);
                console.log(comment);

                if (attendanceDataCurr[id] == null) {
                    attendanceDataCurr[id] = {};
                }
                
                if (attendanceDataCurr[id][date] == null) {
                    attendanceDataCurr[id][date] = {};
                }

                
                attendanceDataCurr[id][date][startTime] = {
                    name: name,
                    ac_hour: acHour,
                    ab_hour: abHour,
                    auth_ab: authAb,
                    comment: comment
                };
    
            } else {
                console.log("Error: this is interesting");
            }
        });
    } else {
        console.log("Error: Table not found");
    }
    console.log(attendanceDataCurr);
    localStorage.setItem("attendance_data", JSON.stringify(attendanceDataCurr));
}


// function webexComments: set comments as "R"
function webexComments() {
    // find the main attendance tracking table
    let attendanceTable = $(".fieldlabeltext").parents("table");
    if(attendanceTable.length > 0) {
        // main attendance tracking table found
        $(attendanceTable).find("tr").each(function(index, element){
            //console.log(index);
            //console.log(element);
            let cellList = $(element).find("td.dbdefault").not(".att-enhance-col");
            if(cellList.length == 0) {
                if (index == 0) {
                    console.log("this row must be table header");
                } else {
                    console.log("Error: this is interesting");
                }
            } else if(cellList.length == 10) {
                
                let acHour = $(cellList[6]).find("input").val() ? $(cellList[6]).find("input").val() : 0;
                let comment = $(cellList[9]).find("input");

                console.log(acHour);

                
                if (parseFloat(acHour) > 0) {
                    $(comment).val("R");
                }
    
            } else {
                console.log("Error: this is interesting");
            }
        });
    } else {
        console.log("Error: Table not found");
    }
}


// function smartFillData: get all attendance from local storage and set the form
function smartFillData() {
    // find the main attendance tracking table
    let attendanceTable = $(".fieldlabeltext").parents("table");
    if(attendanceTable.length > 0) {
        // main attendance tracking table found
        $(attendanceTable).find("tr").each(function(index, element){
            //console.log(index);
            //console.log(element);
            let cellList = $(element).find("td.dbdefault").not(".att-enhance-col");
            if(cellList.length == 0) {
                if (index == 0) {
                    console.log("this row must be table header");
                } else {
                    console.log("Error: this is interesting");
                }
            } else if(cellList.length == 10) {
                
                // use id, date, startTime as key
                let id = cellList[1].innerText;
                let date = cellList[3].innerText
                let startTime = cellList[4].innerText

                let name = $(cellList[2]).find("a")[0].innerHTML.trim().split("<br>");
                let expHour = $(cellList[5])[0].innerText;
                let acHour = $(cellList[6]).find("input").val() ? $(cellList[6]).find("input").val() : 0;
                let abHour = $(cellList[7]).find("input").val() ? $(cellList[7]).find("input").val() : 0;
                let authAb = $(cellList[8]).find("select").val();
                let comment = $(cellList[9]).find("input").val();
                console.log(name + "/" + expHour + "/" + acHour + "/" + abHour + "/" + authAb);

                if (authAb == "Y") {
                    $(cellList[6]).find("input").val(expHour);
                    $(cellList[7]).find("input").val("0");
                } else {
                    $(cellList[6]).find("input").val("0");
                    $(cellList[7]).find("input").val(expHour);
                }

    
            } else {
                console.log("Error: this is interesting");
            }
        });
    } else {
        console.log("Error: Table not found");
    }

}