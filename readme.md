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
- All `curve`, `attackCurve`, `decayCurve`, and `releaseCurve` properties default to `"linear"`, with `"exponential"` the alternative.
- attackCurve, decayCurve, and releaseCurve override their respective curves
- Passing an `initialValueCurve` will determine the shape of the curve usually covered by the attack and decay sections of an envelope, overriding any other curve values.
- Passing a `releaseValueCurve` will determine the shape of the release, overriding any other release curve value.
- Both initialValueCurve and releaseValueCurve are expected to be normalized, i.e. not extending outside of the bounds [0, 1]. This is relatively intuitive for the `initialValueCurve`, but ensure that your `releaseValueCurve` also starts at a value of 1 to avoid any jumps in the sound. The reason for this is that these two curves are applied in series.
- The sampleRate property applies to initialValueCurve and releaseValueCurve, allowing them to be expressed in a sampleRate different from that of the context.

```javascript
let context = new AudioContext();
let settings = {
  curve: "linear",
  attackCurve: "linear",
  decayCurve: "linear",
  releaseCurve: "linear",
  initialValueCurve: Float32Array,
  releaseValueCurve: Float32Array,
  sampleRate: 44100,
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

Because they are generating a signal, envelopes need to be stopped as well as released. This should coincide with when the actual sound source is stopped.

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
