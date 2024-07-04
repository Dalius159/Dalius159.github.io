package Website.LaptopShop.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.net.URLEncoder;
import java.util.HashMap;
import java.util.Map;
import java.util.TreeMap;

@Controller
public class VnPayController {

    @PostMapping("/vnpay_payment")
    public ResponseEntity<Map<String, String>> payment(@RequestParam Map<String, String> params, HttpServletRequest request, Model model) {
        Map<String, String> requestData = new TreeMap<>();
        requestData.put("vnp_Version", "2.1.0");
        requestData.put("vnp_Command", "pay");
        requestData.put("vnp_TmnCode", "ALOOTST2");
        requestData.put("vnp_Amount", "1000000");
        requestData.put("vnp_CurrCode", "VND");
        requestData.put("vnp_TxnRef", LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss")));
        requestData.put("vnp_OrderInfo", "thanh tona don hang");
        requestData.put("vnp_OrderType", "other");
        requestData.put("vnp_Locale", "en");
        requestData.put("vnp_CreateDate", LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss")));
        requestData.put("vnp_IpAddr", "127.0.0.1");
        requestData.put("vnp_ReturnUrl", "http://localhost:8080/payment_return");

        String paymentUrl = getPaymentUrl(requestData);
        System.out.println(paymentUrl);
        Map<String, String> response = new HashMap<>();
        response.put("paymentUrl", paymentUrl);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/payment_return")
    public String paymentReturn(@RequestParam Map<String, String> params, Model model) {
        Map<String, String> responseData = new TreeMap<>(params);

        String vnp_ResponseCode = responseData.get("vnp_ResponseCode");
        String result = "00".equals(vnp_ResponseCode) ? "Success" : "Error";

        if (!validateResponse(responseData)) {
            result = "Error";
            responseData.put("msg", "Wrong checksum");
        }

        model.addAttribute("title", "Checkout Result");
        model.addAttribute("result", result);
        model.addAttribute("order_id", responseData.get("vnp_TxnRef"));
        model.addAttribute("amount", Integer.parseInt(responseData.get("vnp_Amount")) / 100);
        model.addAttribute("order_desc", responseData.get("vnp_OrderInfo"));
        model.addAttribute("vnp_TransactionNo", responseData.get("vnp_TransactionNo"));
        model.addAttribute("vnp_ResponseCode", vnp_ResponseCode);
        model.addAttribute("msg", responseData.get("msg"));

        return "vnpay_payment_return";
    }

    private String getPaymentUrl(Map<String, String> requestData) {
        StringBuilder hashData = new StringBuilder();
        requestData.forEach((key, value) -> hashData.append(key).append("=").append(java.net.URLEncoder.encode(value, StandardCharsets.UTF_8)).append("&"));
        String hashValue = hmacsha512(hashData.toString());
        return "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?" + hashData + "vnp_SecureHash=" + hashValue;
    }

    private static final String SECRET_KEY = "T1HIRMRZSK8GOD63QWYC4SOM1C1YGT9F";

    public static String hmacsha512(String data) {
        try {
            Mac sha512Hmac = Mac.getInstance("HmacSHA512");
            SecretKeySpec keySpec = new SecretKeySpec(SECRET_KEY.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            sha512Hmac.init(keySpec);
            byte[] macData = sha512Hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(macData.length * 2);
            for (byte b : macData) {
                sb.append(String.format("%02x", b & 0xff));
            }
            return sb.toString();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    private boolean validateResponse(Map<String, String> responseData) {
        String secureHash = responseData.remove("vnp_SecureHash");
        responseData.remove("vnp_SecureHashType");
        StringBuilder hashData = new StringBuilder();
        responseData.forEach((key, value) -> hashData.append(key).append("=").append(java.net.URLEncoder.encode(value, StandardCharsets.UTF_8)).append("&"));
        return secureHash.equals(hmacsha512(hashData.toString()));
    }
}
