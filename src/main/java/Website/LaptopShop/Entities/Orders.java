package Website.LaptopShop.Entities;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;

import java.util.Date;
import java.util.List;
@Entity
@NoArgsConstructor
@Data
public class Orders {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private String receiveAddress;
    private String note;
    private String receiver;

    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm", timezone = "GMT+7")
    private Date orderDate;

    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm", timezone = "GMT+7")
    private Date deliveryDate;

    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm", timezone = "GMT+7")
    private Date receivedDate;

    private String receivedPhone;
//  TODO: to enum (Waiting for Delivery, Canceled, Delivering, Waiting for approval, Completed)
    private String orderStatus;
    private long totalCost;

    @ManyToOne()
    @JoinColumn(name = "orderer_id")
    private Users orderer;

    @ManyToOne()
    @JoinColumn(name = "deliver_id")
    private Users deliver;

    @OneToMany(mappedBy = "order")
    private List<OrderDetails> orderDetailsList;
}
