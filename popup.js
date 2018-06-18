var domDomain = document.domain;
$('#optionsLink').attr('href', 'chrome-extension://' + domDomain + '/options.html');
$('#overlayOptions').attr('href', 'chrome-extension://' + domDomain + '/options.html');
$('#overlayOptions1').attr('href', 'chrome-extension://' + domDomain + '/options.html');
document.getElementById("refreshTab").onclick = function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.update(tabs[0].id, { url: tabs[0].url });
    });
    location.reload();
};
document.getElementById("refreshTab1").onclick = function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.update(tabs[0].id, { url: tabs[0].url });
    });
    location.reload();
};
var access_token = localStorage.Access_token;
var c = {};
var t = {};
var s = [];
var info = {};
var domain = "";
var courseNum = "";
var teachers = [];
var recentTeacher = "";
var teacherObj = {};
var teacherID = "";
var t;
var sectionsDone = false;
var tEmail = "";
var sns = [];
var eve = [];
var today = new Date();
var checking = setInterval(function () { checkIfDone() }, 1500);
var checkLinks;
var today = new Date();
function checkLinks() {
    chrome.tabs.executeScript({
        file: 'checkLinks.js'
    });
}
function checkIfDone() {
    if (sectionsDone !== false) {
        $('#loadingD').addClass("hideItem");
        $('#retrieve').removeClass('hideItem');
        $('#retrieve').fadeOut(300);
        $('#retrieve').fadeIn("slow");
    }
}
function reload() {
    t = setTimeout(function () {
        location.reload();
    }, 1000);
}
function startInterval() {
    if (domain == "" && access_token == undefined == false) {
        reload();
    } else {
        clearTimeout(t);
    }
}
chrome.storage.local.get(function (a) {
    access_token = a.Access_token;
});
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (access_token == undefined || access_token == null) {
        $('#overlay').css({ "display": "block" });
        reload();
    }
    if (access_token !== undefined && access_token !== null) {
        $('#overlay').css({ "display": "none" });
    }
    var domDomain = document.domain;
    if (domain == "" && access_token == undefined == false) {
        setTimeout(startInterval, 1000);
    }
    chrome.tabs.sendMessage(tabs[0].id, { getDomain: true }, function (response) {
        info = response;
        domain = info.domain;
        courseNum = info.course;
        $.ajax({
            url: 'https://' + domain + '/api/v1/courses/' + courseNum + '/',
            type: 'GET',
            data: 'per_page=100&cross_domain_login=siteadmin.instructure.com&include[]=sections',
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", "Bearer " + access_token);
            },
            success: function (getCourse, status, xhr) {
                courseObj = getCourse;
                var userID = xhr.getResponseHeader('X-Canvas-User-Id');
                console.log(userID);
                c.name = courseObj.name;
                c.start_at = courseObj.start_at;
                c.end_at = courseObj.end_at;
                c.root_account = courseObj.root_account_id;
                c.term = courseObj.enrollment_term_id;
                getTermDates();
                getMostRecent(function () {
                    $('#loadingT').addClass("hideItem");
                    $('#recentTeacherBTN').removeClass('hideItem');
                    $('#recentTeacherBTN').fadeOut(300);
                    $('#recentTeacherBTN').fadeIn("slow");
                });
            },
            error: function (xhr, ajaxOptions, thrownError) {
                if (xhr.status == 404 && access_token !== undefined) {
                    setTimeout(function () {
                    $('#overlay2').css({ "display": "block" });
                    }, 5000);
                }
                if (xhr.status == 401 && access_token !== undefined) {
                    $('#overlay1').css({ "display": "block" });
                }
            }
        });
        $.ajax({
            url: 'https://' + domain + '/api/v1/courses/' + courseNum + '/sections',
            type: 'GET',
            data: 'per_page=100&cross_domain_login=siteadmin.instructure.com',
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", "Bearer " + access_token);
            },
            success: function (response) {
                sections = response;
                sectionsDone = true;
                for (var i = 0; i < sections.length; i++) {
                    s.push(sections[i] = {
                        name: sections[i].name,
                        start_at: sections[i].start_at,
                        end_at: sections[i].end_at,
                        sectionId: sections[i].id
                    });
                };
                setTimeout(function () {
                    clearInterval(checking);
                }, 300);
            }
        });
        function getTermDates() {
            $.ajax({
                url: 'https://' + domain + '/api/v1/accounts/' + c.root_account + '/terms/',
                type: 'GET',
                data: 'per_page=100&cross_domain_login=siteadmin.instructure.com&include[]=overrides',
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("Authorization", "Bearer " + access_token);
                },
                success: function (response) {
                    getTerms = response;
                    terms = getTerms.enrollment_terms;
                    for (var i = 0; i < terms.length; i++) {
                        if (terms[i].id === c.term) {
                            t.name = terms[i].name;
                            t.start_at = terms[i].start_at;
                            t.end_at = terms[i].end_at;
                            overrides = terms[i].overrides;
                        }
                    };
                    if (sectionsDone !== false) {
                        $('#loadingD').addClass("hideItem");
                        $('#retrieve').removeClass('hideItem');
                        $('#retrieve').fadeOut("fast");
                        $('#retrieve').fadeIn("slow");
                    }
                }
            });
        };
        function getMostRecent(onComplete) {
            $.ajax({
                url: 'https://' + domain + '/api/v1/courses/' + courseNum + '/enrollments',
                type: 'GET',
                data: 'per_page=100&cross_domain_login=siteadmin.instructure.com&type[]=TeacherEnrollment&include[]=email',
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("Authorization", "Bearer " + access_token);
                },
                success: function (response) {
                    teachers = response;
                    function dateFromString(str) {
                        if (teachers.last_activity_at !== null) {
                            str = str.last_activity_at;
                            return new Date(str);
                        }
                    }
                    function mostRecent(a, b) {
                        return dateFromString(a) > dateFromString(b) ? a : b;
                    };
                    if (teachers.length === 0) {
                        $('#loadingT').addClass("hideItem");
                        $('#peopleTab').attr('href', 'https://' + domain + '/courses/' + courseNum + '/users');
                        setTimeout(function () {
                            $('#noTeacher').removeClass('hideItem');
                        }, 500);
                    }
                    if (teachers.length) {
                        recentTeacher = teachers.reduce(mostRecent);
                        teacherID = recentTeacher.user_id.toString();
                        getTeachersObj(onComplete);
                    }
                }
            });
        };
        function getTeachersObj(onComplete) {
            $.ajax({
                url: 'https://' + domain + '/api/v1/courses/' + courseNum + '/users/',
                type: 'GET',
                data: 'per_page=100&cross_domain_login=siteadmin.instructure.com&include[]=email&user_ids[]=' + teacherID,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("Authorization", "Bearer " + access_token);
                },
                success: function (response) {
                    teacherObj = response;
                    onComplete();
                    $()
                }
            });
        };
        $('#recentTeacherBTN').on("click", function () {
            tEmail = teacherObj[0].email;
            $(this).css({ "display": "none" });
            Typed.new('.bopBop', {
                strings: ["Bop ", "Bop "],
                typeSpeed: 0
            }); setTimeout(function () {
                $('.loader').css({ "display": "none" });
                spitRecentTeacher();
            }, 950);
        });
    });
});

