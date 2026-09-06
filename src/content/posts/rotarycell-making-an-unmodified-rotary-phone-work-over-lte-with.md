---
title: "RotaryCell: Making an unmodified rotary phone work over LTE with…"
description: "A practical look at RotaryCell: Making an unmodified rotary phone work over LTE with an ESP32-S3: what actually matters, how the options compare, and how to dec"
slug: rotarycell-making-an-unmodified-rotary-phone-work-over-lte-with
publishDate: 2026-09-03T06:31:14Z
category: consumer-tech
tags:
  - rotarycell
  - making
  - unmodified
  - rotary
  - phone
heroImage: /images/rotarycell-making-an-unmodified-rotary-phone-work-over-lte-with.jpg
heroImageAlt: "Retro rotary phone connected to a small ESP32‑S3 module with visible opto‑isolator wiring on a neutral desk"
author: "The HeyBlog Desk"
draft: true
sourceTopicId: topic_51072
---

## 1. Hardware Interface: Rotary Dial & Handset to ESP32‑S3  

| Option | Description | Safety | Cost (USD) | Wiring complexity | Reliability |
|--------|-------------|--------|------------|-------------------|-------------|
| **Opto‑isolated pulse detector** (e.g., PC817) | The rotary’s make‑contacts drive the LED of an optocoupler; the phototransistor provides a 3.3 V logic signal to the ESP32. | ★★★★★ – galvanic isolation of up to several kilovolts which meets IEC 60950‑1 isolation requirements for low‑voltage consumer equipment. | ★★☆☆☆ – a few dollars for the optocoupler, a resistor and a small PCB. | ★★☆☆☆ – needs a tiny board or perf‑board for the optocoupler and pull‑up network. | ★★★★★ – clean edges, immune to line‑noise and contact corrosion. |
| **Resistor‑divider pulse detector** | Two resistors form a divider that brings the rotary’s 12 V pulses down to ≤3.3 V, feeding a GPIO directly. | ★★☆☆☆ – the ESP32 pin is referenced to the phone’s supply; a protection diode is mandatory. | ★★★★★ – only two resistors and a diode. | ★★★★★ – a single pair of leads to the rotary contacts. | ★★☆☆☆ – voltage spikes and contact bounce can cause spurious edges. |
| **Hybrid (opto + RC debounce)** | A resistor divider feeds a small RC filter and a Schottky diode before the optocoupler, adding both isolation and spike suppression. | ★★★★★ – isolation plus over‑voltage protection. | ★★★☆☆ – modest part count increase. | ★★☆☆☆ – a few more components, still a simple board. | ★★★★★ – best for phones with heavily corroded contacts or noisy environments. |

**Core trade‑off** – Opto isolation provides the highest safety margin and the cleanest pulse edges, which matters when the rotary contacts are decades old and may generate irregular voltages. The resistor‑divider approach saves board area and component cost but requires careful clamping and may need additional filtering to avoid missed pulses.

### Wiring sketch (text description)

1. **Locate the two brass contacts** that close for each pulse of the rotary dial.  
2. **Opto‑isolated version**  
   * Connect one contact to the anode of a PC817 LED through a 330 Ω current‑limiting resistor.  
   * Connect the LED cathode to the phone’s 12 V line (the same line that powers the dial).  
   * The phototransistor collector attaches to ESP32‑S3 GPIO 22 with a 10 kΩ pull‑up to 3.3 V.  
   * The emitter is tied to ESP32 ground.  
3. **Resistor‑divider version**  
   * Series‑connect a 10 kΩ and a 2.2 kΩ resistor between the rotary contacts.  
   * Tap the junction to ESP32 GPIO 22 through a 1N4148 Schottky diode (clamps any over‑voltage).  
   * Add a 0.1 µF ceramic capacitor across the tap to smooth bounce.  

Both approaches require a **common ground** between the phone’s chassis (often tied to the 12 V return) and the ESP32 ground. Use a star‑ground point and place a 100 µF electrolytic capacitor close to the ESP32 to absorb transients.

---

## 2. Pulse Decoding & SIP Translation  

| Method | How it works | Timing accuracy | CPU load | Implementation effort |
|--------|--------------|----------------|----------|------------------------|
| **Interrupt‑driven counter** (GPIO edge interrupt) | Each falling edge increments a counter; a software timer detects a pause that marks the end of a digit. | ★★★★☆ – ESP32‑S3 ISR latency is low enough to provide a comfortable margin over the 10 ms pulse spacing. | ★★☆☆☆ – negligible after debounce. | ★★★☆☆ – small state machine and debounce logic. |
| **Polling with hardware timer** | A hardware timer samples the GPIO every 1 ms, counting high‑duration pulses. | ★★☆☆☆ – limited by the 1 ms poll interval; fast pulses on worn contacts can be missed. | ★★★☆☆ – timer ISR runs continuously. | ★★☆☆☆ – simpler code but less robust. |
| **External pulse‑to‑logic IC (e.g., LM567 tone decoder)** | The rotary pulse train drives a dedicated IC that outputs a clean digital pulse train. | ★★★★★ – hardware conditioning improves signal quality before the ESP32 sees it. | ★★★★★ – almost no CPU work. | ★★★★☆ – adds an IC and board space. |

