
course1 = document.URL.substring(document.URL.indexOf('/courses/') + 9);
if (course1.indexOf('/') !== -1) {
    course = course1.substring(0, course1.indexOf('/'));
} else {
    course = course1;
}
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log(sender.tab ?
            "from a content script:" + sender.tab.url :
            "from the extension");
        if (request.getDomain == true)
            sendResponse({ domain: document.domain, course: course,});
    });

