document.addEventListener("DOMContentLoaded", function () {
    saveT = document.getElementById('saveToken');
    saveT.addEventListener("click", function () {
        var token = $('#accesstoken').val();
        chrome.storage.local.set({
            Access_token: token
        });
        $('#accesstoken').val("");
        $("input[type='text']").fadeOut();
        $(this).fadeOut();
        $("#tokenTitle").fadeOut();
        $("#saveMessage").removeClass("hideItem");
        $("#saveMessage").fadeOut("fast");
        $("#saveMessage").fadeIn("slow");
        $("#saveToken").fadeOut("fast");
        $("#saveMessage").slideDown();
        $('#resetMessage').slideUp();
        $(this).val("");
        $('#resetToken').slideDown();
        $("input[type='text']").val() === "";
    });
    $("#resetToken").on('click', function () {
        $('#accesstoken').val("");
        chrome.storage.local.clear(function (){});
        $('#accesstoken').fadeIn();
        $(this).fadeOut();
        $("#resetMessage").slideDown();
        $('#saveMessage').fadeOut();
        $('#tokenTitle').fadeIn();
        $("#saveToken").fadeIn("fast");
    });
    $("input[type='text']").keypress(function (e) {
        if (e.which === 13 && $(this).val() !== "") {
            chrome.storage.local.set({
                Access_token: $(this).val()
            });
            $(this).fadeOut();
            $("#tokenTitle").fadeOut();
            $("#saveMessage").removeClass("hideItem");
            $("#saveMessage").fadeOut("fast");
            $("#saveMessage").fadeIn("slow");
            $("#saveToken").fadeOut("fast");
            $("#saveMessage").slideDown();
            $('#resetMessage').slideUp();
            $(this).val("");
            $('#resetToken').slideDown();
        } else if (e.which === 13 && $(this).val() === "") {
            alert("We both know it won't work without your token!");
        }
    });
});


