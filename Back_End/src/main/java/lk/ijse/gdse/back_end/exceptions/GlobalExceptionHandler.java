package lk.ijse.gdse.back_end.exceptions;

import io.jsonwebtoken.ExpiredJwtException;
import lk.ijse.gdse.back_end.dto.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(UsernameNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ApiResponse handleUsernameNotFoundException(UsernameNotFoundException ue){
        return new ApiResponse(
                404,
                "Not Found",
                ue.getMessage()
        );
    }

    @ExceptionHandler(BadCredentialsException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public ApiResponse handleBadCredentialsException(BadCredentialsException be){
        return new ApiResponse(
                401,
                "Unauthorized",
                "Invalid Username or Password" // be.getMessage()
        );
    }

    @ExceptionHandler(ExpiredJwtException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public ApiResponse handleExpiredJwtException(ExpiredJwtException ej){
        return new ApiResponse(
                401,
                "Unauthorized",
                "Session Expired" // ej.getMessage()
        );
    }

    @ExceptionHandler(RuntimeException.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ApiResponse handleRuntimeException(RuntimeException re){
        return new ApiResponse(
                500,
                "Internal Server Error",
                re.getMessage()
        );
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiResponse<String>> handleMaxSizeException(MaxUploadSizeExceededException ex) {
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE).body(
                new ApiResponse<>(
                        413,
                        "Payload Too Large",
                        "File too large! Please upload a smaller file."
                )
        );
    }

}
