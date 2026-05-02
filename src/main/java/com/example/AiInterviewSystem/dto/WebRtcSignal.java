package com.example.AiInterviewSystem.dto;

import com.fasterxml.jackson.annotation.JsonRawValue;
import com.fasterxml.jackson.annotation.JsonSetter;
import lombok.Data;
 
@Data
public class WebRtcSignal {
    // OFFER | ANSWER | ICE_CANDIDATE
    private String type;
 
    // set by server from Principal — ignored from client
    private String from;
 
    // target peer email
    private String to;
 
    // Raw JSON payload — either RTCSessionDescription or RTCIceCandidate
    // JsonRawValue preserves nested JSON without double-serialization
    @JsonRawValue
    private String payload;
 
    @JsonSetter("payload")
    public void setPayloadRaw(Object payload) {
        if (payload instanceof String s) {
            this.payload = s;
        } else {
            try {
                this.payload = new com.fasterxml.jackson.databind.ObjectMapper()
                        .writeValueAsString(payload);
            } catch (Exception e) {
                this.payload = "{}";
            }
        }
    }
}