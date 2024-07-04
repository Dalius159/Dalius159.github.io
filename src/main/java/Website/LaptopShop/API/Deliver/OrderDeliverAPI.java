package Website.LaptopShop.API.Deliver;

import Website.LaptopShop.DTO.SearchOrderObject;
import Website.LaptopShop.DTO.UpdateOrderDeliver;
import Website.LaptopShop.Entities.OrderDetails;
import Website.LaptopShop.Entities.Orders;
import Website.LaptopShop.Entities.Users;
import Website.LaptopShop.Services.OrderService;
import Website.LaptopShop.Services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;

@RestController
@RequestMapping("/api/deliver/order")
public class OrderDeliverAPI {
    @Autowired
    private OrderService orderService;

    @Autowired
    private UserService userService;

    @GetMapping("/all")
    public Page<Orders> getOrderByFilter(@RequestParam(defaultValue = "1") int page,
                                         @RequestParam String status,
                                         @RequestParam String fromDate,
                                         @RequestParam String toDate,
                                         @RequestParam long deliverID) throws ParseException {

        SearchOrderObject object = new SearchOrderObject();
        object.setToDate(toDate);
        object.setOrderStatus(status);
        object.setFromDate(fromDate);

        Users deliver = userService.findById(deliverID);
        return orderService.findOrderByDeliver(object, page, deliver);
    }

    @GetMapping("/{id}")
    public Orders getOrderById(@PathVariable long id) {
        return orderService.findById(id);
    }

    @PostMapping("/update")
    public void updateOrderStatus(@RequestBody UpdateOrderDeliver updateOrderDeliver) {
        Orders order = orderService.findById(updateOrderDeliver.getOrderID());

        for (OrderDetails details : order.getOrderDetailsList()) {
            for (UpdateOrderDeliver.UpdateOrderDetails updateDetails : updateOrderDeliver.getUpdateOrderDetailsList()) {
                if (details.getId() == updateDetails.getDetailsID()) {
                    details.setReceivedQuantity(updateDetails.getReceivedQuantity());
                }
            }
        }

        SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        try {

            String dateStr = format.format(new Date());
            Date date = format.parse(dateStr);
            order.setReceivedDate(date);
        } catch (ParseException e) {
            e.printStackTrace();
        }

        order.setOrderStatus("Waiting for approval");
        String note = updateOrderDeliver.getDeliverNote();

        if (!note.equals("")) {
            order.setNote("Delivery note: \n" + updateOrderDeliver.getDeliverNote());
        }
        orderService.save(order);

    }
}
