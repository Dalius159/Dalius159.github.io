package Website.LaptopShop.Services.Impl;

import Website.LaptopShop.DTO.SearchOrderObject;
import Website.LaptopShop.Entities.Orders;
import Website.LaptopShop.Entities.QOrders;
import Website.LaptopShop.Entities.Users;
import Website.LaptopShop.Repositories.OrderRepository;
import Website.LaptopShop.Services.OrderService;
import com.querydsl.core.BooleanBuilder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.List;

@Service
public class OrderServiceImpl implements OrderService {
    @Autowired
    private OrderRepository Rep;

    @Override
    public Page<Orders> getAllOrderByFilter(SearchOrderObject object, int page) throws ParseException {
        BooleanBuilder builder = new BooleanBuilder();

        String orderStatus = object.getOrderStatus();
        String fromDate = object.getFromDate();
        String toDate = object.getToDate();
        SimpleDateFormat formatDate = new SimpleDateFormat("dd-MM-yyyy");

        if (!orderStatus.equals("")) {
            builder.and(QOrders.orders.orderStatus.eq(orderStatus));
        }

        if (!fromDate.equals("")) {
            if (orderStatus.equals("") || orderStatus.equals("Waiting for Delivery") || orderStatus.equals("Canceled")) {
                builder.and(QOrders.orders.orderDate.goe(formatDate.parse(fromDate)));
            } else if (orderStatus.equals("Delivering")) {
                builder.and(QOrders.orders.deliveryDate.goe(formatDate.parse(fromDate)));
            } else { // completed
                builder.and(QOrders.orders.receivedDate.goe(formatDate.parse(fromDate)));
            }
        }

        if (!toDate.equals("")) {
            if (orderStatus.equals("") || orderStatus.equals("Waiting for Delivery") || orderStatus.equals("Canceled")) {
                builder.and(QOrders.orders.orderDate.loe(formatDate.parse(toDate)));
            } else if (orderStatus.equals("Delivering")) {
                builder.and(QOrders.orders.deliveryDate.loe(formatDate.parse(toDate)));
            } else {
                builder.and(QOrders.orders.receivedDate.loe(formatDate.parse(toDate)));
            }
        }

        return Rep.findAll(builder, PageRequest.of(page - 1, 9));
    }

    @Override
    public Orders findById(long id) {
        return Rep.findById(id).get();
    }

    @Override
    public Orders save(Orders order) {
        return Rep.save(order);
    }

    @Override
    public List<Object> getOrderByMonthAndYear() {
        return Rep.getOrderByMonthAndYear();
    }

    @Override
    public List<Orders> getOrderByUser(Users user) {
        return Rep.findByOrderer(user);
    }

    @Override
    public Orders findLatestOrderByOrdererID(Long ordererID) {
        return Rep.findLatestOrderByOrdererID(ordererID);
    }

    @Override
    public List<Orders> findByOrderStatusAndDeliver(String status, Users deliver) {
        return Rep.findByOrderStatusAndDeliver(status, deliver);
    }

    @Override
    public Page<Orders> findOrderByDeliver(SearchOrderObject object, int page, Users deliver) throws ParseException {
        BooleanBuilder builder = new BooleanBuilder();

        String orderStatus = object.getOrderStatus();
        String fromDate = object.getFromDate();
        String toDate = object.getToDate();
        SimpleDateFormat formatDate = new SimpleDateFormat("dd-MM-yyyy");

        builder.and(QOrders.orders.deliver.eq(deliver));

        if (!orderStatus.equals("")) {
            builder.and(QOrders.orders.orderStatus.eq(orderStatus));
        }

        if (!fromDate.equals("")) {
            if (orderStatus.equals("Delivering")) {
                builder.and(QOrders.orders.deliveryDate.goe(formatDate.parse(fromDate)));
            } else { // completed
                builder.and(QOrders.orders.receivedDate.goe(formatDate.parse(fromDate)));
            }
        }

        if (!toDate.equals("")) {
            if (orderStatus.equals("Delivering")) {
                builder.and(QOrders.orders.deliveryDate.loe(formatDate.parse(toDate)));
            } else { // completed
                builder.and(QOrders.orders.receivedDate.loe(formatDate.parse(toDate)));
            }
        }

        return Rep.findAll(builder, PageRequest.of(page - 1, 9));
    }

    @Override
    public int countByOrderStatus(String orderStatus) {
        return Rep.countByOrderStatus(orderStatus);
    }
}
