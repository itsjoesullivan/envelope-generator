##Envelope Generator ![Test status](https://api.travis-ci.org/itsjoesullivan/envelope-generator.svg)

Basic ADSR envelope generator for web audio.

```bash
npm install --save envelope-generator
```

```javascript
import Envelope from 'envelope-generator';

let context = new AudioContext();
let osc = context.createOscillator();

let gain = context.createGain();

let env = new Envelope(context, {
  attackTime: 0.1,
  decayTime: 3,
  sustainLevel: 0.4,
  releaseTime: 0.1
});

env.connect(gain.gain);

var startAt = context.currentTime;

var releaseAt = startAt + 0.5;

osc.start(startAt);
env.start(startAt);

env.release(releaseAt);
osc.stop(env.getReleaseCompleteTime());
```
