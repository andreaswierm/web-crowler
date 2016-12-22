const chai = require('chai');
const spies = require('chai-spies');
const queue = require('./queue');

const expect = chai.expect;

chai.use(spies);

describe('#apply()', () => {
  var callback,
      mockCallback,
      didReturn;

  beforeEach(() => {
    callback = chai.spy();
    didReturn = false;

    mockCallback = (value, cb) => {
      callback(value);

      if (value === 2) {
        return;
      }

      didReturn = true;
      queue.push([2]);

      cb();
    };

    queue.create([1], 3, mockCallback);
  });

  it('should call the callback function with the inital value', () => {
    expect(callback).to.have.been.called.with(1);
  });

  it('should call the callback function with the new added value', () => {
    expect(callback).to.have.been.called.with(2);
  });
});

describe('#create()', () => {
  var callback;

  beforeEach(() => {
    callback = chai.spy('callback');
  });

  it('should execute the inital value', () => {
    queue.create([1], 1, callback);

    expect(callback).to.have.been.called.with(1);
  });
});
