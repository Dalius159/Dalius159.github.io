$(document).ready(function () {
    getAllOrders(1);

    function getAllOrders(page) {
        const data = {
            status: $('#trangThai').val(),
            fromDate: $('#fromDate').val(),
            toDate: $('#toDate').val(),
            deliverID: $('#idShipper').val()
        };
        $.ajax({
            type: "GET",
            data: data,
            contentType: "application/json",
            url: "http://localhost:8080/api/deliver/order/all" + '?page=' + page,
            success: function (result) {
                $.each(result.content, function (i, order) {
                    let orderGrossValue = 0;
                    if (order.orderStatus === "Completed" || order.orderStatus === "Waiting for approval") {
                        $.each(order.orderDetailsList, function (i, orderDetails) {
                            orderGrossValue += orderDetails.cost * orderDetails.receivedQuantity;
                        });
                    } else {
                        $.each(order.orderDetailsList, function (i, orderDetails) {
                            orderGrossValue += orderDetails.cost * orderDetails.orderQuantity;
                        });
                    }
                    let orderRow = '<tr>' +
                        '<td>' + order.id + '</td>' +
                        '<td>' + order.receiver + '</td>' +
                        '<td>' + order.orderStatus + '</td>' +
                        '<td>' + orderGrossValue + '</td>' +
                        '<td>' + order.orderDate + '</td>' +
                        '<td>' + order.deliveryDate + '</td>' +
                        '<td>' + order.receivedDate + '</td>' +
                        '<td>' + '<input type="hidden" class="donHangId" value=' + order.id + '>' + '</td>' +
                        '<td><button class="btn btn-primary btnChiTiet" >Detail</button>';
                    if (order.orderStatus == "Delivering") {
                        orderRow += ' &nbsp;<button class="btn btn-warning btnCapNhat" >Update</button> </td>';
                    }


                    $('.donHangTable tbody').append(orderRow);

                    $('td').each(function (i) {
                        if ($(this).html() === 'null') {
                            $(this).html('');
                        }
                    });
                });

                if (result.totalPages > 1) {
                    for (let numberPage = 1; numberPage <= result.totalPages; numberPage++) {
                        const li = '<li class="page-item "><a class="pageNumber">' + numberPage + '</a></li>';
                        $('.pagination').append(li);
                    }

                    // active page pagination
                    $(".pageNumber").each(function (index) {
                        if ($(this).text() === page) {
                            $(this).parent().removeClass().addClass("page-item active");
                        }
                    });
                }
                ;
            },
            error: function (e) {
                alert("Error: while getting request for /all orders");
                console.log("Error", e);
            }
        });
    };

    $(document).on('click', '#btnDuyetDonHang', function (event) {
        event.preventDefault();
        resetData();
    });


    // clicking on pagination
    $(document).on('click', '.pageNumber', function (event) {
//		event.preventDefault();
        const page = $(this).text();
        $('.donHangTable tbody tr').remove();
        $('.pagination li').remove();
        getAllOrders(page);
    });

    // clicking on search for order by id
    $(document).on('keyup', '#searchById', function (event) {
        event.preventDefault();
        const orderID = $('#searchById').val();
        console.log(orderID);
        if (orderID !== '') {
            $('.donHangTable tbody tr').remove();
            $('.pagination li').remove();
            const href = "http://localhost:8080/api/deliver/order/" + orderID;
            $.get(href, function (order) {
                let orderGrossValue = 0;
                $.each(order.orderDetailsList, function (i, orderDetail) {
                    orderGrossValue += orderDetail.cost * orderDetail.orderQuantity;
                });

                let orderRow = '<tr>' +
                    '<td>' + order.id + '</td>' +
                    '<td>' + order.receiver + '</td>' +
                    '<td>' + order.orderStatus + '</td>' +
                    '<td>' + orderGrossValue + '</td>' +
                    '<td>' + order.orderDate + '</td>' +
                    '<td>' + order.deliveryDate + '</td>' +
                    '<td>' + order.receivedDate + '</td>' +
                    '<td>' + '<input type="hidden" id="donHangId" value=' + order.id + '>' + '</td>' +
                    '<td><button class="btn btn-primary btnChiTiet" >Detail</button>';

                if (order.orderStatus === "Delivering") {
                    orderRow += ' &nbsp;<button class="btn btn-warning btnCapNhat" >Update</button> </td>';
                }

                $('.donHangTable tbody').append(orderRow);
                $('td').each(function (i) {
                    if ($(this).html() === 'null') {
                        $(this).html('');
                    }
                });
            });
        } else {
            resetData();
        }
    });

    // clicking on order detail
    $(document).on('click', '.btnChiTiet', function (event) {
        event.preventDefault();
        const orderID = $(this).parent().prev().children().val();
        const href = "http://localhost:8080/api/deliver/order/" + orderID;
        $.get(href, function (order) {
            $('#orderID').text("Order ID: " + order.id);
            $('#receveiverName').text("Receiver: " + order.receiver);
            $('#receveiverPhoneNum').text("Phone number: " + order.receivedPhone);
            $('#receveiverAddress').text("Address: " + order.receiveAddress);
            $('#orderStatus').text("Order status: " + order.orderStatus);
            $("#orderPlacementDate").text("Order date: " + order.orderDate);

            if (order.deliveryDate != null) {
                $("#deliveryDate").text("Delivery date: " + order.deliveryDate);
            }

            if (order.receivedDate != null) {
                $("#orderRetrievalDate").text("Retrieval date: " + order.receivedDate);
            }

            if (order.note != null) {
                $("#ghiChu").text("Note: " + order.note);
            }

            if (order.orderer != null) {
                $("#nguoiDat").text("Ordering customer: " + order.orderer.hoTen);
            }

            if (order.shipper != null) {
                $("#shipper").text("Shipper: " + order.shipper.fullName);
            }

            const check = order.orderStatus === "Completed" || order.orderStatus === "Waiting for approval";
            if (check) {
                $('.detailTable').find('thead tr')
                    .append('<th id="soLuongNhanTag" class="border-0 text-uppercase small font-weight-bold">Received</th>');
            }
            let sum = 0;
            let no = 1;
            $.each(order.orderDetailsList, function (i, oderDetails) {
                console.log(oderDetails.orderQuantity);
                let detailRow = '<tr>' +
                    '<td>' + no + '</td>' +
                    '<td>' + oderDetails.product.productName + '</td>' +
                    '<td>' + oderDetails.cost + '</td>' +
                    '<td>' + oderDetails.orderQuantity + '</td>';

                if (check) {
                    detailRow += '<td>' + oderDetails.receivedQuantity + '</td>';
                    sum += oderDetails.cost * oderDetails.receivedQuantity;
                } else {
                    sum += oderDetails.cost * oderDetails.orderQuantity;
                }

                $('.detailTable tbody').append(detailRow);
                no++;
            });
            $("#tongTienCapNhat").text("Total : " + sum);
        });
        $("#modalDetail").modal();
    });

    // event khi ẩn modal chi tiết
    $('#modalDetail, #modalUpdateStatus').on('hidden.bs.modal', function (e) {
        e.preventDefault();
        $("#chiTietForm p").text(""); // reset text thẻ p
        $("#capNhatTrangThaiForm h4").text(""); // reset text thẻ p
        $('.detailTable tbody tr').remove();
        $('.detailTable #soLuongNhanTag').remove();
        $('.chiTietCapNhatTable tbody tr').remove();
    });

    // clicking on update order
    $(document).on('click', '.btnCapNhat', function (event) {
        event.preventDefault();
        const orderID = $(this).parent().prev().children().val();
        $("#donHangId").val(orderID);
        const href = "http://localhost:8080/api/deliver/order/" + orderID;
        $.get(href, function (order) {
            let no = 1;
            $.each(order.orderDetailsList, function (i, orderDetails) {
                const detailRow = '<tr>' +
                    '<td>' + no + '</td>' +
                    '<td>' + orderDetails.product.productName + '</td>' +
                    '<td>' + orderDetails.cost + '</td>' +
                    '<td>' + orderDetails.orderQuantity + '</td>' +
                    '<td><input type="number" class="soLuongNhan" style="width: 40px; text-align: center;" value ="' + orderDetails.orderQuantity + '" min="0" max="' + orderDetails.orderQuantity + '" ></td>' +
                    '<td><input type="hidden" value="' + orderDetails.id + '" ></td>';
                $('.chiTietCapNhatTable tbody').append(detailRow);
                no++;
            });
            var sum = 0;
            $.each(order.orderDetailsList, function (i, orderDetails) {
                sum += orderDetails.cost * orderDetails.orderQuantity;
            });
            $("#tongTienCapNhat").text("Total : " + sum);
        });
        $("#modalUpdateStatus").modal();
    });

    //
    $(document).on('change', '.soLuongNhan', function (event) {
        const table = $(".chiTietCapNhatTable tbody");
        let sum = 0;
        table.find('tr').each(function (i) {
            let price = $(this).find("td:eq(2)").text();
            let updatedQuantity = $(this).find("td:eq(4) input[type='number']").val();
            sum += price * updatedQuantity;
        });
        $("#tongTienCapNhat").text("Total : " + sum);

    });

    $(document).on('click', '#btnConfirm', function (event) {
        event.preventDefault();
        postUpdateOrder();
        resetData();
    });

    // post request update order
    function postUpdateOrder() {

        const detailsList = [];
        const table = $(".chiTietCapNhatTable tbody");
        table.find('tr').each(function (i) {
            const details = {
                detailsID: $(this).find("td:eq(5) input[type='hidden']").val(),
                receivedQuantity: $(this).find("td:eq(4) input[type='number']").val()
            };
            detailsList.push(details);
        });


        const data = {
            orderID: $("#donHangId").val(),
            deliverNote: $("#delivererNote").val(),
            updateOrderDetailsList: detailsList
        };
//    	 console.log(data);
        $.ajax({
            async: false,
            type: "POST",
            contentType: "application/json",
            url: "http://localhost:8080/api/deliver/order/update",
            enctype: 'multipart/form-data',

            data: JSON.stringify(data),
            // dataType : 'json',
            success: function (response) {
                $("#modalUpdateStatus").modal('hide');
                alert("Order status updattd");
            },
            error: function (e) {
                alert("Error!")
                console.log("ERROR: ", e);
            }
        });
    }

    // reset table after post, put, filter
    function resetData() {
        const page = $('li.active').children().text();
        console.log(page);
        $('.donHangTable tbody tr').remove();
        $('.pagination li').remove();
        getAllOrders(1);
    }
});