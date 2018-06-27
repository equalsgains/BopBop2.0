var course = new Object();
var user = new Object();
user.token =
  "17~aHZbawoVWogDIOolKZG4QAH3aEVze6NVkkHrvMEnnailFTgkCcpU0lRDGKyqer00";
var domain = "";

// Send request to content js
chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
  chrome.tabs.sendMessage(tabs[0].id, { getDomain: true }, function(response) {
    // obtain domain and course number from the response
    course = response;
    domain = course.domain;
    console.log(course);
  });
});

// get functions
function getCourseInfo() {
  $.ajax({
    url: "https://" + domain + "/api/v1/courses/" + course.id + "/",
    type: "GET",
    data: "cross_domain_login=siteadmin.instructure.com",
    beforeSend: function(xhr) {
      xhr.setRequestHeader("Authorization", "Bearer " + access_token);
    },
    success: function(response, status, xhr) {
      course = response;
    },
    error: function(xhr, ajaxOptions, err) {
      if (error) {
        console.log(error);
      }
      console.log(xhr.status);
    }
  });
}
