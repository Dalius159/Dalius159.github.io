package Website.LaptopShop.Entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.validation.constraints.NotEmpty;
import jakarta.persistence.*;
import lombok.Data;

import java.util.List;
@Entity()
@Data
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @NotEmpty(message="Category name can't be empty")
    private String categoryName;

    @JsonIgnore
    @OneToMany(mappedBy = "category")
    private List<Product> listProduct;
}
