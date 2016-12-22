const chai = require('chai');
const spies = require('chai-spies');
const crowler = require('./crowler');

const expect = chai.expect;

chai.use(spies);

describe('#buildLinkUrl', () => {
  beforeEach(() => {
    crowler.start('http://google.com');
  });

  it('should return an absolute URL when the path does not contain the domain', () => {
    expect(crowler.buildLinkUrl('/about'))
      .to.equal('http://google.com/about');
  });

  it('should remove any after a hashtag in the path', () => {
    expect(crowler.buildLinkUrl('/email#1010'))
      .to.equal('http://google.com/email');
  });

  it('should return the complete URL when the domain is present', () => {
    expect(crowler.buildLinkUrl('http://google.com/about'))
      .to.equal('http://google.com/about');
  });
});

describe('#canFetchUrl()', () => {
  beforeEach(() => {
    crowler.start('http://google.com', chai.spy(), chai.spy());
  });

  it('should return true when the url was never fetched', () => {
    expect(crowler.canFetchUrl('http://google.com/about'))
      .to.be.true;
  });

  describe('when the URL was already fetched', () => {
    beforeEach(() => {
      crowler.canFetchUrl('http://google.com/about')
    });

    it('should return false', () => {
      expect(crowler.canFetchUrl('http://google.com/about'))
        .to.be.false;
    });
  });
});

describe('#setUrlFlag()', () => {
  var statusCallback,
      resultCallback;

  beforeEach(() => {
    statusCallback = chai.spy();
    resultCallback = chai.spy();

    crowler.start('http://google.com', statusCallback, resultCallback);
  });

  it('should call the status update callback', () => {
    crowler.setUrlFlag({url: 'http://google.com'});

    expect(statusCallback)
      .to.have.been.called.with({
        numberOfUrlsFetched: 1,
        urlsToFetch: 0
      });
  });

  it('should call the result callback', () => {
    crowler.canFetchUrl('http://google.com');

    crowler.setUrlFlag({url: 'http://google.com'});

    expect(resultCallback)
      .to.have.been.called.with([]);
  });
});
