export default function Keyboard() {
    let state = new Uint8Array(256);
    this.handleEvent = function(e) {
        if(e.keyCode >= 256) {
            return;
        }
        if(e.type === 'keydown') {
            state[e.keyCode] |= 3;
        } else {
            state[e.keyCode] = (state[e.keyCode] & 2) | 4;
        }
    };
    
    this.endFrame = function() {
        for(let i = 0; i < 256; ++i) {
            state[i] &= 1;
        }
    };
    
    this.isPressed = function(key) {
        if(key < 0 || key >= 256) {
            return false;
        }
        return (state[key] & 1) > 0;
    };
    this.isTriggered = function(key) {
        if(key < 0 || key >= 256) {
            return false;
        }
        return (state[key] & 2) > 0;
    };
    this.isReleased = function(key) {
        if(key < 0 || key >= 256) {
            return false;
        }
        return (state[key] & 4) > 0;
    };
}

Keyboard.BACKSPACE = 8;
Keyboard.TAB = 9;
Keyboard.RETURN = 13;
Keyboard.SHIFT = 16;
Keyboard.CTRL = 17;
Keyboard.ALT = 18;
Keyboard.ESC = 27;
Keyboard.SPACE = 32;
Keyboard.LEFT = 37;
Keyboard.UP = 38;
Keyboard.RIGHT = 39;
Keyboard.DOWN = 40;
Keyboard.N0 = 48;
Keyboard.N1 = 49;
Keyboard.N2 = 50;
Keyboard.N3 = 51;
Keyboard.N4 = 52;
Keyboard.N5 = 53;
Keyboard.N6 = 54;
Keyboard.N7 = 55;
Keyboard.N8 = 56;
Keyboard.N9 = 57;
Keyboard.A = 65;
Keyboard.B = 66;
Keyboard.C = 67;
Keyboard.D = 68;
Keyboard.E = 69;
Keyboard.F = 70;
Keyboard.G = 71;
Keyboard.H = 72;
Keyboard.I = 73;
Keyboard.J = 74;
Keyboard.K = 75;
Keyboard.L = 76;
Keyboard.M = 77;
Keyboard.N = 78;
Keyboard.O = 79;
Keyboard.P = 80;
Keyboard.Q = 81;
Keyboard.R = 82;
Keyboard.S = 83;
Keyboard.T = 84;
Keyboard.U = 85;
Keyboard.V = 86;
Keyboard.W = 87;
Keyboard.X = 88;
Keyboard.Y = 89;
Keyboard.Z = 90;
Keyboard.SEMICOLON = 186;
Keyboard.COMMA = 188;
Keyboard.DOT = 190;
Keyboard.SLASH = 191;
Keyboard.APOSTROPH = 222;
