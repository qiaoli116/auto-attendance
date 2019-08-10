//console.log("I am in .... " + color);
// Store
// Retrieve
//console.log("storage " + localStorage.getItem("lastname"));


console.log("action: " + btn);
initStatus();
switch (btn) {
    case "storeData":
        storeData();
        break;
    case "fillData":
        fillData();
        break;
    case "clearData":
        clearData();
        break;
    case "displayData":
        break;
    default:
        break;
}
showStatus();

function initStatus() {
    if($("#attPluginStatus").length == 0) {
        let divStatus = document.createElement("div");
        $(divStatus).attr("id", "attPluginStatus")
        $(divStatus).css({
            "position": "fixed",
            "right": "0",
            "top": "105px",
            "bottom": "0",
            "width": "300px",
            "background-color": "rgba(204, 238, 255, .8)",
            "z-index": "1000",
            "padding": "20px 10px 20px 30px"
        });
        $("body").append(divStatus);
    }
    $("#attPluginStatus").hide();
}
function showStatus() {
    let statusDiv = $("#attPluginStatus");
    $(statusDiv).empty();
    let attendanceDataLoaded = JSON.parse(localStorage.getItem("attendance_data"));

    // data in storage
    let divStored = document.createElement("div");
    $(divStored).attr("class", "m-stored");
    if (attendanceDataLoaded != null) {
        let dataArray = [];
        
        for (let key in attendanceDataLoaded) {
            if (attendanceDataLoaded.hasOwnProperty(key)) {
                dataArray.push(
                    "<li data-sort='" + attendanceDataLoaded[key].name[0] + " " + attendanceDataLoaded[key].name[1]+ "'>" + 
                    key + " " + 
                    attendanceDataLoaded[key].name.join(" ") + " " +
                    "(" + attendanceDataLoaded[key].ac_hour + "/" + attendanceDataLoaded[key].ab_hour + ") " +
                    "</li>");
            }
        }
        dataArray.sort();
        $(divStored).html("<h4><strong>Data in storage</strong></h4><ol>"+dataArray.join("")+"</ol>");

    } else {
        $(divStored).html("<h4><strong>Data in storage</strong></h4><div>No data stored!</div>");
    }
    $(statusDiv).append(divStored);


    // data missing

    $(statusDiv).slideDown(600);
}

// function clearData: clar all attendance in local storage
function clearData() {
    localStorage.removeItem("attendance_data")
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
                    if (id in attendanceDataLoaded) {
                        $(cellList[6]).find("input").val(attendanceDataLoaded[id].ac_hour);
                        $(cellList[7]).find("input").val(attendanceDataLoaded[id].ab_hour);
                        $(cellList[8]).find("select").val(attendanceDataLoaded[id].auth_ab);
                        $(cellList[9]).find("input").val(attendanceDataLoaded[id].comment);
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

// function storeData: get all attendance form data and store in local storage
function storeData() {
    let attendanceDataCurr = {}; 
    // find the main attendance tracking table
    attendanceTable = $(".fieldlabeltext").parents("table");
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
                
                let id = cellList[1].innerText;
                let name = $(cellList[2]).find("a")[0].innerHTML.trim().split("<br>");
                let acHour = $(cellList[6]).find("input").val() ? $(cellList[6]).find("input").val() : 0;
                let abHour = $(cellList[7]).find("input").val() ? $(cellList[7]).find("input").val() : 0;
                let authAb = $(cellList[8]).find("select").val();
                let comment = $(cellList[9]).find("input").val();
                //console.log(id);
                //console.log(name);
                //console.log(acHour);
                //console.log(abHour);
                //console.log(authAb);
                //console.log(comment);
                attendanceDataCurr[id] = {
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



