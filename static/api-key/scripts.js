
// this is the id of the form
$("#api-form").submit(function(e) {
    e.preventDefault(); // avoid executing the actual submit of the form.

    var url = "https://api.kraigh.net/apiKey"; // the script where you handle the form input.
    var data = {
        "name": $("#api-form :input[name='name']")[0].value,
        "email": $("#api-form :input[name='email']")[0].value,
    };
    data = JSON.stringify(data);
    $.ajax({
        type: "POST",
        url: url,
        data: data,
        success: function(response) {
            console.log(response);
            $("#api-key").html(response.apiKey);
            $("#api-key-container").show();
        },
        error: function(err) {
            console.log(err);
        }
    });

});
