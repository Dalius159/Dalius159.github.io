$(document).ready(function () {

    // clicking on add category button 
    $('.btnAddCategory').on("click", function (event) {
        event.preventDefault();
        $('.categoryForm #categoryModal').modal();
        $('.categoryForm #id').prop("disabled", true);
        $('#form').removeClass().addClass("addForm");
        $('#form #btnSubmit').removeClass().addClass("btn btn-primary btnSaveForm");
    });

    // event khi hide modal
    $('#categoryModal').on('hidden.bs.modal', function () {
        $('#form').removeClass().addClass("categoryForm");
        $('#form #btnSubmit').removeClass().addClass("btn btn-primary");
        resetText();
    });

    // reset text trong form
    function resetText() {
        $("#id").val("");
        $("#categoryName").val("");
    }


    ajaxGet(1);

    // do get
    function ajaxGet(page) {
        $.ajax({
            type: "GET",
            url: "http://localhost:8080/api/category/all" + "?page=" + page,
            success: function (result) {
                $.each(result.content, function (i, category) {
                    const rowCategory = '<tr style="text-align: center;">' +
                        '<td>' + category.id + '</td>' +
                        '<td>' + category.categoryName + '</td>' +
                        '<td>' + '<input type="hidden" value=' + category.id + '>'
                        + '<button class="btn btn-primary btnUpdateCategory" >Update</button>' +
                        '   <button class="btn btn-danger btnDeleteCategory">Delete</button></td>' +
                        '</tr>';
                    $('.categoryTable tbody').append(rowCategory);
                });
                renderPagination(page, result.totalPages);

            },
            error: function (e) {
                alert("Error fetching category table!");
                console.log("Error", e);
            }
        });
    }


    $(document).on('click', '.btnSaveForm', function (event) {
        event.preventDefault();
        postAddNewCategory();
        resetData();
    });

    function postAddNewCategory() {
        // PREPARE FORM DATA
        const formData = {categoryName: $("#categoryName").val()};
        // DO POST
        $.ajax({
            async: false,
            type: "POST",
            contentType: "application/json",
            url: "http://localhost:8080/api/category/save",
            data: JSON.stringify(formData),
            // dataType : 'json',
            success: function (response) {
                if (response.status === "success") {
                    $('#categoryModal').modal('hide');
                    alert("Added successfully");
                } else {
                    $('input').next().remove();
                    $.each(response.errorMessages, function (key, value) {
                        $('input[id=' + key + ']').after('<span class="error">' + value + '</span>');
                    });
                }

            },
            error: function (e) {
                alert("Error adding new category!")
                console.log("ERROR: ", e);
            }
        });
    }

    // click edit button
    $(document).on("click", ".btnUpdateCategory", function () {
        event.preventDefault();
        $('.categoryForm #id').prop("disabled", true);
        const categoryID = $(this).parent().find('input').val();
        $('#form').removeClass().addClass("updateForm");
        $('#form #btnSubmit').removeClass().addClass("btn btn-primary btnUpdateForm");
        const href = "http://localhost:8080/api/category/" + categoryID;
        $.get(href, function (category, status) {
            $('.updateForm #id').val(category.id);
            $('.updateForm #categoryName').val(category.categoryName);
        });

        removeElementsByClass("error");

        $('.updateForm #categoryModal').modal();
    });

    $(document).on('click', '.btnUpdateForm', function (event) {
        event.preventDefault();
        ajaxPut();
        resetData();
    });

    function ajaxPut() {
        // PREPARE FORM DATA
        const formData = {
            id: $('#id').val(),
            categoryName: $("#categoryName").val(),
        };
        // DO PUT
        $.ajax({
            async: false,
            type: "PUT",
            contentType: "application/json",
            url: "http://localhost:8080/api/category/update",
            data: JSON.stringify(formData),
            // dataType : 'json',
            success: function (response) {

                if (response.status === "success") {
                    $('#categoryModal').modal('hide');
                    alert("Update successfully");
                } else {
                    $('input').next().remove();
                    $.each(response.errorMessages, function (key, value) {
                        $('input[id=' + key + ']').after('<span class="error">' + value + '</span>');
                    });
                }
            },
            error: function (e) {
                alert("Error!")
                console.log("ERROR: ", e);
            }
        });
    }

    // delete request
    $(document).on("click", ".btnDeleteCategory", function () {

        const categoryID = $(this).parent().find('input').val();
        const workingObject = $(this);

        const confirmation = confirm("Confirm deleting this category?");
        if (confirmation) {
            $.ajax({
                type: "DELETE",
                url: "http://localhost:8080/api/category/delete/" + categoryID,
                success: function (resultMsg) {
                    resetDataForDelete();
                    alert("Delete successfully");
                },
                error: function (e) {
                    alert("Operation failed! Category cannot be deleted.");
                    console.log("ERROR: ", e);
                }
            });
        }
    });

    // reset table after post, put
    function resetData() {
        $('.categoryTable tbody tr').remove();
        const page = $('li.active').children().text();
        $('.pagination li').remove();
        ajaxGet(page);
    }

    // reset table after delete
    function resetDataForDelete() {
        const count = $('.categoryTable tbody').children().length;
        console.log("columns " + count);
        $('.categoryTable tbody tr').remove();
        const page = $('li.active').children().text();
        $('.pagination li').remove();
        console.log(page);
        if (count === 1) {
            ajaxGet(page - 1);
        } else {
            ajaxGet(page);
        }

    }

    // event - clicking on category pagination
    $(document).on('click', '.pageNumber', function (event) {
//		event.preventDefault();
        const page = $(this).text();
        $('.categoryTable tbody tr').remove();
        $('.pagination li').remove();
        ajaxGet(page);
    });


    function removeElementsByClass(className) {
        const elements = document.getElementsByClassName(className);
        while (elements.length > 0) {
            elements[0].parentNode.removeChild(elements[0]);
        }
    }
});