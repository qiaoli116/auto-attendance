//console.log("I am in .... " + color);
// Store
// Retrieve
//console.log("storage " + localStorage.getItem("lastname"));


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


function optionSelected (btn) {
    page = $("#pagetitle").html();

    console.log("action: " + btn);
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
            default:
                break;
        }
    }
    
}


function enhanceUIForAttendance(){
    $('<style>').text(`
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
    // find the main attendance tracking table
    let attendanceTable = $(".fieldlabeltext").parents("table");
    if(attendanceTable.length > 0) {
        // main attendance tracking table found
        $(attendanceTable).find("tr").each(function(index, element){
            //console.log(index);
            //console.log(element);
            

            let cellList = $(element).find("td.dbdefault");
                
                if(cellList.length == 0) {
                    if (index == 0) {
                        console.log("this row must be table header");
                        var td1 = document.createElement('td');
                        td1.classList.add("dbdefault");
                        td1.innerHTML = `campus`;
                        $(td1).css("background-color", "#a2f2ad");
                        element.appendChild(td1);
    
                        var td2 = document.createElement('td');
                        td2.classList.add("dbdefault");
                        td2.innerHTML = `online`;
                        $(td2).css("background-color", "#759cf0");
                        element.appendChild(td2);
    
                        var td3 = document.createElement('td');
                        td3.classList.add("dbdefault");
                        td3.innerHTML = `absent`;
                        $(td3).css("background-color", "#f59d9a");
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
                    var td1 = document.createElement('td');
                    td1.classList.add("dbdefault");
                    td1.innerHTML = `
                    <input type='radio' value='oncampus' name='group-${index}'>
                    `;
                    td1.addEventListener("input", oncampusClick);
                    element.appendChild(td1);

                    var td2 = document.createElement('td');
                    td2.classList.add("dbdefault");
                    td2.innerHTML = `
                    <input type='radio' value='online' name='group-${index}'>
                    `;
                    td2.addEventListener("input", oncampusClick);
                    element.appendChild(td2);

                    var td3 = document.createElement('td');
                    td3.classList.add("dbdefault");
                    td3.innerHTML = `
                    <input type='radio' value='absence' name='group-${index}'>
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

function showStatusResults() {
    let statusDiv = $("#attPluginStatus");
    $(statusDiv).empty();
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
                let cellList = $(element).find("td.dbdefault");
                
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
            let cellList = $(element).find("td.dbdefault");
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
            let cellList = $(element).find("td.dbdefault");
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
            let cellList = $(element).find("td.dbdefault");
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