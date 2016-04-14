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

###Usage

####Constructor

The constructor accepts two arguments: an AudioContext and a settings object. All settings are optional, but you will probably want to set at least `attackTime`, `decayTime`, `sustainLevel`, and `releaseTime`.

- All `...Time` properties are in seconds
- All `...Curve` properties default to `"linear"`, with `"exponential"` the alternative.

```javascript
let context = new AudioContext();
let settings = {
  curve: "linear",
  attackCurve: "linear",
  decayCurve: "linear",
  releaseCurve: "linear",
  delayTime: 0,
  startLevel: 0,
  attackTime: 0.1,
  holdTime: 0,
  decayTime: 0,
  sustainLevel: 0.5,
  releaseTime: 1
};
let env = new Envelope(context, settings)
```

####Connect

The `connect` method should be attached directly to `AudioParam`s:

```javascript
let osc = context.createOscillator();
let gainNode = context.createGain();
let env = new Envelope(context, settings);
env.connect(gainNode.gain);
```

####Start

The `start` method triggers the attack and decay stages of the envelope:

```javascript
let osc = context.createOscillator();
let gainNode = context.createGain();
let env = new Envelope(context, settings);
env.connect(gainNode.gain);

osc.start(context.currentTime);
env.start(context.currentTime);
```

####Release

The `release` method triggers the release stage of the envelope:

```javascript
let osc = context.createOscillator();
let gainNode = context.createGain();
let env = new Envelope(context, settings);
env.connect(gainNode.gain);

osc.start(context.currentTime);
env.start(context.currentTime);

// Release the envelope after 1 second
env.release(context.currentTime + 1);
```

####getReleaseCompleteTime

Releasing the envelope isn't the same as stopping the sound source. You'll want to wait for the envelope to finish before stopping the source. Once release has been called, `getReleaseCompleteTime()` will return the time that the envelope finishes its release stage:

```javascript
let osc = context.createOscillator();
let gainNode = context.createGain();
let env = new Envelope(context, settings);
env.connect(gainNode.gain);

osc.start(context.currentTime);
env.start(context.currentTime);

env.release(context.currentTime + 1);

// Stop the oscillator once the envelope has completed.
osc.stop(env.getReleaseCompleteTime());
```
