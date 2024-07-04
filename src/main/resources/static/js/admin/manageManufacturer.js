$(document).ready(function(){

    // click event button add new manufacturer
    $('.btnAddManufacturer').on("click", function(event) {
        event.preventDefault();
        $('.manufacturerForm #manufacturerModal').modal();
        $('.manufacturerForm #id').prop("disabled", true);
        $('#form').removeClass().addClass("addForm");
        $('#form #btnSubmit').removeClass().addClass("btn btn-primary btnSaveForm");
    });

    $('#manufacturerModal').on('hidden.bs.modal', function () {
        $('#form').removeClass().addClass("manufacturerForm");
        $('#form #btnSubmit').removeClass().addClass("btn btn-primary");
        resetText();
    });

    // reset text in form
    function resetText(){
        $("#id").val("");
        $("#manufacturerName").val("");
    }

    ajaxGet(1);

    // do get
    function ajaxGet(page){
        $.ajax({
            type: "GET",
            url: "http://localhost:8080/api/manufacturer/all?page=" + page,
            success: function(result){
                $('.manufacturerTable tbody').empty(); // Clear table before appending new data

                $.each(result.content, function(i, manufacturer){
                    var manufacturerRow = '<tr style="text-align: center;">' +
                        '<td>' + manufacturer.id + '</td>' +
                        '<td>' + manufacturer.manufacturerName + '</td>' +
                        '<td>' +
                        '<input type="hidden" value=' + manufacturer.id + '>' +
                        '<button class="btn btn-primary btnUpdateManufacturer">Update</button>' +
                        '<button class="btn btn-danger btnDeleteManufacturer">Delete</button>' +
                        '</td>' +
                        '</tr>';
                    $('.manufacturerTable tbody').append(manufacturerRow);
                });

                // Pagination
                renderPagination(page, result.totalPages);
            },
            error : function(e){
                alert("Error fetching manufacturers!");
                console.log("Error", e);
            }
        });
    }

    $(document).on('click', '.pageNumber', function (event){
        event.preventDefault();
        const page = $(this).data('page');
        ajaxGet(page);
    });

    $(document).on('click', '.btnSaveForm', function (event) {
        event.preventDefault();
        ajaxPost();
    });

    function ajaxPost(){
        var formData = { manufacturerName : $("#manufacturerName").val() };

        $.ajax({
            type : "POST",
            contentType : "application/json",
            url : "http://localhost:8080/api/manufacturer/save",
            data : JSON.stringify(formData),
            success : function(response) {
                if(response.status === "success"){
                    $('#manufacturerModal').modal('hide');
                    alert("Added successfully!");
                    ajaxGet(1); // Reload data after successful addition
                } else {
                    $('input').next().remove();
                    $.each(response.errorMessages, function(key, value){
                        $('input[id='+ key +']').after('<span class="error">'+value+'</span>');
                    });
                }
            },
            error : function(xhr, textStatus, errorThrown) {
                if (xhr.status === 400) {
                    alert("Manufacturer name already exists!");
                } else {
                    alert("Error adding manufacturer!");
                    console.log("ERROR: ", errorThrown);
                }
            }
        });
    }

    $(document).on("click",".btnUpdateManufacturer",function(event){
        event.preventDefault();
        $('.manufacturerForm #id').prop("disabled", true);
        var manufacturerID = $(this).parent().find('input').val();

        $('#form').removeClass().addClass("updateForm");
        $('#form #btnSubmit').removeClass().addClass("btn btn-primary btnUpdateForm");
        var href = "http://localhost:8080/api/manufacturer/" + manufacturerID;
        $.get(href, function(manufacturer, status) {
            $('.updateForm #id').val(manufacturer.id);
            $('.updateForm #manufacturerName').val(manufacturer.manufacturerName);
        });

        removeElementsByClass("error");

        $('.updateForm #manufacturerModal').modal();
    });

    $(document).on('click', '.btnUpdateForm', function (event) {
        event.preventDefault();
        ajaxPut();
    });

    function ajaxPut(){
        var formData = {
            id : $('#id').val(),
            manufacturerName : $("#manufacturerName").val(),
        }

        $.ajax({
            type : "PUT",
            contentType : "application/json",
            url : "http://localhost:8080/api/manufacturer/update",
            data : JSON.stringify(formData),
            success : function(response) {
                if(response.status === "success"){
                    $('#manufacturerModal').modal('hide');
                    alert("Update successful!");
                    resetData();
                } else {
                    $('input').next().remove();
                    $.each(response.errorMessages, function(key, value){
                        $('input[id='+ key +']').after('<span class="error">'+value+'</span>');
                    });
                }
            },
            error : function(e) {
                alert("Error updating manufacturer!");
                console.log("ERROR: ", e);
            }
        });
    }

    $(document).on("click",".btnDeleteManufacturer", function() {
        var manufacturerID = $(this).parent().find('input').val();

        var confirmation = confirm("Are you sure you want to delete this manufacturer?");
        if(confirmation){
            $.ajax({
                type : "DELETE",
                url : "http://localhost:8080/api/manufacturer/delete/" + manufacturerID,
                success: function(resultMsg){
                    resetDataForDelete();
                    alert("Delete successful!");
                },
                error : function(e) {
                    alert("Cannot delete, please check again!");
                    console.log("ERROR: ", e);
                }
            });
        }
    });

    function resetData(){
        $('.manufacturerTable tbody').empty();
        var page = $('.pagination .active .pageNumber').data('page');
        ajaxGet(page);
    }

    function resetDataForDelete(){
        var count = $('.manufacturerTable tbody').children().length;
        $('.manufacturerTable tbody').empty();
        var page = $('.pagination .active .pageNumber').data('page');
        ajaxGet(page);
    }


    function removeElementsByClass(className){
        var elements = document.getElementsByClassName(className);
        while(elements.length > 0){
            elements[0].parentNode.removeChild(elements[0]);
        }
    }

});
