function sendContact() {
    var email = document.getElementById("email").value;
    var content = document.getElementById("content").value;
    var flag = 0;

    document.getElementById("emailWarning").innerHTML = "";
    document.getElementById("contentWarning").innerHTML = "";

    if (!/^[^\d][A-z0-9_]+([.][A-z0-9_]+)*[@][A-z0-9_]+([.][A-z0-9_]+)*[.][A-z]{2,4}$/.test(email)) {
        document.getElementById("emailWarning").innerHTML = "Wrong Email format";
        flag = 1;
    }

    if (content.length === 0) {
        document.getElementById("contentWarning").innerHTML = "Required field";
        flag = 1;
    }

    if (flag === 1) {
        // Clear warnings after 3 seconds
        setTimeout(function () {
            document.getElementById("emailWarning").innerHTML = "";
            document.getElementById("contentWarning").innerHTML = "";
        }, 3000);
        return;
    }

    var send = {
        contactEmail: email,
        contactMessage: content,
        status: 'Waiting for respond'
    };

    var data = JSON.stringify(send);

    $.ajax({
        type: "POST",
        data: data,
        contentType: "application/json",
        url: "http://localhost:8080/createContact",
        success: function (result) {
            alert("Thanks for contacting us. LeoLap will respond as soon as possible!");
            window.location.href = "/contact";
        },
        error: function (e) {
            alert("Error: " + e.responseText); // Display error message from server
            console.log("Error", e);
        }
    });

    // Clear warnings after 3 seconds
    setTimeout(function () {
        document.getElementById("emailWarning").innerHTML = "";
        document.getElementById("contentWarning").innerHTML = "";
    }, 3000);
}