**Recommendation** – Use the interrupt‑driven counter with a software debounce that ignores edges occurring very close together. In practice testing typically shows reliable pulse detection during repeated dialing of all digits.

### Example ISR‑based decoder (Arduino‑style)

```cpp
volatile uint8_t pulseCount = 0;
volatile uint64_t lastEdgeUs = 0;
volatile bool digitReady = false;
uint8_t digit = 0;

// ISR attached to GPIO22
void IRAM_ATTR pulse_isr() {
    uint64_t now = esp_timer_get_time();          // µs since boot
    if (now - lastEdgeUs < 5000) return;          // software debounce
    pulseCount++;
    lastEdgeUs = now;
}

// Timer callback every 20 ms (FreeRTOS software timer)
void digit_timer(void *arg) {
    if (pulseCount && (esp_timer_get_time() - lastEdgeUs) > 60000) { // pause indicates end of digit
        digit = (pulseCount == 10) ? 0 : pulseCount; // 10 pulses → digit 0
        pulseCount = 0;
        digitReady = true;
    }
}
```

When `digitReady` becomes true, push the digit into a queue that the SIP task consumes. For multi‑digit numbers, concatenate digits until the handset is hung up (detected by a separate switch on the cradle).

**DTMF generation** is not required for pure SIP dialing; the ESP32 can send the digit string directly to the SIP stack. If interaction with legacy PBX equipment is needed, the ESP32’s I2S peripheral can output a pair of sine waves (e.g., 697 Hz + 1209 Hz for “1”) through a simple low‑pass filter and the handset speaker line. The ESP32‑S3 can handle PCM DTMF tones, but higher‑complexity codecs such as Opus would need an external DSP or a reduced‑bitrate implementation and are therefore omitted.

---

## 3. LTE & SIP Integration on ESP32‑S3  

| LTE module | Interface | LTE bands (global) | Typical price (USD) | Documentation quality | Integration difficulty |
|------------|-----------|--------------------|---------------------|------------------------|------------------------|
| **Quectel EC25‑Mini** | UART (AT) + optional USB | 1, 3, 5, 7, 8, 20, 28 | varies | ★★★★★ – comprehensive AT‑command reference, many community examples. | ★★☆☆☆ – requires a separate 3.8 V supply and external antenna. |
| **SIM7600‑A** | UART + USB | 1, 3, 5, 7, 8, 20, 28, 38 | varies | ★★★★☆ – good English manuals, built‑in audio codec (useful for voice‑only apps). | ★★★☆☆ – larger footprint, peak current ≈ 2 A during transmit. |
| **u‑blox SARA‑R5** | UART | 1, 3, 5, 8, 20, 28 | varies | ★★★★☆ – IoT‑focused documentation, low‑power modes. | ★★★★☆ – fewer SIP‑focused examples, but AT commands are standard. |

All three modules use the standard AT command set for network registration, PDP context activation, and socket creation. The key practical differences are:

* **EC25‑Mini** – supports simultaneous voice and data, making it suitable for projects that may later add a handset audio path.  
* **SIM7600‑A** – includes an on‑board audio codec, allowing direct analog audio I/O without extra hardware.  
* **SARA‑R5** – offers the lowest average current in idle but lacks built‑in audio, so an external codec would be needed for voice.

### SIP stack choice

The ESP32‑S3 runs **pjsip**, a lightweight, widely‑used SIP library that compiles under ESP‑IDF. pjsip supports:

* TLS‑encrypted signaling (important for many commercial SIP providers).  
* STUN for NAT traversal.  
* G.711 PCM audio, which the ESP32‑S3 can handle via its I2S peripheral.  
* Opus is listed as a supported codec, but real‑time decoding on the ESP32‑S3 exceeds its RAM and CPU budget unless an external DSP is added; therefore the implementation focuses on G.711.

Alternatives such as **linphone** or **baresip** are larger and typically exceed the flash budget of the ESP32‑S3.

### Integration steps (ESP‑IDF)

1. **UART driver** – install a UART driver (`uart_driver_install`) at 115200 baud, 8N1.  
2. **Module initialization**  
   ```c
   // Enable radio
   at_cmd("AT+CFUN=1");
   // Wait for network registration
   while (!at_query("AT+CREG?") == 1) vTaskDelay(pdMS_TO_TICKS(500));
   // Set PDP context
   at_cmd("AT+CGDCONT=1,\"IP\",\"your.apn\"");
   // Activate data connection
   at_cmd("AT+CGACT=1,1");
   ```  
3. **Open a TCP socket** – (implementation continues as needed).
