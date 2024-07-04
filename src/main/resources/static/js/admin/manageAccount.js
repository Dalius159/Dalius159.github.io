$(document).ready(function() {

    // load first when coming page
    ajaxGet(1);

    function ajaxGet(page) {
        if (isNaN(page) || page < 1) {
            page = 1;
        }
        var data = { roleName: $("#role").val() };
        $.ajax({
            type: "GET",
            data: data,
            url: "http://localhost:8080/api/account/all?page=" + page,
            success: function(result) {
                $('.accountTable tbody').empty();

                $.each(result.content, function(i, account) {
                    var accountRow = '<tr>' +
                        '<td>' + account.id + '</td>' +
                        '<td>' + account.fullName + '</td>' +
                        '<td>' + account.email + '</td>' +
                        '<td>' + account.phoneNumber + '</td>' +
                        '<td>' + account.address + '</td>' +
                        '<td>';

                    $.each(account.role, function(i, role) {
                        accountRow += role.roleName;
                        accountRow += "<br>";
                    });

                    // Pagination
                    renderPagination(page, result.totalPages);

                    accountRow += '</td>' +
                        '<td width="0%">' + '<input type="hidden" id="idAccount" value=' + account.id + '>' + '</td>' +
                        '<td><button class="btn btn-danger btnDelete">Delete</button></td>' +
                        '</tr>';
                    $('.accountTable tbody').append(accountRow);
                });

            },
            error: function(e) {
                alert("Error: " + e);
                console.log("Error", e);
            }
        });
    }

    function renderPagination(currentPage, totalPages) {
        $('.pagination').empty(); // Clear pagination before rendering

        var prevDisabled = (currentPage === 1) ? 'disabled' : '';
        var nextDisabled = (currentPage === totalPages) ? 'disabled' : '';

        for(var numberPage = 1; numberPage <= totalPages; numberPage++) {
            var liClass = (numberPage === currentPage) ? 'page-item active' : 'page-item';
            var li = '<li class="' + liClass + '"><a class="page-link pageNumber" href="#" data-page="' + numberPage + '">' + numberPage + '</a></li>';
            $('.pagination').append(li);
        }
    }

    // event when click dropdown button and choose add new product
    $('#role').mouseup(function() {
        var open = $(this).data("isopen");
        if (open) {
            resetData();
        }
        $(this).data("isopen", !open);
    });

    // click add new account
    $(document).on('click', '.btnNewAccount', function (event) {
        event.preventDefault();
        console.log("Opening modal");
        $("#accountModal").modal('show'); // 'show' để hiển thị modal
    });

    // confirm add new account
    $(document).on('click', '#btnSubmit', function (event) {
        event.preventDefault();

        var confirmPassword = $('#confirmPassword').val();
        var password = $('#password').val();

        if (!confirmPassword || !password) {
            alert("Password and Confirm Password fields are required");
            return;
        }

        if (confirmPassword !== password) {
            alert("Passwords do not match");
            return;
        }

        ajaxPostAccount();
        resetData();
    });

    function ajaxPostAccount() {
        var data = JSON.stringify($('#accountForm').serializeJSON());
        console.log(data);

        // do post
        $.ajax({
            async: false,
            type: "POST",
            contentType: "application/json",
            url: "http://localhost:8080/api/account/save",
            enctype: 'multipart/form-data',
            data: data,
            success: function(response) {
                if(response.status === "success"){
                    $('#accountModal').modal('hide');
                    alert("Add Successful!");
                } else {
                    $('input').next().remove();
                    $.each(response.errorMessages, function(key, value) {
                        if(key !== "id") {
                            $('input[name=' + key + ']').after('<span class="error">' + value + '</span>');
                        }
                    });
                }
            },
            error: function(e) {
                alert("Error!")
                console.log("ERROR: ", e);
            }
        });
    }

    // delete request
    $(document).on("click",".btnDelete", function() {

        var accountID = $(this).parent().prev().children().val();
        var confirmation = confirm("Are you sure to delete this account?");
        if(confirmation){
            $.ajax({
                type : "DELETE",
                url : "http://localhost:8080/api/account/delete/" + accountID,
                success: function(resultMsg){
                    resetData();
                },
                error : function(e) {
                    console.log("ERROR: ", e);
                }
            });
        }
    });

    // event when hide modal form
    $('#accountModal').on('hidden.bs.modal', function(e) {
        e.preventDefault();
        $('.accountForm input').next().remove();
    });

    // reset table after post, put, filter
    $('#role').change(function() {
        resetData(1);
    });

    function resetData(page) {
        if (isNaN(page) || page < 1) {
            page = 1;
        }
        $('.accountTable tbody').empty();
        $('.pagination').empty();
        ajaxGet(page);
    }

    (function ($) {
        $.fn.serializeFormJSON = function () {

            var o = {};
            var a = this.serializeArray();
            $.each(a, function () {
                if (o[this.name]) {
                    if (!o[this.name].push) {
                        o[this.name] = [o[this.name]];
                    }
                    o[this.name].push(this.value || '');
                } else {
                    o[this.name] = this.value || '';
                }
            });
            return o;
        };
    })(jQuery);
});