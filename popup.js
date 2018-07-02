var course = new Object();
var user = new Object();
user.token =
  "17~Ra5DWlWg11ge4hkPnScJZEio6xOURpxymhdDDa9RtXtyKIPqXNkrlu1U5t8pe4Jr";
var domain = "";


// Send request to content js then set GET calls
chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
  chrome.tabs.sendMessage(tabs[0].id, { getDomain: true }, function(response) {
    // obtain domain and course number from the response
    course = response;
    domain = course.domain;
    console.log(course);
    getCourseInfo();
  });
});

// call functions
function getCourseInfo() {
  $.ajax({
    url: "https://" + domain + "/api/v1/courses/" + course.id + "/",
    type: "GET",
    data: "cross_domain_login=siteadmin.instructure.com",
    beforeSend: function(xhr) {
      xhr.setRequestHeader("Authorization", "Bearer " + user.token);
    },
    success: function(response, status, xhr) {
      course = response;
      console.log("course received");
      getTermInfo();
      getSectionsInfo();
    },
    error: function(xhr, ajaxOptions, err) {
      if (error) {
        console.log(error);
      }
      console.log(xhr.status);
    }
  });
};

function getSectionsInfo() {
  $.ajax({
    url: "https://" + domain + "/api/v1/courses/" + course.id + "/sections",
    type: "GET",
    data: "per_page=100&cross_domain_login=siteadmin.instructure.com",
    beforeSend: function(xhr) {
      xhr.setRequestHeader("Authorization", "Bearer " + user.token);
    },
    success: function(response, status, xhr) {
      course.sections = response;
      console.log("sections received");
    },
    error: function(xhr, ajaxOptions, err) {
      if (error) {
        console.log(error);
      }
      console.log(xhr.status);
    }
  });
};
// the fuction below should be excecuted once a reponse from the course is first received
function getTermInfo(){
  $.ajax({
    url: "https://" + domain + "/api/v1/accounts/" + course.account_id + "/terms/",
    type: "GET",
    data: "per_page=100&cross_domain_login=siteadmin.instructure.com&include[]=overrides",
    beforeSend: function(xhr) {
      xhr.setRequestHeader("Authorization", "Bearer " + user.token);
    },
    success: function(response, status, xhr) {
      course.terms = response.enrollment_terms;
      console.log("terms received");
    },
    error: function(xhr, ajaxOptions, err) {
      if (error) {
        console.log(error);
      }
      console.log(xhr.status);
    }
  });
};

// display data
function displayCourse() {
  $("#container").append(
    '<a href="#" class="text-left list-group-item"><h4 class="">C O U R S E </h4><p class="">Start: ' +
      course.start_at +
      '</p><p class="">End: ' +
      course.end_at +
      "</p></a>"
  );
};

function displaySections() {
  for (var i = 0; course.sections.length; i++){
    $("#container").append(
      '<a href="#" class="text-left list-group-item"><h4 class="">S E C T I O N </h4><p class="">Start: ' +
        course.sections.start_at +
        '</p><p class="">End: ' +
        course.sections.end_at +
        "</p></a>"
    );
  };
};

// eventlisteners
$("#retrieve").on("click", function() {
  displayCourse();
  $("#displayContainer").removeClass("hideItem");
});
