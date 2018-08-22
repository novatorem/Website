$("form").each(function() {
    $(this).find(':input[type="submit"]').prop('disabled', true);
});
function correctCaptcha() {
    $("form").each(function() {
        $(this).find(':input[type="submit"]').prop('disabled', false);
    });
}
