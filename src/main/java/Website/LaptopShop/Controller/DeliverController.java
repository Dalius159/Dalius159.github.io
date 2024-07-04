package Website.LaptopShop.Controller;

import Website.LaptopShop.Entities.Users;
import Website.LaptopShop.Services.UserService;
import jakarta.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.SessionAttributes;

@Controller
@RequestMapping("/deliver")
@SessionAttributes("loggedInUser")
public class DeliverController {


    @Autowired
    private UserService userService;


    @ModelAttribute("loggedInUser")
    public Users loggedInUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return userService.findByEmail(auth.getName());
    }

    @GetMapping(value= {"", "/order"})
    public String deliverPage(Model model) {
        return "deliver/manageOrderDelivery";
    }

    @GetMapping("/profile")
    public String profilePage(Model model, HttpServletRequest request) {
        model.addAttribute("user", getSessionUser(request));
        System.out.println(getSessionUser(request).toString());
        return "deliver/profile";
    }

    @PostMapping("/profile/update")
    public String updateUser(@ModelAttribute Users user, HttpServletRequest request) {
        Users currentUser = getSessionUser(request);
        currentUser.setAddress(user.getAddress());
        currentUser.setFullName(user.getFullName());
        currentUser.setPhoneNumber(user.getPhoneNumber());
        userService.updateUser(currentUser);
        return "redirect:/deliver/profile";
    }

    public Users getSessionUser(HttpServletRequest request) {
        return (Users) request.getSession().getAttribute("loggedInUser");
    }
}