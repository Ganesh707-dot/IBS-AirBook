package com.ibs.airbook.settle;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settle")
@RequiredArgsConstructor
public class SettleController {

    private final SettleService settleService;

    @PostMapping
    public ResponseEntity<SettleResponse> settle(@Valid @RequestBody SettleRequest request) {
        return ResponseEntity.ok(settleService.settle(request));
    }
}
