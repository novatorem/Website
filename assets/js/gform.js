$("form").each(function() {
    $(this).find(':input[type="submit"]').prop('disabled', true);
});
function correctCaptcha() {
    $("form").each(function() {
        $(this).find(':input[type="submit"]').prop('disabled', false);
    });
}
$('form').submit(function(){
    $.post('www.tenumbra.com/thankyou', function() {
        window.location = 'http://google.com';
    });
    return false;
});
