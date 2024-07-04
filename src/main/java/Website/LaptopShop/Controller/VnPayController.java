package Website.LaptopShop.Controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.TreeMap;

@Controller
public class VnPayController {

    @PostMapping("/vnpay_payment")
    public ResponseEntity<Void> payment(@RequestParam Map<String, String> params, @RequestHeader("X-FORWARDED-FOR") String remoteAddr, Model model) {
        Map<String, String> requestData = new TreeMap<>();
        requestData.put("vnp_Version", "2.1.0");
        requestData.put("vnp_Command", "pay");
        requestData.put("vnp_TmnCode", "ALOOTST2");
        requestData.put("vnp_Amount", String.valueOf(Integer.parseInt(params.get("amount")) * 100));
        requestData.put("vnp_CurrCode", "VND");
        requestData.put("vnp_TxnRef", params.get("order_id"));
        requestData.put("vnp_OrderInfo", params.get("order_desc"));
        requestData.put("vnp_OrderType", "250000");
        requestData.put("vnp_Locale", "en");
        requestData.put("vnp_CreateDate", LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss")));
        requestData.put("vnp_IpAddr", remoteAddr);
        requestData.put("vnp_ReturnUrl", "http://localhost:8080/payment_return");

        String paymentUrl = getPaymentUrl(requestData);
        return ResponseEntity.status(302).header("Location", paymentUrl).build();
    }

    @GetMapping("/payment_return")
    public String paymentReturn(@RequestParam Map<String, String> params, Model model) {
        Map<String, String> responseData = new TreeMap<>(params);

        String vnp_ResponseCode = responseData.get("vnp_ResponseCode");
        String result = "00".equals(vnp_ResponseCode) ? "Thành công" : "Lỗi";

        if (!validateResponse(responseData)) {
            result = "Lỗi";
            responseData.put("msg", "Sai checksum");
        }

        model.addAttribute("title", "Kết quả thanh toán");
        model.addAttribute("result", result);
        model.addAttribute("order_id", responseData.get("vnp_TxnRef"));
        model.addAttribute("amount", Integer.parseInt(responseData.get("vnp_Amount")) / 100);
        model.addAttribute("order_desc", responseData.get("vnp_OrderInfo"));
        model.addAttribute("vnp_TransactionNo", responseData.get("vnp_TransactionNo"));
        model.addAttribute("vnp_ResponseCode", vnp_ResponseCode);
        model.addAttribute("msg", responseData.get("msg"));

        return "vnpay_payment_return"; // Tên của template
    }

    private String getPaymentUrl(Map<String, String> requestData) {
        StringBuilder hashData = new StringBuilder();
        requestData.forEach((key, value) -> hashData.append(key).append("=").append(java.net.URLEncoder.encode(value, StandardCharsets.UTF_8)).append("&"));
        String hashValue = hmacSHA512(hashData.toString());
        return "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?" + hashData + "vnp_SecureHash=" + hashValue;
    }

    private String hmacSHA512(String data) {
        try {
            String secretKey = "T1HIRMRZSK8GOD63QWYC4SOM1C1YGT9F";
            javax.crypto.Mac mac = javax.crypto.Mac.getInstance("HmacSHA512");
            javax.crypto.spec.SecretKeySpec secretKeySpec = new javax.crypto.spec.SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            mac.init(secretKeySpec);
            byte[] bytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hash = new StringBuilder();
            for (byte b : bytes) {
                hash.append(String.format("%02x", b));
            }
            return hash.toString();
        } catch (Exception e) {
            throw new RuntimeException("Failed to calculate HMAC SHA512", e);
        }
    }

    private boolean validateResponse(Map<String, String> responseData) {
        String secureHash = responseData.remove("vnp_SecureHash");
        responseData.remove("vnp_SecureHashType");
        StringBuilder hashData = new StringBuilder();
        responseData.forEach((key, value) -> hashData.append(key).append("=").append(java.net.URLEncoder.encode(value, StandardCharsets.UTF_8)).append("&"));
        return secureHash.equals(hmacSHA512(hashData.toString()));
    }
}