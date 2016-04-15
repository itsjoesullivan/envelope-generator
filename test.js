import Envelope from './index';
let chai = require('chai');
let sinon = require('sinon');
let assert = require('assert');
chai.should();

describe('Envelope', () => {
  describe('#constructor', () => {
    let audioContext;
    class SubClassedEnvelope extends Envelope {
      constructor(context, settings) {
        super(context, settings);
      }
      _getOnesBufferSource() {
        this.getOnesBufferSourceCalled = true;
        return {
          connect: sinon.spy()
        };
      }
      _setDefaults() {
        this.setDefaultsCalled = true;
      }
    }
    beforeEach(() => {
      audioContext = {
        createGain: () => {
          return {
            connect: sinon.spy(),
            gain: {}
          };
        }
      };
    });
    it('holds on to context', () => {
      let env = new SubClassedEnvelope(audioContext, {});
      assert.equal(env.context, audioContext);
    });
    it('holds on to settings', () => {
      let settings = {};
      let env = new SubClassedEnvelope(audioContext, settings);
      assert.equal(env.settings, settings);
    });
    it('calls _setDefaults', () => {
      let env = new SubClassedEnvelope(audioContext, {});
      assert.equal(env.setDefaultsCalled, true)
    });
    it('creates source', () => {
      let env = new SubClassedEnvelope(audioContext, {});
      assert(env.source)
    });
    it('creates attackDecayNode', () => {
      let env = new SubClassedEnvelope(audioContext, {});
      assert(env.attackDecayNode.connect)
    });
    it('creates releaseNode', () => {
      let env = new SubClassedEnvelope(audioContext, {});
      assert(env.releaseNode.connect)
    });
    it('creates ampNode', () => {
      let env = new SubClassedEnvelope(audioContext, {});
      assert(env.ampNode.connect)
    });
    it('creates outputNode', () => {
      let env = new SubClassedEnvelope(audioContext, {});
      assert(env.outputNode.connect)
    });
    it('sets outputNode gain to startLevel', () => {
      let env = new SubClassedEnvelope(audioContext, {
        startLevel: 12
      });
      assert.equal(env.outputNode.gain.value, 12);
    });
    it('sets ampNode gain to maxLevel - startLevel', () => {
      let env = new SubClassedEnvelope(audioContext, {
        startLevel: 12,
        maxLevel: 15
      });
      assert.equal(env.ampNode.gain.value, 3);
    });
    it('connects source to attackDecayNode', () => {
      let env = new SubClassedEnvelope(audioContext, {});
      assert(env.source.connect.calledWith(env.attackDecayNode));
    });
    it('connects source to outputNode', () => {
      let env = new SubClassedEnvelope(audioContext, {});
      assert(env.source.connect.calledWith(env.outputNode));
    });
    it('connects attackDecayNode to releaseNode', () => {
      let env = new SubClassedEnvelope(audioContext, {});
      assert(env.attackDecayNode.connect.calledWith(env.releaseNode));
    });
    it('connects releaseNode to ampNode', () => {
      let env = new SubClassedEnvelope(audioContext, {});
      assert(env.releaseNode.connect.calledWith(env.ampNode));
    });
    it('connects ampNode to outputNode.gain', () => {
      let env = new SubClassedEnvelope(audioContext, {});
      assert(env.ampNode.connect.calledWith(env.outputNode.gain));
    });
  });
  describe('#_setDefaults', () => {
    let context = {};
    beforeEach(() => {
      context = {
        settings: {
          curve: 'linear'
        },
      };
      context._getRampMethodName = Envelope.prototype
        ._getRampMethodName.bind(context);
    });
    it('sets curve to "linear"', () => {
      Envelope.prototype._setDefaults.apply(context);
      context.settings.curve.should.equal('linear');
    });
    it("doesn't override curve: 'exponential'", () => {
      context.settings.curve = "exponential";
      Envelope.prototype._setDefaults.apply(context);
      context.settings.curve.should.equal('exponential');
    });
    it('sets delayTime to 0', () => {
      Envelope.prototype._setDefaults.apply(context);
      context.settings.delayTime.should.equal(0);
    });
    it('sets startLevel to 0', () => {
      Envelope.prototype._setDefaults.apply(context);
      context.settings.startLevel.should.equal(0);
    });
    it('sets maxLevel to 1', () => {
      Envelope.prototype._setDefaults.apply(context);
      context.settings.maxLevel.should.equal(1);
    });
    it('sets sustainLevel to 1', () => {
      Envelope.prototype._setDefaults.apply(context);
      context.settings.sustainLevel.should.equal(1);
    });
    it('sets attackTime to 0', () => {
      Envelope.prototype._setDefaults.apply(context);
      context.settings.attackTime.should.equal(0);
    });
    it('sets holdTime to 0', () => {
      Envelope.prototype._setDefaults.apply(context);
      context.settings.holdTime.should.equal(0);
    });
    it('sets decayTime to 0.001', () => {
      Envelope.prototype._setDefaults.apply(context);
      context.settings.decayTime.should.equal(0.001);
    });
    it('sets releaseTime to 0', () => {
      Envelope.prototype._setDefaults.apply(context);
      context.settings.releaseTime.should.equal(0);
    });
    it('if exponential, 0 startLevel becomes 0.001', () => {
      context.settings.curve = 'exponential';
      Envelope.prototype._setDefaults.apply(context);
      context.settings.startLevel.should.equal(0.001);
    });
    it('if exponential, 0 maxLevel becomes 0.001', () => {
      context.settings.curve = 'exponential';
      context.settings.maxLevel = 0;
      context.settings.startLevel = 1;
      Envelope.prototype._setDefaults.apply(context);
      context.settings.maxLevel.should.equal(0.001);
    });
    it('if exponential and negative maxLevel, 0 startLevel becomes -0.001', () => {
      context.settings.curve = 'exponential';
      context.settings.startLevel = 0;
      context.settings.maxLevel = -10;
      Envelope.prototype._setDefaults.apply(context);
      context.settings.startLevel.should.equal(-0.001);
    });
    it('if exponential and negative startlevel, 0 maxLevel becomes -0.001', () => {
      context.settings.curve = 'exponential';
      context.settings.maxLevel = 0;
      context.settings.startLevel = -10;
      Envelope.prototype._setDefaults.apply(context);
      context.settings.maxLevel.should.equal(-0.001);
    });
    it('if exponential, 0 sustainLevel becomes 0.001', () => {
      context.settings.curve = 'exponential';
      context.settings.sustainLevel = 0;
      Envelope.prototype._setDefaults.apply(context);
      context.settings.sustainLevel.should.equal(0.001);
    });
  });
  describe("#_getOnesBufferSource", () => {
    let context;
    beforeEach(() => {
      let audioContext = {
        createBuffer: () => {
          let buffer = {};
          buffer.arr = [0, 0];
          buffer.getChannelData = (index) => {
            if (index === 0) {
              return buffer.arr;
            }
          }
          return buffer;
        },
        createBufferSource: () => {
          return {
            type: "buffer-source"
          };
        }
      };
      context = { context: audioContext };
    });
    it("returns a buffer source", () => {
      let source = Envelope.prototype._getOnesBufferSource.apply(context);
      assert.equal(source.type, "buffer-source");
    });
    it("returns a looped buffer source", () => {
      let source = Envelope.prototype._getOnesBufferSource.apply(context);
      assert.equal(source.loop, true);
    });
    it("assigns a buffer to source", () => {
      let source = Envelope.prototype._getOnesBufferSource.apply(context);
      assert(source.buffer);
    });
    it("assigns a buffer of 1s as the source's buffer", () => {
      let source = Envelope.prototype._getOnesBufferSource.apply(context);
      assert.equal(source.buffer.getChannelData(0).length, 2)
      assert.equal(source.buffer.getChannelData(0)[0], 1)
      assert.equal(source.buffer.getChannelData(0)[1], 1)
    });
  });
  describe("#connect", () => {
    it('connects argument to outputNode', () => {
      let context = {
        outputNode: {
          connect: sinon.spy()
        }
      }
      Envelope.prototype.connect.apply(context, ["test"]);
      assert(context.outputNode.connect.calledWith("test"));
    });
  });
  describe("#start", () => {
    let context;
    beforeEach(() => {
      context = {
        source: {
          start: sinon.spy()
        },
        attackDecayNode: {
          gain: {
            setValueAtTime: sinon.spy(),
            linearRampToValueAtTime: sinon.spy(),
            exponentialRampToValueAtTime: sinon.spy()
          }
        },
        settings: {
          curve: 'linear',
          delayTime: 0.1,
          attackTime: 0.2,
          holdTime: 0.3,
          decayTime: 0.4,
          startLevel: 0.5,
          sustainLevel: 0.7
        }
      };
      context._getRampMethodName = Envelope.prototype._getRampMethodName.bind(context);
    });
    it("if linear, sets attackDecayNode to 0 at start", () => {
      let when = 0.6;
      context.settings.curve = "linear";
      Envelope.prototype.start.apply(context, [when]);
      assert(context.attackDecayNode.gain
          .setValueAtTime.calledWith(0, when));
    });
    it("if exponential, sets attackDecayNode to 0.001 at start", () => {
      let when = 0.6;
      context.settings.curve = "exponential";
      Envelope.prototype.start.apply(context, [when]);
      assert(context.attackDecayNode.gain
          .setValueAtTime.calledWith(0.001, when));
    });
    it("if linear, sets attackDecayNode to 0 after delayTime", () => {
      let when = 0.6;
      context.settings.curve = "linear";
      let attackStartTime = when + context.settings.delayTime;
      Envelope.prototype.start.apply(context, [when]);
      assert(context.attackDecayNode.gain
          .setValueAtTime.calledWith(0, attackStartTime));
    });
    it("if exponential, sets attackDecayNode to 0.001 after delayTime", () => {
      let when = 0.6;
      context.settings.curve = "exponential";
      let attackStartTime = when + context.settings.delayTime;
      Envelope.prototype.start.apply(context, [when]);
      assert(context.attackDecayNode.gain
          .setValueAtTime.calledWith(0.001, attackStartTime));
    });
    it("ramps to 1 by delayTime + attackTime", () => {
      let when = 0.6;
      let attackStartTime = when + context.settings.delayTime;
      let attackEndTime = attackStartTime + context.settings.attackTime;
      Envelope.prototype.start.apply(context, [when]);
      assert(context.attackDecayNode.gain
          .linearRampToValueAtTime.calledWith(1, attackEndTime));
    });
    it("holds decay until holdTime after attack ends", () => {
      let when = 0.6;
      let attackStartTime = when + context.settings.delayTime;
      let attackEndTime = attackStartTime + context.settings.attackTime;
      let decayStartTime = attackEndTime + context.settings.holdTime;
      Envelope.prototype.start.apply(context, [when]);
      assert(context.attackDecayNode.gain
          .setValueAtTime.calledWith(1, decayStartTime));
    });
    it("ramps to sustainLevel after holdTime", () => {
      let when = 0.6;
      let attackStartTime = when + context.settings.delayTime;
      let attackEndTime = attackStartTime + context.settings.attackTime;
      let decayStartTime = attackEndTime + context.settings.holdTime;
      let decayEndTime = decayStartTime + context.settings.decayTime;
      Envelope.prototype.start.apply(context, [when]);
      assert(context.attackDecayNode.gain
          .linearRampToValueAtTime.calledWith(context.settings.sustainLevel, decayEndTime));
    });
    it("begins source", () => {
      let when = 0.6;
      Envelope.prototype.start.apply(context, [when]);
      assert(context.source.start.calledWith(when));
    });
    it("if attackCurve is exponential, uses exponential ramp", () => {
      let when = 0.6;
      let attackStartTime = when + context.settings.delayTime;
      let attackEndTime = attackStartTime + context.settings.attackTime;
      context.settings.attackCurve = "exponential";
      Envelope.prototype.start.apply(context, [when]);
      assert(context.attackDecayNode.gain
          .exponentialRampToValueAtTime.calledWith(1, attackEndTime));
    });
    it("if decayCurve is exponential, uses exponential ramp", () => {
      let when = 0.6;
      let attackStartTime = when + context.settings.delayTime;
      let attackEndTime = attackStartTime + context.settings.attackTime;
      let decayStartTime = attackEndTime + context.settings.holdTime;
      let decayEndTime = decayStartTime + context.settings.decayTime;
      context.settings.decayCurve = "exponential";
      Envelope.prototype.start.apply(context, [when]);
      assert(context.attackDecayNode.gain
          .exponentialRampToValueAtTime.calledWith(context.settings.sustainLevel, decayEndTime));
    });
  });
  describe("#_getRampMethodName", () => {
    it("returns linear without anything set", () => {
      let settings = {};
      let name = Envelope.prototype._getRampMethodName.apply({ settings: settings});
      assert.equal(name, "linearRampToValueAtTime");
    });
    it("returns exponential if curve: exponential", () => {
      let settings = { curve: "exponential" };
      let name = Envelope.prototype._getRampMethodName.apply({ settings: settings});
      assert.equal(name, "exponentialRampToValueAtTime");
    });
    it("attackCurve wins if asking for attack", () => {
      let settings = { curve: "exponential", attackCurve: "linear" };
      let name = Envelope.prototype._getRampMethodName.apply({ settings: settings}, ["attack"]);
      assert.equal(name, "linearRampToValueAtTime");
    });
    it("decayCurve wins if asking for decay", () => {
      let settings = { curve: "linear", decayCurve: "exponential" };
      let name = Envelope.prototype._getRampMethodName.apply({ settings: settings}, ["decay"]);
      assert.equal(name, "exponentialRampToValueAtTime");
    });
    it("releaseCurve wins if asking for release", () => {
      let settings = { curve: "linear", releaseCurve: "exponential" };
      let name = Envelope.prototype._getRampMethodName.apply({ settings: settings}, ["release"]);
      assert.equal(name, "exponentialRampToValueAtTime");
    });
  });
  describe("#release", () => {
    let context;
    beforeEach(() => {
      context = {
        releaseNode: {
          gain: {
            setValueAtTime: sinon.spy(),
            linearRampToValueAtTime: sinon.spy(),
            exponentialRampToValueAtTime: sinon.spy()
          }
        },
        settings: {
          curve: 'linear',
          startLevel: 0.5,
          releaseTime: 0.8
        }
      };
      context._getRampMethodName = Envelope.prototype._getRampMethodName.bind(context);
    });
    it("sets value to 1 at release start", () => {
      let when = 0.9;
      Envelope.prototype.release.apply(context, [when]);
      assert(context.releaseNode.gain.setValueAtTime.calledWith(1, when));
    });
    it("if linear, ramps to 0 by release end", () => {
      let when = 0.9;
      context.settings.curve = "linear";
      Envelope.prototype.release.apply(context, [when]);
      let releaseEndsAt = when + context.settings.releaseTime;
      assert(context.releaseNode.gain.linearRampToValueAtTime
          .calledWith(0, releaseEndsAt));
    });
    it("if exponential, ramps to 0.001 by release end", () => {
      let when = 0.9;
      context.settings.curve = "exponential";
      Envelope.prototype.release.apply(context, [when]);
      let releaseEndsAt = when + context.settings.releaseTime;
      assert(context.releaseNode.gain.exponentialRampToValueAtTime
          .calledWith(0.001, releaseEndsAt));
    });
  });
  describe("#stop", () => {
    it("stops source", () => {
      context = {
        source: {
          stop: sinon.spy()
        }
      }
      let when = 0.9;
      Envelope.prototype.stop.apply(context, [when]);
      assert(context.source.stop.calledWith(when));
    });
  });
  describe("#getReleaseCompleteTime", () => {
    it("returns releasedAt + releaseTime", () => {
      let context = {
        releasedAt: 1,
        settings: {
          releaseTime: 3
        }
      };
      let completeAt = Envelope.prototype.getReleaseCompleteTime.apply(context);
      assert.equal(completeAt, 4);
    });
    it("throws an error if no releasedAt", () => {
      let context = {
        settings: {
          releaseTime: 3
        }
      };
      assert.throws(() => {
        let completeAt = Envelope.prototype.getReleaseCompleteTime.apply(context);
      }, (err) => {
        return /Release has not been called/.test(err.message);
      }, "unexpected error");
    });
  });
});
