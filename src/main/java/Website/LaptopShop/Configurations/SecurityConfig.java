package Website.LaptopShop.Configurations;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
	@Autowired
	private AuthenticationSuccessHandler successHandler;

	@Autowired
	private UserDetailsService userDetailsService;


	@Bean
	BCryptPasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	@Bean
	DaoAuthenticationProvider authProvider() {
		DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
		authProvider.setUserDetailsService(userDetailsService);
		authProvider.setPasswordEncoder(passwordEncoder());
		return authProvider;
	}

	@Bean
	AuthenticationManager authManager(HttpSecurity http) throws Exception {
		return http.getSharedObject(AuthenticationManagerBuilder.class)
				.authenticationProvider(authProvider())
				.build();
	}

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		http
				.csrf(AbstractHttpConfigurer::disable)
				.authorizeHttpRequests((requests) -> requests
						.requestMatchers("/admin/**").hasRole("ADMIN")
						.requestMatchers("/deliver/**").hasRole("DELIVER")
						.requestMatchers("/checkout", "/thankyou").hasRole("MEMBER")
						.requestMatchers("/**").permitAll())
				.formLogin((form) -> form.loginPage("/login")
						.loginProcessingUrl("/login")
						.usernameParameter("email")
						.passwordParameter("password")
						.successHandler(successHandler)
						.failureUrl("/login?error"))
				.logout((logout) -> logout.logoutUrl("/logout")
						.logoutSuccessUrl("/login?logout"))
				.exceptionHandling((exceptionHandling) -> {
					System.out.println(exceptionHandling.toString());
					exceptionHandling.accessDeniedPage("/login?accessDenied");
				});
		return http.build();
	}
}