function changeLanguage (languageSelected) {
    $.ajax({
        url: 'https://siteadmin.instructure.com/api/v1/users/4597752',
        type: 'PUT',
        data: 'user[locale]=' + languageSelected,
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Bearer " + access_token);
        },
        success: function (response) {
            refreshPage();
            window.close();
        }
    });
};
function refreshPage () {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.update(tabs[0].id, {url: tabs[0].url});
    });
};
$('#spanish').on("click", function(){
    changeLanguage("es");
});
$('#english').on("click", function(){
    changeLanguage("en");
});
$('#portuguese').on("click", function(){
    changeLanguage("pt-BR");
});
$('#retrieve').on("click", function () {
    $(this).css({ "display": "none" });
    Typed.new('.bopBop', {
        strings: ["Bop ", "Bop "],
        typeSpeed: 0
    });
    setTimeout(function () {
        $('.loader').css({ "display": "none" });
        spitAllinfo();
    }, 950);
});
window.addEventListener('DOMContentLoaded', function () {
    var link = document.getElementById('links');
    link.addEventListener('click', function () {
        var newURL = 'http://' + domain + '/courses/' + courseNum + '/link_validator?cross_domain_login=siteadmin.instructure.com';
        chrome.tabs.create({ url: newURL });
    });
});
$('#linkCheck').on('click', function () {
    checkLinks();
});
function spitAllinfo() {
    spitCourseInfo();
    spitSectionsInfo();
    spitTermInfo();
    if (overrides.hasOwnProperty("StudentEnrollment") === true) {
        spitStudentTerm();
    }
    if (overrides.hasOwnProperty("TeacherEnrollment") === true) {
        spitTeacherTerm();
    }
    if (overrides.hasOwnProperty("TaEnrollment") === true) {
        spitTATerm();
    }
};
function spitCourseInfo() {
    var cstartN = new Date(c.start_at);
    cstart = cstartN.toDateString();
    var cendN = new Date(c.end_at);
    cend = cendN.toDateString();
    var start = cstart + " " + cstartN.toLocaleTimeString();
    var end = cend + " " + cendN.toLocaleTimeString();
    if (c.start_at == null) {
        start = " Nada";
    }
    if (c.end_at == null) {
        end = " Nada";
    }
    if (today < cstartN && start !== " Nada") {
        $('#container').append('<a class="slide-fade show" href=https://' + domain + '/courses/' + courseNum + '/settings  target="_blank"><div class="panel panel-red"><div class="panel-heading"><div class="row"><div class="col-xs-3"><h1 class="titles">Course</h1><p class="redText">Has Not Started😒 </p><i class="fa fa-graduation-cap fa-2x"></i></a></div><div class="col-xs-9 text-right"><div class="huge"><input disabled="true" class="dNames"  tabindex="1" autocomplete="off" type="text" value="' + c.name + '"></div><li><span class="StartEnd redText">Start</span> ' + cstart + '</li><li><span class="StartEnd">End</span> ' + end + '</li>');
    } else if (today > cendN && end !== " Nada") {
        $('#container').append('<a class="slide-fade show" href=https://' + domain + '/courses/' + courseNum + '/settings  target="_blank"><div class="panel panel-red"><div class="panel-heading"><div class="row"><div class="col-xs-3"><h1 class="titles">Course</h1><p class="redText">Already Ended 😘 </p><i class="fa fa-graduation-cap fa-2x"></i></a></div><div class="col-xs-9 text-right"><div class="huge"><input disabled="true" class="dNames"  tabindex="1" autocomplete="off" type="text" value="' + c.name + '"></div><li><span class="StartEnd">Start</span> ' + start + '</li><li><span class="StartEnd redText">End</span> ' + end + '</li>');
    } else {
        $('#container').append('<a class="slide-fade show" href=https://' + domain + '/courses/' + courseNum + '/settings  target="_blank"><div class="panel panel-red"><div class="panel-heading"><div class="row"><div class="col-xs-3"><h1 class="titles">Course</h1><p>Looks Good! 🙌 </p><i class="fa fa-graduation-cap fa-2x"></i></a></div><div class="col-xs-9 text-right"><div class="huge"><input disabled="true" class="dNames"  tabindex="1" autocomplete="off" type="text" value="' + c.name + '"></div><li><span class="StartEnd">Start</span> ' + start + '</li><li><span class="StartEnd">End</span> ' + end + '</li>');
    }
};
function spitTermInfo() {
    var tstartN = new Date(t.start_at);
    tstart = tstartN.toDateString();
    var tendN = new Date(t.end_at);
    tend = tendN.toDateString();
    var start = tstart + " " + tstartN.toLocaleTimeString();
    var end = tend + " " + tendN.toLocaleTimeString();
    if (t.start_at == null) {
        start = " Nada";
    }
    if (t.end_at == null) {
        end = " Nada";
    }
    if (today < tstartN && start !== " Nada") {
        $('#container').append('<a class="slide-fade show" href=https://' + domain + '/accounts/' + c.root_account + '/terms target="_blank"><div class="panel panel-yellow"><div class="panel-heading"><div class="row"><div class="col-xs-3"><h1 class="titles">Term</h1><p class="redText">Has Not Started😒 </p><i class="fa fa-university fa-2x"></i></a></div><div class="col-xs-9 text-right"><div class="huge"><input disabled="true" class="dNames"  tabindex="1" autocomplete="off" type="text" value="' + t.name + '"></div><li><span class="StartEnd redText">Start</span> ' + start + '</li><li><span class="StartEnd">End</span> ' + end + '</li>');
    } else if (today > tendN && end !== " Nada") {
        $('#container').append('<a class="slide-fade show" href=https://' + domain + '/accounts/' + c.root_account + '/terms target="_blank"><div class="panel panel-yellow"><div class="panel-heading"><div class="row"><div class="col-xs-3"><h1 class="titles">Term</h1><p class="redText">Already Ended 😘 </p><i class="fa fa-university fa-2x"></i></a></div><div class="col-xs-9 text-right"><div class="huge"><input disabled="true" class="dNames"  tabindex="1" autocomplete="off" type="text" value="' + t.name + '"></div><li><span class="StartEnd">Start</span> ' + start + '</li><li><span class="StartEnd redText">End</span> ' + end + '</li>');
    } else {
        $('#container').append('<a class="slide-fade show" href=https://' + domain + '/accounts/' + c.root_account + '/terms target="_blank"><div class="panel panel-yellow"><div class="panel-heading"><div class="row"><div class="col-xs-3"><h1 class="titles">Term</h1><p>Looks Good! 🙌 </p><i class="fa fa-university fa-2x"></i></a></div><div class="col-xs-9 text-right"><div class="huge"><input disabled="true" class="dNames"  tabindex="1" autocomplete="off" type="text" value="' + t.name + '"></div><li><span class="StartEnd">Start</span> ' + start + '</li><li><span class="StartEnd">End</span> ' + end + '</li>');
    }
};
function spitSectionsInfo() {
    for (var i = 0; i < s.length; i++) {
        var sstartN = new Date(s[i].start_at);
        sstart = sstartN.toDateString();
        var sendN = new Date(s[i].end_at);
        send = sendN.toDateString();
        var start = sstart + " " + sstartN.toLocaleTimeString();
        var end = send + " " + sendN.toLocaleTimeString();
        if (s[i].start_at == null) {
            start = " Nada";
        }
        if (s[i].end_at == null) {
            end = " Nada";
        }
        if (today < sstartN && start !== " Nada") {
            $('#container').append('<a class="slide-fade show" href=https://' + domain + '/courses/' + courseNum + '/sections/' + s[i].sectionId + ' target="_blank"><div class="panel panel-blue"><div class="panel-heading"><div class="row"><div class="col-xs-3"><h1 class="titles">Section</h1><p class="redText">Has Not Started 😒 </p><i class="fa fa-tasks fa-2x"></i></a></div><div class="col-xs-9 text-right"><div class="huge"><li><input disabled="true" class="dNames"  tabindex="1" autocomplete="off" type="text" value="' + s[i].name + '"></li><li><span class="StartEnd redText">Start</span> ' + start + '</li><li><span class="StartEnd">End</span> ' + end + '</li></div>');
        } else if (today > sendN && end !== " Nada") {
            $('#container').append('<a class="slide-fade show" href=https://' + domain + '/courses/' + courseNum + '/sections/' + s[i].sectionId + ' target="_blank"><div class="panel panel-blue"><div class="panel-heading"><div class="row"><div class="col-xs-3"><h1 class="titles">Section</h1><p class="redText">Already Ended 😘 </p><i class="fa fa-tasks fa-2x"></i></a></div><div class="col-xs-9 text-right"><div class="huge"><li><input disabled="true" class="dNames"  tabindex="1" autocomplete="off" type="text" value="' + s[i].name + '"></li><li><span class="StartEnd">Start</span> ' + start + '</li><li><span class="StartEnd redText">End</span> ' + end + '</li></div>');
        } else {
            $('#container').append('<a class="slide-fade show" href=https://' + domain + '/courses/' + courseNum + '/sections/' + s[i].sectionId + ' target="_blank"><div class="panel panel-blue"><div class="panel-heading"><div class="row"><div class="col-xs-3"><h1 class="titles">Section</h1><p>Looks Good! 🙌 </p><i class="fa fa-tasks fa-2x"></i></a></div><div class="col-xs-9 text-right"><div class="huge"><li><input disabled="true" class="dNames"  tabindex="1" autocomplete="off" type="text" value="' + s[i].name + '"></li><li><span class="StartEnd">Start</span> ' + start + '</li><li><span class="StartEnd">End</span> ' + end + '</li></div>');
        }
    };
};
function spitRecentTeacher() {
    $('#container').append('<a href=https://' + domain + '/users/' + teacherObj[0].id + '/ target=_blank><div class="panel panel-blue"><div class="panel-heading"><div class="row"><div class="col-xs-3"><h1 class="titles">Teacher</h1><i class="fa fa-tasks fa-2x"></i></a></div><div class="col-xs-9 text-right"><div class="huge">' + teacherObj[0].name + '</div><li><input id="copy-text" tabindex="1" autocomplete="off" type="text" value=' + tEmail + '></li><li><input id="copy" value="copy" type="submit"></li>');
    $('#copy').on('click', function () {
        $("#copy-text").select();
        document.execCommand('copy');
    });
}
function spitStudentTerm() {
    var tstartSN = new Date(overrides.StudentEnrollment.start_at);
    tstartS = tstartSN.toDateString();
    var tendSN = new Date(overrides.StudentEnrollment.end_at);
    tendS = tendSN.toDateString();
    var start = tstartS + " " + tstartSN.toLocaleTimeString();
    var end = tendS + " " + tendSN.toLocaleTimeString();
    
    if (overrides.StudentEnrollment.start_at == null) {
        start = " Nada";
    }
    if (overrides.StudentEnrollment.end_at == null) {
        end = " Nada";
    }
    if (today < tstartSN && start !== " Nada") {
        $('#container').append('<a class="slide-fade show" href=https://' + domain + '/accounts/' + c.root_account + '/terms target="_blank"><div class="panel panel-yellow"><div class="panel-heading"><div class="row"><div class="col-xs-3"><h1 class="titles">Term</h1><p class="redText">Has Not Started😒 </p><i class="fa fa-university fa-2x"></i></a></div><div class="col-xs-9 text-right"><div class="huge">Students can access from:</div><li><span class="StartEnd redText">Start</span> ' + start + '</li><li><span class="StartEnd">End</span> ' + end + '</li>');
    } else if (today > tendSN && end !== " Nada") {
        $('#container').append('<a class="slide-fade show" href=https://' + domain + '/accounts/' + c.root_account + '/terms target="_blank"><div class="panel panel-yellow"><div class="panel-heading"><div class="row"><div class="col-xs-3"><h1 class="titles">Term</h1><p class="redText">Already Ended 😘 </p><i class="fa fa-university fa-2x"></i></a></div><div class="col-xs-9 text-right"><div class="huge">Students can access from:</div><li><span class="StartEnd">Start</span> ' + start + '</li><li><span class="StartEnd redText">End</span> ' + end + '</li>');
    } else {
        $('#container').append('<a class="slide-fade show" href=https://' + domain + '/accounts/' + c.root_account + '/terms target="_blank"><div class="panel panel-yellow"><div class="panel-heading"><div class="row"><div class="col-xs-3"><h1 class="titles">Term</h1><p>Looks Good! 🙌 </p><i class="fa fa-university fa-2x"></i></a></div><div class="col-xs-9 text-right"><div class="huge">Students can access from:</div><li><span class="StartEnd">Start</span> ' + start + '</li><li><span class="StartEnd">End</span> ' + end + '</li>');
    }
};
function spitTeacherTerm() {
    var tstartTN = new Date(overrides.TeacherEnrollment.start_at);
    var tendTN = new Date(overrides.TeacherEnrollment.end_at);
    tstartT = tstartTN.toDateString();
    tendT = tendTN.toDateString();
    var start = tstartT + " " + tstartTN.toLocaleTimeString();
    var end = tendT + " " + tendTN.toLocaleTimeString();
    if (overrides.TeacherEnrollment.start_at == null) {
        start = " Nada";
    }
    if (overrides.TeacherEnrollment.end_at == null) {
        end = " Nada";
    }



    if (today < tstartTN && start !== " Nada") {
        $('#container').append('<a class="slide-fade show" href=https://' + domain + '/accounts/' + c.root_account + '/terms target="_blank"><div class="panel panel-yellow"><div class="panel-heading"><div class="row"><div class="col-xs-3"><h1 class="titles">Term</h1><p class="redText">Has Not Started😒 </p><i class="fa fa-university fa-2x"></i></a></div><div class="col-xs-9 text-right"><div class="huge">Teachers can access from:</div><li><span class="StartEnd redText">Start</span> ' + start + '</li><li><span class="StartEnd">End</span> ' + end + '</li>');
    } else if (today > tendTN && end !== " Nada") {
        $('#container').append('<a class="slide-fade show" href=https://' + domain + '/accounts/' + c.root_account + '/terms target="_blank"><div class="panel panel-yellow"><div class="panel-heading"><div class="row"><div class="col-xs-3"><h1 class="titles">Term</h1><p class="redText">Already Ended 😘 </p><i class="fa fa-university fa-2x"></i></a></div><div class="col-xs-9 text-right"><div class="huge">Teachers can access from:</div><li><span class="StartEnd">Start</span> ' + start + '</li><li><span class="StartEnd redText">End</span> ' + end + '</li>');
    } else {
        $('#container').append('<a class="slide-fade show" href=https://' + domain + '/accounts/' + c.root_account + '/terms target="_blank"><div class="panel panel-yellow"><div class="panel-heading"><div class="row"><div class="col-xs-3"><h1 class="titles">Term</h1><p>Looks Good! 🙌 </p><i class="fa fa-university fa-2x"></i></a></div><div class="col-xs-9 text-right"><div class="huge">Teachers can access from:</div><li><span class="StartEnd">Start</span> ' + start + '</li><li><span class="StartEnd">End</span> ' + end + '</li>');
    }
};
function spitTATerm() {
    var tstartTAN = new Date(overrides.TaEnrollment.start_at);
    tstartTA = tstartTAN.toDateString();
    var tendTAN = new Date(overrides.TaEnrollment.end_at);
    tendTA = tendTAN.toDateString();
    var start = tstartTA + " " + tstartTAN.toLocaleTimeString();
    var end = tendTA + " " + tendTAN.toLocaleTimeString();
    if (overrides.TaEnrollment.start_at == null) {
        start = " Nada";
    }
    if (overrides.TaEnrollment.end_at == null) {
        end = " Nada";
    }
    if (today < tstartTAN && start !== " Nada") {
        $('#container').append('<a class="slide-fade show" href=https://' + domain + '/accounts/' + c.root_account + '/terms target="_blank"><div class="panel panel-yellow"><div class="panel-heading"><div class="row"><div class="col-xs-3"><h1 class="titles">Term</h1><p class="redText">Has Not Started😒 </p><i class="fa fa-university fa-2x"></i></a></div><div class="col-xs-9 text-right"><div class="huge">Teachers can access from:</div><li><span class="StartEnd redText">Start</span> ' + start + '</li><li><span class="StartEnd">End</span> ' + end + '</li>');
    } else if (today > tendTAN && end !== " Nada") {
        $('#container').append('<a class="slide-fade show" href=https://' + domain + '/accounts/' + c.root_account + '/terms target="_blank"><div class="panel panel-yellow"><div class="panel-heading"><div class="row"><div class="col-xs-3"><h1 class="titles">Term</h1><p class="redText">Already Ended 😘 </p><i class="fa fa-university fa-2x"></i></a></div><div class="col-xs-9 text-right"><div class="huge">TAs can access from:</div><li><span class="StartEnd">Start</span> ' + start + '</li><li><span class="StartEnd redText">End</span> ' + end + '</li>');
    } else {
        $('#container').append('<a class="slide-fade show" href=https://' + domain + '/accounts/' + c.root_account + '/terms target="_blank"><div class="panel panel-yellow"><div class="panel-heading"><div class="row"><div class="col-xs-3"><h1 class="titles">Term</h1><p>Looks Good! 🙌 </p><i class="fa fa-university fa-2x"></i></a></div><div class="col-xs-9 text-right"><div class="huge">TAs can access from:</div><li><span class="StartEnd">Start</span> ' + start + '</li><li><span class="StartEnd">End</span> ' + end + '</li>');
    }
};

