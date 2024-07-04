function changePass() {
    const old = document.getElementById("old").value;
    const new1 = document.getElementById("new1").value;
    const new2 = document.getElementById("new2").value;
    let flag = 0;

    // Clear previous warnings
    document.getElementById("oldWarning").innerHTML = "";
    document.getElementById("new1Warning").innerHTML = "";
    document.getElementById("new2Warning").innerHTML = "";

    if (old.length === 0) {
        flag = 1;
        document.getElementById("oldWarning").innerHTML = "Can't be empty";
    }
    if (new1.length < 8) {
        flag = 1;
        document.getElementById("new1Warning").innerHTML = "Password length must have at least 8 characters";
    }
    if (new1 !== new2) {
        flag = 1;
        document.getElementById("new2Warning").innerHTML = "Passwords do not match";
    }
    if (flag === 1) {
        return;
    }

    const object = {
        oldPassword: old,
        newPassword: new1
    };

    fetch('http://localhost:8080/updatePassword', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(object)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(result => {
            if (result.status === "old") {
                alert("Wrong old password");
                // window.location.reload();
            } else {
                alert("Password Changed");
                window.location.href = "/account";
            }
        })
        .catch(error => {
            alert("Error: " + error.message);
            console.log("Error", error);
        });
}
