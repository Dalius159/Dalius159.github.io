package Website.LaptopShop.Controller;

import Website.LaptopShop.DTO.ListAssignmentDTO;
import Website.LaptopShop.DTO.SearchContactObject;
import Website.LaptopShop.Entities.Contact;
import Website.LaptopShop.Entities.Manufacturer;
import Website.LaptopShop.Entities.Roles;
import Website.LaptopShop.Entities.Users;
import Website.LaptopShop.Services.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Controller
@RequestMapping("/admin")
@SessionAttributes("loggedInUser")
public class AdminController {
    @Autowired
    private CategoryService categoryService;

    @Autowired
    private ManufacturerService manufacturerService;

    @Autowired
    private UserService userService;

    @Autowired
    private RoleService roleService;

    @Autowired
    private ContactService contactService;

    @Autowired
    private OrderService orderService;

    @ModelAttribute("loggedInUser")
    public Users loggedInUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return userService.findByEmail(auth.getName());
    }

    public Users getSessionUser(HttpServletRequest request) {
        return (Users) request.getSession().getAttribute("loggedInUser");
    }

    @GetMapping
    public String adminPage(Model model) {
        ListAssignmentDTO listAssignment = new ListAssignmentDTO();
        listAssignment.setNewOrderQuantity(orderService.countByOrderStatus("Waiting for Delivery"));
        listAssignment.setOrderPendingApprovalQuantity(orderService.countByOrderStatus("Waiting for approval"));
        listAssignment.setNewContactQuantity(contactService.countByStatus("Waiting for respond"));

        model.addAttribute("listAssignment", listAssignment);
        return "admin/adminPage";
    }

    @GetMapping("/category")
    public String manageCategoryPage() { return "admin/manageCategory";}

    @GetMapping("/manufacturer")
    public String manageManufacturerPage() {return "admin/manageManufacturer";}

    @GetMapping("/contact")
    public String manageContactPage() { return "admin/manageContact";}

    @GetMapping("/product")
    public String manageProductPage(Model model) {
        model.addAttribute("manufacturerList", manufacturerService.getALlManufacturer());
        model.addAttribute("categoryList", categoryService.getAllCategory());
        return "admin/manageProduct";
    }

    @GetMapping("/profile")
    public String profilePage(Model model, HttpServletRequest request) {
        model.addAttribute("user", getSessionUser(request));
        return "admin/profile";
    }

    @PostMapping("/profile/update")
    public String updateUser(@ModelAttribute Users u, HttpServletRequest request) {
        Users currentUser = getSessionUser(request);
        currentUser.setAddress(u.getAddress());
        currentUser.setFullName(u.getFullName());
        currentUser.setPhoneNumber(u.getPhoneNumber());
        userService.updateUser(currentUser);
        return "redirect:/admin/profile";
    }

    @GetMapping("/order")
    public String manageOrderPage(Model model) {
        Set<Roles> role = new HashSet<>();
        role.add(roleService.findByRoleName("ROLE_DELIVER"));
        List<Users> delivers = userService.getUserByRole(role);
        for (Users deliver : delivers) {
            deliver.setListOrders(orderService.findByOrderStatusAndDeliver("Delivering", deliver));
        }
        model.addAttribute("allDeliver", delivers);
        return "admin/manageOrder";
    }

    @GetMapping("/account")
    public String manageAccountPage(Model model) {
        model.addAttribute("roleList", roleService.findAllRole());
        return "admin/manageAccount";
    }

    @GetMapping("/statistics")
    public String statisticalPage(Model model) { return "admin/statistics";}


    @PostMapping("/save")
    public ResponseEntity<?> saveManufacturer(@RequestBody Manufacturer manufacturer) {
        try {
            Manufacturer savedManufacturer = manufacturerService.save(manufacturer);
            return ResponseEntity.ok(savedManufacturer);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
