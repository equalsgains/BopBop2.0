document.querySelector('.user_content').querySelectorAll('a').forEach((item) => {
    if (item['href'] != null) {
        $.ajax({
            type: 'HEAD',
            url: item['href'],
            headers: { 'Access-Control-Allow-Origin': '*' },
            success: function () {
                console.log(`${item['href']} looks good`);
            },
            error: function (xhr, ajaxOptions, thrownError) {
                if (xhr.status == 404) {
                    $(item).css({ "border": "solid 10px red", "color": "red",});
                }
            }
        });
    }
});

