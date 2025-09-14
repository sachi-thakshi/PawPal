package lk.ijse.gdse.back_end.config;


import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "payhere")
@Data
public class PayHereConfig {
    private String merchantId;
    private String merchantSecret;
    private String appId;
    private String appSecret;
    private String sandboxUrl;
    private String liveUrl;
    private String mode;
    private String returnUrl;
    private String cancelUrl;
    private String notifyUrl;
}
