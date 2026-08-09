package com.ibs.airbook.deliver;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/deliver")
@RequiredArgsConstructor
public class DeliverController {

    private final DeliverService deliverService;

    @GetMapping("/boarding-pass/{ref}")
    public ResponseEntity<BoardingPassResponse> boardingPass(@PathVariable String ref) {
        return ResponseEntity.ok(deliverService.getBoardingPass(ref));
    }
}
