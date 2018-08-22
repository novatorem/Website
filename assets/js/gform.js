$("form").each(function() {
    $(this).find(':input[type="submit"]').prop('disabled', true);
});
function correctCaptcha() {
    $("form").each(function() {
        $(this).find(':input[type="submit"]').prop('disabled', false);
    });
}
$('form').submit(function(){
    $.post('/thankyou', function() {
        window.location = 'http://google.com';
    });
    return false;
});
