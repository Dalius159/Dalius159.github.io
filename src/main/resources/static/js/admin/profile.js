$(document).ready(function(){

    // click event button Cap nhật thông tin
    $('.btnUpdateInfor').on("click", function(event) {
        event.preventDefault();
        var userId = $(".userId").val();

        console.log(userId);

        var href = "http://localhost:8080/api/profile/"+userId;
        $.get(href, function(user, status) {
            populate('.formUpdate', user);
        });

        $('.formUpdate #updateModal').modal();
    });

    // fill input form với JSon Object
    function populate(frm, data) {
        $.each(data, function(key, value){
            if(key !== "id"){
                $('[name='+key+']', frm).val(value);
            }
        });
    }

    $('.btnChangePassword').on("click", function(event) {
        event.preventDefault();
        removeElementsByClass("error");
        $('.formChangePassword #changePWModal').modal();
    });

    $(document).on('click', '#btnConfirmChangePW', function(event) {
        event.preventDefault();
        removeElementsByClass("error");
        ajaxPostChangePass();
    });

    function ajaxPostChangePass() {
        // PREPATEE DATA
        var data = $('.formChangePassword').serializeFormJSON();
        // do post
        $.ajax({
            async:false,
            type : "POST",
            contentType : "application/json",
            url : "http://localhost:8080/api/profile/changePassword",
            data : JSON.stringify(data),
            success : function(response) {
                if(response.status === "success"){
                    $('#changePWModal').modal('hide');
                    alert("Change password successful. You need to login again");
                    location.href = "http://localhost:8080/logout";
                } else {
                    $('input').next().remove();
                    $.each(response.errorMessages, function(key,value){
                        $('input[name='+ key +']').after('<span class="error">'+value+'</span>');
                    });
                }
            },
            error : function(e) {
                alert("Error!")
                console.log("ERROR: ", e);
            }
        });
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

    function removeElementsByClass(className){
        var elements = document.getElementsByClassName(className);
        while(elements.length > 0){
            elements[0].parentNode.removeChild(elements[0]);
        }
    }
})