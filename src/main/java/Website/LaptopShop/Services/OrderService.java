package Website.LaptopShop.Services;

import Website.LaptopShop.DTO.SearchOrderObject;
import Website.LaptopShop.Entities.Orders;
import Website.LaptopShop.Entities.Users;
import org.springframework.data.domain.Page;

import java.text.ParseException;
import java.util.List;

public interface OrderService {
    Page<Orders> getAllOrderByFilter(SearchOrderObject object, int page) throws ParseException;

    Orders findById(long id);

    Orders save(Orders order);

    List<Object> getOrderByMonthAndYear();

    List<Orders> getOrderByUser(Users user);

    Orders findLatestOrderByOrdererID(Long ordererID);

    List<Orders> findByOrderStatusAndDeliver(String status,Users deliver);

    Page<Orders> findOrderByDeliver(SearchOrderObject object, int page, Users deliver) throws ParseException;

    int countByOrderStatus(String orderStatus);
}
