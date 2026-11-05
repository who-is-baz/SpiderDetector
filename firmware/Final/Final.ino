// Recibe una letra por serial desde la página (S, V, A o N) y mueve el servo,
// los LEDs y el buzzer según el grupo detectado.

#define LED_RED 13
#define LED_GREEN 26
#define LED_YELLOW 25
#define BUZZER 14
#define SERVO 27

const unsigned long BEEP_MS = 400;   // el buzzer alterna cada 400 ms en Anomalía
const int STEP_MS = 15;              // 1 grado cada 15 ms para que el servo no dé tirones

char state = 'N';
int target = 90;
int current = 90;
unsigned long lastBeep = 0;
bool buzzerOn = false;

// servo a 50 Hz con PWM de 16 bits: 0° = 500 us y 180° = 2500 us de un periodo de 20000 us
void moveServo(int deg) {
  int us = 500 + deg * 2000 / 180;
  ledcWrite(SERVO, us * 65535L / 20000);
}

// ignoro cualquier otro byte (por ejemplo saltos de línea)
void readSerial() {
  if (!Serial.available()) return;
  char c = Serial.read();
  if (c == 'S' || c == 'V' || c == 'A' || c == 'N') {
    state = c;
  }
}

void updateLeds() {
  digitalWrite(LED_GREEN, state == 'S');
  digitalWrite(LED_RED, state == 'A');
  digitalWrite(LED_YELLOW, state == 'V');
}

// S = 30°, V = 90°, A = 150°, N = 90°
int angleFor(char s) {
  if (s == 'S') return 30;
  if (s == 'V') return 90;
  if (s == 'A') return 150;
  return 90;
}

// uso millis() en vez de delay() para que el servo siga moviéndose mientras suena
void updateBuzzer() {
  if (state != 'A') {
    digitalWrite(BUZZER, LOW);
    buzzerOn = false;
    return;
  }
  if (millis() - lastBeep > BEEP_MS) {
    buzzerOn = !buzzerOn;
    digitalWrite(BUZZER, buzzerOn);
    lastBeep = millis();
  }
}

void stepServo() {
  if (current < target) {
    current++;
  } else if (current > target) {
    current--;
  }
  moveServo(current);
}

void setup() {
  Serial.begin(115200);
  pinMode(LED_RED, OUTPUT);
  pinMode(LED_GREEN, OUTPUT);
  pinMode(LED_YELLOW, OUTPUT);
  pinMode(BUZZER, OUTPUT);
  ledcAttach(SERVO, 50, 16);
  moveServo(90);
}

void loop() {
  readSerial();
  updateLeds();
  target = angleFor(state);
  updateBuzzer();
  stepServo();
  delay(STEP_MS);
}
