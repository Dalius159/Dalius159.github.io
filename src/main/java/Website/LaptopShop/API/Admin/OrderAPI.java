package Website.LaptopShop.API.Admin;

import Website.LaptopShop.DTO.SearchOrderObject;
import Website.LaptopShop.Entities.OrderDetails;
import Website.LaptopShop.Entities.Orders;
import Website.LaptopShop.Entities.Product;
import Website.LaptopShop.Services.OrderService;
import Website.LaptopShop.Services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;


@RestController
@RequestMapping("/api/order")
public class OrderAPI {

    @Autowired
    private OrderService orderService;

    @Autowired
    private UserService userService;

    //Get orderList by search object
    @GetMapping("/all")
    public Page<Orders> getOrderByFilter(@RequestParam(defaultValue = "1") int page,
                                         @RequestParam String status,
                                         @RequestParam String fromDate,
                                         @RequestParam String toDate) throws ParseException {

        SearchOrderObject object = new SearchOrderObject();
        object.setToDate(toDate);
        object.setOrderStatus(status);
        object.setFromDate(fromDate);
        return orderService.getAllOrderByFilter(object, page);
    }

    @GetMapping("/{id}")
    public Orders getOrderById(@PathVariable long id) {
        return orderService.findById(id);
    }

    // order assignment
    @PostMapping("/assign")
    public void orderAssignment(@RequestParam("deliverEmail") String deliverEmail,
                                @RequestParam("orderID") long orderID) {
        Orders order = orderService.findById(orderID);
        order.setOrderStatus("Delivering");
        order.setDeliver(userService.findByEmail(deliverEmail));

        SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        try {
            String dateStr = format.format(new Date());
            Date date = format.parse(dateStr);
            order.setDeliveryDate(date);
        } catch (ParseException e) {e.printStackTrace();}

        orderService.save(order);
    }

    // Order completed confirm
    @PostMapping("/update")
    public void orderComplete(@RequestParam("orderID") long orderID,
                              @RequestParam("adminNote") String adminNote) {
        Orders order = orderService.findById(orderID);

        for (OrderDetails detail : order.getOrderDetailsList()) {
            Product product = detail.getProduct();
            product.setSalesUnit(product.getSalesUnit() + detail.getReceivedQuantity());
            product.setWarehouseUnit(product.getWarehouseUnit() - detail.getReceivedQuantity());
        }
        order.setOrderStatus("Completed");
        String note = order.getNote();
        if (!adminNote.equals("")) {
            note += "<br> Admin Note:\n" + adminNote;
        }
        order.setNote(note);
        orderService.save(order);
    }

    // Order canceled confirm
    @PostMapping("/cancel")
    public void orderCanceled(@RequestParam("orderID") long orderID) {
        Orders dh = orderService.findById(orderID);
        dh.setOrderStatus("Canceled");
        orderService.save(dh);
    }

    // Get data for statistical reports
    @GetMapping("/report")
    public List<Object> test() {
        return orderService.getOrderByMonthAndYear();
    }
}
