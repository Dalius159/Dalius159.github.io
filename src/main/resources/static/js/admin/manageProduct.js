$(document).ready(function () {

    getAllProducts(1);

    function getAllProducts(page) {
        // prepare data
        const data = $('#searchForm').serialize();
        $.ajax({
            type: "GET",
            data: data,
            contentType: "application/json",
            url: "http://localhost:8080/api/product/all" + '?page=' + page,
            success: function (result) {
                $.each(result.content, function (i, product) {
                    let productRow = '<tr>' +
                        '<td>' + '<img src="/product_images/' + product.id + '.png" class="img-responsive" style="height: 50px; width: 50px" />' + '</td>' +
                        '<td>' + product.productName + '</td>' +
                        '<td>' + product.category.categoryName + '</td>' +
                        '<td>' + product.manufacturer.manufacturerName + '</td>' +
                        '<td>' + product.price + '</td>' +
                        '<td>' + product.warehouseUnit + '</td>' +
                        '<td>' + '<input type="hidden" id="productId" value=' + product.id + '>' + '</td>' +
                        '<td> <button class="btn btn-warning btnProductDetail" style="margin-right: 6px">Detail</button>';

                    const categoryNameCheck = (product.category.categoryName.toLowerCase()).indexOf("Laptop".toLowerCase());
                    productRow += (categoryNameCheck !== -1) ? '<button class="btn btn-primary btnUpdateLaptopProduct" >Update</button>' : '<button class="btn btn-primary btnUpdateOrder" >Cập nhật</button>';
                    productRow += '  <button class="btn btn-danger btnDeleteProduct">Delete</button></td>' + '</tr>';
                    $('.productTable tbody').append(productRow);
                });
                // Pagination
                renderPagination(page, result.totalPages);
            },
            error: function (e) {
                alert("Error: ", e);
                console.log("Error", e);
            }
        });
    };

    // clicking on dropdown menu and choosing category for new product
    $('#categoryDropdown').mouseup(function () {
        const open = $(this).data("isopen");
        if (open) {
            const label = $('#categoryDropdown option:selected').text();
            if ((label.toLowerCase()).indexOf("Laptop".toLowerCase()) !== -1) {
                $('.lapTopModal').modal('show');
                $("#idLaptopCategory").val($(this).val());
                $('#lapTopForm').removeClass().addClass("addLapTopForm");
                $('#lapTopForm #btnSubmit').removeClass().addClass("btn btn-primary btnSaveLapTopForm");
            } else {
                $('.otherModal').modal('show');
                $("#idOtherCategory").val($(this).val());
                $('#otherForm').removeClass().addClass("addOtherForm");
                $('#otherForm #btnSubmit').removeClass().addClass("btn btn-primary btnSaveOtherForm");
            }
            $(".modal-title").text("New Category" + label);

        }
        $(this).data("isopen", !open);
    });

    $(document).on('click', '#btnBrowseProduct', function (event) {
        event.preventDefault();
        $('.productTable tbody tr').remove();
        $('.pagination li').remove();
        getAllProducts(1);

    });


    // event - hide modal form
    $('.lapTopModal, .otherModal').on('hidden.bs.modal', function (e) {
        e.preventDefault();
        $("#idLaptopCategory, #idOtherCategory").val("");
        $("#idProductLapTop, #idOtherProduct").val("");

        $('#lapTopForm').removeClass().addClass("lapTopForm");
        $('#lapTopForm #btnSubmit').removeClass().addClass("btn btn-primary");
        $('#lapTopForm').trigger("reset");

        $('#otherForm').removeClass().addClass("otherForm");
        $('#otherForm #btnSubmit').removeClass().addClass("btn btn-primary");
        $('#otherForm').trigger("reset");
        $('input, textarea').next().remove();
    });

    // Save Form Laptop Event
    $(document).on('click', '.btnSaveLapTopForm', function (event) {
        event.preventDefault();
        ajaxPostLapTop();
        resetData();
    });

    function ajaxPostLapTop() {
        // PREPARE DATA
        const form = $('.addLapTopForm')[0];
        const data = new FormData(form);

        // do post
        $.ajax({
            async: false,
            type: "POST",
            contentType: "application/json",
            url: "http://localhost:8080/api/product/save",
            enctype: 'multipart/form-data',
            data: data,

            // prevent jQuery from automatically transforming the data into a query string
            processData: false,
            contentType: false,
            cache: false,
            timeout: 1000000,

            success: function (response) {
                if (response.status === "success") {
                    $('.lapTopModal').modal('hide');
                    alert("Added successfully");
                } else {
                    $('input, textarea').next().remove();
                    $.each(response.errorMessages, function (key, value) {
                        if (key !== "id") {
                            $('input[name=' + key + ']').after('<span class="error">' + value + '</span>');
                            $('textarea[name=' + key + ']').after('<span class="error">' + value + '</span>');
                        }
                        ;
                    });
                }

            },
            error: function (e) {
                alert("Error!")
                console.log("ERROR: ", e);
            }
        });
    }

    // btnSaveOtherForm event click
    $(document).on('click', '.btnSaveOtherForm', function (event) {
        event.preventDefault();
        ajaxPostOther();
        resetData();
    });

    function ajaxPostOther() {
        // PREPATEE DATA
        var form = $('.addOtherForm')[0];
        var data = new FormData(form);
        // do post
        $.ajax({
            async: false,
            type: "POST",
            contentType: "application/json",
            url: "http://localhost:8080/api/product/save",
            enctype: 'multipart/form-data',
            data: data,

            // prevent jQuery from automatically transforming the data into a
            // query string
            processData: false,
            // contentType: false,
            cache: false,
            timeout: 1000000,

            success: function (response) {
                if (response.status === "success") {
                    $('.otherModal').modal('hide');
                    alert("Added successfully");
                } else {
                    $('input, textarea').next().remove();
                    $.each(response.errorMessages, function (key, value) {
                        if (key !== "id") {
                            $('input[name=' + key + ']').after('<span class="error">' + value + '</span>');
                            $('textarea[name=' + key + ']').after('<span class="error">' + value + '</span>');
                        }
                        ;
                    });
                }

            },
            error: function (e) {
                alert("Error!")
                console.log("ERROR: ", e);
            }
        });
    }


    // clicking on updating laptop category
    $(document).on("click", ".btnUpdateLaptopProduct", function (event) {
        event.preventDefault();
        const productID = $(this).parent().prev().children().val();
        $('#lapTopForm').removeClass().addClass("updateLaptopForm");
        $('#lapTopForm #btnSubmit').removeClass().addClass("btn btn-primary btnUpdateLaptopForm");

        const href = "http://localhost:8080/api/product/" + productID;
        $.get(href, function (product) {
            populate('.updateLaptopForm', product);
            $("#idLaptopCategory").val(product.category.id);
            const manufacturerID = product.manufacturer.id;
            $("#manufacturerID").val(manufacturerID);
        });

        removeElementsByClass("error");
        $('.updateLaptopForm .lapTopModal').modal();
    });

    // btn update Laptop form Event
    $(document).on('click', '.btnUpdateLaptopForm', function (event) {
        event.preventDefault();
        postLaptopProduct();
        resetData();
    });

    function postLaptopProduct() {

        const form = $('.updateLaptopForm')[0];
        const data = new FormData(form);
        console.log(data);

        // do post
        $.ajax({
            async: false,
            type: "POST",
            contentType: "application/json",
            url: "http://localhost:8080/api/product/save",
            enctype: 'multipart/form-data',
            data: data,

            // prevent jQuery from automatically transforming the data into a
            // query string
            processData: false,
            // contentType: false,
            cache: false,
            timeout: 1000000,

            success: function (response) {
                if (response.status === "success") {
                    $('.lapTopModal').modal('hide');
                    alert("Update successfully");
                } else {
                    $('input, textarea').next().remove();
                    if (key !== "id") {
                        $('input[name=' + key + ']').after('<span class="error">' + value + '</span>');
                        $('textarea[name=' + key + ']').after('<span class="error">' + value + '</span>');
                    }
                    ;
                }

            },
            error: function (e) {
                alert("Error!")
                console.log("ERROR: ", e);
            }
        });
    }


    // other categories
    $(document).on("click", ".btnUpdateOther", function (event) {
        event.preventDefault();
        const productID = $(this).parent().prev().children().val();
        $('#otherForm').removeClass().addClass("updateOtherForm");
        $('#otherForm #btnSubmit').removeClass().addClass("btn btn-primary btnUpdateOtherForm");

        const href = "http://localhost:8080/api/product/" + productID;
        $.get(href, function (product) {
            populate('.updateOtherForm', product);
            $("#idOtherCategory").val(product.category.id);
            const manufacturerID = product.manufacturer.id;
            $("#manufacturerIdOther").val(manufacturerID);
        });
        removeElementsByClass("error");
        $('.updateOtherForm .otherModal').modal();
    });

    // btnUpdateOtherForm event click
    $(document).on('click', '.btnUpdateOtherForm', function (event) {
        event.preventDefault();
        putOtherProduct();
        resetData();
    });

    function putOtherProduct() {
        // PREPARE DATA
        const form = $('.updateOtherForm')[0];
        const data = new FormData(form);
        // do put
        $.ajax({
            async: false,
            type: "POST",
            contentType: "application/json",
            url: "http://localhost:8080/api/product/save",
            enctype: 'multipart/form-data',
            data: data,

            // prevent jQuery from automatically transforming the data into a
            // query string
            processData: false,
            contentType: false,
            cache: false,
            timeout: 1000000,

            success: function (response) {
                if (response.status === "success") {
                    $('.otherModal').modal('hide');
                    alert("Updated successfully");
                } else {
                    $('input, textarea').next().remove();
                    $.each(response.errorMessages, function (key, value) {
                        if (key !== "id") {
                            $('input[name=' + key + ']').after('<span class="error">' + value + '</span>');
                            $('textarea[name=' + key + ']').after('<span class="error">' + value + '</span>');
                        }
                        ;
                    });
                }

            },
            error: function (e) {
                alert("Error!")
                console.log("ERROR: ", e);
            }
        });
    }


    // clicking on delete button
    $(document).on("click", ".btnDeleteProduct", function () {

        const productID = $(this).parent().prev().children().val();
        const workingObject = $(this);

        const confirmation = confirm("Confirm to delete this product ?");
        if (confirmation) {
            $.ajax({
                async: false,
                type: "DELETE",
                url: "http://localhost:8080/api/product/delete/" + productID,
                success: function (resultMsg) {
                    resetDataForDelete();
                    alert("Deleted successfully");
                },
                error: function (e) {
                    console.log("ERROR: ", e);
                }
            });
        }
        resetData();
    });

    // clicking on detail button
    $(document).on("click", ".btnProductDetail", function () {

        const productID = $(this).parent().prev().children().val();
        console.log(productID);

        const href = "http://localhost:8080/api/product/" + productID;
        $.get(href, function (product) {
            $('.image').attr("src", "/product_images/" + product.id + ".png");
            $('.productName').html("<span style='font-weight: bold'>Product name: </span> " + product.productName);
            $('.productId').html("<span style='font-weight: bold'>Product ID: </span>" + product.id);
            $('.manufacturer').html("<span style='font-weight: bold'>Manufacturer: </span>" + product.manufacturer.manufacturerName);

            const categoryNameCheck = (product.category.categoryName.toLowerCase()).indexOf("Laptop".toLowerCase());

            console.log(categoryNameCheck !== -1);
            if (categoryNameCheck !== -1) {
                $('.cpu').html("<span style='font-weight: bold'>CPU: </span>" + product.cpu);
                $('.ram').html("<span style='font-weight: bold'>RAM: </span>" + product.ram);
                $('.design').html("<span style='font-weight: bold'>Design: </span>" + product.design);
                $('.batteryCapacity_mAh').html("<span style='font-weight: bold'>Battery capacity: </span>" + product.batteryCapacity_mAh);
                $('.operatingSystem').html("<span style='font-weight: bold'>OS: </span>" + product.operatingSystem);
                $('.screen').html("<span style='font-weight: bold'>Screen: </span>" + product.screen);
            }
            $('.generalInfor').html("<span style='font-weight: bold'>General Inforamation: </span>" + product.generalInfor);
            $('.price').html("<span style='font-weight: bold'>Price: </span>" + product.price);
            $('.warrantyInfor').html("<span style='font-weight: bold'>Warranty: </span>" + product.warrantyInfor);
            $('.warehouseUnit').html("<span style='font-weight: bold'>In stock: </span>" + product.warehouseUnit);
            $('.salesUnit').html("<span style='font-weight: bold'>Sold: </span>" + product.salesUnit);
        });

        $('#modalDetail').modal('show');

    });

    // reset table after delete
    function resetDataForDelete() {
        const count = $('.productTable tbody').children().length;
        $('.productTable tbody tr').remove();
        const page = $('li.active').children().text();
        $('.pagination li').remove();
        console.log(page);
        if (count === 1) {
            getAllProducts(page - 1);
        } else {
            getAllProducts(page);
        }

    };

    // reset table after post, put, filter
    function resetData() {
        const page = $('li.active').children().text();
        $('.productTable tbody tr').remove();
        $('.pagination li').remove();
        getAllProducts(page);
    }

    // event - clicking on product pagination
    $(document).on('click', '.pageNumber', function (event) {
        event.preventDefault();
        const page = $(this).text();
        $('.productTable tbody tr').remove();
        $('.pagination li').remove();
        getAllProducts(page);
    });


    // clicking on search by name
    $(document).on('keyup', '#searchById', function (event) {
        event.preventDefault();
        const productID = $('#searchById').val();
        console.log(productID);
        if (productID !== '') {
            $('.productTable tbody tr').remove();
            $('.pagination li').remove();
            const href = "http://localhost:8080/api/product/" + productID;
            $.get(href, function (product) {
                let productRow = '<tr>' +
                    '<td>' + '<img src="/product_images/' + product.id + '.png" class="img-responsive" style="height: 50px; width: 50px" />' + '</td>' +
                    '<td>' + product.productName + '</td>' +
                    '<td>' + product.category.categoryName + '</td>' +
                    '<td>' + product.manufacturer.manufacturerName + '</td>' +
                    '<td>' + product.price + '</td>' +
                    '<td>' + product.warehouseUnit + '</td>' +
                    '<td>' + '<input type="hidden" id="productId" value=' + product.id + '>' + '</td>' +
                    '<td><button class="btn btn-warning btnProductDetail" style="margin-right: 6px">Details</button>';

                const catNameCheck = (product.manufacturer.manufacturerName.toLowerCase()).indexOf("Laptop".toLowerCase());
                productRow += (catNameCheck !== -1) ? '  <button class="btn btn-primary btnUpdateLaptopProduct">Update</button>' : '<button class="btn btn-primary btnUpdateOrder" >Update</button>';
                productRow += ' <button class="btn btn-danger btnDeleteProduct">Delete</button></td>' + '</tr>';
                $('.productTable tbody').append(productRow);
            });
        } else {
            resetData();
        }
    });

    // fill input form với JSon Object
    function populate(frm, data) {
        $.each(data, function (key, value) {
            $('[name=' + key + ']', frm).val(value);
        });
    }

    // event - hide detail modal
    $('#modalDetail').on('hidden.bs.modal', function (e) {
        e.preventDefault();
        $(".formDetail p").text(""); // reset p tag
    });

    // remove element by class name
    function removeElementsByClass(className) {
        const elements = document.getElementsByClassName(className);
        while (elements.length > 0) {
            elements[0].parentNode.removeChild(elements[0]);
        }
    }

    (function ($) {
        $.fn.serializeFormJSON = function () {
            const o = {};
            const a = this.serializeArray();
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
