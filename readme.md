##Envelope Generator ![Test status](https://api.travis-ci.org/itsjoesullivan/envelope-generator.svg)

Basic ADSR envelope generator for web audio. A demo is running [here](http://joesul.li/van/envelope-generator/).

- The release stage exists as a separate `GainNode`, so the envelope doesn't need to keep track of its output gain internally.
- Uses the [voltage](https://github.com/mmckegg/adsr/blob/master/index.js#L126) idea from [mmckegg/adsr](https://github.com/mmckegg/adsr).

###Example

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

let stopAt = env.getReleaseCompleteTime();
osc.stop(stopAt);
env.stop(stopAt);
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
  maxLevel: 1,
  attackTime: 0.1,
  holdTime: 0,
  decayTime: 0,
  sustainLevel: 0.5,
  releaseTime: 1
};
let env = new Envelope(context, settings)
```

####connect

The `connect` method should be attached directly to `AudioParam`s:

```javascript
let osc = context.createOscillator();
let gainNode = context.createGain();
let env = new Envelope(context, settings);
env.connect(gainNode.gain);
```

####start

The `start` method triggers the attack and decay stages of the envelope:

```javascript
let osc = context.createOscillator();
let gainNode = context.createGain();
let env = new Envelope(context, settings);
env.connect(gainNode.gain);

osc.start(context.currentTime);
env.start(context.currentTime);
```

####release

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

Releasing the envelope isn't the same as stopping the sound source. Once release has been called, `getReleaseCompleteTime()` will return the time that the envelope finishes its release stage. If this is an amp envelope, and the startLevel (i.e., where the envelope will release to) is 0, `getReleaseCompleteTime()` is when your sound source is guaranteed to be silent and can be stopped:

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

####stop

Because they are generating a signal, envelopes need to be stopped as well as released. This should coincide with when the actualy sound source is stopped.

```javascript
let osc = context.createOscillator();
let gainNode = context.createGain();
let env = new Envelope(context, settings);
env.connect(gainNode.gain);

osc.start(context.currentTime);
env.start(context.currentTime);

env.release(context.currentTime + 1);

// Stop the oscillator once the envelope has completed.
let stopAt = env.getReleaseCompleteTime();
osc.stop(stopAt);
env.stop(stopAt);
```
